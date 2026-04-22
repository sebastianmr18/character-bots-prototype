"use client"

import { useEffect, useState } from "react"
import type { Character } from "@/types/chat.types"
import { normalizeBackendCharacters } from "@/utils/message.utils"

type UseCharactersOptions = {
  storageKey?: string | null
  refreshKey?: number
}

const DEFAULT_STORAGE_KEY = "selected_character_id"

export const useCharacters = (
  preselectedCharacterId?: string,
  options?: UseCharactersOptions,
) => {
  const storageKey = options?.storageKey ?? DEFAULT_STORAGE_KEY
  const refreshKey = options?.refreshKey ?? 0
  const [availableCharacters, setAvailableCharacters] = useState<Character[]>([])
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch('/api/characters')
        if (!response.ok) throw new Error(`Error HTTP ${response.status}`)

        const data: Character[] = await response.json()
        const normalizedCharacters = normalizeBackendCharacters(data)
        setAvailableCharacters(normalizedCharacters)

        if (normalizedCharacters.length === 0) {
          setSelectedCharacterId(null)
          if (storageKey) {
            localStorage.removeItem(storageKey)
          }
          return
        }

        if (preselectedCharacterId && normalizedCharacters.find((c) => c.id === preselectedCharacterId)) {
          setSelectedCharacterId(preselectedCharacterId)
          if (storageKey) {
            localStorage.setItem(storageKey, preselectedCharacterId)
          }
          return
        }

        const storedCharacterId = storageKey ? localStorage.getItem(storageKey) : null
        const initialCharacterId =
          storedCharacterId && normalizedCharacters.find((c) => c.id === storedCharacterId)
            ? storedCharacterId
            : normalizedCharacters[0].id

        setSelectedCharacterId(initialCharacterId)
        if (storageKey) {
          localStorage.setItem(storageKey, initialCharacterId)
        }
      } catch (error) {
        console.error("Error al cargar personajes:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCharacters()
  }, [preselectedCharacterId, refreshKey, storageKey])

  const handleCharacterChange = (newId: string) => {
    setSelectedCharacterId(newId)
    if (storageKey) {
      localStorage.setItem(storageKey, newId)
    }
  }

  return { availableCharacters, selectedCharacterId, handleCharacterChange, isLoading }
}
