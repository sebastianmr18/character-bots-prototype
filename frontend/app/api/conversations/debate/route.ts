/**
 * Rutas BFF /api/conversations/debate: proxifica al backend con autenticación Supabase.
 */

import type { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/api/backend-proxy'

/**
 * Crea recurso en `/conversations/debate`.
 *
 * @returns Respuesta del proxy BFF hacia el backend.
 */
export async function POST(request: NextRequest) {
  const body = await request.text()
  return proxyToBackend({ method: 'POST', backendPath: '/conversations/debate', requestBody: body })
}
