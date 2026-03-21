"use client"

import type React from "react"
import type { Message, Character } from "@/types/chat.types"
import { AudioMessagePlayer } from "@/components/ui/features/chat-interface/AudioMessagePlayer"
import { colorFromName, lightColorFromName } from "@/utils/character.utils"

interface DebateChatMessagesProps {
  messages: Message[]
  characterA: Character
  characterB: Character
  messagesEndRef: React.RefObject<HTMLDivElement | null>
}

const getThemeColor = (character: Character) =>
  character.themeColor ?? colorFromName(character.name)

const getThemeColorLight = (character: Character) =>
  character.themeColorLight ?? lightColorFromName(character.name)

const getShortName = (character: Character) => character.name.split(" ")[0]

const makePassthroughResolver = (audioUrl: string | null | undefined) =>
  async () => ({ audioUrl: audioUrl ?? null, mediaType: "audio/mpeg" as string | null })

export const DebateChatMessages: React.FC<DebateChatMessagesProps> = ({
  messages,
  characterA,
  characterB,
  messagesEndRef,
}) => {
  return (
    <>
      {messages.map((message) => {
        if (message.role === "user") {
          return (
            <div key={String(message.id)} className="flex justify-center">
              <div className="bg-muted text-muted-foreground rounded-full px-4 py-2 text-sm max-w-[80%]">
                <span className="font-medium">Tú: </span>
                {message.content}
              </div>
            </div>
          )
        }

        // Determine which character is speaking
        const isCharA = message.speakerId === characterA.id
        const speaker = isCharA ? characterA : characterB
        const shortName = getShortName(speaker)
        const themeColor = getThemeColor(speaker)
        const themeColorLight = getThemeColorLight(speaker)

        const warning = message.metadata?.warning as
          | { code: string; message: string } | null
          | undefined

        return (
          <div
            key={String(message.id)}
            className={`flex ${isCharA ? "justify-start" : "justify-end"}`}
          >
            <div className="max-w-[70%]">
              {/* Speaker label */}
              <div className={`flex items-center gap-1.5 mb-1 ${isCharA ? "flex-row" : "flex-row-reverse"}`}>
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ backgroundColor: themeColor }}
                >
                  {shortName[0]}
                </div>
                <span className="text-xs font-medium text-foreground/70">{shortName}</span>
              </div>

              {/* Bubble */}
              <div
                className={`rounded-2xl px-4 py-3 ${isCharA ? "rounded-bl-md" : "rounded-br-md"}`}
                style={{ backgroundColor: themeColorLight }}
              >
                <p className="text-sm leading-relaxed text-foreground">{message.content}</p>

                {message.audioUrl && (
                  <div className="mt-2">
                    <AudioMessagePlayer
                      messageId={message.id}
                      initialAudioUrl={message.audioUrl}
                      mediaType={message.mediaType}
                      resolveAudioUrl={makePassthroughResolver(message.audioUrl)}
                    />
                  </div>
                )}
              </div>

              {warning && (
                <p className="text-xs text-muted-foreground mt-1 px-1">
                  ⚠ Audio no disponible
                </p>
              )}
            </div>
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </>
  )
}
