// server-only — NUNCA importar em 'use client' ou expor via NEXT_PUBLIC_.
// Usa SUPABASE_SERVICE_ROLE_KEY: bypassa RLS, acesso total ao banco.
// Reservado para operações administrativas (webhooks, migrações, cron jobs).

import { createClient } from '@supabase/supabase-js'

let _admin: ReturnType<typeof createClient> | null = null

export function createSupabaseAdmin() {
  if (!_admin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      throw new Error(
        'NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios para o cliente admin.',
      )
    }

    _admin = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return _admin
}
