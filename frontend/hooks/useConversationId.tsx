"use client"

import { useEffect, useState } from "react"
import { API_BASE_URL } from "@/constants/chat.constants"
import type { Message, Character } from "@/types/chat.types"

interface CharacterReference {
    id: string;
    name: string;
}

export const useConversation = (initialConversationId: string) => {
    const conversationId = initialConversationId
    
    // Estados para la data cargada
    const [messages, setMessages] = useState<Message[]>([])
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const availableCharacters: CharacterReference[] = selectedCharacter 
        ? [{ id: selectedCharacter.id, name: selectedCharacter.name }] 
        : []

    useEffect(() => {
        if (!conversationId) {
            setIsLoading(false);
            return
        }

        setIsLoading(true)

        const fetchConversationData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/`)

                if (!response.ok) {
                    throw new Error(`Error HTTP ${response.status} al cargar conversación`)
                }

                const data: { 
                    id: string, 
                    character: Character, 
                    messages: Message[] 
                } = await response.json()
                
                console.log("Conversación cargada:", data)
                
                setSelectedCharacter(data.character)
                setMessages(data.messages || [])

            } catch (error) {
                console.error("Error al cargar la conversación:", error)
                setSelectedCharacter(null)
                setMessages([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchConversationData()

    }, [conversationId])

    return { 
        conversationId, 
        messages, 
        setMessages, 
        selectedCharacterId: selectedCharacter?.id || null,
        characterName: selectedCharacter?.name || "Cargando...",
        availableCharacters,
        isLoading
    }
}