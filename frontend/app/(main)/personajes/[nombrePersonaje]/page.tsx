import CharacterProfile from '@/components/ui/features/characters/core/CharacterProfile'
import { CharacterNotFoundState } from '@/components/ui/features/characters/core/module'
import { createClient } from '@/lib/supabase/server'
import type { Character } from '@/types/chat.types'
import { normalizeBackendCharacter } from '@/utils/message.utils'
import { redirect } from 'next/navigation'

interface PersonajeDetallePageProps {
  params: Promise<{ nombrePersonaje: string }>
}

async function fetchCharacterBySlug(slug: string): Promise<Character | null> {
  const supabase = await createClient()
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session?.access_token) {
    redirect('/login')
  }

  if (!process.env.BACKEND_URL) {
    throw new Error('BACKEND_URL is not configured')
  }

  const response = await fetch(
    `${process.env.BACKEND_URL}/characters/by-slug/${encodeURIComponent(slug)}/`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: 'no-store',
    },
  )

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status} al cargar personaje`)
  }

  const data: Character = await response.json()
  return normalizeBackendCharacter(data)
}

export default async function PersonajeDetallePage({ params }: PersonajeDetallePageProps) {
  const { nombrePersonaje } = await params
  const character = await fetchCharacterBySlug(nombrePersonaje)

  if (!character) {
    return <CharacterNotFoundState />
  }

  return <CharacterProfile character={character} />
}
