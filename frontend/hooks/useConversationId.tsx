"use client"

import { useEffect, useState } from "react"
import type { Message, Character, Conversation } from "@/types/chat.types"
import { normalizeBackendCharacter, normalizeBackendMessages } from "@/utils/message.utils"

interface CharacterReference {
    id: string;
    name: string;
}

interface UseConversationOptions {
    expectedMode?: Conversation['mode']
}

const normalizeConversationMode = (mode?: Conversation['mode']) =>
    mode === 'debate' ? 'debate' : 'single'

export const useConversation = (initialConversationId: string | null, options: UseConversationOptions = {}) => {
    const conversationId = initialConversationId
    const expectedMode = options.expectedMode
    
    // Estados para la data cargada
    const [messages, setMessages] = useState<Message[]>([])
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [conversationMode, setConversationMode] = useState<Conversation['mode'] | null>(null)

    const availableCharacters: CharacterReference[] = selectedCharacter 
        ? [{ id: selectedCharacter.id, name: selectedCharacter.name }] 
        : []

    const isModeCompatible = expectedMode
        ? conversationMode === null
            ? !conversationId
            : conversationMode === expectedMode
        : true

    useEffect(() => {
        if (!conversationId) {
            setSelectedCharacter(null)
            setMessages([])
            setConversationMode(null)
            setIsLoading(false);
            return
        }

        setIsLoading(true)
        setSelectedCharacter(null)
        setMessages(prev => prev.filter(m => typeof m.id === 'number' && m.id < 0))
        setConversationMode(null)
        let isCancelled = false

        const fetchConversationData = async () => {
            try {
                const response = await fetch(`/api/conversations/${conversationId}`)

                if (!response.ok) {
                    throw new Error(`Error HTTP ${response.status} al cargar conversación`)
                }

                const data: { 
                    id: string, 
                    mode?: Conversation['mode'],
                    character: Character, 
                    messages: Message[] 
                } = await response.json()

                if (isCancelled) return

                const resolvedMode = normalizeConversationMode(data.mode)
                setConversationMode(resolvedMode)

                if (expectedMode && resolvedMode !== expectedMode) {
                    setSelectedCharacter(null)
                    setMessages([])
                    return
                }
                
                setSelectedCharacter(normalizeBackendCharacter(data.character))
                setMessages(prev => {
                    const optimistic = prev.filter(m => typeof m.id === 'number' && m.id < 0)
                    return [...normalizeBackendMessages(data.messages || []), ...optimistic]
                })

            } catch (error) {
                if (isCancelled) return
                console.error("Error al cargar la conversación:", error)
                setSelectedCharacter(null)
                setMessages([])
                setConversationMode(null)
            } finally {
                if (!isCancelled) {
                    setIsLoading(false)
                }
            }
        }

        fetchConversationData()

        return () => {
            isCancelled = true
        }

    }, [conversationId, expectedMode])

    return { 
        conversationId, 
        messages, 
        setMessages, 
        conversationMode,
        isModeCompatible,
        selectedCharacterId: selectedCharacter?.id || null,
        characterName: selectedCharacter?.name || "Cargando...",
        characterBiography: selectedCharacter?.biography || "Biografia no disponible.",
        characterDataset: selectedCharacter?.vectorDbName ? `Este personaje usa el dataset ${selectedCharacter.vectorDbName}` : "Dataset no disponible.",
        availableCharacters,
        isLoading
    }
}