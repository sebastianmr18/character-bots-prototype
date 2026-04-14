import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const tryParseJson = (text: string): unknown => {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.access_token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.BACKEND_URL) {
      return NextResponse.json(
        { error: 'BACKEND_URL is not configured' },
        { status: 500 },
      )
    }

    const response = await fetch(`${process.env.BACKEND_URL}/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: 'no-store',
    })

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 })
    }

    const responseText = await response.text()

    if (!response.ok) {
      const parsed = tryParseJson(responseText)
      if (parsed !== null) {
        return NextResponse.json(parsed, { status: response.status })
      }

      return NextResponse.json(
        { error: responseText || 'Backend request failed' },
        { status: response.status },
      )
    }

    const parsed = tryParseJson(responseText)
    if (parsed !== null) {
      return NextResponse.json(parsed, { status: response.status })
    }

    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') ?? 'text/plain',
      },
    })
  } catch (error) {
    console.error('[Me Proxy] Unhandled error:', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 500 })
  }
}
