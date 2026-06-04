/**
 * Rutas BFF /api/characters/[characterId]/relationships/[itemId]: proxifica al backend con autenticación Supabase.
 */

import { proxyToBackend } from '@/lib/api/backend-proxy'

type RouteContext = {
  params: Promise<{ characterId: string; itemId: string }>
}

/**
 * Actualiza recurso en `/characters/${characterId}/relationships/${itemId}`. Requiere rol administrador.
 *
 * @returns Respuesta del proxy BFF hacia el backend.
 */
export async function PUT(request: Request, context: RouteContext) {
  const { characterId, itemId } = await context.params
  const body = await request.text()
  return proxyToBackend({
    method: 'PUT',
    backendPath: `/characters/${characterId}/relationships/${itemId}`,
    requestBody: body,
    requireAdmin: true,
  })
}

/**
 * Elimina recurso en `/characters/${characterId}/relationships/${itemId}`. Requiere rol administrador.
 *
 * @returns Respuesta del proxy BFF hacia el backend.
 */
export async function DELETE(_request: Request, context: RouteContext) {
  const { characterId, itemId } = await context.params
  return proxyToBackend({
    method: 'DELETE',
    backendPath: `/characters/${characterId}/relationships/${itemId}`,
    requireAdmin: true,
  })
}
