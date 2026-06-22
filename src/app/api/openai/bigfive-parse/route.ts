// POST /api/openai/bigfive-parse
// Recebe um texto com o resultado de um teste Big Five e extrai os 5 escores (0–100).
// Retorna: { openness, conscientiousness, extraversion, agreeableness, neuroticism }

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getUserApiKey } from '@/lib/getUserApiKey'

export async function POST(req: NextRequest) {
  let rawText: string
  let source: string
  try {
    const body = await req.json()
    rawText = body.rawText
    source  = body.source ?? 'manual'
    if (!rawText?.trim()) {
      return NextResponse.json({ error: 'invalid_payload', message: 'rawText obrigatório.' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const systemPrompt = `Você é um especialista em psicometria. Analise o texto abaixo (resultado de um teste de personalidade Big Five / OCEAN) e extraia os 5 escores percentuais.

Responda SOMENTE com JSON válido, sem texto adicional, no formato:
{
  "openness": <número 0-100>,
  "conscientiousness": <número 0-100>,
  "extraversion": <número 0-100>,
  "agreeableness": <número 0-100>,
  "neuroticism": <número 0-100>
}

Se um escore não for encontrado explicitamente, infira a partir do texto. Todos os valores devem ser inteiros.`

  try {
    const { key, source: keySource } = await getUserApiKey('openai')
    const client     = new OpenAI({ apiKey: key })
    const completion = await client.chat.completions.create({
      model:       'gpt-4o-mini',
      max_tokens:  200,
      temperature: 0,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: `Fonte: ${source}\n\n${rawText}` },
      ],
    })

    const text = completion.choices[0]?.message?.content?.trim() ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'parse_failed', message: 'Resposta inesperada do modelo.' }, { status: 502 })
    }

    const scores = JSON.parse(jsonMatch[0]) as Record<string, number>
    const required = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']
    for (const k of required) {
      if (typeof scores[k] !== 'number') {
        return NextResponse.json({ error: 'incomplete_scores', message: `Escore "${k}" ausente.` }, { status: 502 })
      }
    }

    return NextResponse.json(
      {
        openness:          Math.round(Math.min(100, Math.max(0, scores.openness))),
        conscientiousness: Math.round(Math.min(100, Math.max(0, scores.conscientiousness))),
        extraversion:      Math.round(Math.min(100, Math.max(0, scores.extraversion))),
        agreeableness:     Math.round(Math.min(100, Math.max(0, scores.agreeableness))),
        neuroticism:       Math.round(Math.min(100, Math.max(0, scores.neuroticism))),
        keySource,
      },
      { headers: { 'X-AI-Key-Source': keySource } },
    )
  } catch (err) {
    console.error('[bigfive-parse] OpenAI error:', err)
    return NextResponse.json({ error: 'openai_error', message: 'Erro ao processar resultado.' }, { status: 502 })
  }
}
