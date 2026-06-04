/**
 * Rutas BFF /api/characters/[characterId]/editorial: proxifica al backend con autenticación Supabase.
 */

import type { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/api/backend-proxy'

type RouteContext = {
  params: Promise<{ characterId: string }>
}

/**
 * Consulta `/characters/${characterId}/editorial/`.
 *
 * @returns Respuesta del proxy BFF hacia el backend.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  const { characterId } = await context.params

  return proxyToBackend({
    method: 'GET',
    backendPath: `/characters/${characterId}/editorial/`,
  })
}