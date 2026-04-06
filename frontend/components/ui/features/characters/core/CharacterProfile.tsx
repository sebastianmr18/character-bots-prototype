'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, PanelRightClose, PanelRightOpen } from 'lucide-react'
import type { Character, Conversation } from '@/types/chat.types'
import { CharacterContextPanel } from '@/components/ui/features/characters/shared/CharactersContextPanel'
import { CharacterConversationHistory } from '../shared/CharacterConversationHistory'
import ChatInterface, { type ConversationMode } from '@/components/ui/features/characters/modes/chat/ChatMode'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

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
    setIsHistoryOpen(false)
  }, [character.id])

  const selectedConversationId = activeMode === 'debate'
    ? lastDebateConversation?.id
    : lastSingleConversation?.id

  const toggleHistory = useCallback(() => {
    setIsHistoryOpen((current) => !current)
  }, [])

  const historyToggleButton = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggleHistory}
      aria-label={isHistoryOpen ? 'Ocultar historial' : 'Mostrar historial'}
      aria-pressed={isHistoryOpen}
      className="shadow-sm"
    >
      {isHistoryOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
      Historial
    </Button>
  )

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

      <div className="flex flex-1 flex-col lg:hidden">
        <div className="border-r border-border overflow-hidden flex flex-col">
          <CharacterContextPanel character={character} />
        </div>

        <div className="flex flex-col relative min-h-0 overflow-hidden">
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

        <div className="flex flex-col relative overflow-hidden">
          <CharacterConversationHistory
            character={character}
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversationId}
            onInitialHistoryLoaded={handleInitialHistoryLoaded}
          />
        </div>
      </div>

      <div className="hidden flex-1 lg:flex min-h-0">
        <div
          className={cn(
            'border-r border-border overflow-hidden flex flex-col transition-all duration-300',
            isHistoryOpen ? 'w-[40%]' : 'w-[40%]'
          )}
        >
          <CharacterContextPanel character={character} />
        </div>

        <div
          className={cn(
            'relative flex min-h-0 flex-col overflow-hidden transition-all duration-300',
            isHistoryOpen ? 'w-[45%]' : 'w-[60%]'
          )}
        >
          {!isHistoryOpen ? (
            <div className="absolute right-4 top-4 z-10">
              {historyToggleButton}
            </div>
          ) : null}

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

        <div
          className={cn(
            'min-h-0 overflow-hidden transition-all duration-300',
            isHistoryOpen ? 'w-[15%] opacity-100' : 'w-0 opacity-0 pointer-events-none'
          )}
          aria-hidden={!isHistoryOpen}
        >
          <CharacterConversationHistory
            character={character}
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversationId}
            onInitialHistoryLoaded={handleInitialHistoryLoaded}
            headerAction={historyToggleButton}
          />
        </div>
      </div>
    </main>
  )
}
