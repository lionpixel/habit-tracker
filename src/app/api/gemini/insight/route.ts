// POST /api/gemini/insight
// Insight via Google Gemini — usa key do usuário ou fallback do servidor.

import { NextRequest, NextResponse } from 'next/server'
import { getUserApiKey } from '@/lib/getUserApiKey'

export async function POST(req: NextRequest) {
  let prompt: string
  try {
    const body = await req.json()
    prompt = body.prompt
    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'invalid_payload', message: 'prompt obrigatório.' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  try {
    const { key, source } = await getUserApiKey('gemini')

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 500, temperature: 0.8 },
        }),
      },
    )

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('[gemini/insight] API error:', res.status, err)
      return NextResponse.json({ insight: 'Erro ao chamar Gemini.' }, { status: 200 })
    }

    const data   = await res.json()
    const insight = (data.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim()
    return NextResponse.json(
      { insight, keySource: source },
      { headers: { 'X-AI-Key-Source': source } },
    )
  } catch (err) {
    console.error('[gemini/insight] error:', err)
    return NextResponse.json({ insight: 'Não foi possível gerar insight com Gemini.' }, { status: 200 })
  }
}
