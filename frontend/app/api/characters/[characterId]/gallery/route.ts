/**
 * Rutas BFF /api/characters/[characterId]/gallery: proxifica al backend con autenticación Supabase.
 */

import { proxyToBackend } from '@/lib/api/backend-proxy'

type RouteContext = {
  params: Promise<{ characterId: string }>
}

/**
 * Crea recurso en `/characters/${characterId}/gallery`. Requiere rol administrador.
 *
 * @returns Respuesta del proxy BFF hacia el backend.
 */
export async function POST(request: Request, context: RouteContext) {
  const { characterId } = await context.params
  const body = await request.text()
  return proxyToBackend({
    method: 'POST',
    backendPath: `/characters/${characterId}/gallery`,
    requestBody: body,
    requireAdmin: true,
  })
}
