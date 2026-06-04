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

export async function PUT(request: Request, context: RouteContext) {
  const { characterId } = await context.params
  const body = await request.text()
  return proxyToBackend({
    method: 'PUT',
    backendPath: `/characters/${characterId}/`,
    requestBody: body,
    requireAdmin: true,
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
