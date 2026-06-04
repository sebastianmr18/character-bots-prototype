/**
 * Comprueba si el token de sesión pertenece a un usuario con rol administrador.
 *
 * @param token - Access token JWT de Supabase.
 * @returns `true` si el backend responde con `role: "admin"` en `/me`.
 */
export async function hasAdminRole(token: string): Promise<boolean> {
  if (!process.env.BACKEND_URL) {
    return false
  }

  const meResponse = await fetch(`${process.env.BACKEND_URL}/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  })

  if (!meResponse.ok) {
    return false
  }

  const meData = (await meResponse.json()) as { role?: string }
  return meData.role === 'admin'
}
