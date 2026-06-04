/**
 * Rutas BFF /api/characters/[characterId]/quotes/[itemId]: proxifica al backend con autenticación Supabase.
 */

import { proxyToBackend } from '@/lib/api/backend-proxy'

type RouteContext = {
  params: Promise<{ characterId: string; itemId: string }>
}

/**
 * Actualiza recurso en `/characters/${characterId}/quotes/${itemId}`. Requiere rol administrador.
 *
 * @returns Respuesta del proxy BFF hacia el backend.
 */
export async function PUT(request: Request, context: RouteContext) {
  const { characterId, itemId } = await context.params
  const body = await request.text()
  return proxyToBackend({
    method: 'PUT',
    backendPath: `/characters/${characterId}/quotes/${itemId}`,
    requestBody: body,
    requireAdmin: true,
  })
}

/**
 * Elimina recurso en `/characters/${characterId}/quotes/${itemId}`. Requiere rol administrador.
 *
 * @returns Respuesta del proxy BFF hacia el backend.
 */
export async function DELETE(_request: Request, context: RouteContext) {
  const { characterId, itemId } = await context.params
  return proxyToBackend({
    method: 'DELETE',
    backendPath: `/characters/${characterId}/quotes/${itemId}`,
    requireAdmin: true,
  })
}
