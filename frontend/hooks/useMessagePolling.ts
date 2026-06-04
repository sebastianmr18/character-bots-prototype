import { useRef, useCallback } from 'react'
import type { Message } from '@/types/chat.types'
import {
  normalizeBackendMessages,
  mergeMessageCollection,
  hasAssistantAudio,
} from '@/utils/message.utils'

/**
 * Consulta periódicamente la conversación por mensajes nuevos cuando el WebSocket no entrega audio a tiempo.
 *
 * @param conversationId - Conversación a sondear.
 * @param onMessagesUpdate - Actualizador de estado de mensajes.
 * @param onStatusChange - Callback de etiqueta de estado para la UI.
 * @returns `startPolling` y `stopPolling`; se detiene al recibir audio del asistente o tras ~30 s.
 */
export const useMessagePolling = (
  conversationId: string | null,
  onMessagesUpdate: (updater: (prev: Message[]) => Message[]) => void,
  onStatusChange: (status: string) => void,
) => {
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isPollingInFlightRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }

    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    isPollingInFlightRef.current = false
  }, [])

  const pollOnce = useCallback(async () => {
    if (!conversationId || isPollingInFlightRef.current) return

    isPollingInFlightRef.current = true
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        signal: abortControllerRef.current.signal,
      })
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
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }
      console.error('Error en polling de mensajes:', error)
    } finally {
      isPollingInFlightRef.current = false
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
