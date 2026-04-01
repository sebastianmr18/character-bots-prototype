"use client"

import type React from "react"
import { useState } from "react"
import { Mic, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const QUICK_SUGGESTIONS = [
  "Cuéntame sobre tu vida",
  "¿Cuál fue tu mayor logro?",
  "¿Qué consejo darías?",
]

interface ChatInputProps {
  isRecording: boolean
  isConnected: boolean
  isModalOpen: boolean
  selectedCharacterId: string | null
  canSendMessages?: boolean
  suggestions?: string[]
  availableCharacters: Array<{ id: string; name: string }>
  onSendMessage: (text: string) => void
  onToggleRecording: () => void
  status?: string
}

export const ChatInput: React.FC<ChatInputProps> = ({
  isRecording,
  isConnected,
  isModalOpen,
  selectedCharacterId,
  canSendMessages = true,
  suggestions = [],
  availableCharacters,
  onSendMessage,
  onToggleRecording,
}) => {
  const [input, setInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSendMessage(input)
      setInput("")
    }
  }

  const characterName =
    availableCharacters.find((c) => c.id === selectedCharacterId)?.name || "el personaje"

  const inputDisabled = isRecording || isModalOpen || !canSendMessages
  const renderedSuggestions = suggestions.length > 0 ? suggestions : QUICK_SUGGESTIONS

  const handleSuggestionClick = (suggestion: string) => {
    if (inputDisabled || !isConnected) return
    onSendMessage(suggestion)
  }

  return (
    <div className="space-y-2">
      {/* Quick suggestions */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {renderedSuggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => handleSuggestionClick(suggestion)}
            disabled={inputDisabled || !isConnected}
            className="px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit(e)}
          placeholder={`Escribe a ${characterName}...`}
          disabled={inputDisabled}
          className="flex-1"
        />
        <Button
          type="button"
          size="icon"
          variant={isRecording ? "destructive" : "outline"}
          onClick={onToggleRecording}
          disabled={!isConnected || isModalOpen || !canSendMessages}
          aria-label={isRecording ? "Detener grabación" : "Grabar mensaje de voz"}
          className="shrink-0"
        >
          <Mic className="h-4 w-4" />
        </Button>
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isRecording || isModalOpen || !canSendMessages}
          aria-label="Enviar mensaje"
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
