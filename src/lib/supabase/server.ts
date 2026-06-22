// server-only — importar apenas em Server Components, Route Handlers e Server Actions.
// Cria um cliente Supabase com escopo da sessão do usuário (cookies → RLS ativo).

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServerClient() {
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
              cookieStore.set(name, value, options),
            )
          } catch {
            // Server Components não podem setar cookies — ignorar.
            // O middleware se encarrega de persistir a sessão.
          }
        },
      },
    },
  )
}
