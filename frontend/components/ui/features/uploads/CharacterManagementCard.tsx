'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, Pencil, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CharacterFormSheet } from './CharacterFormSheet'
import { getErrorMessage } from '@/utils/api.utils'
import type { Character } from '@/types/chat.types'

export function CharacterManagementCard() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetMode, setSheetMode] = useState<'create' | 'edit'>('create')
  const [editingCharacter, setEditingCharacter] = useState<Character | undefined>(undefined)

  const loadCharacters = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const res = await fetch('/api/characters', { cache: 'no-store' })
      if (!res.ok) {
        setErrorMessage(await getErrorMessage(res))
        return
      }
      const data = (await res.json()) as Character[]
      setCharacters(data)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error de conexión.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadCharacters()
  }, [loadCharacters])

  function openCreate() {
    setSheetMode('create')
    setEditingCharacter(undefined)
    setSheetOpen(true)
  }

  function openEdit(character: Character) {
    setSheetMode('edit')
    setEditingCharacter(character)
    setSheetOpen(true)
  }

  function handleSuccess() {
    void loadCharacters()
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-xl font-serif">Gestión de personajes</CardTitle>
            <CardDescription>Crea y edita personajes con sus datos editoriales.</CardDescription>
          </div>
          <Button size="sm" onClick={openCreate} className="shrink-0 ml-4">
            <Plus className="mr-1 h-4 w-4" />
            Nuevo personaje
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando personajes...
            </div>
          )}

          {!isLoading && errorMessage && (
            <p className="text-sm text-destructive">{errorMessage}</p>
          )}

          {!isLoading && !errorMessage && characters.length === 0 && (
            <p className="text-sm text-muted-foreground">No hay personajes creados aún.</p>
          )}

          {!isLoading && characters.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Nombre</th>
                    <th className="pb-2 pr-4 font-medium">Rol</th>
                    <th className="pb-2 pr-4 font-medium">Categoría</th>
                    <th className="pb-2 pr-4 font-medium">Público</th>
                    <th className="pb-2 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {characters.map((c) => {
                    const ec = c as Character & Record<string, unknown>
                    return (
                      <tr key={c.id} className="border-b last:border-0">
                        <td className="py-2 pr-4 font-medium">{c.name}</td>
                        <td className="py-2 pr-4 text-muted-foreground">{c.role}</td>
                        <td className="py-2 pr-4 text-muted-foreground">{c.category ?? '—'}</td>
                        <td className="py-2 pr-4 text-muted-foreground">{ec.isPublic ? 'Sí' : 'No'}</td>
                        <td className="py-2">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(c)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <CharacterFormSheet
        mode={sheetMode}
        character={editingCharacter}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={handleSuccess}
      />
    </>
  )
}
