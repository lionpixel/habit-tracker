// Browser client — usar em componentes 'use client' e páginas de auth.
// Singleton: createBrowserClient deduplica automaticamente no browser.

import { createBrowserClient } from '@supabase/ssr'

export function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
