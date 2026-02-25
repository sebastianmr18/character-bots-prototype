'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChatListItem } from '@/components/ui/features/character-menu/ChatListItem'
import { CreateCharacterModal } from '@/components/ui/features/character-menu/CreateCharacterModal'
import type { Character, Conversation } from '@/types/chat.types'
import { ArrowLeft, Sparkles, MessageSquare } from 'lucide-react'
import { generateUUID } from '@/utils/uuid.utils'

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
  const charMap: Record<string, Character> = characters.reduce((acc, char) => {
    acc[char.id] = char
    return acc
  }, {} as Record<string, Character>)

  const grouped: GroupedChats = {}

  conversations.forEach((conv) => {
    // Asumimos que character es un objeto o tiene una propiedad characterId en la conversación
    const characterId = (conv as any).characterId || (conv as any).character?.id || null; 
    
    if (characterId && charMap[characterId]) {
      if (!grouped[characterId]) {
        grouped[characterId] = {
          character: charMap[characterId],
          chats: [],
        }
      }
      grouped[characterId].chats.push(conv)
    }
  })
  
  // Agregar personajes sin chats para que se muestren
  characters.forEach(char => {
      // Ordenar los chats descendientemente por fecha de creación
      const sortedChats = grouped[char.id]?.chats.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ) || [];
      
      grouped[char.id] = {
          character: char,
          chats: sortedChats,
      }
  })

  return grouped
}

export default function ChatsConversationsPage() {
  const router = useRouter()
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [groupedChats, setGroupedChats] = useState<GroupedChats>({})

      const fetchAllData = async () => {
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

        setCharacters(charactersData)
        
        // Agrupación
        const grouped = groupConversationsByCharacter(charactersData, conversationsData)
        setGroupedChats(grouped)

      } catch (error) {
        console.error('Error al cargar datos:', error)
      } finally {
        setLoading(false)
      }
    }

  // 1. Carga de datos y Agrupación
  useEffect(() => {
    fetchAllData()
  }, [])

  const handleConversationSelect = useCallback((conversationId: string) => {
    router.push(`/chats/${conversationId}`)
  }, [router])
  
  // TODO: Manejador para la creación de un nuevo chat (asumiendo flujo POST)
  const handleNewConversation = useCallback(async (characterId: string) => {
    // 💡 Aquí se realizaría la llamada real al backend
    // para crear una nueva conversación con el characterId
    
    // --- Lógica simulada de POST al Backend ---

    alert("Crear nuevo chat función por implementar")
    
    const tempConversationId = generateUUID() 
    
    console.log(`Simulando POST /conversations/ con Character ID: ${characterId}. Redirigiendo a: ${tempConversationId}`)
    
    try {
        // En una implementación real, la respuesta del POST contendría el nuevo ID.
        /*
        const response = await fetch(`${API_BASE_URL}/conversations/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ characterId: characterId }) 
        });
        const newConv = await response.json();
        const newConvId = newConv.id;
        */
        
        // Redirección con el ID (simulado o real)
        router.push(`/chats/${tempConversationId}`) 
        
    } catch (error) {
        console.error('Error al crear nueva conversación:', error);
        alert('Error al iniciar nuevo chat. Inténtalo de nuevo.')
    }
  }, [router])

  // 3. Renderizado
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400 animate-pulse text-xl">Cargando personajes y conversaciones... ⏳</p>
      </main>
    )
  }

  const allCharacters = Object.values(groupedChats);
  
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* --- Header --- */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/')}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Personajes & Historial
                </h1>
              </div>
            </div>

            <CreateCharacterModal onCharacterCreated={fetchAllData} />
          </div>
          <p className="text-gray-600 dark:text-gray-400 ml-12">
            Selecciona un chat o crea uno nuevo con tu **personaje favorito**.
          </p>
        </div>
      </div>

      {/* --- Characters Grouped List --- */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {allCharacters.length > 0 ? (
          <div className="space-y-12">
            {allCharacters.map(({ character, chats }) => (
              <div 
                key={character.id} 
                className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
              >
                {/* Título del Personaje y Botón de Nuevo Chat */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 mb-4">
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                        {character.name}
                    </h2>
                    <Button 
                        onClick={() => handleNewConversation(character.id)}
                        className="mt-3 sm:mt-0 bg-green-600 hover:bg-green-700 text-white font-semibold"
                    >
                        + Iniciar Nueva Charla
                    </Button>
                </div>
                
                {/* Lista de Conversaciones */}
<div className="space-y-3">
                    {chats.length > 0 ? (
                        chats.map((conversation) => (
                          <ChatListItem // 🔑 Reemplazo del div por el componente
                            key={conversation.id} 
                            conversation={conversation} 
                            onClick={handleConversationSelect}
                          />
                        ))
                    ) : (
                        // ... (Mensaje de sin chats) ...
                        <div className="text-center py-4 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                            <p className="text-gray-500 dark:text-gray-400">No hay chats guardados con **{character.name}**. ¡Comienza uno!</p>
                        </div>
                    )}
                </div>
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
    </main>
  )
}