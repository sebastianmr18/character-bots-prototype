"use client"

import { useEffect, useState } from "react"
import type { Character } from "@/types/chat.types"
import { normalizeBackendCharacter } from "@/utils/message.utils"

/**
 * Obtiene un personaje por id desde la API BFF.
 *
 * @param characterId - Identificador del personaje; si es `null` no se consulta.
 * @returns Personaje normalizado, carga y mensaje de error.
 */
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
                const response = await fetch(`/api/characters/${characterId}`)

                if (!response.ok) {
                    throw new Error(`Error HTTP ${response.status} al cargar personaje`)
                }

                const data: Character = await response.json()
                setCharacter(normalizeBackendCharacter(data))

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
