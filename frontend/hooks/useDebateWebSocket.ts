"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useCallback } from "react"
import { io, Socket } from "socket.io-client"
import { WS_URL } from "@/constants/chat.constants"
import type {
  DebateErrorPayload,
  DebateMessageMetadata,
  DebateRoundCompletePayload,
  DebateTurnSkippedPayload,
  DebateStartedPayload,
  DebateTurnPayload,
  DebateTypingPayload,
  DebateUserAckPayload,
  Message,
} from "@/types/chat.types"
import { base64ToObjectUrl } from "@/utils/live-audio.utils"
import { createClient } from "@/lib/supabase/client"

interface UseDebateWebSocketProps {
  conversationId: string | null
  onStatusChange: (status: string) => void
  fetchConversationMessages?: () => Promise<Message[] | null>
}

const asDebateMetadata = (message: Message): DebateMessageMetadata | undefined => {
  if (!message.metadata) return undefined
  return message.metadata as DebateMessageMetadata
}

const upsertMessagesById = (prev: Message[], incomingMessages: Message[]): Message[] => {
  if (incomingMessages.length === 0) return prev

  const next = [...prev]
  let didChange = false

  incomingMessages.forEach((incoming) => {
    const existingIndex = next.findIndex(
      (message) => String(message.id) === String(incoming.id),
    )

    if (existingIndex >= 0) {
      next[existingIndex] = {
        ...next[existingIndex],
        ...incoming,
        metadata: incoming.metadata ?? next[existingIndex].metadata,
      }
      didChange = true
      return
    }

    next.push(incoming)
    didChange = true
  })

  return didChange ? next : prev
}

const removeMessagesByTraceId = (prev: Message[], traceId: string): Message[] => {
  const next = prev.filter((message) => asDebateMetadata(message)?.debateTraceId !== traceId)
  return next.length === prev.length ? prev : next
}

const createTraceScopedMessage = (
  message: Message,
  traceId: string,
  metadata: Omit<DebateMessageMetadata, "debateTraceId"> = {},
): Message => ({
  ...message,
  metadata: {
    ...(message.metadata ?? {}),
    ...metadata,
    debateTraceId: traceId,
  },
})

const buildTurnMessage = (payload: DebateTurnPayload): Message => {
  let audioUrl: string | null = null

  if (payload.audio) {
    try {
      audioUrl = base64ToObjectUrl(payload.audio, "audio/mpeg")
    } catch {
      audioUrl = null
    }
  }

  return createTraceScopedMessage(
    {
      id: payload.message_id,
      role: "assistant",
      content: payload.text,
      speakerId: payload.speaker_id,
      speakerName: payload.speaker_name,
      audioUrl,
      mediaType: audioUrl ? "audio/mpeg" : null,
    },
    payload.traceId,
    {
      turnOrder: payload.turn_order,
      isForced: payload.is_forced ?? false,
      warning: payload.warning ?? null,
    },
  )
}

const buildSkippedTurnMessage = (payload: DebateTurnSkippedPayload): Message => {
  const reasonDetail = payload.reason_detail?.trim()
  const content = reasonDetail
    ? `${payload.speaker_name} ha pasado su turno. (${reasonDetail})`
    : `${payload.speaker_name} ha pasado su turno.`

  return createTraceScopedMessage(
    {
      id: `skip_${payload.traceId}_${payload.speaker_id}_${payload.reason}`,
      role: "assistant",
      content,
      speakerId: payload.speaker_id,
      speakerName: payload.speaker_name,
      audioUrl: null,
      mediaType: null,
    },
    payload.traceId,
    {
      turnOrder: payload.turn_order,
      isForced: payload.is_forced ?? false,
      isSkipped: true,
      skipReason: payload.reason,
      skipReasonDetail: payload.reason_detail ?? null,
      skipConfidence: payload.confidence ?? null,
      warning: null,
    },
  )
}

