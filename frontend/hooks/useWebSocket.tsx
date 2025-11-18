"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { WS_URL, CONVERSATION_ID_PREFIX } from "@/constants/chat.constants"
import type { Message, WebSocketMessage } from "@/types/chat.types"
import { playAudio } from "@/utils/audio.utils"

interface UseWebSocketChatProps {
  conversationId: string | null
  selectedCharacterId: string | null
  onStatusChange: (status: string) => void
  onMessagesUpdate: (messages: Message[]) => void
  onTranscriptionResult: (text: string) => void
}

export const useWebSocketChat = ({
  conversationId,
  selectedCharacterId,
  onStatusChange,
  onMessagesUpdate,
  onTranscriptionResult,
}: UseWebSocketChatProps) => {
  const ws = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!conversationId || !selectedCharacterId) return

    ws.current = new WebSocket(WS_URL)
    onStatusChange("Conectando...")

    ws.current.onopen = () => {
      onStatusChange("Conectado")
      setIsConnected(true)
      ws.current?.send(
        JSON.stringify({
          type: "init",
          conversation_id: conversationId,
          character_id: selectedCharacterId,
        }),
      )
    }

    ws.current.onmessage = (event) => {
      const data: WebSocketMessage = JSON.parse(event.data)

      switch (data.type) {
        case "status":
          onStatusChange(data.message || "")
          break

        case "transcription_result":
          if (data.text) {
            onTranscriptionResult(data.text)
          }
          console.log("Resultado de transcripción recibido")
          break

        case "text_response":
          onMessagesUpdate((prev) => [
            ...prev,
            { id: Date.now(), role: "assistant", content: data.text || "" },
          ])
          onStatusChange("Listo")
          console.log("Respuesta de Gemini Escrita")
          break

        case "audio_response":
          if (data.audio) {
            console.log("Audio listo")
            playAudio(data.audio)
          }
          break

        case "error":
          onStatusChange(`Error: ${data.message || ""}`)
          if (data.message?.includes("ID de conversación inválido")) {
            console.error("ID inválido detectado, forzando regeneración.")
            const DYNAMIC_CONV_KEY =
              CONVERSATION_ID_PREFIX + selectedCharacterId
            localStorage.removeItem(DYNAMIC_CONV_KEY)
            ws.current?.close()
          }
          break
      }
    }

    ws.current.onclose = () => {
      onStatusChange("Desconectado")
      setIsConnected(false)
      console.log("WebSocket cerrado.")
    }

    ws.current.onerror = (error) => {
      console.error("Error de WebSocket:", error)
      onStatusChange("Error de conexión")
      setIsConnected(false)
    }

    return () => {
      ws.current?.close()
    }
  }, [
    conversationId,
    selectedCharacterId,
    onStatusChange,
    onMessagesUpdate,
    onTranscriptionResult,
  ])

  const sendMessage = useCallback(
    (text: string) => {
      if (
        !text.trim() ||
        ws.current?.readyState !== WebSocket.OPEN ||
        !conversationId ||
        !selectedCharacterId
      ) {
        return
      }

      ws.current.send(
        JSON.stringify({
          type: "text",
          text,
          conversation_id: conversationId,
          character_id: selectedCharacterId,
        }),
      )
    },
    [conversationId, selectedCharacterId],
  )

  const sendAudioMessage = useCallback(
    (base64Data: string) => {
      if (
        ws.current?.readyState !== WebSocket.OPEN ||
        !conversationId ||
        !selectedCharacterId
      ) {
        console.error(
          "No se pudo enviar el audio: conexión no disponible o IDs nulos.",
        )
        return
      }

      ws.current.send(
        JSON.stringify({
          type: "audio", // Este tipo ahora solo transcribe
          audio: base64Data,
          conversation_id: conversationId,
          character_id: selectedCharacterId,
        }),
      )
    },
    [conversationId, selectedCharacterId],
  )

  return { sendMessage, sendAudioMessage, isConnected }
}