"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { io, Socket } from "socket.io-client"
import { WS_URL } from "@/constants/chat.constants"
import type { Message, AiMessagePayload } from "@/types/chat.types"
import { normalizeBackendMessages } from "@/utils/message.utils"
import { createClient } from "@/lib/supabase/client"

const hasAssistantAudio = (message: Message) => {
  return Boolean(message.audioUrl || message.audioPath || message.audioStorageId)
}

const hasMessageChanged = (current: Message, incoming: Message) => {
  return (
    current.content !== incoming.content ||
    current.audioPath !== incoming.audioPath ||
    current.audioUrl !== incoming.audioUrl ||
    current.audioStorageId !== incoming.audioStorageId ||
    current.mediaType !== incoming.mediaType ||
    current.durationMs !== incoming.durationMs ||
    current.timestamp !== incoming.timestamp
  )
}

const mergeMessageCollection = (prev: Message[], incomingMessages: Message[]) => {
  if (incomingMessages.length === 0) return prev

  const next = [...prev]
  let didChange = false

  incomingMessages.forEach((incoming) => {
    const byIdIndex = next.findIndex((message) => String(message.id) === String(incoming.id))

    if (byIdIndex >= 0) {
      const mergedMessage = { ...next[byIdIndex], ...incoming }
      if (hasMessageChanged(next[byIdIndex], mergedMessage)) {
        next[byIdIndex] = mergedMessage
        didChange = true
      }
      return
    }

    const byRoleContentIndex = next.findIndex(
      (message) => message.role === incoming.role && message.content === incoming.content
    )

    if (byRoleContentIndex >= 0) {
      const mergedMessage = { ...next[byRoleContentIndex], ...incoming }
      if (hasMessageChanged(next[byRoleContentIndex], mergedMessage)) {
        next[byRoleContentIndex] = mergedMessage
        didChange = true
      }
      return
    }

    next.push(incoming)
    didChange = true
  })

  return didChange ? next : prev
}

interface UseWebSocketChatProps {
  conversationId: string | null
  selectedCharacterId: string | null
  onStatusChange: (status: string) => void
  onMessagesUpdate: (updater: (prev: Message[]) => Message[]) => void
  onTranscriptionResult: (text: string) => void
}

