"use client"

import { useEffect, useState } from "react"
import type { Character } from "@/types/chat.types"
import { normalizeBackendCharacters } from "@/utils/message.utils"

export const useCharacters = (preselectedCharacterId?: string) => {
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

        if (normalizedCharacters.length > 0) {
          if (preselectedCharacterId && normalizedCharacters.find((c) => c.id === preselectedCharacterId)) {
            setSelectedCharacterId(preselectedCharacterId)
            localStorage.setItem("selected_character_id", preselectedCharacterId)
          } else {
            const storedCharacterId = localStorage.getItem("selected_character_id")
            const initialCharacterId =
              storedCharacterId && normalizedCharacters.find((c) => c.id === storedCharacterId)
                ? storedCharacterId
                : normalizedCharacters[0].id
            setSelectedCharacterId(initialCharacterId)
            localStorage.setItem("selected_character_id", initialCharacterId)
          }
        }
      } catch (error) {
        console.error("Error al cargar personajes:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCharacters()
  }, [preselectedCharacterId])

  const handleCharacterChange = (newId: string) => {
    setSelectedCharacterId(newId)
    localStorage.setItem("selected_character_id", newId)
  }

  return { availableCharacters, selectedCharacterId, handleCharacterChange, isLoading }
}
