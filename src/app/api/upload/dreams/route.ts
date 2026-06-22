// POST /api/upload/dreams
// Upload server-side de imagens para o bucket "dreams".
// Usa SUPABASE_SERVICE_ROLE_KEY para bypass de RLS no storage.

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const VALID_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const MAX_SIZE    = 10 * 1024 * 1024 // 10 MB

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'invalid_form' }, { status: 400 })
  }

  const file    = formData.get('file') as File | null
  const dreamId = (formData.get('dreamId') as string | null) ?? String(Date.now())

  if (!file) {
    return NextResponse.json({ error: 'no_file' }, { status: 400 })
  }
  if (!VALID_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'invalid_type', message: 'Use JPG, PNG, WEBP ou HEIC.' },
      { status: 400 },
    )
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: 'too_large', message: 'Arquivo máximo: 10 MB.' },
      { status: 400 },
    )
  }

  const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${user.id}/${dreamId}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('dreams')
    .upload(path, file, { contentType: file.type, upsert: true })

  if (uploadError) {
    console.error('[upload/dreams] upload error:', uploadError.message)
    return NextResponse.json(
      { error: uploadError.message },
      { status: 500 },
    )
  }

  // URL assinada válida por 10 anos (365 * 10 * 24 * 3600)
  const { data: signed, error: signError } = await supabase.storage
    .from('dreams')
    .createSignedUrl(path, 315_360_000)

  if (signError || !signed?.signedUrl) {
    console.error('[upload/dreams] sign error:', signError?.message)
    return NextResponse.json({ error: 'sign_failed' }, { status: 500 })
  }

  return NextResponse.json({ url: signed.signedUrl, path })
}