export const useWebSocketChat = ({
  conversationId,
  selectedCharacterId,
  onStatusChange,
  onMessagesUpdate,
  onTranscriptionResult,
}: UseWebSocketChatProps) => {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastMessageCountRef = useRef<number>(0)

  const base64ToObjectUrl = useCallback((base64String: string, mediaType = "audio/mpeg") => {
    const cleanedBase64 = base64String.replace(/\s/g, "")
    const binaryString = atob(cleanedBase64)
    const bytes = new Uint8Array(binaryString.length)

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    const audioBlob = new Blob([bytes], { type: mediaType })
    return URL.createObjectURL(audioBlob)
  }, [])

  useEffect(() => {
    if (!conversationId || !selectedCharacterId) return

    const baseUrl = WS_URL.replace("/ws/chat/", "")
    const supabase = createClient()
    let isCancelled = false
    let hasRetriedUnauthorized = false
    let socket: Socket | null = null

    const fetchAccessToken = async (forceRefresh = false): Promise<string | null> => {
      if (forceRefresh) {
        const { data, error } = await supabase.auth.refreshSession()
        if (error) {
          console.error("Error refrescando sesión para WebSocket:", error)
        }
        return data.session?.access_token ?? null
      }

      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error("Error obteniendo sesión para WebSocket:", error)
      }
      return data.session?.access_token ?? null
    }

    const setDisconnectedState = () => {
      setIsConnected(false)
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }

    const attachCommonHandlers = () => {
      if (!socket) return

      socket.on("connect", () => {
        onStatusChange("Conectado")
        setIsConnected(true)

        socket?.emit("join_chat", conversationId)

        ;(async () => {
          try {
            const response = await fetch(`/api/conversations/${conversationId}`)
            if (response.ok) {
              const data = await response.json()
              lastMessageCountRef.current = (data.messages || []).length
            }
          } catch (error) {
            console.error("Error al inicializar conteo de mensajes:", error)
          }
        })()
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
        onStatusChange("Escribiendo...")
      })

      socket.on("ai_message", (data: AiMessagePayload) => {
        console.log("[DEBUG] Recibido evento 'ai_message':", data)

        const messageText = data.text ?? data.content ?? ""
        const messageId = data.message_id ?? data.messageId ?? `ws-${Date.now()}`
        const audioPath = data.audioPath ?? data.audio_path ?? null
        const mediaType = data.mediaType ?? data.media_type ?? null

        let audioUrlFromSocket: string | null = data.audioUrl ?? data.audio_url ?? null
        if (!audioUrlFromSocket && data.audio) {
          try {
            audioUrlFromSocket = base64ToObjectUrl(data.audio, mediaType ?? "audio/mpeg")
          } catch (error) {
            console.error("Error creando audio URL desde base64:", error)
          }
        }

        const incomingMessage: Message = {
          id: messageId,
          role: "assistant",
          content: messageText,
          audioPath,
          audioUrl: audioUrlFromSocket,
          mediaType,
        }

        onMessagesUpdate((prev) => {
          return mergeMessageCollection(prev, [incomingMessage])
        })

        lastMessageCountRef.current = Math.max(lastMessageCountRef.current, 1)

        if (hasAssistantAudio(incomingMessage) && pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }

        onStatusChange(hasAssistantAudio(incomingMessage) ? "Listo" : "Generando audio...")
      })

      const handleTranscription = (data: { text: string }) => {
        console.log("[DEBUG] Recibido evento de transcripción:", data)
        if (data.text) {
          onTranscriptionResult(data.text)
        } else {
          console.log("[DEBUG] Transcripción vacía o nula")
        }
      }

      socket.on("transcription", handleTranscription)
      socket.on("transcription_result", handleTranscription)

      socket.on("error", (data: { message: string }) => {
        console.log("[DEBUG] Recibido evento 'error' del socket:", data)
        onStatusChange(`Error: ${data.message}`)
        console.error("Socket Error:", data.message)
      })

      socket.on("no_speech", (data: { message: string }) => {
        console.log("[DEBUG] Recibido evento 'no_speech':", data)
        alert(data.message)
      })

      socket.on("disconnect", () => {
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
        auth: {
          token: accessToken,
        },
      })

      socketRef.current = socket
      attachCommonHandlers()
    }

    initSocket()

    return () => {
      isCancelled = true
      // Limpiar polling al desmontar
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [conversationId, selectedCharacterId, onStatusChange, onMessagesUpdate, onTranscriptionResult, base64ToObjectUrl])

  // Función para hacer polling de nuevos mensajes desde el backend
  const pollForNewMessages = useCallback(async () => {
    if (!conversationId) return

    try {
      const response = await fetch(`/api/conversations/${conversationId}`)
      if (!response.ok) throw new Error("Error al obtener mensajes")

      const data = await response.json()
      const fetchedMessages: Message[] = normalizeBackendMessages(data.messages || [])

      onMessagesUpdate((prev) => mergeMessageCollection(prev, fetchedMessages))

      lastMessageCountRef.current = fetchedMessages.length

      const latestAssistantMessage = [...fetchedMessages].reverse().find((message) => message.role === "assistant")
      if (latestAssistantMessage) {
        if (hasAssistantAudio(latestAssistantMessage)) {
          onStatusChange("Listo")
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
        } else {
          onStatusChange("Generando audio...")
        }
      }
    } catch (error) {
      console.error("Error en polling de mensajes:", error)
    }
  }, [conversationId, onMessagesUpdate, onStatusChange])

  // Función para iniciar el polling
  const startPolling = useCallback(() => {
    // Evitar múltiples polls simultáneos
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    // Primer polling inmediato
    pollForNewMessages()

    // Luego polling cada 2 segundos, máximo 30 segundos (15 intentos)
    let pollCount = 0
    pollingIntervalRef.current = setInterval(() => {
      pollCount++
      pollForNewMessages()

      // Detener después de 30 segundos
      if (pollCount >= 15) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
      }
    }, 2000)
  }, [pollForNewMessages])

  const sendMessage = useCallback(
    (text: string) => {
      console.log("[DEBUG] Intentando enviar mensaje de texto:", text, "conectado:", isConnected, "conversationId:", conversationId)
      if (!text.trim() || !isConnected || !conversationId) return

      // Enviar evento estructurado según nuestro nuevo Gateway de Node
      console.log("[DEBUG] Emitiendo 'send_text' con texto:", text)
      socketRef.current?.emit("send_text", {
        conversationId,
        text,
      })

      // Iniciar polling como fallback si el WebSocket no responde
      startPolling()
    },
    [isConnected, conversationId, startPolling]
  )

  const sendAudioMessage = useCallback(
    (base64Data: string) => {
      console.log("[DEBUG] Intentando enviar mensaje de audio, conectado:", isConnected, "conversationId:", conversationId)
      if (!isConnected || !conversationId) {
        console.error("[DEBUG] No se pudo enviar el audio: sin conexión o sin conversationId.")
        return
      }

      console.log("[DEBUG] Emitiendo 'send_audio' con audio de longitud:", base64Data.length)
      socketRef.current?.emit("send_audio", {
        conversationId,
        audioBase64: base64Data,
        mimeType: "audio/webm",
      })

      // Iniciar polling como fallback si el WebSocket no responde
      startPolling()
    },
    [isConnected, conversationId, startPolling]
  )

  return { sendMessage, sendAudioMessage, isConnected }
}