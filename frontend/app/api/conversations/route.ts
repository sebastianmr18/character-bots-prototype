import type { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/api/backend-proxy'

export async function GET() {
  return proxyToBackend({ method: 'GET', backendPath: '/conversations/' })
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  return proxyToBackend({ method: 'POST', backendPath: '/conversations/', requestBody: body })
}
