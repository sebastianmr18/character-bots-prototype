"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useCallback } from "react"
import { io, Socket } from "socket.io-client"
import { WS_URL } from "@/constants/chat.constants"
import type { Message, DebateTurnResultPayload, DebateErrorPayload } from "@/types/chat.types"
import { base64ToObjectUrl } from "@/utils/live-audio.utils"
import { mergeMessageCollection } from "@/utils/message.utils"
import { createClient } from "@/lib/supabase/client"

interface UseDebateWebSocketProps {
  conversationId: string | null
  onStatusChange: (status: string) => void
}

export const useDebateWebSocket = ({
  conversationId,
  onStatusChange,
}: UseDebateWebSocketProps) => {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    setMessages([])
    setErrorMessage(null)
    setIsSending(false)
  }, [conversationId])

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
        onStatusChange("Conectado")
        setIsConnected(true)
        setErrorMessage(null)
        socket?.emit("join_debate", conversationId)
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

      socket.on("debate_started", () => {
        onStatusChange("Listo")
      })

      socket.on("debate_turn_result", (data: DebateTurnResultPayload) => {
        setIsSending(false)
        onStatusChange("Listo")

        const newMessages: Message[] = []

        // User message
        newMessages.push({
          id: data.user_message_id,
          role: "user",
          content: data.user_text,
        })

        // Character responses
        for (const response of data.responses) {
          let audioUrl: string | null = null
          if (response.audio) {
            try {
              audioUrl = base64ToObjectUrl(response.audio, "audio/mpeg")
            } catch {
              // audio unavailable; text still displayed
            }
          }
          newMessages.push({
            id: response.message_id,
            role: "assistant",
            content: response.text,
            speakerId: response.speaker_id,
            speakerName: response.speaker_name,
            audioUrl,
            mediaType: audioUrl ? "audio/mpeg" : null,
            metadata: response.warning ? { warning: response.warning } : undefined,
          })
        }

        setMessages((prev) => mergeMessageCollection(prev, newMessages))
      })

      socket.on("debate_error", (data: DebateErrorPayload) => {
        setIsSending(false)
        onStatusChange("Error")
        setErrorMessage(data.message)
        console.error("Debate error:", data)
      })

      socket.on("disconnect", () => {
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
  }, [conversationId, onStatusChange])

  const sendDebateMessage = useCallback(
    (text: string) => {
      if (!text.trim() || !isConnected || !conversationId) return
      setIsSending(true)
      setErrorMessage(null)
      onStatusChange("Debatiendo...")
      socketRef.current?.emit("send_debate_text", { conversationId, text })
    },
    [isConnected, conversationId, onStatusChange],
  )

  return { messages, setMessages, sendDebateMessage, isConnected, isSending, errorMessage }
}
