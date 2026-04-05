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
import { MessageSquareMore, Phone, Swords, GraduationCap } from "lucide-react"
import { getErrorMessage } from "@/utils/api.utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export type ConversationMode = "call" | "interview" | "debate" | "professor"

interface ChatInterfaceProps {
  activeMode: ConversationMode
  singleConversationId: string | null
  debateConversationId: string | null
  defaultCharacterId?: string | null
  defaultCharacterName?: string
  isInitialHistoryLoaded?: boolean
  onModeChange?: (mode: ConversationMode) => void
  onConversationCreated?: (conversation: { id: string; mode?: "single" | "debate" }) => void
}

const MODES: { id: ConversationMode; label: string; icon: React.ElementType }[] = [
  { id: "interview", label: "Entrevista", icon: MessageSquareMore },
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
  isInitialHistoryLoaded = false,
  onModeChange,
  onConversationCreated,
}) => {
  const [status, setStatus] = useState("Desconectado")
  const [localSingleConversationId, setLocalSingleConversationId] = useState<string | null>(singleConversationId)
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([])
  const pendingTextQueueRef = useRef<string[]>([])
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false)

  useEffect(() => {
    setLocalSingleConversationId(singleConversationId)
  }, [singleConversationId])

  const isInterviewMode = activeMode === "interview"
  const interviewConversationId = isInterviewMode ? localSingleConversationId : null
  const debateConversationIdForPanel = activeMode === "debate" ? debateConversationId : null

  const {
    messages,
    setMessages,
    selectedCharacterId,
    availableCharacters,
    characterName,
    isLoading,
    isModeCompatible,
  } = useConversation(interviewConversationId, { expectedMode: "single" })

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

  const { sendMessage, sendAudioMessage, isConnected, isTyping } = useWebSocketChat({
    conversationId: !isLoading && isModeCompatible ? interviewConversationId : null,
    selectedCharacterId: effectiveCharacterId,
    onStatusChange: setStatus,
    onMessagesUpdate: setMessages,
    onTranscriptionResult,
    onNoSpeech,
    onSuggestionsReceived: setDynamicSuggestions,
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const { isRecording, audioLevel, startRecording, stopRecording, errorMessage, clearError } = useVoiceRecording()

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

  useEffect(() => {
    if (!isWaitingForResponse) return
    const lastMsg = messages[messages.length - 1]
    if (lastMsg?.role === 'assistant' && (typeof lastMsg.id === 'string' || (typeof lastMsg.id === 'number' && lastMsg.id > 0))) {
      setIsWaitingForResponse(false)
    }
  }, [messages, isWaitingForResponse])

  useEffect(() => {
    setDynamicSuggestions([])
  }, [interviewConversationId])

  const createSingleConversation = useCallback(async (): Promise<string | null> => {
    if (!effectiveCharacterId || isCreatingConversation) return null

    try {
      setIsCreatingConversation(true)
      setStatus("Iniciando conversación...")

      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ characterId: effectiveCharacterId }),
      })

      if (!response.ok) {
        const message = await getErrorMessage(response)
        throw new Error(message)
      }

      const payload: { id?: string } = await response.json()
      if (!payload.id) {
        throw new Error("No se recibió el id de la conversación")
      }

      setLocalSingleConversationId(payload.id)
      onConversationCreated?.({ id: payload.id, mode: "single" })
      window.dispatchEvent(
        new CustomEvent("conversation:created", {
          detail: { id: payload.id, mode: "single" },
        }),
      )

      return payload.id
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al iniciar conversación"
      setStatus(`Error: ${message}`)
      return null
    } finally {
      setIsCreatingConversation(false)
    }
  }, [effectiveCharacterId, isCreatingConversation, onConversationCreated])

  const handleSendMessage = async (text: string) => {
    if (!isInitialHistoryLoaded || !text.trim() || !effectiveCharacterId) return

    let currentConversationId = interviewConversationId

    if (!currentConversationId) {
      currentConversationId = await createSingleConversation()
      if (!currentConversationId) return
    }

    setMessages((prev) => [...prev, { id: -Date.now(), role: "user", content: text }])
    setIsWaitingForResponse(true)

    if (isConnected && isModeCompatible) {
      sendMessage(text)
      return
    }

    pendingTextQueueRef.current.push(text)
    setStatus("Conectando para enviar mensaje...")
  }

  useEffect(() => {
    if (!interviewConversationId || !isModeCompatible || !isConnected) return
    if (pendingTextQueueRef.current.length === 0) return

    const queuedMessages = [...pendingTextQueueRef.current]
    pendingTextQueueRef.current = []

    queuedMessages.forEach((queuedText) => sendMessage(queuedText))
  }, [interviewConversationId, isModeCompatible, isConnected, sendMessage])

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
          setIsWaitingForResponse(true)
          sendAudioMessage(base64Data)
        }
        setShowVoiceModal(false)
      } else {
        const didStartRecording = await startRecording()
        if (!didStartRecording) {
          setShowVoiceModal(false)
          return
        }

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

  const resolveAudioUrl = useAudioResolver(interviewConversationId, messages, setMessages)
  const showInterviewConversation = Boolean(interviewConversationId && isModeCompatible)
  const hasOptimisticMessages = messages.some(m => typeof m.id === 'number' && m.id < 0)

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
      {isInterviewMode ? (
        <>
          {/* Messages */}
          <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
            {interviewConversationId && isLoading && !hasOptimisticMessages ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <h3 className="text-base font-semibold mb-1 text-foreground">Cargando conversación</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Verificando el historial y el tipo de conversación seleccionado.
                </p>
              </div>
            ) : (showInterviewConversation || hasOptimisticMessages) ? (
              <ChatMessages
                messages={messages}
                availableCharacters={effectiveAvailableCharacters}
                selectedCharacterId={effectiveCharacterId}
                conversationId={interviewConversationId}
                messagesEndRef={messagesEndRef}
                resolveAudioUrl={resolveAudioUrl}
                characterName={effectiveCharacterName}
                isTyping={isTyping || isWaitingForResponse}
              />
            ) : interviewConversationId && !isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <h3 className="text-base font-semibold mb-1 text-foreground">Esta conversación no pertenece al modo entrevista</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Cambia a la pestaña Debate para retomarla o selecciona una conversación desde el historial.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <h3 className="text-base font-semibold mb-1 text-foreground">No hay conversación activa</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  {isInitialHistoryLoaded
                    ? "Escribe tu primer mensaje para crear una conversación automáticamente o selecciona una del historial."
                    : "Cargando historial de conversaciones... cuando termine, podrás enviar tu primer mensaje."}
                </p>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-4 shrink-0">
            <ChatInput
              isRecording={isRecording}
              isConnected={Boolean(showInterviewConversation && isConnected)}
              isModalOpen={showVoiceModal}
              selectedCharacterId={effectiveCharacterId}
              canSendMessages={Boolean(effectiveCharacterId && !isCreatingConversation && isInitialHistoryLoaded)}
              availableCharacters={effectiveAvailableCharacters}
              suggestions={dynamicSuggestions}
              onSendMessage={handleSendMessage}
              onToggleRecording={handleToggleRecording}
              status={status}
            />
          </div>
        </>
      ) : activeMode === "call" ? (
        <CallModePanel characterId={effectiveCharacterId} onEndCall={() => onModeChange?.("interview")} />
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
        isOpen={showVoiceModal && !errorMessage}
        onToggleRecording={handleToggleRecording}
        isRecording={isRecording}
        audioLevel={audioLevel}
        onClose={handleCloseVoiceModal}
      />

      <Dialog open={!!errorMessage} onOpenChange={(open) => { if (!open) clearError() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error de audio</DialogTitle>
            <DialogDescription>{errorMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={clearError}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ChatInterface