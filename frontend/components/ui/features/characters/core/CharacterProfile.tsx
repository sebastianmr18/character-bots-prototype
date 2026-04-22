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
  const [isHistoryOpen, setIsHistoryOpen] = useState(true)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)

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

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true)

      const query = new URLSearchParams({ characterId: character.id })
      const response = await fetch(`/api/conversations?${query.toString()}`)
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`)
      }

      const data: Conversation[] = await response.json()
      const forThisCharacter = data.filter(
        (conversation) =>
          conversation.character?.id === character.id ||
          conversation.secondaryCharacter?.id === character.id,
      )

      setConversations(forThisCharacter)
      setIsInitialHistoryLoaded(true)
    } catch (error) {
      console.error('Error al cargar conversaciones:', error)
      setConversations([])
    } finally {
      setIsLoadingConversations(false)
    }
  }, [character.id])

  useEffect(() => {
    setIsInitialHistoryLoaded(false)
    setIsHistoryOpen(true)
    setConversations([])
    setIsLoadingConversations(true)
  }, [character.id])

  useEffect(() => {
    void fetchConversations()
  }, [fetchConversations])

  useEffect(() => {
    const onConversationCreated = () => {
      void fetchConversations()
    }

    window.addEventListener('conversation:created', onConversationCreated)

    return () => {
      window.removeEventListener('conversation:created', onConversationCreated)
    }
  }, [fetchConversations])

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

  const desktopHistoryToggleButton = (
    <div className="hidden lg:block">
      {historyToggleButton}
    </div>
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

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div
          className={cn(
            'overflow-hidden flex flex-col lg:border-r lg:border-border lg:transition-all lg:duration-300',
            isHistoryOpen ? 'lg:w-[40%]' : 'lg:w-[55%]',
          )}
        >
          <CharacterContextPanel character={character} />
        </div>

        <div
          className={cn(
            'relative flex min-h-0 flex-col overflow-hidden lg:transition-all lg:duration-300',
            isHistoryOpen ? 'lg:w-[45%]' : 'lg:w-[60%]',
          )}
        >
          {!isHistoryOpen ? (
            <div className="absolute right-4 top-4 z-10 hidden lg:block">
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
            'relative flex flex-col overflow-hidden border-t border-border lg:min-h-0 lg:border-l lg:border-t-0 lg:transition-all lg:duration-300',
            isHistoryOpen ? 'lg:w-[15%] lg:opacity-100' : 'lg:w-0 lg:opacity-0 lg:pointer-events-none',
          )}
          aria-hidden={!isHistoryOpen}
        >
          <CharacterConversationHistory
            character={character}
            conversations={conversations}
            isLoadingConversations={isLoadingConversations}
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversationId}
            headerAction={desktopHistoryToggleButton}
          />
        </div>
      </div>
    </main>
  )
}
