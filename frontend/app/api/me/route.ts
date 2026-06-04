import { proxyToBackend } from '@/lib/api/backend-proxy'

export async function GET() {
  return proxyToBackend({ method: 'GET', backendPath: '/me' })
}

export async function PATCH(request: Request) {
  const body = await request.text()
  return proxyToBackend({ method: 'PATCH', backendPath: '/me', requestBody: body })
}
