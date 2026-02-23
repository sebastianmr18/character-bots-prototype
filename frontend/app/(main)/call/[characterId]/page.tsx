'use client'

import { useParams } from 'next/navigation'
import { CallCanvas } from '@/components/ui/features/call/CallCanvas'

export default function CallPage() {
  const params = useParams()
  const characterId = params.characterId as string

  return (
    <main className="min-h-screen">
      <CallCanvas characterId={characterId} />
    </main>
  )
}
