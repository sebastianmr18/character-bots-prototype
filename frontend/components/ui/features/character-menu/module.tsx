'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { Character } from '@/types/chat.types'
import { MessageSquare } from 'lucide-react'
import { toSlug, colorFromName, lightColorFromName } from '@/utils/character.utils'

export default function ChatsConversationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [characters, setCharacters] = useState<Character[]>([])

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true)

      const charResponse = await fetch('/api/characters')

      if (!charResponse.ok) throw new Error(`Error HTTP Personajes ${charResponse.status}`)

      const charactersData: Character[] = await charResponse.json()
      setCharacters(charactersData)

    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  const handleCharacterClick = useCallback((characterName: string) => {
    router.push(`/personajes/${toSlug(characterName)}`)
  }, [router])

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400 animate-pulse text-xl">Cargando personajes...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">

      {/* --- Header --- */}
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Elige con quien conversar hoy
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explora nuestra coleccion de personajes historicos y ficticios
            </p>
          </div>
        </div>
      </div>

      {/* --- Characters Grid --- */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {characters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <div
                key={character.id}
                className="group relative rounded-lg overflow-hidden bg-card border border-border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                onClick={() => handleCharacterClick(character.name)}
                style={{
                  '--character-color': character.themeColor ?? colorFromName(character.name),
                  '--character-color-light': character.themeColorLight ?? lightColorFromName(character.name),
                } as React.CSSProperties}
              >
                <div className="h-80 relative overflow-hidden">
                  {character.imageUrl ? (
                    <img
                      src={character.imageUrl}
                      alt={character.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 opacity-20">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <pattern id={`pattern-${character.id}`} patternUnits="userSpaceOnUse" width="20" height="20">
                        <circle cx="10" cy="10" r="1.5" fill={character.themeColor ?? colorFromName(character.name)} />
                      </pattern>
                      <rect width="100%" height="100%" fill={`url(#pattern-${character.id})`} />
                    </svg>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="text-6xl font-serif font-bold opacity-30"
                      style={{ color: character.themeColor ?? colorFromName(character.name) }}
                    >
                      {character.name[0]}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-serif text-lg font-semibold text-card-foreground mb-1">
                    {character.name}
                  </h3>
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <span className="px-2 py-0.5 rounded-full text-xs"
                      style={{
                        backgroundColor: character.themeColorLight ?? lightColorFromName(character.name),
                        color: character.themeColor ?? colorFromName(character.name),
                      }}
                    >
                      {character.role}
                    </span>
                    <span>{character.biography && character.biography.length > 60 ? character.biography.slice(0, 60) + "…" : character.biography}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 flex flex-col items-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg">No hay personajes disponibles para chatear.</p>
            <Button onClick={() => router.push('/')}>Volver a inicio</Button>
          </div>
        )}
      </div>
    </main>
  )
}