export const useDebateWebSocket = ({
  conversationId,
  onStatusChange,
  fetchConversationMessages,
}: UseDebateWebSocketProps) => {
  const socketRef = useRef<Socket | null>(null)
  const hasConnectedRef = useRef(false)
  const activeRoundTraceIdRef = useRef<string | null>(null)
  const activeRoundTextRef = useRef<string | null>(null)
  const lastSubmittedTextRef = useRef<string | null>(null)
  const lastRetryableTextRef = useRef<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [errorState, setErrorState] = useState<DebateErrorPayload | null>(null)
  const [typingCharacterId, setTypingCharacterId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])

  const reconcileHistory = useCallback(async () => {
    if (!fetchConversationMessages) return

    const historicalMessages = await fetchConversationMessages()
    if (historicalMessages) {
      setMessages(historicalMessages)
    }
  }, [fetchConversationMessages])

  const clearRoundState = useCallback((clearRetryText = false) => {
    activeRoundTraceIdRef.current = null
    activeRoundTextRef.current = null
    setTypingCharacterId(null)
    setIsSending(false)

    if (clearRetryText) {
      lastRetryableTextRef.current = null
    }
  }, [])

  const emitDebateMessage = useCallback(
    (text: string, forcedSpeakerId?: string | null) => {
      const trimmedText = text.trim()
      if (!trimmedText || !socketRef.current || !isConnected || !conversationId || isSending) {
        return false
      }

      activeRoundTraceIdRef.current = null
      activeRoundTextRef.current = trimmedText
      lastSubmittedTextRef.current = trimmedText
      setErrorState(null)
      setTypingCharacterId(null)
      setIsSending(true)
      onStatusChange("Esperando confirmación...")
      socketRef.current.emit("send_debate_text", {
        conversationId,
        text: trimmedText,
        forced_speaker_id: forcedSpeakerId ?? null,
      })
      return true
    },
    [conversationId, isConnected, isSending, onStatusChange],
  )

  const emitSkipDebateTurn = useCallback(
    (speakerId: string, reason?: string) => {
      const trimmedSpeakerId = speakerId.trim()
      if (!trimmedSpeakerId || !socketRef.current || !isConnected || !conversationId || isSending) {
        return false
      }

      socketRef.current.emit("skip_debate_turn", {
        conversationId,
        speaker_id: trimmedSpeakerId,
        reason,
      })

      return true
    },
    [conversationId, isConnected, isSending],
  )

  useEffect(() => {
    setMessages([])
    setErrorState(null)
    setTypingCharacterId(null)
    clearRoundState(true)
  }, [clearRoundState, conversationId])

  useEffect(() => {
    if (!conversationId) return

    const baseUrl = WS_URL.replace("/ws/chat/", "")
    const supabase = createClient()
    let isCancelled = false
    let hasRetriedUnauthorized = false
    let socket: Socket | null = null

    const fetchAccessToken = async (forceRefresh = false): Promise<string | null> => {
      if (forceRefresh) {
        const { data } = await supabase.auth.refreshSession()
        return data.session?.access_token ?? null
      }
      const { data } = await supabase.auth.getSession()
      return data.session?.access_token ?? null
    }

    const attachHandlers = () => {
      if (!socket) return

      socket.on("connect", () => {
        const isReconnect = hasConnectedRef.current
        hasConnectedRef.current = true
        onStatusChange("Conectado")
        setIsConnected(true)
        socket?.emit("join_debate", conversationId)

        if (isReconnect) {
          void reconcileHistory()
        }
      })

      socket.on("connect_error", async (error: any) => {
        const errorMessage = (error?.message || "").toLowerCase()

        if (errorMessage.includes("unauthorized")) {
          if (hasRetriedUnauthorized || isCancelled) {
            onStatusChange("No autenticado")
            setIsConnected(false)
            socket?.disconnect()
            return
          }

          hasRetriedUnauthorized = true
          onStatusChange("Reautenticando...")
          const refreshedToken = await fetchAccessToken(true)

          if (!refreshedToken || isCancelled || !socket) {
            onStatusChange("No autenticado")
            setIsConnected(false)
            socket?.disconnect()
            return
          }

          socket.auth = { token: refreshedToken }
          socket.connect()
          return
        }

        onStatusChange(`Error de conexión: ${error.message}`)
        setIsConnected(false)
      })

      socket.on("debate_started", (data: DebateStartedPayload) => {
        if (data.conversationId !== conversationId) return
        activeRoundTraceIdRef.current = data.traceId
        onStatusChange("Esperando respuestas...")
      })

      socket.on("debate_user_ack", (data: DebateUserAckPayload) => {
        if (data.conversationId !== conversationId) return

        activeRoundTraceIdRef.current = data.traceId
        setErrorState(null)
        onStatusChange("Esperando respuestas...")
        setMessages((prev) =>
          upsertMessagesById(prev, [
            createTraceScopedMessage(
              {
                id: data.user_message_id,
                role: "user",
                content: data.user_text,
              },
              data.traceId,
              {
                turnOrder: null,
                warning: null,
              },
            ),
          ]),
        )
      })

      socket.on("debate_typing", (data: DebateTypingPayload) => {
        if (data.conversationId !== conversationId) return

        activeRoundTraceIdRef.current = data.traceId
        setTypingCharacterId(data.speaker_id)
        onStatusChange(
          data.is_forced
            ? `${data.speaker_name} está pensando (turno forzado)...`
            : `${data.speaker_name} está pensando...`,
        )
      })

      socket.on("debate_turn", (data: DebateTurnPayload) => {
        if (data.conversationId !== conversationId) return

        activeRoundTraceIdRef.current = data.traceId
        setTypingCharacterId(null)
        setMessages((prev) => upsertMessagesById(prev, [buildTurnMessage(data)]))
        onStatusChange("Esperando siguiente respuesta...")
      })

      socket.on("debate_turn_skipped", (data: DebateTurnSkippedPayload) => {
        if (data.conversationId !== conversationId) return

        activeRoundTraceIdRef.current = data.traceId
        setTypingCharacterId(null)
        setMessages((prev) => upsertMessagesById(prev, [buildSkippedTurnMessage(data)]))
        onStatusChange("Esperando siguiente respuesta...")
      })

      socket.on("debate_round_complete", (data: DebateRoundCompletePayload) => {
        if (data.conversationId !== conversationId) return

        clearRoundState(true)
        setErrorState(null)
        onStatusChange("Listo")
        void reconcileHistory()
      })

      socket.on("debate_error", (data: DebateErrorPayload) => {
        const failedTraceId = activeRoundTraceIdRef.current ?? data.traceId
        const failedText = activeRoundTextRef.current ?? lastSubmittedTextRef.current

        if (failedTraceId) {
          setMessages((prev) => removeMessagesByTraceId(prev, failedTraceId))
        }

        if (data.retryable && failedText) {
          lastRetryableTextRef.current = failedText
        } else {
          lastRetryableTextRef.current = null
        }

        clearRoundState(false)
        onStatusChange("Error")
        setErrorState(data)
        console.error("Debate error:", data)
      })

      socket.on("disconnect", () => {
        clearRoundState(false)
        onStatusChange("Desconectado")
        setIsConnected(false)
      })
    }

    const initSocket = async () => {
      onStatusChange("Conectando...")

      const accessToken = await fetchAccessToken()
      if (!accessToken || isCancelled) {
        onStatusChange("No autenticado")
        setIsConnected(false)
        return
      }

      socket = io(baseUrl, {
        transports: ["websocket"],
        withCredentials: true,
        auth: { token: accessToken },
      })

      socketRef.current = socket
      attachHandlers()
    }

    initSocket()

    return () => {
      isCancelled = true
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [clearRoundState, conversationId, onStatusChange, reconcileHistory])

  const sendDebateMessage = useCallback(
    (text: string, forcedSpeakerId?: string | null) => {
      void emitDebateMessage(text, forcedSpeakerId)
    },
    [emitDebateMessage],
  )

  const skipDebateTurn = useCallback(
    (speakerId: string, reason?: string) => {
      return emitSkipDebateTurn(speakerId, reason)
    },
    [emitSkipDebateTurn],
  )

  const retryLastMessage = useCallback(() => {
    const retryText = lastRetryableTextRef.current
    if (!retryText || !errorState?.retryable) return false
    return emitDebateMessage(retryText)
  }, [emitDebateMessage, errorState?.retryable])

  return {
    messages,
    setMessages,
    sendDebateMessage,
    skipDebateTurn,
    retryLastMessage,
    isConnected,
    isSending,
    errorState,
    typingCharacterId,
    canRetry: Boolean(errorState?.retryable && lastRetryableTextRef.current),
  }
}
