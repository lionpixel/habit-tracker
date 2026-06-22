// server-only — NUNCA importar em 'use client'
// Busca a API key descriptografada do usuário autenticado.
// Se não tiver, cai silenciosamente no fallback do servidor.

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { decrypt } from '@/lib/encryption'

export type Provider = 'openai' | 'anthropic' | 'gemini'
export type KeySource = 'user' | 'server'

export interface ResolvedKey {
  key:      string
  source:   KeySource
  provider: Provider
}

// Retorna a key descriptografada + de onde veio ('user' | 'server').
// Lança erro se nenhuma key estiver disponível.
export async function getUserApiKey(provider: Provider): Promise<ResolvedKey> {
  // 1. Tentar key do usuário autenticado
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase
        .from('user_api_keys')
        .select('encrypted_key, is_valid')
        .eq('user_id', user.id)
        .eq('provider', provider)
        .single()

      if (data?.encrypted_key && data.is_valid) {
        const key = decrypt(data.encrypted_key)
        return { key, source: 'user', provider }
      }
    }
  } catch {
    // fallback silencioso — não expor stack trace ao cliente
  }

  // 2. Fallback para key do servidor (variável de ambiente)
  const serverKey = getServerKey(provider)
  if (serverKey) return { key: serverKey, source: 'server', provider }

  throw new Error(
    `Nenhuma key disponível para ${provider}. ` +
    'Configure nas Configurações de IA do seu perfil ou peça ao admin para configurar a key do servidor.',
  )
}

// Tenta providers em ordem de preferência, retorna o primeiro disponível.
export async function getPreferredApiKey(
  preferred: Provider | 'auto' = 'auto',
): Promise<ResolvedKey> {
  const order: Provider[] = preferred === 'auto'
    ? ['anthropic', 'openai', 'gemini']
    : [preferred, 'anthropic', 'openai', 'gemini'].filter(
        (p, i, arr) => arr.indexOf(p) === i,
      ) as Provider[]

  for (const provider of order) {
    try {
      return await getUserApiKey(provider)
    } catch {
      continue
    }
  }

  throw new Error('Nenhum provider de IA disponível. Configure ao menos uma API key.')
}

function getServerKey(provider: Provider): string | undefined {
  switch (provider) {
    case 'openai':    return process.env.OPENAI_API_KEY    || undefined
    case 'anthropic': return process.env.ANTHROPIC_API_KEY || undefined
    case 'gemini':    return process.env.GEMINI_API_KEY    || undefined
  }
}
