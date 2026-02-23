"use client"

import { useEffect, useState } from "react"
import { API_BASE_URL } from "@/constants/chat.constants"
import type { Character } from "@/types/chat.types"

export const useCharacterById = (characterId: string | null) => {
    const [character, setCharacter] = useState<Character | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!characterId) {
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        setError(null)

        const fetchCharacter = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/characters/${characterId}/`)

                if (!response.ok) {
                    throw new Error(`Error HTTP ${response.status} al cargar personaje`)
                }

                const data: Character = await response.json()
                setCharacter(data)

            } catch (err) {
                console.error("Error al cargar el personaje:", err)
                setError(err instanceof Error ? err.message : "Error desconocido")
                setCharacter(null)
            } finally {
                setIsLoading(false)
            }
        }

        fetchCharacter()

    }, [characterId])

    return { character, isLoading, error }
}
