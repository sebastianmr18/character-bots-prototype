"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { ArrowLeft, Send, Swords } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusIndicator } from "@/components/ui/features/characters/StatusIndicator"
import { DebateChatMessages } from "@/components/ui/features/characters/DebateChatMessages"
import { useDebateWebSocket } from "@/hooks/useDebateWebSocket"
import type { Character } from "@/types/chat.types"
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
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, setMessages, sendDebateMessage, isConnected, isSending, errorMessage } =
    useDebateWebSocket({ conversationId, onStatusChange: setStatus })

  // Load history whenever conversation changes.
  useEffect(() => {
    setMessages([])

    const loadHistory = async () => {
      try {
        const response = await fetch(`/api/conversations/${conversationId}`)
        if (!response.ok) return
        const data = await response.json()
        const historical = normalizeBackendMessages(data.messages ?? [])
        setMessages(historical)
      } catch {
        // non-critical; debate continues without history
      }
    }

    loadHistory()
  }, [conversationId, setMessages])

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
    sendDebateMessage(inputValue.trim())
    setInputValue("")
  }

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
          messages={messages}
          characterA={characterA}
          characterB={characterB}
          messagesEndRef={messagesEndRef}
        />
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20 shrink-0">
          <p className="text-sm text-destructive text-center">{errorMessage}</p>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border p-4 shrink-0">
        <p className="text-xs text-muted-foreground mb-2 text-center">Moderado por: Tú</p>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Escribe una pregunta al debate..."
            disabled={!isConnected || isSending}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!isConnected || isSending || !inputValue.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
