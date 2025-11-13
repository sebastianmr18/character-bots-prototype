"use client"

import { useEffect, useState } from "react"
import { CONVERSATION_ID_PREFIX, API_BASE_URL } from "@/constants/chat.constants"
import { generateUUID } from "@/utils/uuid.utils"
import type { Message } from "@/types/chat.types"

export const useConversationId = (selectedCharacterId: string | null) => {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    if (!selectedCharacterId) return

    const STORAGE_KEY = CONVERSATION_ID_PREFIX + selectedCharacterId
    let id = localStorage.getItem(STORAGE_KEY)

    if (!id) {
      id = generateUUID()
      localStorage.setItem(STORAGE_KEY, id)
      console.log(`Nuevo ID (${id}) generado para personaje: ${selectedCharacterId}`)
    } else {
      console.log(`ID (${id}) recuperado para personaje: ${selectedCharacterId}`)
    }

    setConversationId(id)
    setMessages([])

    const fetchMessages = async (currentId: string) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/conversations/${currentId}/messages/?character_id=${selectedCharacterId}`,
        )

        if (!response.ok && response.status !== 404) {
          throw new Error(`Error HTTP ${response.status}`)
        }

        if (response.status === 404) {
          console.log("No hay historial, comenzando nuevo chat.")
          return
        }

        const data = await response.json()
        console.log("Mensajes previos cargados:", data)
        if (Array.isArray(data)) setMessages(data)
      } catch (error) {
        console.error("Error al cargar mensajes previos:", error)
        setMessages([])
      }
    }

    fetchMessages(id)
  }, [selectedCharacterId])

  return { conversationId, messages, setMessages }
}
