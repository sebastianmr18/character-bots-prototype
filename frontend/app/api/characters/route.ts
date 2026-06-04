/**
 * Rutas BFF /api/characters: proxifica al backend con autenticación Supabase.
 */

import type { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/api/backend-proxy'

/**
 * Consulta `/characters/`.
 *
 * @returns Respuesta del proxy BFF hacia el backend.
 */
export async function GET() {
  return proxyToBackend({ method: 'GET', backendPath: '/characters/' })
}

/**
 * Crea recurso en `/characters/`.
 *
 * @returns Respuesta del proxy BFF hacia el backend.
 */
export async function POST(request: NextRequest) {
  const body = await request.text()
  return proxyToBackend({ method: 'POST', backendPath: '/characters/', requestBody: body })
}
