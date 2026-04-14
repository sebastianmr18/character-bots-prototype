"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { ArrowLeft, MicOff, Send, Swords } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusIndicator } from "@/components/ui/features/characters/shared/StatusIndicator"
import { DebateChatMessages } from "@/components/ui/features/characters/modes/debate/DebateChatMessages"
import { useDebateWebSocket } from "@/hooks/useDebateWebSocket"
import type { Character, Message } from "@/types/chat.types"
import { normalizeBackendMessages } from "@/utils/message.utils"
import { colorFromName } from "@/utils/character.utils"

interface DebateChatPanelProps {
  conversationId: string
  characterA: Character
  characterB: Character
  onBack: () => void
}

const getThemeColor = (character: Character) =>
  character.themeColor ?? colorFromName(character.name)

const getShortName = (character: Character) => character.name.split(" ")[0]
const getEpoch = (character: Character) => character.years ?? ""

export const DebateChatPanel: React.FC<DebateChatPanelProps> = ({
  conversationId,
  characterA,
  characterB,
  onBack,
}) => {
  const [status, setStatus] = useState("Conectando...")
  const [inputValue, setInputValue] = useState("")
  const [forcedSpeakerId, setForcedSpeakerId] = useState<string | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadHistory = useCallback(async (): Promise<Message[] | null> => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`)
      if (!response.ok) return null

      const data = await response.json()
      return normalizeBackendMessages(data.messages ?? [])
    } catch {
      return null
    }
  }, [conversationId])

  const {
    messages,
    setMessages,
    sendDebateMessage,
    skipDebateTurn,
    retryLastMessage,
    isConnected,
    isSending,
    errorState,
    typingCharacterId,
    canRetry,
  } = useDebateWebSocket({
    conversationId,
    onStatusChange: setStatus,
    fetchConversationMessages: loadHistory,
  })

  // Load history whenever conversation changes.
  useEffect(() => {
    let isMounted = true
    setMessages([])

    const syncHistory = async () => {
      const historical = await loadHistory()
      if (historical && isMounted) {
        setMessages(historical)
      }
    }

    void syncHistory()

    return () => {
      isMounted = false
    }
  }, [conversationId, loadHistory, setMessages])

  useEffect(() => {
    setForcedSpeakerId(null)
  }, [conversationId])

  // Auto-scroll on new messages
  const scrollToBottom = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSend = () => {
    if (!inputValue.trim() || !isConnected || isSending) return
    sendDebateMessage(inputValue.trim(), forcedSpeakerId)
    setInputValue("")
    setForcedSpeakerId(null)
  }

  const handleRetry = () => {
    void retryLastMessage()
  }

  const handleSkip = (speakerId: string) => {
    skipDebateTurn(speakerId, "manual_user")
  }

  const controlsDisabled = !isConnected || isSending

  const colorA = getThemeColor(characterA)
  const colorB = getThemeColor(characterB)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="border-b border-border p-4 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Modo Debate</span>
          </div>
          <div className="ml-auto">
            <StatusIndicator status={status} />
          </div>
        </div>

        {/* VS display */}
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-1"
              style={{ backgroundColor: colorA }}
            >
              {getShortName(characterA)[0]}
            </div>
            <p className="font-medium text-foreground text-sm">{getShortName(characterA)}</p>
            <p className="text-xs text-muted-foreground">{getEpoch(characterA)}</p>
          </div>

          <div className="text-2xl font-bold text-muted-foreground">VS</div>

          <div className="text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-1"
              style={{ backgroundColor: colorB }}
            >
              {getShortName(characterB)[0]}
            </div>
            <p className="font-medium text-foreground text-sm">{getShortName(characterB)}</p>
            <p className="text-xs text-muted-foreground">{getEpoch(characterB)}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground mt-8">
            Escribe una pregunta para iniciar el debate
          </p>
        )}
        <DebateChatMessages
          conversationId={conversationId}
          messages={messages}
          characterA={characterA}
          characterB={characterB}
          typingCharacterId={typingCharacterId}
          messagesEndRef={messagesEndRef}
        />
      </div>

      {/* Error */}
      {errorState && (
        <div className="px-4 py-3 bg-destructive/10 border-t border-destructive/20 shrink-0">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-destructive">{errorState.message}</p>
              <p className="text-xs text-destructive/80 mt-1">
                Código: {errorState.code} · Etapa: {errorState.stage}
              </p>
            </div>
            {canRetry && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={!isConnected || isSending}
                className="border-destructive/30 bg-background text-destructive hover:bg-destructive/5"
              >
                Reintentar ronda
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border p-4 shrink-0">
        <div className="mb-3 rounded-xl border border-border/70 bg-muted/30 p-3 space-y-3">
          <p className="text-xs font-medium text-foreground/80">Control de turnos (próxima ronda)</p>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Button
              type="button"
              variant={forcedSpeakerId === null ? "default" : "outline"}
              size="sm"
              disabled={controlsDisabled}
              onClick={() => setForcedSpeakerId(null)}
            >
              Alternar automático
            </Button>
            <Button
              type="button"
              variant={forcedSpeakerId === characterA.id ? "default" : "outline"}
              size="sm"
              disabled={controlsDisabled}
              onClick={() => setForcedSpeakerId(characterA.id)}
            >
              {getShortName(characterA)} luego {getShortName(characterB)}
            </Button>
            <Button
              type="button"
              variant={forcedSpeakerId === characterB.id ? "default" : "outline"}
              size="sm"
              disabled={controlsDisabled}
              onClick={() => setForcedSpeakerId(characterB.id)}
            >
              {getShortName(characterB)} luego {getShortName(characterA)}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={controlsDisabled}
              onClick={() => setForcedSpeakerId(characterA.id)}
            >
              Dar la palabra a {getShortName(characterA)}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={controlsDisabled}
              onClick={() => setForcedSpeakerId(characterB.id)}
            >
              Dar la palabra a {getShortName(characterB)}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={controlsDisabled}
              onClick={() => handleSkip(characterA.id)}
            >
              <MicOff className="h-4 w-4 mr-1" />
              {getShortName(characterA)} pasa turno
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={controlsDisabled}
              onClick={() => handleSkip(characterB.id)}
            >
              <MicOff className="h-4 w-4 mr-1" />
              {getShortName(characterB)} pasa turno
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-2 text-center">Moderado por: Tú</p>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Escribe una pregunta al debate..."
            disabled={controlsDisabled}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={controlsDisabled || !inputValue.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
