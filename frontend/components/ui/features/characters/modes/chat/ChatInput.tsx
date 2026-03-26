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

  const inputDisabled = isRecording || !isConnected || isModalOpen

  return (
    <div className="space-y-2">
      {/* Quick suggestions */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {QUICK_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => setInput(suggestion)}
            className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs whitespace-nowrap hover:bg-secondary/80 transition-colors shrink-0"
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
          disabled={!isConnected || isModalOpen}
          aria-label={isRecording ? "Detener grabación" : "Grabar mensaje de voz"}
          className="shrink-0"
        >
          <Mic className="h-4 w-4" />
        </Button>
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isRecording || !isConnected}
          aria-label="Enviar mensaje"
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
