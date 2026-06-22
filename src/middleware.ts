// Middleware de sessão Supabase.
// Roda em cada request e garante que tokens expirados sejam renovados
// antes de chegarem aos Route Handlers / Server Components.

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Propaga os cookies atualizados tanto no request quanto no response.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Renova a sessão se o access token expirou.
  // getUser() é a única chamada segura para validar o JWT aqui.
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    // Roda em todas as rotas exceto estáticos e _next internals.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
