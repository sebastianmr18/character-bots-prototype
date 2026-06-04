/**
 * Rutas BFF /api/conversations: proxifica al backend con autenticación Supabase.
 */

import type { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/api/backend-proxy'

/**
 * Consulta.
 *
 * @returns Respuesta del proxy BFF hacia el backend.
 */
export async function GET(request: NextRequest) {
  const characterId = request.nextUrl.searchParams.get('characterId')
  const backendPath = characterId
    ? `/conversations/?character_id=${encodeURIComponent(characterId)}`
    : '/conversations/'

  return proxyToBackend({ method: 'GET', backendPath })
}

/**
 * Crea recurso en `/conversations/`.
 *
 * @returns Respuesta del proxy BFF hacia el backend.
 */
export async function POST(request: NextRequest) {
  const body = await request.text()
  return proxyToBackend({ method: 'POST', backendPath: '/conversations/', requestBody: body })
}
