'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MessageCircle, BookOpen, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Character } from '@/types/chat.types'
import { getErrorMessage } from '@/utils/api.utils'
import { CharacterContextPanel } from '@/components/ui/features/characters/CharactersContextPanel'

interface CharacterProfileProps {
  character: Character
}

export default function CharacterProfile({ character }: CharacterProfileProps) {
  const router = useRouter()
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStartConversation = useCallback(async () => {
    try {
      setError(null)
      setIsStarting(true)

      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId: character.id }),
      })

      if (!response.ok) {
        const message = await getErrorMessage(response)
        throw new Error(message)
      }

      const newConversation = await response.json()
      const conversationId = newConversation?.id

      if (!conversationId) {
        throw new Error('No se recibió el id de la conversación')
      }

      router.push(`/chats/${conversationId}`)
    } catch (err) {
      console.error('Error al iniciar conversación:', err)
      setError(err instanceof Error ? err.message : 'Error al iniciar la conversación')
    } finally {
      setIsStarting(false)
    }
  }, [character.id, router])

  return (
    <main className="min-h-screen bg-background">
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">

        {/* Left Panel - Character Context (60%) */}
        <div className="lg:w-[60%] border-r border-border overflow-y-auto">

          <button
            onClick={() => router.push('/personajes')}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a personajes
          </button>

          <CharacterContextPanel
            character={character}
          />
        </div>
        {/* Back nav */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-4">


        </div>

        {/* Hero banner */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-lg">

            {/* Decorative header */}
            <div className="relative h-48 sm:h-64 overflow-hidden bg-gradient-to-br from-muted/60 to-muted">
              {/* Dot pattern */}
              <svg className="absolute inset-0 w-full h-full opacity-20" aria-hidden="true">
                <pattern id="char-dots" patternUnits="userSpaceOnUse" width="24" height="24">
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#char-dots)" />
              </svg>

              {/* Large initial */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-serif text-[9rem] font-bold leading-none opacity-10 select-none">
                  {character.name[0]}
                </span>
              </div>

              {/* Role badge */}
              <div className="absolute bottom-4 left-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-background/80 backdrop-blur-sm text-foreground border border-border">
                  <User className="w-3 h-3" />
                  {character.role}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-10 space-y-8">

              {/* Name + CTA */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
                    {character.name}
                  </h1>
                  <p className="mt-1 text-muted-foreground text-sm">{character.role}</p>
                </div>

                <div className="shrink-0">
                  {error && (
                    <p className="text-xs text-red-500 mb-2 text-right">{error}</p>
                  )}
                  <Button
                    onClick={handleStartConversation}
                    disabled={isStarting}
                    size="lg"
                    className="gap-2 w-full sm:w-auto"
                  >
                    {isStarting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Iniciando...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4" />
                        Iniciar conversación
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Description */}
              {character.description && (
                <section aria-labelledby="desc-heading">
                  <h2
                    id="desc-heading"
                    className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3"
                  >
                    <BookOpen className="w-4 h-4" />
                    Descripción
                  </h2>
                  <p className="text-foreground/90 leading-relaxed">
                    {character.description}
                  </p>
                </section>
              )}

              {/* Biography */}
              {character.biography && (
                <section aria-labelledby="bio-heading">
                  <h2
                    id="bio-heading"
                    className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3"
                  >
                    <BookOpen className="w-4 h-4" />
                    Biografía
                  </h2>
                  <p className="text-foreground/90 leading-relaxed whitespace-pre-line">
                    {character.biography}
                  </p>
                </section>
              )}

            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
