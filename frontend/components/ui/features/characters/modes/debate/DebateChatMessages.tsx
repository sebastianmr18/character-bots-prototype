"use client"

import type React from "react"
import { useCallback } from "react"
import type { Character, DebateMessageMetadata, DebateWarningPayload, Message } from "@/types/chat.types"
import { AudioMessagePlayer } from "@/components/ui/features/characters/shared/AudioMessagePlayer"
import { TypingIndicator } from "@/components/ui/features/characters/modes/chat/TypingIndicator"
import { StreamingText } from "@/components/ui/features/characters/shared/StreamingText"
import { colorFromName, lightColorFromName } from "@/utils/character.utils"
import { useAnimatedEntryKeys } from "@/hooks/useAnimatedEntryKeys"

interface DebateChatMessagesProps {
  conversationId: string
  messages: Message[]
  characterA: Character
  characterB: Character
  typingCharacterId: string | null
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
  conversationId,
  messages,
  characterA,
  characterB,
  typingCharacterId,
  messagesEndRef,
}) => {
  const getMessageAnimationKey = useCallback(
    (message: Message) => `${String(message.id)}:${message.speakerId ?? "no-speaker"}`,
    [],
  )

  const animatedMessageKeys = useAnimatedEntryKeys(
    messages,
    getMessageAnimationKey,
    (message) => message.role === "assistant",
    conversationId,
  )

  const typingSpeaker =
    typingCharacterId === characterA.id
      ? characterA
      : typingCharacterId === characterB.id
        ? characterB
        : null

  const skipReasonLabel = (reason: string | undefined): string => {
    if (reason === "manual" || reason === "manual_user") return "el usuario lo omitió"
    if (reason === "auto_low_confidence") return "baja confianza"
    return "motivo desconocido"
  }

  return (
    <>
      {messages.map((message) => {
        if (message.role === "event" && message.eventType === "debate_turn_skip") {
          const meta = message.eventMetaJson
          const name = (meta?.speakerName as string | undefined) ?? message.speakerName ?? "Personaje"
          const reason = (meta?.reason as string | undefined)
          const reasonDetail = (meta?.reasonDetail as string | undefined)
          return (
            <div key={String(message.id)} className="flex justify-center">
              <div
                className="flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground"
                title={reasonDetail ?? undefined}
              >
                <span>⏭</span>
                <span>
                  <span className="font-medium">{name}</span>
                  {" omitió su turno"}
                  {reason ? ` — ${skipReasonLabel(reason)}` : ""}
                </span>
              </div>
            </div>
          )
        }

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

        const debateMetadata = message.metadata as DebateMessageMetadata | undefined
        const isSkipped = debateMetadata?.isSkipped === true

        // Determine which character is speaking
        const isCharA = message.speakerId === characterA.id
        const speaker = isCharA ? characterA : characterB
        const shortName = getShortName(speaker)
        const themeColor = getThemeColor(speaker)
        const themeColorLight = getThemeColorLight(speaker)

        const warning = debateMetadata?.warning as
          | DebateWarningPayload
          | null
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
                {debateMetadata?.isForced && (
                  <span className="rounded-full border border-foreground/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground/70">
                    Forzado
                  </span>
                )}
                {debateMetadata?.speakerInferenceMethod === "text_mention" && (
                  <span
                    className="rounded-full border border-emerald-300/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300"
                    title={debateMetadata?.speakerMentionText ? `Mención: "${debateMetadata.speakerMentionText}"` : "Detectado por mención"}
                  >
                    🎯 Detectado
                  </span>
                )}
              </div>

              {/* Bubble */}
              <div
                className={`rounded-2xl px-4 py-3 ${isCharA ? "rounded-bl-md" : "rounded-br-md"}`}
                style={{ backgroundColor: themeColorLight }}
              >
                {isSkipped ? (
                  <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap break-words italic">
                    {message.content}
                  </p>
                ) : (
                  <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words">
                    <StreamingText
                      text={message.content}
                      animate={animatedMessageKeys.has(getMessageAnimationKey(message))}
                    />
                  </p>
                )}

                {message.audioUrl && !isSkipped && (
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
                <div className="mt-2 px-1">
                  <p className="text-xs font-medium text-foreground/75">Advertencia: {warning.message}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {warning.code} · etapa {warning.stage}
                  </p>
                </div>
              )}
            </div>
          </div>
        )
      })}

      {typingSpeaker && (
        <div className={`flex ${typingSpeaker.id === characterA.id ? "justify-start" : "justify-end"}`}>
          <div className="max-w-[70%]">
            <div
              className={`flex items-center gap-1.5 mb-1 ${typingSpeaker.id === characterA.id ? "flex-row" : "flex-row-reverse"}`}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ backgroundColor: getThemeColor(typingSpeaker) }}
              >
                {getShortName(typingSpeaker)[0]}
              </div>
              <span className="text-xs font-medium text-foreground/70">
                {getShortName(typingSpeaker)}
              </span>
            </div>

            <div
              className={`rounded-2xl px-4 py-3 ${typingSpeaker.id === characterA.id ? "rounded-bl-md" : "rounded-br-md"}`}
              style={{ backgroundColor: getThemeColorLight(typingSpeaker) }}
            >
              <div className="flex items-center gap-2 text-foreground/70">
                <span className="text-xs">{getShortName(typingSpeaker)} está pensando</span>
                <TypingIndicator />
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </>
  )
}
