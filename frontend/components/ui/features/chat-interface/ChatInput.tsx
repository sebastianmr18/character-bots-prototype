"use client"

import type React from "react"
import { useState } from "react"

interface ChatInputProps {
  isRecording: boolean
  isConnected: boolean
  selectedCharacterId: string | null
  availableCharacters: Array<{ id: string; name: string }>
  onSendMessage: (text: string) => void
}

export const ChatInput: React.FC<ChatInputProps> = ({
  isRecording,
  isConnected,
  selectedCharacterId,
  availableCharacters,
  onSendMessage,
}) => {
  const [input, setInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSendMessage(input)
      setInput("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
      <div className="flex-1 relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Habla con ${availableCharacters.find((c) => c.id === selectedCharacterId)?.name || "el asistente"}...`}
          disabled={isRecording || !isConnected}
          className="w-full p-3 pr-12 rounded-xl border-2 border-gray-200 
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                     dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 
                     dark:focus:border-blue-400 dark:focus:ring-blue-900/30
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200 outline-none"
        />
        {input.length > 0 && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{input.length}</span>
        )}
      </div>

      <button
        type="submit"
        disabled={!input.trim() || isRecording || !isConnected}
        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold 
                   hover:bg-blue-700 active:scale-95
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600
                   transition-all duration-200 shadow-md hover:shadow-lg
                   flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        <span className="hidden sm:inline">Enviar</span>
      </button>
    </form>
  )
}
