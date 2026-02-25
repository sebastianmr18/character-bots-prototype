import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type RouteContext = {
  params: Promise<{ characterId: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { characterId } = await context.params

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

    const response = await fetch(
      `${process.env.BACKEND_URL}/characters/${characterId}/`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: 'no-store',
      },
    )

    const responseText = await response.text()

    if (!response.ok) {
      return NextResponse.json(
        {
          error: 'Backend request failed',
          status: response.status,
          details: responseText || null,
        },
        { status: response.status },
      )
    }

    try {
      return NextResponse.json(JSON.parse(responseText), {
        status: response.status,
      })
    } catch {
      return new NextResponse(responseText, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('content-type') ?? 'text/plain',
        },
      })
    }
  } catch (error) {
    console.error('Character By Id Proxy Error:', error)

    return NextResponse.json({ error: 'Character unavailable' }, { status: 500 })
  }
}
