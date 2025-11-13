import type React from "react"
import type { Message, Character } from "@/types/chat.types"

interface ChatMessagesProps {
  messages: Message[]
  availableCharacters: Character[]
  selectedCharacterId: string | null
  conversationId: string | null
  messagesEndRef: React.RefObject<HTMLDivElement>
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  availableCharacters,
  selectedCharacterId,
  conversationId,
  messagesEndRef,
}) => {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">¡Comienza la conversación!</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          Estás hablando con{" "}
          <span className="font-bold">
            {availableCharacters.find((c) => c.id === selectedCharacterId)?.name || "..."}
          </span>
          .
        </p>
        {conversationId && (
          <div className="mt-2 text-xs opacity-50">ID Conversación: {conversationId.substring(0, 8)}...</div>
        )}
      </div>
    )
  }

  return (
    <>
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
        >
          <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                }
              `}
            >
              {msg.role === "user" ? "TÚ" : "AI"}
            </div>

            <div
              className={`py-3 px-4 rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg
                ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm border border-gray-200 dark:border-gray-600"
                }
              `}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </>
  )
}
