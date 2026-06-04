import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Crea el cliente de Supabase en el servidor (Route Handlers, Server Components, middleware).
 *
 * @remarks Usa el almacén de cookies de Next.js para leer y escribir la sesión.
 * @returns Cliente de Supabase enlazado a la petición HTTP actual.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
