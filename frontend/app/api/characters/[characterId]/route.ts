import { proxyToBackend } from '@/lib/api/backend-proxy'

type RouteContext = {
  params: Promise<{ characterId: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { characterId } = await context.params
  return proxyToBackend({
    method: 'GET',
    backendPath: `/characters/${characterId}/`,
  })
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { characterId } = await context.params
  return proxyToBackend({
    method: 'DELETE',
    backendPath: `/characters/${characterId}/`,
    requireAdmin: true,
  })
}
