'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { KnowledgeBaseUploadCard } from '@/components/ui/features/uploads/KnowledgeBaseUploadCard'
import { DeleteCharacterCard } from '@/components/ui/features/uploads/DeleteCharacterCard'

export default function UploadsPage() {
  const { isAdmin, isLoading: isAuthLoading } = useAuth()
  const [charactersRefreshKey, setCharactersRefreshKey] = useState(0)

  const handleCharacterDeleted = () => {
    setCharactersRefreshKey((previousKey) => previousKey + 1)
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        {isAuthLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validando permisos...
            </CardContent>
          </Card>
        ) : null}

        {!isAuthLoading && !isAdmin ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-serif">Acceso restringido</CardTitle>
              <CardDescription>
                Esta pagina de uploads solo esta disponible para usuarios con rol admin.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        {isAuthLoading || !isAdmin ? null : (
          <div className="space-y-6">
            <KnowledgeBaseUploadCard refreshKey={charactersRefreshKey} />
            <DeleteCharacterCard
              refreshKey={charactersRefreshKey}
              onCharacterDeleted={handleCharacterDeleted}
            />
          </div>
        )}
      </div>
    </main>
  )
}
