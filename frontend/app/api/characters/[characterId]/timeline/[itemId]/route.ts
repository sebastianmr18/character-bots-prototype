/**
 * Rutas BFF /api/characters/[characterId]/timeline/[itemId]: proxifica al backend con autenticación Supabase.
 */

import { proxyToBackend } from '@/lib/api/backend-proxy'

type RouteContext = {
  params: Promise<{ characterId: string; itemId: string }>
}

/**
 * Actualiza recurso en `/characters/${characterId}/timeline/${itemId}`. Requiere rol administrador.
 *
 * @returns Respuesta del proxy BFF hacia el backend.
 */
export async function PUT(request: Request, context: RouteContext) {
  const { characterId, itemId } = await context.params
  const body = await request.text()
  return proxyToBackend({
    method: 'PUT',
    backendPath: `/characters/${characterId}/timeline/${itemId}`,
    requestBody: body,
    requireAdmin: true,
  })
}

/**
 * Elimina recurso en `/characters/${characterId}/timeline/${itemId}`. Requiere rol administrador.
 *
 * @returns Respuesta del proxy BFF hacia el backend.
 */
export async function DELETE(_request: Request, context: RouteContext) {
  const { characterId, itemId } = await context.params
  return proxyToBackend({
    method: 'DELETE',
    backendPath: `/characters/${characterId}/timeline/${itemId}`,
    requireAdmin: true,
  })
}
