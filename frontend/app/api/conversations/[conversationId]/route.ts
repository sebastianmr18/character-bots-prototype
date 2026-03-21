import type { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/api/backend-proxy'

type RouteContext = {
  params: Promise<{ conversationId: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { conversationId } = await context.params
  return proxyToBackend({ method: 'GET', backendPath: `/conversations/${conversationId}/` })
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { conversationId } = await context.params
  return proxyToBackend({ method: 'DELETE', backendPath: `/conversations/${conversationId}/` })
}
