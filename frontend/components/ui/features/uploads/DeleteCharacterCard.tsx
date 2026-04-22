'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'
import { useCharacters } from '@/hooks/useCharacters'
import { getErrorMessage } from '@/utils/api.utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

type DeleteCharacterCardProps = {
  refreshKey: number
  onCharacterDeleted: () => void
}

export function DeleteCharacterCard({ refreshKey, onCharacterDeleted }: DeleteCharacterCardProps) {
  const { availableCharacters, selectedCharacterId, handleCharacterChange, isLoading } = useCharacters(
    undefined,
    {
      storageKey: 'uploads_delete_character_id',
      refreshKey,
    },
  )

  const selectedCharacter = useMemo(
    () => availableCharacters.find((character) => character.id === selectedCharacterId) ?? null,
    [availableCharacters, selectedCharacterId],
  )

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [confirmName, setConfirmName] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const isConfirmationValid = selectedCharacter?.name === confirmName.trim()

  const resetDialogState = () => {
    setConfirmName('')
    setIsDeleting(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setIsDialogOpen(nextOpen)
    if (!nextOpen) {
      resetDialogState()
    }
  }

  const handleDeleteCharacter = async () => {
    if (!selectedCharacter) {
      setErrorMessage('Selecciona un personaje antes de intentar eliminarlo.')
      return
    }

    setIsDeleting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const response = await fetch(`/api/characters/${selectedCharacter.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized')
        }
        if (response.status === 403) {
          throw new Error('Forbidden: admin role required.')
        }
        if (response.status === 404) {
          throw new Error('El personaje no existe o ya fue eliminado.')
        }

        throw new Error(await getErrorMessage(response))
      }

      setSuccessMessage(`Se elimino a ${selectedCharacter.name} correctamente.`)
      resetDialogState()
      setIsDialogOpen(false)
      onCharacterDeleted()
    } catch (error) {
      const fallbackMessage = 'No se pudo eliminar el personaje. Intenta nuevamente.'
      setErrorMessage(error instanceof Error ? error.message : fallbackMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-serif text-destructive">
          <Trash2 className="h-6 w-6" />
          Eliminar personaje
        </CardTitle>
        <CardDescription>
          Esta accion es destructiva y elimina en cascada conversaciones, mensajes, contenido editorial y limpieza best-effort de assets asociados.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-muted-foreground">
          <p className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
            Solo admins pueden ejecutar este borrado. El backend trata el 204 como fuente de verdad aunque el cleanup de storage sea best-effort.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="delete-character-select">Personaje</Label>
          <select
            id="delete-character-select"
            className="border-input bg-background ring-offset-background focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
            value={selectedCharacterId ?? ''}
            onChange={(event) => {
              handleCharacterChange(event.target.value)
              setErrorMessage(null)
              setSuccessMessage(null)
            }}
            disabled={isLoading || availableCharacters.length === 0 || isDeleting}
          >
            <option value="" disabled>
              {isLoading ? 'Cargando personajes...' : 'Selecciona un personaje'}
            </option>
            {availableCharacters.map((character) => (
              <option key={character.id} value={character.id}>
                {character.name}
              </option>
            ))}
          </select>
        </div>

        {selectedCharacter ? (
          <div className="rounded-md border bg-muted/30 p-3 text-sm">
            <p className="font-medium text-foreground">Confirmacion requerida</p>
            <p className="text-muted-foreground">
              Para continuar, deberas escribir exactamente: <span className="font-semibold text-foreground">{selectedCharacter.name}</span>
            </p>
          </div>
        ) : null}

        <AlertDialog open={isDialogOpen} onOpenChange={handleOpenChange}>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="destructive"
              className="w-full gap-2"
              disabled={!selectedCharacter || isDeleting}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar personaje
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar eliminacion permanente</AlertDialogTitle>
              <AlertDialogDescription>
                Esta accion borra al personaje y sus datos relacionados. Escribe el nombre exacto para habilitar la eliminacion final.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {selectedCharacter ? (
              <div className="space-y-2">
                <Label htmlFor="delete-character-confirmation">Escribe el nombre del personaje</Label>
                <Input
                  id="delete-character-confirmation"
                  value={confirmName}
                  onChange={(event) => setConfirmName(event.target.value)}
                  placeholder={selectedCharacter.name}
                  disabled={isDeleting}
                />
              </div>
            ) : null}

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={(event) => {
                  event.preventDefault()
                  if (!isConfirmationValid || isDeleting) {
                    return
                  }
                  void handleDeleteCharacter()
                }}
                className="bg-destructive text-white hover:bg-destructive/90"
                disabled={!isConfirmationValid || isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  'Eliminar definitivamente'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {errorMessage ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
            {successMessage}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
