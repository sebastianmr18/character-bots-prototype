"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useTheme } from "@/app/providers"
import { VoiceRecordingModal } from "./VoiceRecordingModal";
import { useConversation } from "@/hooks/useConversationId";
import { useWebSocketChat } from "@/hooks/useWebSocket";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { StatusIndicator } from "@/components/ui/features/chat-interface/StatusIndicator";
import { ChatInput } from "@/components/ui/features/chat-interface/ChatInput";
import { ChatMessages } from "@/components/ui/features/chat-interface/ChatMessages";
import { Button } from "@/components/ui/button"
import { Moon, Sun } from 'lucide-react'

const ChatInterface: React.FC<{ conversationId: string }> = ({ conversationId }) => {
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

  const onTranscriptionResult = useCallback((text: string) => {
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
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", content: text }])

    // Send through WebSocket
    sendMessage(text)
  }

  const handleToggleRecording = async () => {
    if (isRecording) {
      setStatus("Procesando audio...")
      const base64Data = await stopRecording()

      if (base64Data) {
        sendAudioMessage(base64Data)
      }
      setShowVoiceModal(false)
    } else {
      await startRecording()
      setStatus("Grabando voz...")
      console.log("Grabación iniciada, mostrando modal.?")
      setShowVoiceModal(true)
    }
  }

  const handleSendVoiceMessage = (reviewedText: string) => {
    setShowVoiceModal(false)
    setVoiceTranscription("")
    handleSendMessage(reviewedText)
  }

  const handleCloseVoiceModal = () => {
    setShowVoiceModal(false)
    setVoiceTranscription("")
    setStatus("Listo")
  }

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

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-800/50">
          <ChatMessages
            messages={messages}
            availableCharacters={availableCharacters} // Suministrado por useConversation
            selectedCharacterId={selectedCharacterId} // Suministrado por useConversation
            conversationId={conversationId}
            messagesEndRef={messagesEndRef}
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