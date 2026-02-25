"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { io, Socket } from "socket.io-client"
import { WS_URL } from "@/constants/chat.constants"
import type { Message } from "@/types/chat.types"
import { playAudio } from "@/utils/audio.utils"

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

  useEffect(() => {
    if (!conversationId || !selectedCharacterId) return

    const baseUrl = WS_URL.replace("/ws/chat/", "")
    
    socketRef.current = io(baseUrl, {
      transports: ["websocket"],
      withCredentials: true,
    })

    onStatusChange("Conectando...")

    const socket = socketRef.current

    socket.on("connect", () => {
      onStatusChange("Conectado")
      setIsConnected(true)

      socket.emit("join_chat", conversationId)

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

    socket.on("system_message", (data: any) => {
      onStatusChange(data.content || data.message || "Listo")
    })

    socket.on("bot_typing", () => {
      onStatusChange("Escribiendo...")
    })

    socket.on("ai_message", (data: { text: string; audio?: string }) => {
      console.log("[DEBUG] Recibido evento 'ai_message':", data)
      onMessagesUpdate((prev) => {
        // Evitar duplicados verificando por content y role
        if (!prev.find((m) => m.content === data.text && m.role === "assistant")) {
          return [...prev, { id: -Date.now(), role: "assistant", content: data.text }]
        }
        return prev
      })
      
      // Detener polling cuando se reciba respuesta del WebSocket
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      
      if (data.audio) {
        console.log("Audio recibido")
        playAudio(data.audio)
      }
      onStatusChange("Listo")
    })

    socket.on("transcription_result", (data: { text: string }) => {
      console.log("[DEBUG] Recibido evento 'transcription_result':", data)
      if (data.text) {
        onTranscriptionResult(data.text)
      } else {
        console.log("[DEBUG] Transcripción vacía o nula")
      }
    })

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
      setIsConnected(false)
      // Limpiar polling en desconexión
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    })

    return () => {
      // Limpiar polling al desmontar
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      socket.disconnect()
    }
  }, [conversationId, selectedCharacterId, onStatusChange, onMessagesUpdate, onTranscriptionResult])

  // Función para hacer polling de nuevos mensajes desde el backend
  const pollForNewMessages = useCallback(async () => {
    if (!conversationId) return

    try {
      const response = await fetch(`/api/conversations/${conversationId}`)
      if (!response.ok) throw new Error("Error al obtener mensajes")

      const data = await response.json()
      const fetchedMessages: Message[] = data.messages || []

      // Si hay nuevos mensajes
      if (fetchedMessages.length > lastMessageCountRef.current) {
        const newMessagesCount = fetchedMessages.length - lastMessageCountRef.current
        const newMessages = fetchedMessages.slice(
          lastMessageCountRef.current,
          fetchedMessages.length
        )

        // Agregar los nuevos mensajes
        newMessages.forEach((msg) => {
          onMessagesUpdate((prev) => {
            // Evitar duplicados verificando por id, content y role
            if (!prev.find((m) => m.id === msg.id || (m.content === msg.content && m.role === msg.role))) {
              return [...prev, msg]
            }
            return prev
          })
        })

        lastMessageCountRef.current = fetchedMessages.length

        // Si hay un mensaje de IA, detener el polling
        if (newMessages.some((m) => m.role === "assistant")) {
          onStatusChange("Listo")
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
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
      })

      // Iniciar polling como fallback si el WebSocket no responde
      startPolling()
    },
    [isConnected, conversationId, startPolling]
  )

  return { sendMessage, sendAudioMessage, isConnected }
}