'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CharacterProfile from '@/components/ui/features/characters/core/CharacterProfile'
import { findCharacterBySlug } from '@/utils/character.utils'
import type { Character } from '@/types/chat.types'
import { normalizeBackendCharacters } from '@/utils/message.utils'

interface CharacterProfilePageProps {
  slug: string
}

export default function CharacterProfilePage({ slug }: CharacterProfilePageProps) {
  const router = useRouter()
  const [character, setCharacter] = useState<Character | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchAndFind = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/characters')
        if (!response.ok) throw new Error(`Error HTTP ${response.status}`)

        const data: Character[] = await response.json()
        const normalized = normalizeBackendCharacters(data)
        const found = findCharacterBySlug(normalized, slug)

        if (found) {
          setCharacter(found)
        } else {
          setNotFound(true)
        }
      } catch (err) {
        console.error('Error al cargar personajes:', err)
        setNotFound(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAndFind()
  }, [slug])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-lg animate-pulse">Cargando personaje...</p>
        </div>
      </main>
    )
  }

  if (notFound || !character) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-4">
          <MessageSquare className="w-16 h-16 text-muted-foreground/30" />
          <h1 className="text-2xl font-serif font-bold">Personaje no encontrado</h1>
          <p className="text-muted-foreground">
            No encontramos un personaje con ese nombre.
          </p>
          <Button onClick={() => router.push('/personajes')}>
            Ver todos los personajes
          </Button>
        </div>
      </main>
    )
  }

  return <CharacterProfile character={character} />
}
