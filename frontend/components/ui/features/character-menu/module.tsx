'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ChatListItem } from '@/components/ui/features/character-menu/ChatListItem'
import { CreateCharacterModal } from '@/components/ui/features/character-menu/CreateCharacterModal'
import type { Character, Conversation } from '@/types/chat.types'
import { getErrorMessage } from '@/utils/api.utils'
import { ArrowLeft, Sparkles, MessageSquare } from 'lucide-react'
import { toSlug, colorFromName, lightColorFromName } from '@/utils/character.utils'

// Se define el tipo para la estructura de agrupación
type GroupedChats = {
  [characterId: string]: {
    character: Character
    chats: Conversation[]
  }
}

/**
 * Función de ayuda para agrupar las conversaciones bajo su respectivo personaje.
 * Asegura que todos los personajes aparezcan, incluso si no tienen chats.
 */
const groupConversationsByCharacter = (
  characters: Character[],
  conversations: Conversation[],
): GroupedChats => {
  const grouped: GroupedChats = Object.fromEntries(
    characters.map((character) => [character.id, { character, chats: [] }]),
  )

  for (const conversation of conversations) {
    const characterId = conversation.characterId ?? conversation.character?.id
    if (!characterId || !grouped[characterId]) continue
    grouped[characterId].chats.push(conversation)
  }

  for (const entry of Object.values(grouped)) {
    entry.chats.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }

  return grouped
}

export default function ChatsConversationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [creatingCharacterId, setCreatingCharacterId] = useState<string | null>(null)
  const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null)
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null)
  const [operationError, setOperationError] = useState<string | null>(null)
  const [groupedChats, setGroupedChats] = useState<GroupedChats>({})

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true)

      // Carga paralela de personajes y conversaciones
      const [charResponse, convResponse] = await Promise.all([
        fetch('/api/characters'),
        fetch('/api/conversations'),
      ])

      if (!charResponse.ok) throw new Error(`Error HTTP Personajes ${charResponse.status}`)
      if (!convResponse.ok) throw new Error(`Error HTTP Conversaciones ${convResponse.status}`)

      const charactersData: Character[] = await charResponse.json()
      const conversationsData: Conversation[] = await convResponse.json()

      // Agrupación
      const grouped = groupConversationsByCharacter(charactersData, conversationsData)
      setGroupedChats(grouped)

    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // 1. Carga de datos y Agrupación
  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  const handleConversationSelect = useCallback((conversationId: string) => {
    router.push(`/chats/${conversationId}`)
  }, [router])

  const handleCharacterClick = useCallback((characterName: string) => {
    router.push(`/personajes/${toSlug(characterName)}`)
  }, [router])

  const handleNewConversation = useCallback(async (characterId: string) => {
    try {
      setOperationError(null)
      setCreatingCharacterId(characterId)

      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ characterId }),
      })

      if (!response.ok) {
        const message = await getErrorMessage(response)
        throw new Error(message)
      }

      const newConversation: Conversation = await response.json()
      const newConversationId = newConversation?.id

      if (!newConversationId) {
        throw new Error('No se recibió el id de la conversación')
      }

      await fetchAllData()
      router.push(`/chats/${newConversationId}`)
    } catch (error) {
      console.error('Error al crear nueva conversación:', error)
      const message = error instanceof Error ? error.message : 'Error al iniciar nuevo chat'
      setOperationError(message)
    } finally {
      setCreatingCharacterId(null)
    }
  }, [fetchAllData, router])

  const handleDeleteConversation = useCallback((conversationId: string) => {
    setOperationError(null)
    setConversationToDelete(conversationId)
  }, [])

  const confirmDeleteConversation = useCallback(async () => {
    if (!conversationToDelete) return

    try {
      setOperationError(null)
      setDeletingConversationId(conversationToDelete)

      const response = await fetch(`/api/conversations/${conversationToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const message = await getErrorMessage(response)
        throw new Error(message)
      }

      await fetchAllData()
    } catch (error) {
      console.error('Error al eliminar conversación:', error)
      const message = error instanceof Error ? error.message : 'Error al eliminar la conversación'
      setOperationError(message)
    } finally {
      setConversationToDelete(null)
      setDeletingConversationId(null)
    }
  }, [conversationToDelete, fetchAllData])

  // 3. Renderizado
  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400 animate-pulse text-xl">Cargando personajes y conversaciones... ⏳</p>
      </main>
    )
  }

  const allCharacters = Object.values(groupedChats);

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
            {/*<CreateCharacterModal onCharacterCreated={fetchAllData} />*/}
          </div>
        </div>
      </div>

      {/* --- Characters Grouped List --- */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {operationError && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {operationError}
          </div>
        )}

        {allCharacters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCharacters.map(({ character, chats }) => (
              <div
                key={character.id}
                className="group relative rounded-lg overflow-hidden bg-card border border-border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                onClick={() => handleCharacterClick(character.name)}
                style={{
                  '--character-color': character.themeColor ?? colorFromName(character.name),
                  '--character-color-light': character.themeColorLight ?? lightColorFromName(character.name),
                } as React.CSSProperties}
              >
                {/* Título del Personaje y Botón de Nuevo Chat */}
                <div className="h-40 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <pattern id={`pattern-${character.id}`} patternUnits="userSpaceOnUse" width="20" height="20">
                        <circle cx="10" cy="10" r="1.5" fill={character.themeColor ?? colorFromName(character.name)} />
                      </pattern>
                      <rect width="100%" height="100%" fill={`url(#pattern-${character.id})`} />
                    </svg>
                  </div>

                  {/* Character initial as placeholder */}
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
                  {/* TODO: Recolocar el botón de iniciar una neuva charla. */}
                  {/*<Button 
                        onClick={() => handleNewConversation(character.id)}
                      disabled={creatingCharacterId === character.id}
                        className="mt-3 sm:mt-0 bg-green-600 hover:bg-green-700 text-white font-semibold"
                    >
                      {creatingCharacterId === character.id ? 'Creando...' : '+ Iniciar Nueva Charla'}
                    </Button>*/}
                </div>

                {/* Lista de Conversaciones */}
                {/*<div className="space-y-3">
                  {chats.length > 0 ? (
                    chats.map((conversation) => (
                      <ChatListItem // 🔑 Reemplazo del div por el componente
                        key={conversation.id}
                        conversation={conversation}
                        onClick={handleConversationSelect}
                        onDelete={handleDeleteConversation}
                        isDeleting={deletingConversationId === conversation.id}
                      />
                    ))
                  ) : (
                    // ... (Mensaje de sin chats) ...
                    <div className="text-center py-4 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                      <p className="text-gray-500 dark:text-gray-400">No hay chats guardados con **{character.name}**. ¡Comienza uno!</p>
                    </div>
                  )}
                </div>*/}
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

      <AlertDialog
        open={conversationToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setConversationToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar conversación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingConversationId !== null}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteConversation}
              disabled={deletingConversationId !== null}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deletingConversationId !== null ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}