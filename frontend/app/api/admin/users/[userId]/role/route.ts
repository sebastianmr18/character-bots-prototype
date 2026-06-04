import { proxyToBackend } from '@/lib/api/backend-proxy'

type RouteContext = {
  params: Promise<{ userId: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  const { userId } = await context.params
  const body = await request.text()
  return proxyToBackend({
    method: 'PATCH',
    backendPath: `/admin/users/${userId}/role`,
    requestBody: body,
    requireAdmin: true,
  })
}
