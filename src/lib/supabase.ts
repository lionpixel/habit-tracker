// ─────────────────────────────────────────────
//  Supabase client
//  Vars necessárias em .env.local:
//    NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
//    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
// ─────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const supabase = createClient(supabaseUrl, supabaseKey)

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

// ── Storage: dreams bucket ────────────────────

export async function uploadDreamImage(file: File): Promise<string | null> {
  if (!isSupabaseConfigured) return null

  const ext  = file.name.split('.').pop() ?? 'jpg'
  const path = `dreams/${Date.now()}_${Math.random().toString(36).slice(2, 9)}.${ext}`

  const { data, error } = await supabase.storage
    .from('dreams')
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error || !data) return null

  const { data: urlData } = supabase.storage
    .from('dreams')
    .getPublicUrl(data.path)

  return urlData.publicUrl ?? null
}
