/**
 * Rutas BFF /api/characters/[characterId]/system-prompt: proxifica al backend con autenticación Supabase.
 */

import type { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/api/backend-proxy'

type RouteContext = {
  params: Promise<{ characterId: string }>
}

/**
 * Consulta `/characters/${characterId}/system-prompt/` con el query param `mode` opcional.
 *
 * @returns Respuesta del proxy BFF hacia el backend.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const { characterId } = await context.params
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('mode')

  const backendPath = mode
    ? `/characters/${characterId}/system-prompt/?mode=${encodeURIComponent(mode)}`
    : `/characters/${characterId}/system-prompt/`

  return proxyToBackend({
    method: 'GET',
    backendPath,
  })
}
