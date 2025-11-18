'use client'

import { useParams } from 'next/navigation'
import ChatInterface from '@/components/ui/features/chat-interface/module'

export default function ChatPage() {
  const params = useParams()
  const conversationId = params.conversationId as string

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-0 sm:p-4">
      <ChatInterface conversationId={conversationId} />
    </main>
  )
}