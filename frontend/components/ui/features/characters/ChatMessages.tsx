import type React from "react"
import type { Message, CharacterReference } from "@/types/chat.types"
import { AudioMessagePlayer } from "./AudioMessagePlayer"
import { GenericRenderer } from "./genui/GenericRenderer"

interface ChatMessagesProps {
  messages: Message[]
  availableCharacters: CharacterReference[]
  selectedCharacterId: string | null
  conversationId: string | null
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  resolveAudioUrl: (messageId: number | string, forceRefresh?: boolean) => Promise<{ audioUrl: string | null; mediaType?: string | null }>
  characterName?: string
}

/** Generates a deterministic HSL color from a string (e.g. a character name). */
function nameToHslColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 55%, 40%)`
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  availableCharacters,
  selectedCharacterId,
  conversationId,
  messagesEndRef,
  resolveAudioUrl,
  characterName,
}) => {
  const charName =
    characterName ||
    availableCharacters.find((c) => c.id === selectedCharacterId)?.name ||
    "AI"
  const charInitial = charName[0]?.toUpperCase() ?? "A"
  const avatarColor = nameToHslColor(charName)

  const hasRenderableBlocks = (message: Message) => {
    return Array.isArray(message.blocks) && message.blocks.length > 0
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-8">
        <div className="w-14 h-14 mb-4 rounded-full flex items-center justify-center text-2xl font-bold text-white"
          style={{ backgroundColor: avatarColor }}>
          {charInitial}
        </div>
        <h3 className="text-base font-semibold mb-1 text-foreground">
          Comienza la conversación
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Estás hablando con <span className="font-medium">{charName}</span>.
        </p>
        {conversationId && (
          <div className="mt-2 text-xs text-muted-foreground/50">
            ID: {conversationId.substring(0, 8)}…
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`flex items-end gap-2 max-w-[80%] ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <div
              className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: msg.role === "user" ? "hsl(221, 83%, 53%)" : avatarColor }}
            >
              {msg.role === "user" ? "TÚ" : charInitial}
            </div>

            {/* Bubble */}
            <div
              className={`rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-secondary text-secondary-foreground rounded-bl-md"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs font-medium opacity-70">{charName}</span>
                </div>
              )}
              {hasRenderableBlocks(msg) ? (
                <GenericRenderer blocks={msg.blocks ?? []} />
              ) : (
                <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${msg.role === "assistant" ? "font-serif" : ""}`}>
                  {msg.content}
                </p>
              )}
              {msg.role === "assistant" && (
                <AudioMessagePlayer
                  messageId={msg.id}
                  initialAudioUrl={msg.audioUrl}
                  mediaType={msg.mediaType}
                  resolveAudioUrl={resolveAudioUrl}
                />
              )}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </>
  )
}
