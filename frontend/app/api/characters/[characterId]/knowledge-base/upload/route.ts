import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type RouteContext = {
  params: Promise<{ characterId: string }>
}

const tryParseJson = (text: string): unknown => {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

const hasAdminRole = async (token: string): Promise<boolean> => {
  if (!process.env.BACKEND_URL) return false

  const meResponse = await fetch(`${process.env.BACKEND_URL}/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  })

  if (!meResponse.ok) {
    return false
  }

  const meData = (await meResponse.json()) as { role?: string }
  return meData.role === 'admin'
}

export async function POST(request: NextRequest, context: RouteContext) {
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

    const isAdmin = await hasAdminRole(session.access_token)

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: admin role required.' },
        { status: 403 },
      )
    }

    const inputFormData = await request.formData()
    const file = inputFormData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Debe enviar un archivo en el campo 'file'." },
        { status: 400 },
      )
    }

    const outboundFormData = new FormData()
    outboundFormData.append('file', file, file.name)

    const response = await fetch(
      `${process.env.BACKEND_URL}/characters/${characterId}/knowledge-base/upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: outboundFormData,
        cache: 'no-store',
      },
    )

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 })
    }

    const responseText = await response.text()

    if (!response.ok) {
      const parsedError = tryParseJson(responseText)
      if (parsedError !== null) {
        return NextResponse.json(parsedError, { status: response.status })
      }

      return NextResponse.json(
        { error: responseText || 'Backend request failed' },
        { status: response.status },
      )
    }

    const parsedSuccess = tryParseJson(responseText)
    if (parsedSuccess !== null) {
      return NextResponse.json(parsedSuccess, { status: response.status })
    }

    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') ?? 'text/plain',
      },
    })
  } catch (error) {
    console.error('[Knowledge Base Upload Proxy] Unhandled error:', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 500 })
  }
}
