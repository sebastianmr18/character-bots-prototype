import { useCallback } from 'react'
import type React from 'react'
import type { Message } from '@/types/chat.types'
import { normalizeBackendMessages } from '@/utils/message.utils'

export interface AudioResolverResult {
  audioUrl: string | null
  mediaType: string | null
}

export const useAudioResolver = (
  conversationId: string,
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
) => {
  return useCallback(
    async (
      messageId: number | string,
      forceRefresh = false,
    ): Promise<AudioResolverResult> => {
      if (!conversationId) {
        return { audioUrl: null, mediaType: null }
      }

      if (!forceRefresh) {
        const localMessage = messages.find(
          (message) => String(message.id) === String(messageId),
        )

        if (localMessage?.audioUrl) {
          return {
            audioUrl: localMessage.audioUrl,
            mediaType: localMessage.mediaType ?? null,
          }
        }
      }

      try {
        const response = await fetch(`/api/conversations/${conversationId}`, {
          cache: 'no-store',
        })

        if (!response.ok) {
          return { audioUrl: null, mediaType: null }
        }

        const data = await response.json()
        const normalizedMessages = normalizeBackendMessages(data.messages ?? [])

        setMessages((prev) => {
          const updatesById = new Map(
            normalizedMessages.map((message) => [String(message.id), message]),
          )

          return prev.map((message) => {
            const updated = updatesById.get(String(message.id))
            return updated ? { ...message, ...updated } : message
          })
        })

        const refreshedMessage = normalizedMessages.find(
          (message) => String(message.id) === String(messageId),
        )

        return {
          audioUrl: refreshedMessage?.audioUrl ?? null,
          mediaType: refreshedMessage?.mediaType ?? null,
        }
      } catch {
        return { audioUrl: null, mediaType: null }
      }
    },
    [conversationId, messages, setMessages],
  )
}
