'use client'

import { type ReactNode } from 'react'
import { Clock, MessageSquare } from 'lucide-react'
import type { Character, Conversation } from '@/types/chat.types'
import { cn } from '@/lib/utils'
import { ConversationItemSkeleton } from '@/components/ui/features/skeletons/ConversationItemSkeleton'

interface CharacterConversationHistoryProps {
  character: Character
  conversations: Conversation[]
  isLoadingConversations: boolean
  onSelectConversation?: (conversation: { id: string; mode?: Conversation['mode'] }) => void
  selectedConversationId?: string | null
  className?: string
  headerAction?: ReactNode
}

export function CharacterConversationHistory({
  character,
  conversations,
  isLoadingConversations,
  onSelectConversation,
  selectedConversationId,
  className,
  headerAction,
}: CharacterConversationHistoryProps) {
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
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <ConversationItemSkeleton key={index} />
            ))}
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