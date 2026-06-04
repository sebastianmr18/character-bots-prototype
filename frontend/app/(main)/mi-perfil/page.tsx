'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getErrorMessage } from '@/utils/api.utils'

export default function MiPerfilPage() {
  const { profile, isLoading, refreshProfile } = useAuth()
  const [username, setUsername] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (profile?.username) {
      setUsername(profile.username)
    }
  }, [profile?.username])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    const trimmed = username.trim()
    if (!trimmed) {
      setErrorMessage('El nombre de usuario no puede estar vacío.')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmed }),
      })
      if (!response.ok) {
        setErrorMessage(await getErrorMessage(response))
        return
      }
      await refreshProfile()
      setSuccessMessage('Nombre de usuario actualizado correctamente.')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error de conexión.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-lg space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-serif">Mi perfil</CardTitle>
            <CardDescription>Modifica tu información de usuario.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando perfil...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="username">Nombre de usuario</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Tu nombre de usuario"
                    disabled={isSaving}
                  />
                </div>

                {errorMessage && (
                  <p className="text-sm text-destructive">{errorMessage}</p>
                )}
                {successMessage && (
                  <p className="text-sm text-green-600">{successMessage}</p>
                )}

                <Button type="submit" disabled={isSaving || !username.trim()}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar cambios
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
