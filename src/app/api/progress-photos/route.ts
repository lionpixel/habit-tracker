// ─────────────────────────────────────────────
//  API Route: /api/progress-photos
//  Upload, listagem e exclusão de fotos de progresso corporal.
//
//  SETUP SUPABASE — rodar no SQL Editor:
//
//  create table if not exists progress_photos (
//    id uuid primary key default gen_random_uuid(),
//    user_id uuid references auth.users(id) on delete cascade,
//    storage_path text not null,
//    date date not null,
//    week integer not null,
//    month integer not null,
//    year integer not null,
//    day_of_week text not null,
//    weight numeric,
//    body_fat numeric,
//    notes text,
//    created_at timestamptz default now()
//  );
//  alter table progress_photos enable row level security;
//  create policy "usuario acessa proprias fotos"
//    on progress_photos for all using (auth.uid() = user_id);
//
//  Storage → New bucket: "progress-photos" | Public: false
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

function isoWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day  = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

const DAY_KEYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']

// ── GET: lista fotos com URLs assinadas ──────
export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data: rows, error } = await supabase
    .from('progress_photos')
    .select('id, storage_path, date, week, month, year, day_of_week, weight, body_fat, notes, created_at')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Gerar URLs assinadas para cada foto (7 dias de validade)
  const photos = await Promise.all(
    (rows ?? []).map(async (row) => {
      const { data: signed } = await supabase.storage
        .from('progress-photos')
        .createSignedUrl(row.storage_path, 604800)
      return { ...row, image_url: signed?.signedUrl ?? null }
    }),
  )

  return NextResponse.json(photos)
}

// ── POST: upload de nova foto ────────────────
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file     = formData.get('file') as File | null
  const date     = formData.get('date') as string
  const notes    = formData.get('notes') as string | null
  const weight   = formData.get('weight') ? Number(formData.get('weight')) : null
  const bodyFat  = formData.get('bodyFat') ? Number(formData.get('bodyFat')) : null

  if (!file || !date) {
    return NextResponse.json({ error: 'file and date required' }, { status: 400 })
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Arquivo muito grande (máx 10MB)' }, { status: 400 })
  }

  const d           = new Date(date)
  const ext         = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const storagePath = `${user.id}/${date}-${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('progress-photos')
    .upload(storagePath, file, { contentType: file.type, upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: photo, error: dbError } = await supabase
    .from('progress_photos')
    .insert({
      user_id:     user.id,
      storage_path: storagePath,
      date,
      week:        isoWeekNumber(d),
      month:       d.getMonth() + 1,
      year:        d.getFullYear(),
      day_of_week: DAY_KEYS[d.getDay()],
      weight:      weight ?? null,
      body_fat:    bodyFat ?? null,
      notes:       notes ?? null,
    })
    .select()
    .single()

  if (dbError) {
    await supabase.storage.from('progress-photos').remove([storagePath])
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  const { data: signed } = await supabase.storage
    .from('progress-photos')
    .createSignedUrl(storagePath, 604800)

  return NextResponse.json({ ...photo, image_url: signed?.signedUrl ?? null }, { status: 201 })
}

// ── DELETE: remover foto ─────────────────────
export async function DELETE(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id, storagePath } = await req.json()
  if (!id || !storagePath) {
    return NextResponse.json({ error: 'id and storagePath required' }, { status: 400 })
  }

  await supabase.storage.from('progress-photos').remove([storagePath])
  await supabase.from('progress_photos').delete().eq('id', id).eq('user_id', user.id)

  return NextResponse.json({ ok: true })
}
