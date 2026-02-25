import { createClient as createBrowserClient } from './client';
import { createClient as createServerClient } from './server';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}, isServer: boolean = false) {
  const supabase = isServer ? await createServerClient() : createBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();

  const headers = new Headers(options.headers);
  
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    console.log('API Error:', response.status, await response.text());
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}