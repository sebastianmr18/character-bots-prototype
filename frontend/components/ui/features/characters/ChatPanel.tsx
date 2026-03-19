"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { VoiceRecordingModal } from "@/components/ui/features/characters/VoiceRecordingModal"
import { CallModePanel } from "@/components/ui/features/characters/CallModePanel"
import { useConversation } from "@/hooks/useConversationId"
import { useWebSocketChat } from "@/hooks/useWebSocket"
import { useVoiceRecording } from "@/hooks/useVoiceRecording"
import { useAudioResolver } from "@/hooks/useAudioResolver"
import { ChatInput } from "@/components/ui/features/characters/ChatInput"
import { ChatMessages } from "@/components/ui/features/characters/ChatMessages"
import { MessageSquare, Phone, Swords, GraduationCap } from "lucide-react"

type ConversationMode = "chat" | "call" | "interview" | "debate" | "professor"

const MODES: { id: ConversationMode; label: string; icon: React.ElementType }[] = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "call", label: "Llamada", icon: Phone },
  { id: "debate", label: "Debate", icon: Swords },
  { id: "professor", label: "Profesor", icon: GraduationCap },
]

const ChatInterface: React.FC<{ conversationId: string }> = ({ conversationId }) => {
  const [status, setStatus] = useState("Desconectado")
  const [activeMode, setActiveMode] = useState<ConversationMode>("chat")

  const {
    messages,
    setMessages,
    selectedCharacterId,
    availableCharacters,
    characterName,
  } = useConversation(conversationId)

  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const audioPlaceholderIdRef = useRef<number | null>(null)

  const clearAudioPlaceholder = useCallback(() => {
    if (audioPlaceholderIdRef.current === null) return

    const placeholderId = audioPlaceholderIdRef.current
    setMessages((prev) => prev.filter((msg) => String(msg.id) !== String(placeholderId)))
    audioPlaceholderIdRef.current = null
  }, [setMessages])

  const onTranscriptionResult = useCallback(
    (text: string) => {
      if (!text.trim()) {
        clearAudioPlaceholder()
        setStatus("Sin transcripción")
        return
      }

      setMessages((prev) =>
        prev.map((msg) =>
          audioPlaceholderIdRef.current !== null &&
          String(msg.id) === String(audioPlaceholderIdRef.current)
            ? { ...msg, content: text }
            : msg
        )
      )
      audioPlaceholderIdRef.current = null
      setStatus("Transcripción recibida")
    },
    [clearAudioPlaceholder, setMessages]
  )

  const onNoSpeech = useCallback(() => {
    clearAudioPlaceholder()
    setStatus("No se detectó voz")
  }, [clearAudioPlaceholder])

  const { sendMessage, sendAudioMessage, isConnected } = useWebSocketChat({
    conversationId,
    selectedCharacterId,
    onStatusChange: setStatus,
    onMessagesUpdate: setMessages,
    onTranscriptionResult,
    onNoSpeech,
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const { isRecording, audioLevel, startRecording, stopRecording } = useVoiceRecording()

  const scrollToBottom = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return
    setMessages((prev) => [...prev, { id: -Date.now(), role: "user", content: text }])
    sendMessage(text)
  }

  const handleToggleRecording = async () => {
    try {
      if (isRecording) {
        setStatus("Esperando transcripción...")
        const base64Data = await stopRecording()

        if (base64Data) {
          const placeholderId = -Date.now()
          audioPlaceholderIdRef.current = placeholderId
          setMessages((prev) => [
            ...prev,
            { id: placeholderId, role: "user", content: "🎤 Enviando audio..." },
          ])
          sendAudioMessage(base64Data)
        }
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
      try {
        await stopRecording()
      } catch (error) {
        console.error("Error al cancelar grabación:", error)
      }
    }
    clearAudioPlaceholder()
    setShowVoiceModal(false)
    setStatus(isRecording ? "Grabación cancelada" : "Listo")
  }

  const handleModeClick = (mode: ConversationMode) => {
    setActiveMode(mode)
  }

  const resolveAudioUrl = useAudioResolver(conversationId, messages, setMessages)

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] overflow-hidden border border-border rounded-xl">
      {/* Mode Selector Tabs */}
      <div className="border-b border-border px-4 py-2 flex gap-1 overflow-x-auto shrink-0">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => handleModeClick(m.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeMode === m.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
            }`}
          >
            <m.icon className="h-4 w-4" />
            {m.label}
          </button>
        ))}
      </div>

      {/* Content area */}
      {activeMode === "chat" ? (
        <>
          {/* Messages */}
          <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
            <ChatMessages
              messages={messages}
              availableCharacters={availableCharacters}
              selectedCharacterId={selectedCharacterId}
              conversationId={conversationId}
              messagesEndRef={messagesEndRef}
              resolveAudioUrl={resolveAudioUrl}
              characterName={characterName}
            />
          </div>

          {/* Input */}
          <div className="border-t border-border p-4 shrink-0">
            <ChatInput
              isRecording={isRecording}
              isConnected={isConnected}
              isModalOpen={showVoiceModal}
              selectedCharacterId={selectedCharacterId}
              availableCharacters={availableCharacters}
              onSendMessage={handleSendMessage}
              onToggleRecording={handleToggleRecording}
              status={status}
            />
          </div>
        </>
      ) : activeMode === "call" ? (
        <CallModePanel characterId={selectedCharacterId} onEndCall={() => setActiveMode("chat")} />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">
            {MODES.find((m) => m.id === activeMode)?.label} — Próximamente
          </p>
        </div>
      )}

      <VoiceRecordingModal
        isOpen={showVoiceModal}
        onToggleRecording={handleToggleRecording}
        isRecording={isRecording}
        audioLevel={audioLevel}
        onClose={handleCloseVoiceModal}
      />
    </div>
  )
}

export default ChatInterface