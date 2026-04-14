'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Clock, Loader2, MessageSquare } from 'lucide-react'
import type { Character, Conversation } from '@/types/chat.types'
import { cn } from '@/lib/utils'

interface CharacterConversationHistoryProps {
  character: Character
  onSelectConversation?: (conversation: { id: string; mode?: Conversation['mode'] }) => void
  selectedConversationId?: string
  onInitialHistoryLoaded?: () => void
  className?: string
  headerAction?: ReactNode
}

export function CharacterConversationHistory({
  character,
  onSelectConversation,
  selectedConversationId,
  onInitialHistoryLoaded,
  className,
  headerAction,
}: CharacterConversationHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [hasLoadedInitialHistory, setHasLoadedInitialHistory] = useState(false)
  const [hasNotifiedInitialHistoryLoaded, setHasNotifiedInitialHistoryLoaded] = useState(false)

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true)
      const response = await fetch('/api/conversations')
      if (!response.ok) throw new Error(`Error HTTP ${response.status}`)

      const data: Conversation[] = await response.json()
      const forThisCharacter = data.filter((conversation) => conversation.character?.id === character.id || conversation.secondaryCharacter?.id === character.id)
      setConversations(forThisCharacter)
      setHasLoadedInitialHistory(true)
    } catch (error) {
      console.error('Error al cargar conversaciones:', error)
    } finally {
      setIsLoadingConversations(false)
    }
  }, [character.id])

  useEffect(() => {
    setHasLoadedInitialHistory(false)
    setHasNotifiedInitialHistoryLoaded(false)
  }, [character.id])

  useEffect(() => {
    if (!hasLoadedInitialHistory || hasNotifiedInitialHistoryLoaded) {
      return
    }

    onInitialHistoryLoaded?.()
    setHasNotifiedInitialHistoryLoaded(true)
  }, [hasLoadedInitialHistory, hasNotifiedInitialHistoryLoaded, onInitialHistoryLoaded])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  useEffect(() => {
    const onConversationCreated = () => {
      fetchConversations()
    }

    window.addEventListener('conversation:created', onConversationCreated)

    return () => {
      window.removeEventListener('conversation:created', onConversationCreated)
    }
  }, [fetchConversations])

  return (
    <aside className={cn('flex h-full flex-col border-l border-border bg-muted/20', className)}>
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Clock className="h-4 w-4 text-primary" />
              Historial
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Conversaciones previas con {character.name}
            </p>
          </div>
          {headerAction}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {isLoadingConversations ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando conversaciones...
          </div>
        ) : conversations.length === 0 ? (
          <p className="text-sm italic text-muted-foreground">
            Aún no tienes conversaciones con este personaje.
          </p>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => {
              const isSelected = selectedConversationId === conversation.id

              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation?.({ id: conversation.id, mode: conversation.mode })}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-foreground hover:bg-muted'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare className="mt-0.5 h-4 w-4 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 truncate text-sm font-medium">
                        Conversación
                        {conversation.mode === 'debate' && (
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                              isSelected
                                ? 'bg-primary-foreground/20 text-primary-foreground'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            Debate
                          </span>
                        )}
                      </p>
                      <p className={`mt-1 text-xs ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {new Date(conversation.createdAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}