"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useTheme } from "@/app/providers"
import { VoiceRecordingModal } from "./VoiceRecordingModal";
import { useCharacters } from "@/hooks/useCharacters";
import { useConversationId } from "@/hooks/useConversationId";
import { useWebSocketChat } from "@/hooks/useWebSocket";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { CharacterSelector } from "@/components/ui/features/chat-interface/CharacterSelector";
import { CharacterSidebar } from "@/components/ui/features/chat-interface/CharacterSidebar";
import { StatusIndicator } from "@/components/ui/features/chat-interface/StatusIndicator";
import { ChatInput } from "@/components/ui/features/chat-interface/ChatInput";
import { ChatMessages } from "@/components/ui/features/chat-interface/ChatMessages";
import { VoiceRecordingButton } from "@/components/ui/features/chat-interface/VoiceRecordingButton";
import { Button } from "@/components/ui/button"
import { Moon, Sun } from 'lucide-react'

const ChatInterface: React.FC = () => {
  const [status, setStatus] = useState("Desconectado")
  const { theme, toggleTheme } = useTheme()
  const { availableCharacters, selectedCharacterId, handleCharacterChange } = useCharacters()
  const { conversationId, messages, setMessages } = useConversationId(selectedCharacterId)

  const { sendMessage, sendAudioMessage, isConnected } = useWebSocketChat({
    conversationId,
    selectedCharacterId,
    onStatusChange: setStatus,
    onMessagesUpdate: setMessages,
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
    } else {
      await startRecording()
      setStatus("Grabando voz...")
    }
  }

  // 4. Renderizado
  return (
    <div className="flex w-full min-h-screen">

      <CharacterSidebar
        availableCharacters={availableCharacters}
        selectedCharacterId={selectedCharacterId}
        onCharacterChange={handleCharacterChange}/>

<div
  className="w-full min-h-screen flex flex-col rounded-2xl border border-gray-200 shadow-2xl 
             bg-white dark:bg-gray-900 dark:border-gray-700 
             text-gray-900 dark:text-gray-100 transition-all duration-300 overflow-hidden"
>
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Habla con Sheldon Cooper!</h1>
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

      {/* 💡 Selector de Personaje */}
      <CharacterSelector
        availableCharacters={availableCharacters}
        selectedCharacterId={selectedCharacterId}
        onCharacterChange={handleCharacterChange}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-800/50">
        {/* ... (Mensajes de chat) ... */}
        <ChatMessages
          messages={messages}
          availableCharacters={availableCharacters}
          selectedCharacterId={selectedCharacterId}
          conversationId={conversationId}
          messagesEndRef={messagesEndRef}
        />
      </div>

      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <ChatInput
          isRecording={isRecording}
          isConnected={isConnected}
          selectedCharacterId={selectedCharacterId}
          availableCharacters={availableCharacters}
          onSendMessage={handleSendMessage}
        />

        <VoiceRecordingButton
          isRecording={isRecording}
          isConnected={isConnected}
          onToggleRecording={handleToggleRecording}
        />
        <p className="mt-3 text-xs text-center text-gray-500 dark:text-gray-400">
          Transcripción de voz con ElevenLabs • Respuestas con audio incluido
        </p>
      </div>

      {/*<VoiceRecordingModal
        isOpen={showVoiceModal}
        isRecording={isRecording}
        audioLevel={audioLevel}
        transcription={voiceTranscription}
        onClose={handleCloseVoiceModal}
        onSend={handleSendVoiceMessage}
      />*/}
    </div>
    </div>
  )
}

export default ChatInterface