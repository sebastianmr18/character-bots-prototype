"use client"

import { useEffect, useState } from "react"
import { API_BASE_URL } from "../constants/chat.constants"
import type { Character } from "../types/chat.types"

export const useCharacters = () => {
  const [availableCharacters, setAvailableCharacters] = useState<Character[]>([])
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null)

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/characters/`)
        if (!response.ok) throw new Error(`Error HTTP ${response.status}`)

        const data: Character[] = await response.json()
        setAvailableCharacters(data)

        if (data.length > 0) {
          const storedCharacterId = localStorage.getItem("selected_character_id")
          const initialCharacterId =
            storedCharacterId && data.find((c) => c.id === storedCharacterId) ? storedCharacterId : data[0].id
          setSelectedCharacterId(initialCharacterId)
          localStorage.setItem("selected_character_id", initialCharacterId)
        }
      } catch (error) {
        console.error("Error al cargar personajes:", error)
      }
    }

    fetchCharacters()
  }, [])

  const handleCharacterChange = (newId: string) => {
    setSelectedCharacterId(newId)
    localStorage.setItem("selected_character_id", newId)
  }

  return { availableCharacters, selectedCharacterId, handleCharacterChange }
}
