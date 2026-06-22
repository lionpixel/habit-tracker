// server-only — NUNCA importar em componentes 'use client'
// A chave OPENAI_API_KEY fica somente no processo Node.js do servidor.
// Instanciação lazy para não quebrar o build quando a variável não está configurada.

import OpenAI from 'openai'

let _client: OpenAI | null = null

export function getOpenAI(): OpenAI {
  if (!_client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        'OPENAI_API_KEY não configurada. ' +
        'Adicione ao .env.local (local) e às Environment Variables da Vercel (produção). ' +
        'NUNCA use o prefixo NEXT_PUBLIC_.',
      )
    }
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return _client
}

export function hasOpenAI(): boolean {
  return Boolean(process.env.OPENAI_API_KEY)
}
