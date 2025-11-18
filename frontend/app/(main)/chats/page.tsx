'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CharacterCard } from '@/components/ui/features/chat-interface/CharacterCard'
import { API_BASE_URL } from '@/constants/chat.constants'
import type { Character, Conversation } from '@/types/chat.types'
import { ArrowLeft, Sparkles, MessageSquare } from 'lucide-react'

interface Message {
  role: string
  content: string
  timestamp: string
}

export default function ChatsPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/conversations/`)
        if (!response.ok) throw new Error(`Error HTTP ${response.status}`)

        const data: Conversation[] = await response.json()
        const sortedData = data.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setConversations(sortedData)
      } catch (error) {
        console.error('Error al cargar conversaciones:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [])

  const handleConversationSelect = (conversationId: string) => {
    router.push(`/chats/${conversationId}`)
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/')}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Mis Conversaciones
                </h1>
              </div>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 ml-12">
            Historial de charlas con tus personajes de IA
          </p>
        </div>
      </div>

      {/* Conversations Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex items-center justify-center min-h-96">
            <p className="text-gray-600 dark:text-gray-400 animate-pulse">Cargando historial...</p>
          </div>
        ) : conversations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {conversations.map((conversation) => (
              <CharacterCard
                key={conversation.id}
                conversation={conversation}
                onClick={() => handleConversationSelect(conversation.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 flex flex-col items-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg">No tienes conversaciones activas.</p>
            <Button onClick={() => router.push('/')}>Iniciar nueva charla</Button>
          </div>
        )}
      </div>
    </main>
  )
}