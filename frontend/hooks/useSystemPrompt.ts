'use client'

import { useCallback, useEffect, useState } from 'react'
import type { PromptMode, SystemPromptResponse } from '@/types/prompt.types'
import { getErrorMessage } from '@/utils/api.utils'

/**
 * Carga el system prompt del personaje para un modo de conversación dado.
 */
export function useSystemPrompt(characterId: string | null, mode: PromptMode, enabled = true) {
  const [data, setData] = useState<SystemPromptResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!characterId) {
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const url = new URL(`/api/characters/${characterId}/system-prompt`, window.location.origin)
      url.searchParams.set('mode', mode)

      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new Error(await getErrorMessage(response))
      }

      const payload = (await response.json()) as SystemPromptResponse
      setData(payload)
      return payload
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : 'Error al cargar el prompt'
      setError(message)
      setData(null)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [characterId, mode])

  useEffect(() => {
    if (!enabled || !characterId) {
      return
    }

    void load()
  }, [characterId, enabled, load])

  return { data, isLoading, error, reload: load }
}
