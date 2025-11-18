'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CharacterCard } from '@/components/ui/features/chat-interface/CharacterCard'
import { API_BASE_URL } from '@/constants/chat.constants'
import type { Character } from '@/types/chat.types'
import { ArrowLeft, Sparkles } from 'lucide-react'

export default function ChatsPage() {
  const router = useRouter()
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/characters/`)
        if (!response.ok) throw new Error(`Error HTTP ${response.status}`)

        const data: Character[] = await response.json()
        setCharacters(data)
      } catch (error) {
        console.error('Error al cargar personajes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCharacters()
  }, [])

  const handleCharacterSelect = (characterId: string) => {
    router.push(`/chats/${characterId}`)
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
                  Personajes Disponibles
                </h1>
              </div>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 ml-12">
            Selecciona un personaje para comenzar a conversar
          </p>
        </div>
      </div>

      {/* Characters Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex items-center justify-center min-h-96">
            <p className="text-gray-600 dark:text-gray-400">Cargando personajes...</p>
          </div>
        ) : characters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onClick={() => handleCharacterSelect(character.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No hay personajes disponibles</p>
            <Button onClick={() => router.push('/')}>Volver a inicio</Button>
          </div>
        )}
      </div>
    </main>
  )
}
