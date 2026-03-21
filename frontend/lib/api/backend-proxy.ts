import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface ProxyOptions {
  method: HttpMethod
  backendPath: string
  requestBody?: string
}

const tryParseJson = (text: string): unknown => {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

/**
 * Proxies a request to the configured BACKEND_URL, attaching the Supabase
 * session token as Bearer authorization. Handles auth checks, BACKEND_URL
 * validation, JSON/text serialization, and 204 No Content responses.
 */
export async function proxyToBackend({
  method,
  backendPath,
  requestBody,
}: ProxyOptions): Promise<NextResponse> {
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

    const headers: Record<string, string> = {
      Authorization: `Bearer ${session.access_token}`,
    }

    if (requestBody !== undefined) {
      headers['Content-Type'] = 'application/json'
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}${backendPath}`,
      {
        method,
        headers,
        ...(requestBody !== undefined && { body: requestBody }),
        cache: 'no-store',
      },
    )

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 })
    }

    const responseText = await response.text()

    if (!response.ok) {
      const parsed = tryParseJson(responseText)
      if (parsed) {
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
    console.error('[BackendProxy] Unhandled error:', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 500 })
  }
}
