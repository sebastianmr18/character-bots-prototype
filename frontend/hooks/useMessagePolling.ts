import { useRef, useCallback } from 'react'
import type { Message } from '@/types/chat.types'
import {
  normalizeBackendMessages,
  mergeMessageCollection,
  hasAssistantAudio,
} from '@/utils/message.utils'

/**
 * Polls the conversation endpoint for new messages on a fixed interval.
 * Stops automatically when the latest assistant message has audio, or after
 * 15 iterations (~30 s). Exposed via `startPolling` and `stopPolling`.
 */
export const useMessagePolling = (
  conversationId: string | null,
  onMessagesUpdate: (updater: (prev: Message[]) => Message[]) => void,
  onStatusChange: (status: string) => void,
) => {
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }, [])

  const pollOnce = useCallback(async () => {
    if (!conversationId) return
    try {
      const response = await fetch(`/api/conversations/${conversationId}`)
      if (!response.ok) throw new Error('Error al obtener mensajes')

      const data = await response.json()
      const fetched: Message[] = normalizeBackendMessages(data.messages ?? [])

      onMessagesUpdate((prev) => mergeMessageCollection(prev, fetched))

      const latestAssistant = [...fetched]
        .reverse()
        .find((m) => m.role === 'assistant')

      if (latestAssistant && hasAssistantAudio(latestAssistant)) {
        onStatusChange('Listo')
        stopPolling()
      } else if (latestAssistant) {
        onStatusChange('Generando audio...')
      }
    } catch (error) {
      console.error('Error en polling de mensajes:', error)
    }
  }, [conversationId, onMessagesUpdate, onStatusChange, stopPolling])

  const startPolling = useCallback(() => {
    stopPolling()
    pollOnce()

    let pollCount = 0
    pollingIntervalRef.current = setInterval(() => {
      pollCount++
      pollOnce()
      if (pollCount >= 15) stopPolling()
    }, 2000)
  }, [pollOnce, stopPolling])

  return { startPolling, stopPolling }
}
