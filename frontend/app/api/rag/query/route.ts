import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.access_token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      )
    }

    if (!process.env.BACKEND_URL) {
      return NextResponse.json(
        { error: 'BACKEND_URL is not configured' },
        { status: 500 },
      )
    }

    const body = await request.text()

    const response = await fetch(`${process.env.BACKEND_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body,
      cache: 'no-store',
    })

    const responseText = await response.text()

    if (!response.ok) {
      try {
        return NextResponse.json(JSON.parse(responseText), {
          status: response.status,
        })
      } catch {
        return NextResponse.json(
          { error: responseText || 'Backend request failed' },
          { status: response.status },
        )
      }
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
    console.error('RAG Query Proxy Error:', error)

    return NextResponse.json(
      { context: '', error: 'RAG unavailable' },
      { status: 500 },
    )
  }
}
