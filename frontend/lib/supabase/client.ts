import { createBrowserClient } from '@supabase/ssr'

/**
 * Crea el cliente de Supabase para el navegador (componentes cliente y hooks).
 *
 * @returns Instancia de Supabase con cookies gestionadas en el cliente.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
