import type { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/api/backend-proxy'

type RouteContext = {
  params: Promise<{ characterId: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { characterId } = await context.params

  return proxyToBackend({
    method: 'GET',
    backendPath: `/characters/${characterId}/editorial/`,
  })
}