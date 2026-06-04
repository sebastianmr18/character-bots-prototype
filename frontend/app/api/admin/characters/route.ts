/**
 * Rutas BFF /api/admin/characters: proxifica al backend con autenticación Supabase.
 */

import type { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/api/backend-proxy'

/**
 * Consulta. Requiere rol administrador.
 *
 * @returns Respuesta del proxy BFF hacia el backend.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const query = searchParams.toString()
  const backendPath = query ? `/admin/characters/?${query}` : '/admin/characters/'
  return proxyToBackend({ method: 'GET', backendPath, requireAdmin: true })
}
