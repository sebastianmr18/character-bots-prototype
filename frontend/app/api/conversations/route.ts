import type { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/api/backend-proxy'

export async function GET(request: NextRequest) {
  const characterId = request.nextUrl.searchParams.get('characterId')
  const backendPath = characterId
    ? `/conversations/?character_id=${encodeURIComponent(characterId)}`
    : '/conversations/'

  return proxyToBackend({ method: 'GET', backendPath })
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  return proxyToBackend({ method: 'POST', backendPath: '/conversations/', requestBody: body })
}
