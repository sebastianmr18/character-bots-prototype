"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "@/app/providers"
import { VoiceRecordingModal } from "./VoiceRecordingModal";
import { useConversation } from "@/hooks/useConversationId";
import { useWebSocketChat } from "@/hooks/useWebSocket";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { StatusIndicator } from "@/components/ui/features/chat-interface/StatusIndicator";
import { ChatInput } from "@/components/ui/features/chat-interface/ChatInput";
import { ChatMessages } from "@/components/ui/features/chat-interface/ChatMessages";
import { Button } from "@/components/ui/button"
import { Moon, Sun, Phone } from 'lucide-react'
import { normalizeBackendMessages } from "@/utils/message.utils"

const ChatInterface: React.FC<{ conversationId: string }> = ({ conversationId }) => {
  const router = useRouter()
  const [status, setStatus] = useState("Desconectado")
  const { theme, toggleTheme } = useTheme()

  const { 
    messages, 
    setMessages, 
    selectedCharacterId, 
    availableCharacters,
    characterName
  } = useConversation(conversationId)

  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [voiceTranscription, setVoiceTranscription] = useState("")
  const transcriptionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const onTranscriptionResult = useCallback((text: string) => {
    console.log("[DEBUG] Transcripción recibida del backend:", text)
    if (transcriptionTimeoutRef.current) {
      clearTimeout(transcriptionTimeoutRef.current)
      transcriptionTimeoutRef.current = null
    }
    setVoiceTranscription(text)
    setShowVoiceModal(true)
    setStatus("Transcripción recibida. Revisa.")
  }, [])

  const { sendMessage, sendAudioMessage, isConnected } = useWebSocketChat({
    conversationId,
    selectedCharacterId,
    onStatusChange: setStatus,
    onMessagesUpdate: setMessages,
    onTranscriptionResult: onTranscriptionResult,
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { isRecording, audioLevel, startRecording, stopRecording } = useVoiceRecording()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return

    // Add user message immediately
    setMessages((prev) => [...prev, { id: -Date.now(), role: "user", content: text }])

    // Send through WebSocket
    sendMessage(text)
  }

  const handleToggleRecording = async () => {
    try {
      if (isRecording) {
        console.log("[DEBUG] Deteniendo grabación de voz")
        setStatus("Esperando transcripción...")
        const base64Data = await stopRecording()
        console.log("[DEBUG] Grabación detenida, base64Data recibido:", base64Data ? "Sí" : "No", base64Data ? `(${base64Data.length} chars)` : "")

        if (base64Data) {
          console.log("[DEBUG] Enviando mensaje de audio al backend")
          sendAudioMessage(base64Data)
          // Iniciar timeout para cerrar modal si no llega transcripción
          /*transcriptionTimeoutRef.current = setTimeout(() => {
            console.log("[DEBUG] Timeout: no llegó transcripción, cerrando modal")
            setShowVoiceModal(false)
            setVoiceTranscription("")
            setStatus("Listo")
          }, 10000) // 10 segundos*/
        } else {
          console.log("[DEBUG] No se recibió base64Data, no se envía mensaje")
        }
        // No cerrar el modal aquí, esperar la transcripción
      } else {
        console.log("[DEBUG] Iniciando grabación de voz")
        setVoiceTranscription("") // Limpiar transcripción anterior
        await startRecording()
        setStatus("Grabando voz...")
        console.log("[DEBUG] Grabación iniciada, mostrando modal")
        setShowVoiceModal(true)
      }
    } catch (error) {
      console.error("[DEBUG] Error en handleToggleRecording:", error)
      setStatus("Error en grabación")
    }
  }

  const handleSendVoiceMessage = (reviewedText: string) => {
    console.log("[DEBUG] Enviando mensaje de voz revisado:", reviewedText)
    if (transcriptionTimeoutRef.current) {
      clearTimeout(transcriptionTimeoutRef.current)
      transcriptionTimeoutRef.current = null
    }
    setShowVoiceModal(false)
    setVoiceTranscription("")
    handleSendMessage(reviewedText)
  }

  const handleCloseVoiceModal = () => {
    if (isRecording) {
      // Si está grabando, detener primero
      handleToggleRecording()
    }
    if (transcriptionTimeoutRef.current) {
      clearTimeout(transcriptionTimeoutRef.current)
      transcriptionTimeoutRef.current = null
    }
    setShowVoiceModal(false)
    setVoiceTranscription("")
    setStatus("Listo")
  }

  const resolveAudioUrl = useCallback(
    async (messageId: number | string, forceRefresh = false) => {
      if (!conversationId) {
        return { audioUrl: null, mediaType: null }
      }

      if (!forceRefresh) {
        const localMessage = messages.find((message) => String(message.id) === String(messageId))
        if (localMessage?.audioUrl) {
          return {
            audioUrl: localMessage.audioUrl,
            mediaType: localMessage.mediaType ?? null,
          }
        }
      }

      const response = await fetch(`/api/conversations/${conversationId}`, { cache: "no-store" })
      if (!response.ok) {
        return { audioUrl: null, mediaType: null }
      }

      const data = await response.json()
      const normalizedMessages = normalizeBackendMessages(data.messages || [])

      setMessages((prev) => {
        const updatesById = new Map(normalizedMessages.map((message) => [String(message.id), message]))
        return prev.map((message) => {
          const updated = updatesById.get(String(message.id))
          return updated ? { ...message, ...updated } : message
        })
      })

      const refreshedMessage = normalizedMessages.find((message) => String(message.id) === String(messageId))
      return {
        audioUrl: refreshedMessage?.audioUrl ?? null,
        mediaType: refreshedMessage?.mediaType ?? null,
      }
    },
    [conversationId, messages, setMessages]
  )

  // Renderizado
  return (
    <div className="flex w-full min-h-screen">
      <div
        className="w-full min-h-screen flex flex-col rounded-2xl border border-gray-200 shadow-2xl 
                   bg-white dark:bg-gray-900 dark:border-gray-700 
                   text-gray-900 dark:text-gray-100 transition-all duration-300 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Habla con {characterName || "el personaje"}</h1>
              <p className="text-sm text-blue-100">Prototipo con RAG y ElevenLabs</p>
            </div>

            <div className="flex items-center gap-2">
              {selectedCharacterId && (
                <Button
                  onClick={() => router.push(`/call/${selectedCharacterId}`)}
                  className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
                  title="Iniciar llamada de voz"
                >
                  <Phone className="w-4 h-4" />
                  <span className="hidden sm:inline">Llamar</span>
                </Button>
              )}
              <StatusIndicator status={status} />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-white hover:bg-white/20"
                title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-800/50">
          <ChatMessages
            messages={messages}
            availableCharacters={availableCharacters} // Suministrado por useConversation
            selectedCharacterId={selectedCharacterId} // Suministrado por useConversation
            conversationId={conversationId}
            messagesEndRef={messagesEndRef}
            resolveAudioUrl={resolveAudioUrl}
          />
        </div>

        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <ChatInput
            isRecording={isRecording}
            isConnected={isConnected}
            isModalOpen={showVoiceModal}
            selectedCharacterId={selectedCharacterId}
            availableCharacters={availableCharacters}
            onSendMessage={handleSendMessage}
            onToggleRecording={handleToggleRecording}
          />

          <p className="mt-3 text-xs text-center text-gray-500 dark:text-gray-400">
            Transcripción de voz con ElevenLabs • Respuestas con audio incluido
          </p>
        </div>

        <VoiceRecordingModal
          isOpen={showVoiceModal}
          onToggleRecording={handleToggleRecording}
          isRecording={isRecording}
          audioLevel={audioLevel}
          transcription={voiceTranscription}
          onClose={handleCloseVoiceModal}
          onSend={handleSendVoiceMessage}
        />
      </div>
    </div>
  )
}

export default ChatInterface