// ─────────────────────────────────────────────
//  API Route: /api/user-keys
//  Gerencia API keys criptografadas dos usuários no Supabase.
//
//  SETUP — rodar no SQL Editor do Supabase Dashboard:
//
//  create table if not exists user_api_keys (
//    id uuid primary key default gen_random_uuid(),
//    user_id uuid references auth.users(id) on delete cascade,
//    provider text not null check (provider in ('openai','anthropic','gemini')),
//    encrypted_key text not null,
//    key_hint text not null,
//    label text,
//    is_valid boolean default false,
//    last_validated_at timestamptz,
//    created_at timestamptz default now(),
//    updated_at timestamptz default now(),
//    unique(user_id, provider)
//  );
//  alter table user_api_keys enable row level security;
//  create policy "usuario acessa proprias keys"
//    on user_api_keys for all using (auth.uid() = user_id);
//  create or replace function update_updated_at()
//  returns trigger as $$ begin new.updated_at = now(); return new; end; $$ language plpgsql;
//  create trigger user_api_keys_updated_at
//    before update on user_api_keys
//    for each row execute procedure update_updated_at();
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { encrypt } from '@/lib/encryption'

type Provider = 'openai' | 'anthropic' | 'gemini'

const VALID_PROVIDERS: Provider[] = ['openai', 'anthropic', 'gemini']

// ── GET — metadados das keys (sem revelar a key real) ────

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('user_api_keys')
    .select('id, provider, key_hint, label, is_valid, last_validated_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[user-keys] GET error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

// ── POST — salvar nova key (criptografar + testar) ────────

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let provider: Provider, apiKey: string, label: string | undefined
  try {
    const body = await req.json()
    provider = body.provider
    apiKey   = body.apiKey?.trim()
    label    = body.label?.trim() || undefined

    if (!VALID_PROVIDERS.includes(provider)) {
      return NextResponse.json({ error: 'invalid_provider' }, { status: 400 })
    }
    if (!apiKey) {
      return NextResponse.json({ error: 'missing_key' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  // validar formato
  const formatError = validateKeyFormat(provider, apiKey)
  if (formatError) {
    return NextResponse.json({ error: 'invalid_format', message: formatError }, { status: 400 })
  }

  // testar se a key funciona de verdade (chamada real à API)
  const testResult = await testApiKey(provider, apiKey)

  // criptografar e salvar (upsert por user_id + provider)
  let encryptedKey: string
  try {
    encryptedKey = encrypt(apiKey)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro de criptografia'
    console.error('[user-keys] POST encrypt error:', msg)
    return NextResponse.json({ error: 'encryption_error', message: msg }, { status: 500 })
  }

  const keyHint = apiKey.slice(-5)

  const { error: dbError } = await supabase
    .from('user_api_keys')
    .upsert(
      {
        user_id:           user.id,
        provider,
        encrypted_key:     encryptedKey,
        key_hint:          keyHint,
        label:             label ?? null,
        is_valid:          testResult.valid,
        last_validated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,provider' },
    )

  if (dbError) {
    console.error('[user-keys] POST upsert error:', dbError.message)
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    valid:   testResult.valid,
    message: testResult.message,
  })
}

// ── DELETE — remover key de um provider ───────────────────

export async function DELETE(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let provider: Provider
  try {
    const body = await req.json()
    provider = body.provider
    if (!VALID_PROVIDERS.includes(provider)) {
      return NextResponse.json({ error: 'invalid_provider' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  await supabase
    .from('user_api_keys')
    .delete()
    .eq('user_id', user.id)
    .eq('provider', provider)

  return NextResponse.json({ success: true })
}

// ── Helpers ───────────────────────────────────────────────

function validateKeyFormat(provider: Provider, key: string): string | null {
  if (provider === 'openai'    && !key.startsWith('sk-'))      return 'Keys OpenAI começam com sk-proj-... ou sk-...'
  if (provider === 'anthropic' && !key.startsWith('sk-ant-'))  return 'Keys Anthropic começam com sk-ant-...'
  if (provider === 'gemini'    && key.length < 20)             return 'Key Gemini parece muito curta.'
  return null
}

async function testApiKey(
  provider: Provider,
  key: string,
): Promise<{ valid: boolean; message: string }> {
  try {
    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${key}` },
      })
      return res.ok
        ? { valid: true,  message: 'Key válida e funcionando.' }
        : { valid: false, message: 'Key inválida ou sem permissão na OpenAI.' }
    }

    if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:  'POST',
        headers: {
          'x-api-key':         key,
          'anthropic-version': '2023-06-01',
          'content-type':      'application/json',
        },
        body: JSON.stringify({
          model:      'claude-haiku-4-5-20251001',
          max_tokens: 10,
          messages:   [{ role: 'user', content: 'hi' }],
        }),
      })
      return res.ok
        ? { valid: true,  message: 'Key válida e funcionando.' }
        : { valid: false, message: 'Key inválida ou sem créditos na Anthropic.' }
    }

    if (provider === 'gemini') {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${key}`,
      )
      return res.ok
        ? { valid: true,  message: 'Key válida e funcionando.' }
        : { valid: false, message: 'Key inválida ou sem permissão no Google AI.' }
    }

    return { valid: false, message: 'Provider desconhecido.' }
  } catch (e) {
    console.error('[user-keys] testApiKey error:', provider, e)
    return { valid: false, message: 'Não foi possível testar a conexão.' }
  }
}
