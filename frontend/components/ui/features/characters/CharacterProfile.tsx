'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import type { Character } from '@/types/chat.types'
import { CharacterContextPanel } from '@/components/ui/features/characters/CharactersContextPanel'
import ChatInterface from '@/components/ui/features/characters/ChatPanel'

interface CharacterProfileProps {
  character: Character
}

export default function CharacterProfile({ character }: CharacterProfileProps) {
  const router = useRouter()
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  const handleSelectConversation = useCallback((conversationId: string) => {
    setSelectedConversationId(conversationId)
  }, [])

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <nav className="px-4 py-3 border-b border-border shrink-0">
        <button
          onClick={() => router.push('/personajes')}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a personajes
        </button>
      </nav>

      <div className="flex flex-col lg:flex-row flex-1">
        {/* Left Panel - Character Context (60%) */}
        <div className="lg:w-[60%] border-r border-border overflow-hidden flex flex-col">
          <CharacterContextPanel
            character={character}
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversationId || undefined}
          />
        </div>

        {/* Right Panel - Conversation (40%) */}
        <div className="lg:w-[40%] flex flex-col relative min-h-0 overflow-hidden">
          {selectedConversationId ? (
            <div className="flex-1 min-h-0 p-4">
              <ChatInterface conversationId={selectedConversationId} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground text-center px-4">
                Selecciona una conversación para empezar
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
