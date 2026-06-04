/**
 * Rutas BFF /api/conversations/[conversationId]: proxifica al backend con autenticación Supabase.
 */

import type { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/api/backend-proxy'

type RouteContext = {
  params: Promise<{ conversationId: string }>
}

/**
 * Consulta `/conversations/${conversationId}/`.
 *
 * @returns Respuesta del proxy BFF hacia el backend.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  const { conversationId } = await context.params
  return proxyToBackend({ method: 'GET', backendPath: `/conversations/${conversationId}/` })
}

/**
 * Elimina recurso en `/conversations/${conversationId}/`.
 *
 * @returns Respuesta del proxy BFF hacia el backend.
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { conversationId } = await context.params
  return proxyToBackend({ method: 'DELETE', backendPath: `/conversations/${conversationId}/` })
}
