'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import type { Character } from '@/types/chat.types'
import { CharacterContextPanel } from '@/components/ui/features/characters/shared/CharactersContextPanel'
import ChatInterface, { type ConversationMode } from '@/components/ui/features/characters/modes/chat/ChatMode'

interface CharacterProfileProps {
  character: Character
}

interface SelectedConversation {
  id: string
  mode?: 'single' | 'debate'
}

const getConversationMode = (conversation: SelectedConversation): 'single' | 'debate' =>
  conversation.mode === 'debate' ? 'debate' : 'single'

export default function CharacterProfile({ character }: CharacterProfileProps) {
  const router = useRouter()
  const [activeMode, setActiveMode] = useState<ConversationMode>('chat')
  const [lastSingleConversation, setLastSingleConversation] = useState<SelectedConversation | null>(null)
  const [lastDebateConversation, setLastDebateConversation] = useState<SelectedConversation | null>(null)

  const handleSelectConversation = useCallback((conversation: SelectedConversation) => {
    if (getConversationMode(conversation) === 'debate') {
      setLastDebateConversation({ id: conversation.id, mode: 'debate' })
      setActiveMode('debate')
      return
    }

    setLastSingleConversation({ id: conversation.id, mode: 'single' })
    setActiveMode('chat')
  }, [])

  const handleConversationCreated = useCallback((conversation: SelectedConversation) => {
    if (getConversationMode(conversation) === 'debate') {
      setLastDebateConversation({ id: conversation.id, mode: 'debate' })
      setActiveMode('debate')
      return
    }

    setLastSingleConversation({ id: conversation.id, mode: 'single' })
    setActiveMode('chat')
  }, [])

  const handleModeChange = useCallback((mode: ConversationMode) => {
    setActiveMode(mode)
  }, [])

  const selectedConversationId = activeMode === 'debate'
    ? lastDebateConversation?.id
    : lastSingleConversation?.id

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
            selectedConversationId={selectedConversationId}
          />
        </div>

        {/* Right Panel - Conversation (40%) */}
        <div className="lg:w-[40%] flex flex-col relative min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 p-4">
            <ChatInterface
              activeMode={activeMode}
              singleConversationId={lastSingleConversation?.id ?? null}
              debateConversationId={lastDebateConversation?.id ?? null}
              defaultCharacterId={character.id}
              defaultCharacterName={character.name}
              onModeChange={handleModeChange}
              onConversationCreated={handleConversationCreated}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
