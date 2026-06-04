"use client"

import { useEffect, useState } from "react"
import type { Character } from "@/types/chat.types"
import { normalizeBackendCharacters } from "@/utils/message.utils"

type UseCharactersOptions = {
  storageKey?: string | null
  refreshKey?: number
  apiEndpoint?: string
}

const DEFAULT_STORAGE_KEY = "selected_character_id"

/**
 * Carga la lista de personajes y persiste la selección en `localStorage`.
 *
 * @param preselectedCharacterId - Id a seleccionar si existe en la lista.
 * @param options - Clave de almacenamiento, endpoint y clave de refresco opcional.
 * @returns Personajes disponibles, id seleccionado, setter y estado de carga.
 */
export const useCharacters = (
  preselectedCharacterId?: string,
  options?: UseCharactersOptions,
) => {
  const storageKey = options?.storageKey ?? DEFAULT_STORAGE_KEY
  const refreshKey = options?.refreshKey ?? 0
  const apiEndpoint = options?.apiEndpoint ?? '/api/characters'
  const [availableCharacters, setAvailableCharacters] = useState<Character[]>([])
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch(apiEndpoint)
        if (!response.ok) throw new Error(`Error HTTP ${response.status}`)

        const json: unknown = await response.json()
        const raw = Array.isArray(json)
          ? (json as Character[])
          : ((json as { data: Character[] }).data ?? [])
        const normalizedCharacters = normalizeBackendCharacters(raw)
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
  }, [preselectedCharacterId, refreshKey, storageKey, apiEndpoint])

  const handleCharacterChange = (newId: string) => {
    setSelectedCharacterId(newId)
    if (storageKey) {
      localStorage.setItem(storageKey, newId)
    }
  }

  return { availableCharacters, selectedCharacterId, handleCharacterChange, isLoading }
}
