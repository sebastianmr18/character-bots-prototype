'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getErrorMessage } from '@/utils/api.utils'
import type { AdminUser, UserRole } from '@/types/chat.types'

export function UserManagementCard() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const response = await fetch('/api/admin/users', { cache: 'no-store' })
      if (!response.ok) {
        setErrorMessage(await getErrorMessage(response))
        return
      }
      const data = (await response.json()) as { users: AdminUser[] }
      setUsers(data.users ?? [])
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error de conexión.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  async function handleRoleChange(userId: string, newRole: UserRole) {
    const previousUsers = users
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    )

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (!response.ok) {
        setUsers(previousUsers)
        setErrorMessage(await getErrorMessage(response))
      }
    } catch (err) {
      setUsers(previousUsers)
      setErrorMessage(err instanceof Error ? err.message : 'Error de conexión.')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-serif">Gestión de usuarios</CardTitle>
        <CardDescription>Consulta y modifica el rol de los usuarios registrados.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cargando usuarios...
          </div>
        )}

        {!isLoading && errorMessage && (
          <p className="text-sm text-destructive">{errorMessage}</p>
        )}

        {!isLoading && !errorMessage && users.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay usuarios registrados.</p>
        )}

        {!isLoading && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Usuario</th>
                  <th className="pb-2 pr-4 font-medium">ID</th>
                  <th className="pb-2 pr-4 font-medium">Registrado</th>
                  <th className="pb-2 font-medium">Rol</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">{user.username}</td>
                    <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">
                      {user.id.slice(0, 8)}…
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="py-2">
                      <Select
                        value={user.role}
                        onValueChange={(value) =>
                          void handleRoleChange(user.id, value as UserRole)
                        }
                      >
                        <SelectTrigger className="h-8 w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">user</SelectItem>
                          <SelectItem value="admin">admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
