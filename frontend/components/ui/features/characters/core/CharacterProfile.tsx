'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import type { Character, Conversation } from '@/types/chat.types'
import { CharacterContextPanel } from '@/components/ui/features/characters/shared/CharactersContextPanel'
import ChatInterface, { type ConversationMode } from '@/components/ui/features/characters/modes/chat/ChatMode'

interface CharacterProfileProps {
  character: Character
}

interface SelectedConversation {
  id: string
  mode?: Conversation['mode']
}

const getConversationMode = (conversation: SelectedConversation): 'single' | 'debate' =>
  conversation.mode === 'debate' ? 'debate' : 'single'

export default function CharacterProfile({ character }: CharacterProfileProps) {
  const router = useRouter()
  const [activeMode, setActiveMode] = useState<ConversationMode>('interview')
  const [lastSingleConversation, setLastSingleConversation] = useState<SelectedConversation | null>(null)
  const [lastDebateConversation, setLastDebateConversation] = useState<SelectedConversation | null>(null)
  const [isInitialHistoryLoaded, setIsInitialHistoryLoaded] = useState(false)

  const handleSelectConversation = useCallback((conversation: SelectedConversation) => {
    if (getConversationMode(conversation) === 'debate') {
      setLastDebateConversation({ id: conversation.id, mode: 'debate' })
      setActiveMode('debate')
      return
    }

    setLastSingleConversation({ id: conversation.id, mode: 'single' })
    setActiveMode('interview')
  }, [])

  const handleConversationCreated = useCallback((conversation: SelectedConversation) => {
    if (getConversationMode(conversation) === 'debate') {
      setLastDebateConversation({ id: conversation.id, mode: 'debate' })
      setActiveMode('debate')
      return
    }

    setLastSingleConversation({ id: conversation.id, mode: 'single' })
    setActiveMode('interview')
  }, [])

  const handleModeChange = useCallback((mode: ConversationMode) => {
    setActiveMode(mode)
  }, [])

  const handleInitialHistoryLoaded = useCallback(() => {
    setIsInitialHistoryLoaded(true)
  }, [])

  useEffect(() => {
    setIsInitialHistoryLoaded(false)
  }, [character.id])

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
            onInitialHistoryLoaded={handleInitialHistoryLoaded}
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
              isInitialHistoryLoaded={isInitialHistoryLoaded}
              onModeChange={handleModeChange}
              onConversationCreated={handleConversationCreated}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
