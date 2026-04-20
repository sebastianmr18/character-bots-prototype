import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
        headers: request.headers,
        },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const path = request.nextUrl.pathname

  // 1. Definición de rutas
  const isAuthRoute = path.startsWith('/login') || path.startsWith('/auth')
  const isProtectedRoute = path.startsWith('/personajes') ||
                           path.startsWith('/uploads') ||
                           path.startsWith('/call') ||
                           path.startsWith('/profile')

// 2. Lógica de redirección
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', path) 
    return NextResponse.redirect(url)
  }

  if (user && path.startsWith('/uploads')) {
    if (!session?.access_token || !process.env.BACKEND_URL) {
      const url = request.nextUrl.clone()
      url.pathname = '/personajes'
      url.searchParams.set('reason', 'forbidden')
      return NextResponse.redirect(url)
    }

    const meResponse = await fetch(`${process.env.BACKEND_URL}/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: 'no-store',
    })

    if (!meResponse.ok) {
      const url = request.nextUrl.clone()
      url.pathname = '/personajes'
      url.searchParams.set('reason', 'forbidden')
      return NextResponse.redirect(url)
    }

    const meData = (await meResponse.json()) as { role?: string }
    if (meData.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/personajes'
      url.searchParams.set('reason', 'admin-required')
      return NextResponse.redirect(url)
    }
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}