"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useCallback } from "react"
import { io, Socket } from "socket.io-client"
import { WS_URL } from "@/constants/chat.constants"
import type { Message, AiMessagePayload, SuggestionsPayload } from "@/types/chat.types"
import {
  normalizeAiMessagePayload,
  mergeMessageCollection,
  hasAssistantAudio,
} from "@/utils/message.utils"
import { base64ToObjectUrl } from "@/utils/live-audio.utils"
import { createClient } from "@/lib/supabase/client"
import { useMessagePolling } from "@/hooks/useMessagePolling"

interface UseWebSocketChatProps {
  conversationId: string | null
  selectedCharacterId: string | null
  onStatusChange: (status: string) => void
  onMessagesUpdate: (updater: (prev: Message[]) => Message[]) => void
  onTranscriptionResult: (text: string) => void
  onNoSpeech?: () => void
  onSuggestionsReceived?: (suggestions: string[]) => void
}

export const useWebSocketChat = ({
  conversationId,
  selectedCharacterId,
  onStatusChange,
  onMessagesUpdate,
  onTranscriptionResult,
  onNoSpeech,
  onSuggestionsReceived,
}: UseWebSocketChatProps) => {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const lastTranscriptionEventRef = useRef<{ text: string; timestamp: number } | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { startPolling, stopPolling } = useMessagePolling(
    conversationId,
    onMessagesUpdate,
    onStatusChange,
  )

  useEffect(() => {
    if (!conversationId || !selectedCharacterId) return

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

    const setDisconnectedState = () => {
      setIsConnected(false)
      setIsTyping(false)
      stopPolling()
    }

    const clearTypingTimeout = () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = null
      }
    }

    const armTypingTimeout = () => {
      clearTypingTimeout()
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
      }, 15000)
    }

    const attachCommonHandlers = () => {
      if (!socket) return

      socket.on("connect", () => {
        onStatusChange("Conectado")
        setIsConnected(true)
        setIsTyping(false)
        socket?.emit("join_chat", conversationId)
      })

      socket.on("connect_error", async (error) => {
        const errorMessage = (error?.message || "").toLowerCase()

        if (errorMessage.includes("unauthorized")) {
          if (hasRetriedUnauthorized || isCancelled) {
            onStatusChange("No autenticado")
            setDisconnectedState()
            socket?.disconnect()
            return
          }

          hasRetriedUnauthorized = true
          onStatusChange("Reautenticando...")
          const refreshedToken = await fetchAccessToken(true)

          if (!refreshedToken || isCancelled || !socket) {
            onStatusChange("No autenticado")
            setDisconnectedState()
            socket?.disconnect()
            return
          }

          socket.auth = { token: refreshedToken }
          socket.connect()
          return
        }

        onStatusChange(`Error de conexión: ${error.message}`)
        setDisconnectedState()
      })

      socket.on("system_message", (data: any) => {
        onStatusChange(data.content || data.message || "Listo")
      })

      socket.on("bot_typing", () => {
        setIsTyping(true)
        armTypingTimeout()
        onStatusChange("Escribiendo...")
      })

      socket.on("suggestions", (data: SuggestionsPayload) => {
        if (!Array.isArray(data?.suggestions)) return
        onSuggestionsReceived?.(data.suggestions)
      })

      socket.on("ai_message", (data: AiMessagePayload) => {
        setIsTyping(false)
        clearTypingTimeout()

        const normalizedMessage = normalizeAiMessagePayload(data)
        const mediaType = normalizedMessage.mediaType ?? null

        let audioUrlFromSocket: string | null = data.audioUrl ?? data.audio_url ?? null
        if (!audioUrlFromSocket && data.audio) {
          try {
            audioUrlFromSocket = base64ToObjectUrl(data.audio, mediaType ?? "audio/mpeg")
          } catch (error) {
            console.error("Error creando audio URL desde base64:", error)
          }
        }

        const incomingMessage: Message = {
          ...normalizedMessage,
          audioUrl: audioUrlFromSocket,
          mediaType,
        }

        onMessagesUpdate((prev) => mergeMessageCollection(prev, [incomingMessage]))

        if (hasAssistantAudio(incomingMessage)) {
          stopPolling()
          onStatusChange("Listo")
        } else {
          onStatusChange("Generando audio...")
        }
      })

      const handleTranscription = (data: { text: string }) => {
        if (!data.text) return
        const now = Date.now()
        const lastEvent = lastTranscriptionEventRef.current
        if (lastEvent && lastEvent.text === data.text && now - lastEvent.timestamp < 1500) return
        lastTranscriptionEventRef.current = { text: data.text, timestamp: now }
        onTranscriptionResult(data.text)
      }

      socket.on("transcription", handleTranscription)
      socket.on("transcription_result", handleTranscription)

      socket.on("error", (data: { message: string }) => {
        onStatusChange(`Error: ${data.message}`)
        console.error("Socket Error:", data.message)
      })

      socket.on("no_speech", () => {
        onNoSpeech?.()
      })

      socket.on("disconnect", () => {
        clearTypingTimeout()
        onStatusChange("Desconectado")
        setDisconnectedState()
      })
    }

    const initSocket = async () => {
      onStatusChange("Conectando...")

      const accessToken = await fetchAccessToken()
      if (!accessToken || isCancelled) {
        onStatusChange("No autenticado")
        setDisconnectedState()
        return
      }

      socket = io(baseUrl, {
        transports: ["websocket"],
        withCredentials: true,
        auth: { token: accessToken },
      })

      socketRef.current = socket
      attachCommonHandlers()
    }

    initSocket()

    return () => {
      isCancelled = true
      stopPolling()
      setIsTyping(false)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = null
      }
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [
    conversationId,
    selectedCharacterId,
    onStatusChange,
    onMessagesUpdate,
    onTranscriptionResult,
    onNoSpeech,
    onSuggestionsReceived,
    stopPolling,
  ])

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || !isConnected || !conversationId) return
      socketRef.current?.emit("send_text", { conversationId, text, mode: "interview" })
      startPolling()
    },
    [isConnected, conversationId, startPolling],
  )

  const sendAudioMessage = useCallback(
    (base64Data: string) => {
      if (!isConnected || !conversationId) {
        console.error("No se pudo enviar el audio: sin conexión o sin conversationId.")
        return
      }
      socketRef.current?.emit("send_audio", {
        conversationId,
        audioBase64: base64Data,
        mimeType: "audio/webm",
        mode: "interview",
      })
      startPolling()
    },
    [isConnected, conversationId, startPolling],
  )

  return { sendMessage, sendAudioMessage, isConnected, isTyping }
}
