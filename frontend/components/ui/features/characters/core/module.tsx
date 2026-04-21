import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CharacterNotFoundState() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center flex flex-col items-center gap-4">
        <MessageSquare className="w-16 h-16 text-muted-foreground/30" />
        <h1 className="text-2xl font-serif font-bold">Personaje no encontrado</h1>
        <p className="text-muted-foreground">
          No encontramos un personaje con ese enlace.
        </p>
        <Button asChild>
          <Link href="/personajes">Ver todos los personajes</Link>
        </Button>
      </div>
    </main>
  )
}
