'use client'

import { useCallback, useEffect, useState } from 'react'
import type { CharacterEditorialSectionName, CharacterEditorialSectionResponse } from '@/types/editorial.types'
import { normalizeBackendEditorialSectionPayload } from '@/utils/editorial.utils'

const SECTION_CACHE_TTL_MS = 1000 * 60 * 60
const SECTION_CACHE_VERSION = 'v2'

interface CacheEntry {
  expiresAt: number
  payload: CharacterEditorialSectionResponse
}

const memoryCache = new Map<string, CacheEntry>()
const inflightRequests = new Map<string, Promise<CharacterEditorialSectionResponse>>()

const getCacheKey = (characterId: string, section: CharacterEditorialSectionName) =>
  `character-editorial:${SECTION_CACHE_VERSION}:${characterId}:${section}`

const readSessionCache = (key: string): CacheEntry | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.sessionStorage.getItem(key)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as CacheEntry
    if (!parsed?.expiresAt || parsed.expiresAt <= Date.now()) {
      window.sessionStorage.removeItem(key)
      return null
    }

    return parsed
  } catch {
    window.sessionStorage.removeItem(key)
    return null
  }
}

const writeSessionCache = (key: string, entry: CacheEntry) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.sessionStorage.setItem(key, JSON.stringify(entry))
  } catch {
    // Ignore storage quota failures and continue with memory cache only.
  }
}

const readCache = (key: string): CacheEntry | null => {
  const inMemory = memoryCache.get(key)
  if (inMemory && inMemory.expiresAt > Date.now()) {
    return inMemory
  }

  if (inMemory) {
    memoryCache.delete(key)
  }

  const inSession = readSessionCache(key)
  if (inSession) {
    memoryCache.set(key, inSession)
    return inSession
  }

  return null
}

const writeCache = (key: string, payload: CharacterEditorialSectionResponse) => {
  const entry: CacheEntry = {
    expiresAt: Date.now() + SECTION_CACHE_TTL_MS,
    payload,
  }

  memoryCache.set(key, entry)
  writeSessionCache(key, entry)
}

const fetchEditorialSection = async (
  characterId: string,
  section: CharacterEditorialSectionName,
): Promise<CharacterEditorialSectionResponse> => {
  const key = getCacheKey(characterId, section)

  const cached = readCache(key)
  if (cached) {
    return cached.payload
  }

  const existingRequest = inflightRequests.get(key)
  if (existingRequest) {
    return existingRequest
  }

  const request = fetch(`/api/characters/${characterId}/editorial/${section}`)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status} al cargar la sección ${section}`)
      }

      const payload = normalizeBackendEditorialSectionPayload(section, await response.json())
      writeCache(key, payload)
      return payload
    })
    .finally(() => {
      inflightRequests.delete(key)
    })

  inflightRequests.set(key, request)
  return request
}

export const useCharacterEditorialSection = (
  characterId: string | null,
  section: CharacterEditorialSectionName,
  enabled = true,
) => {
  const cacheKey = characterId ? getCacheKey(characterId, section) : null
  const initialCached = cacheKey ? readCache(cacheKey)?.payload ?? null : null

  const [data, setData] = useState<CharacterEditorialSectionResponse | null>(initialCached)
  const [isLoading, setIsLoading] = useState(enabled && !initialCached && Boolean(characterId))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const nextCached = cacheKey ? readCache(cacheKey)?.payload ?? null : null
    setData(nextCached)
    setError(null)
    setIsLoading(enabled && !nextCached && Boolean(characterId))
  }, [cacheKey, characterId, enabled])

  const load = useCallback(async () => {
    if (!characterId) {
      return null
    }

    const cached = readCache(getCacheKey(characterId, section))
    if (cached) {
      setData(cached.payload)
      setError(null)
      setIsLoading(false)
      return cached.payload
    }

    setIsLoading(true)
    setError(null)

    try {
      const payload = await fetchEditorialSection(characterId, section)
      setData(payload)
      return payload
    } catch (fetchError) {
      console.error(`Error al cargar la sección editorial ${section}:`, fetchError)
      setError(fetchError instanceof Error ? fetchError.message : 'Error desconocido')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [characterId, section])

  useEffect(() => {
    if (!enabled || !characterId) {
      return
    }

    void load()
  }, [characterId, enabled, load])

  const prefetch = useCallback(async () => {
    if (!characterId) {
      return null
    }

    try {
      return await fetchEditorialSection(characterId, section)
    } catch {
      return null
    }
  }, [characterId, section])

  return { data, isLoading, error, load, prefetch }
}