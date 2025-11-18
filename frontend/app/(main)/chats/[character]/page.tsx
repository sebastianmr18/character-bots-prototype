'use client'

import { useParams, useRouter } from 'next/navigation'
import ChatInterface from '@/components/ui/features/chat-interface/module'

export default function ChatPage() {
  const params = useParams()
  const personajeId = params.personaje as string

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <ChatInterface preselectedCharacterId={personajeId} />
    </main>
  )
}
