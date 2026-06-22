// server-only — NUNCA importar em componentes 'use client'
// A chave ANTHROPIC_API_KEY fica somente no processo Node.js do servidor.
// Instanciação lazy para não quebrar o build quando a variável não está configurada.

import Anthropic from '@anthropic-ai/sdk'

let _client: Anthropic | null = null

export function getAnthropic(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error(
        'ANTHROPIC_API_KEY não configurada. ' +
        'Adicione ao .env.local (local) e às Environment Variables da Vercel (produção). ' +
        'NUNCA use o prefixo NEXT_PUBLIC_.',
      )
    }
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}

export function hasAnthropic(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}
