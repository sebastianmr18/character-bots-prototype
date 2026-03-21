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

interface SelectedConversation {
  id: string
  mode?: 'single' | 'debate'
}

export default function CharacterProfile({ character }: CharacterProfileProps) {
  const router = useRouter()
  const [selectedConversation, setSelectedConversation] = useState<SelectedConversation | null>(null)

  const handleSelectConversation = useCallback((conversation: SelectedConversation) => {
    setSelectedConversation(conversation)
  }, [])

  const initialMode = selectedConversation?.mode === 'debate' ? 'debate' : 'chat'

  const handleConversationCreated = useCallback((conversation: SelectedConversation) => {
    setSelectedConversation(conversation)
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
            selectedConversationId={selectedConversation?.id}
          />
        </div>

        {/* Right Panel - Conversation (40%) */}
        <div className="lg:w-[40%] flex flex-col relative min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 p-4">
            <ChatInterface
              conversationId={selectedConversation?.id ?? null}
              defaultCharacterId={character.id}
              defaultCharacterName={character.name}
              initialMode={initialMode}
              onConversationCreated={handleConversationCreated}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
