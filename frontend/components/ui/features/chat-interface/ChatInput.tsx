"use client"

import type React from "react"
import { useState } from "react"
import { Mic, Send, MicOff } from 'lucide-react'

interface ChatInputProps {
  isRecording: boolean
  isConnected: boolean
  isModalOpen: boolean
  selectedCharacterId: string | null
  availableCharacters: Array<{ id: string; name: string }>
  onSendMessage: (text: string) => void
  onToggleRecording: () => void
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

  const inputDisabled = isRecording || !isConnected || isModalOpen;

  const actionDisabled = !isConnected || isModalOpen;

  const recordButtonClasses = `px-4 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg 
                               flex items-center justify-center gap-2 flex-shrink-0
                               ${isRecording
      ? "bg-red-600 text-white hover:bg-red-700 active:scale-95"
      : "bg-orange-500 text-white hover:bg-orange-600 active:scale-95"
    } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-500`

  const sendButtonClasses = `px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg
                             flex items-center justify-center gap-2 flex-shrink-0
                             hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600`
  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
      <div className="flex-1 relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Habla con ${availableCharacters.find((c) => c.id === selectedCharacterId)?.name || "el asistente"}...`}
          disabled={isRecording || !isConnected}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                     dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 
                     dark:focus:border-blue-400 dark:focus:ring-blue-900/30
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200 outline-none font-semibold h-12
                     flex items-center"
        />
        {input.length > 0 && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{input.length}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleRecording}
          disabled={actionDisabled || isRecording}
          className={recordButtonClasses}
          aria-label={isRecording ? "Detener grabación" : "Iniciar grabación"}
          title={isRecording ? "Detener grabación" : "Iniciar grabación"}
        >
          {isRecording ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
          <span className="hidden sm:inline text-sm">{isRecording ? "Detener" : "Grabar"}</span>
        </button>

        <button
          type="submit"
          disabled={!input.trim() || isRecording || !isConnected}
          className={sendButtonClasses}
          aria-label="Enviar mensaje"
          title="Enviar mensaje"
        >
          <Send className="w-5 h-5" />
          <span className="hidden sm:inline text-sm">Enviar</span>
        </button>
      </div>
    </form>
  )
}
