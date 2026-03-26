"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { VoiceRecordingModal } from "@/components/ui/features/characters/shared/VoiceRecordingModal"
import { CallModePanel } from "@/components/ui/features/characters/modes/call/CallMode"
import { DebatePanel } from "@/components/ui/features/characters/modes/debate/DebateMode"
import { useConversation } from "@/hooks/useConversationId"
import { useWebSocketChat } from "@/hooks/useWebSocket"
import { useVoiceRecording } from "@/hooks/useVoiceRecording"
import { useAudioResolver } from "@/hooks/useAudioResolver"
import { ChatInput } from "@/components/ui/features/characters/modes/chat/ChatInput"
import { ChatMessages } from "@/components/ui/features/characters/modes/chat/ChatMessages"
import { MessageSquare, Phone, Swords, GraduationCap } from "lucide-react"

export type ConversationMode = "chat" | "call" | "interview" | "debate" | "professor"

interface ChatInterfaceProps {
  activeMode: ConversationMode
  singleConversationId: string | null
  debateConversationId: string | null
  defaultCharacterId?: string | null
  defaultCharacterName?: string
  onModeChange?: (mode: ConversationMode) => void
  onConversationCreated?: (conversation: { id: string; mode?: "single" | "debate" }) => void
}

const MODES: { id: ConversationMode; label: string; icon: React.ElementType }[] = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "call", label: "Llamada", icon: Phone },
  { id: "debate", label: "Debate", icon: Swords },
  { id: "professor", label: "Profesor", icon: GraduationCap },
]

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  activeMode,
  singleConversationId,
  debateConversationId,
  defaultCharacterId = null,
  defaultCharacterName,
  onModeChange,
  onConversationCreated,
}) => {
  const [status, setStatus] = useState("Desconectado")
  const chatConversationId = activeMode === "chat" ? singleConversationId : null
  const debateConversationIdForPanel = activeMode === "debate" ? debateConversationId : null

  const {
    messages,
    setMessages,
    selectedCharacterId,
    availableCharacters,
    characterName,
    isLoading,
    isModeCompatible,
  } = useConversation(chatConversationId, { expectedMode: "single" })

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
    conversationId: !isLoading && isModeCompatible ? chatConversationId : null,
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
    if (!text.trim() || !chatConversationId || !isModeCompatible) return
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
    onModeChange?.(mode)
  }

  const resolveAudioUrl = useAudioResolver(chatConversationId, messages, setMessages)
  const showChatConversation = Boolean(chatConversationId && isModeCompatible)

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
            {chatConversationId && isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <h3 className="text-base font-semibold mb-1 text-foreground">Cargando conversación</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Verificando el historial y el tipo de conversación seleccionado.
                </p>
              </div>
            ) : showChatConversation ? (
              <ChatMessages
                messages={messages}
                availableCharacters={effectiveAvailableCharacters}
                selectedCharacterId={effectiveCharacterId}
                conversationId={chatConversationId}
                messagesEndRef={messagesEndRef}
                resolveAudioUrl={resolveAudioUrl}
                characterName={effectiveCharacterName}
              />
            ) : chatConversationId && !isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <h3 className="text-base font-semibold mb-1 text-foreground">Esta conversación no pertenece al chat individual</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Cambia a la pestaña Debate para retomarla o selecciona una conversación de chat desde el historial.
                </p>
              </div>
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
              isConnected={Boolean(showChatConversation && isConnected)}
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
        <CallModePanel characterId={effectiveCharacterId} onEndCall={() => onModeChange?.("chat")} />
      ) : activeMode === "debate" ? (
        <DebatePanel
          currentCharacterId={effectiveCharacterId}
          existingConversationId={debateConversationIdForPanel}
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