import { proxyToBackend } from '@/lib/api/backend-proxy'

type RouteContext = {
  params: Promise<{ slug: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params

  return proxyToBackend({
    method: 'GET',
    backendPath: `/characters/by-slug/${encodeURIComponent(slug)}/`,
  })
}