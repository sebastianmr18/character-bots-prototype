'use client'

import { useParams } from 'next/navigation'
import CharacterProfilePage from '@/components/ui/features/characters/core/module'

export default function PersonajeDetallePage() {
  const params = useParams()
  const nombrePersonaje = params.nombrePersonaje as string

  return <CharacterProfilePage slug={nombrePersonaje} />
}
