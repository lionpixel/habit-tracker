// server-only — NUNCA importar em componentes 'use client'
// A chave OPENAI_API_KEY fica somente no processo Node.js do servidor.
// Instanciação lazy para evitar erro em build sem a variável configurada.

import OpenAI from 'openai'

let _client: OpenAI | null = null

export function getOpenAI(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return _client
}
