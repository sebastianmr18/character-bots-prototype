"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "@/app/providers"
import { VoiceRecordingModal } from "@/components/ui/features/chat-interface/VoiceRecordingModal";
import { useConversation } from "@/hooks/useConversationId";
import { useWebSocketChat } from "@/hooks/useWebSocket";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useAudioResolver } from "@/hooks/useAudioResolver";
import { StatusIndicator } from "@/components/ui/features/chat-interface/StatusIndicator";
import { ChatInput } from "@/components/ui/features/chat-interface/ChatInput";
import { ChatMessages } from "@/components/ui/features/chat-interface/ChatMessages";
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Moon, Sun, Phone, CircleHelp } from 'lucide-react'

const ChatInterface: React.FC<{ conversationId: string }> = ({ conversationId }) => {
  const router = useRouter()
  const [status, setStatus] = useState("Desconectado")
  const { theme, toggleTheme } = useTheme()

  const { 
    messages, 
    setMessages, 
    selectedCharacterId, 
    availableCharacters,
    characterName,
    characterBiography,
    characterDataset,
  } = useConversation(conversationId)

  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const audioPlaceholderIdRef = useRef<number | null>(null)

  const clearAudioPlaceholder = useCallback(() => {
    if (audioPlaceholderIdRef.current === null) return

    const placeholderId = audioPlaceholderIdRef.current
    setMessages((prev) => prev.filter((msg) => String(msg.id) !== String(placeholderId)))
    audioPlaceholderIdRef.current = null
  }, [setMessages])

  const onTranscriptionResult = useCallback((text: string) => {
    if (!text.trim()) {
      clearAudioPlaceholder()
      setStatus("Sin transcripción")
      return
    }

    // Replace the placeholder bubble with the real transcription text
    setMessages((prev) =>
      prev.map((msg) =>
        audioPlaceholderIdRef.current !== null && String(msg.id) === String(audioPlaceholderIdRef.current)
          ? { ...msg, content: text }
          : msg
      )
    )
    audioPlaceholderIdRef.current = null
    // Keep transcription as UI feedback only. Backend already processed send_audio.
    setStatus("Transcripción recibida")
  }, [clearAudioPlaceholder, setMessages])

  const onNoSpeech = useCallback(() => {
    clearAudioPlaceholder()
    setStatus("No se detectó voz")
  }, [clearAudioPlaceholder])

  const { sendMessage, sendAudioMessage, isConnected } = useWebSocketChat({
    conversationId,
    selectedCharacterId,
    onStatusChange: setStatus,
    onMessagesUpdate: setMessages,
    onTranscriptionResult: onTranscriptionResult,
    onNoSpeech,
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { isRecording, audioLevel, startRecording, stopRecording } = useVoiceRecording()

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

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
        setStatus("Esperando transcripción...")
        const base64Data = await stopRecording()

        if (base64Data) {
          // Add a placeholder bubble so the user message always appears before the bot response
          const placeholderId = -Date.now()
          audioPlaceholderIdRef.current = placeholderId
          setMessages((prev) => [...prev, { id: placeholderId, role: "user", content: "🎤 Enviando audio..." }])
          sendAudioMessage(base64Data)
        }
        // Close modal immediately — no review step
        setShowVoiceModal(false)
      } else {
        await startRecording()
        setStatus("Grabando voz...")
        setShowVoiceModal(true)
      }
    } catch (error) {
      console.error("Error en handleToggleRecording:", error)
      setStatus("Error en grabación")
    }
  }

  const handleCloseVoiceModal = async () => {
    if (isRecording) {
      // Si el usuario cancela mientras graba, detener y descartar audio sin enviarlo
      try {
        await stopRecording()
      } catch (error) {
        console.error("Error al cancelar grabación:", error)
      }
    }
    // If there's a dangling placeholder (recording cancelled before transcription), remove it
    clearAudioPlaceholder()
    setShowVoiceModal(false)
    setStatus(isRecording ? "Grabación cancelada" : "Listo")
  }

  const resolveAudioUrl = useAudioResolver(conversationId, messages, setMessages)

  // Renderizado
  return (
    <div className="flex w-full min-h-[calc(100vh-6rem)]">
      <div
        className="w-full min-h-0 flex flex-col rounded-2xl border border-gray-200 shadow-2xl 
                   bg-white dark:bg-gray-900 dark:border-gray-700 
                   text-gray-900 dark:text-gray-100 transition-all duration-300 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                <span>Habla con {characterName || "el personaje"}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-full text-blue-100 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                      aria-label="Ver biografia del personaje"
                    >
                      <CircleHelp className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={8} className="max-w-xs text-xs leading-relaxed">
                    {characterDataset}
                  </TooltipContent>
                </Tooltip>
              </h1>
              <p className="text-sm text-blue-100">{characterBiography}</p>
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

        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-800/50">
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
          onClose={handleCloseVoiceModal}
        />
      </div>
    </div>
  )
}

export default ChatInterface