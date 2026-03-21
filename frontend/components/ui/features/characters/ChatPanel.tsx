"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { VoiceRecordingModal } from "@/components/ui/features/characters/VoiceRecordingModal"
import { CallModePanel } from "@/components/ui/features/characters/CallModePanel"
import { DebatePanel } from "@/components/ui/features/characters/DebatePanel"
import { useConversation } from "@/hooks/useConversationId"
import { useWebSocketChat } from "@/hooks/useWebSocket"
import { useVoiceRecording } from "@/hooks/useVoiceRecording"
import { useAudioResolver } from "@/hooks/useAudioResolver"
import { ChatInput } from "@/components/ui/features/characters/ChatInput"
import { ChatMessages } from "@/components/ui/features/characters/ChatMessages"
import { MessageSquare, Phone, Swords, GraduationCap } from "lucide-react"

type ConversationMode = "chat" | "call" | "interview" | "debate" | "professor"

interface ChatInterfaceProps {
  conversationId: string | null
  defaultCharacterId?: string | null
  defaultCharacterName?: string
  initialMode?: ConversationMode
  onConversationCreated?: (conversation: { id: string; mode?: "single" | "debate" }) => void
}

const MODES: { id: ConversationMode; label: string; icon: React.ElementType }[] = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "call", label: "Llamada", icon: Phone },
  { id: "debate", label: "Debate", icon: Swords },
  { id: "professor", label: "Profesor", icon: GraduationCap },
]

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversationId,
  defaultCharacterId = null,
  defaultCharacterName,
  initialMode = "chat",
  onConversationCreated,
}) => {
  const [status, setStatus] = useState("Desconectado")
  const [activeMode, setActiveMode] = useState<ConversationMode>(initialMode)

  const {
    messages,
    setMessages,
    selectedCharacterId,
    availableCharacters,
    characterName,
  } = useConversation(conversationId)

  const effectiveCharacterId = selectedCharacterId ?? defaultCharacterId
  const effectiveCharacterName =
    characterName && characterName !== "Cargando..."
      ? characterName
      : (defaultCharacterName ?? "el personaje")
  const effectiveAvailableCharacters =
    availableCharacters.length > 0
      ? availableCharacters
      : effectiveCharacterId
        ? [{ id: effectiveCharacterId, name: effectiveCharacterName }]
        : []

  useEffect(() => {
    setActiveMode(initialMode)
  }, [conversationId, initialMode])

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
    selectedCharacterId: effectiveCharacterId,
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
            {conversationId ? (
              <ChatMessages
                messages={messages}
                availableCharacters={effectiveAvailableCharacters}
                selectedCharacterId={effectiveCharacterId}
                conversationId={conversationId}
                messagesEndRef={messagesEndRef}
                resolveAudioUrl={resolveAudioUrl}
                characterName={effectiveCharacterName}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <h3 className="text-base font-semibold mb-1 text-foreground">No hay conversación activa</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Selecciona una conversación del historial o cambia a otra pestaña para continuar.
                </p>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-4 shrink-0">
            <ChatInput
              isRecording={isRecording}
              isConnected={Boolean(conversationId && isConnected)}
              isModalOpen={showVoiceModal}
              selectedCharacterId={effectiveCharacterId}
              availableCharacters={effectiveAvailableCharacters}
              onSendMessage={handleSendMessage}
              onToggleRecording={handleToggleRecording}
              status={status}
            />
          </div>
        </>
      ) : activeMode === "call" ? (
        <CallModePanel characterId={effectiveCharacterId} onEndCall={() => setActiveMode("chat")} />
      ) : activeMode === "debate" ? (
        <DebatePanel
          currentCharacterId={effectiveCharacterId}
          existingConversationId={conversationId}
          onConversationCreated={onConversationCreated}
        />
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