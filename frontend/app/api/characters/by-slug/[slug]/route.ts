/**
 * Rutas BFF /api/characters/by-slug/[slug]: proxifica al backend con autenticación Supabase.
 */

import { proxyToBackend } from '@/lib/api/backend-proxy'

type RouteContext = {
  params: Promise<{ slug: string }>
}

/**
 * Consulta `/characters/by-slug/${encodeURIComponent(slug)}/`.
 *
 * @returns Respuesta del proxy BFF hacia el backend.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params

  return proxyToBackend({
    method: 'GET',
    backendPath: `/characters/by-slug/${encodeURIComponent(slug)}/`,
  })
}