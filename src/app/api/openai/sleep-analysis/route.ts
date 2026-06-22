// POST /api/openai/sleep-analysis
// Análise integrada do sono via Anthropic — conecta padrões de sono
// com hábitos, Big Five e saúde geral.

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getUserApiKey } from '@/lib/getUserApiKey'
import type { SleepHistoryItem } from '@/types/sleep'
import type { BigFiveResult } from '@/types/profile'

interface SleepAnalysisPayload {
  sleepHistory: SleepHistoryItem[]
  targetWake:   string
  bigFive?:     BigFiveResult | null
  habitsSummary?: string
}

function buildPrompt(p: SleepAnalysisPayload): string {
  const { sleepHistory, targetWake, bigFive, habitsSummary } = p

  const last30 = sleepHistory.slice(0, 30)
  const withDuration = last30.filter((h) => h.durationMin !== undefined)
  const avgDuration = withDuration.length > 0
    ? Math.round(withDuration.reduce((s, h) => s + (h.durationMin ?? 0), 0) / withDuration.length)
    : null
  const avgH = avgDuration !== null ? `${Math.floor(avgDuration / 60)}h${avgDuration % 60}min` : 'desconhecida'

  const wakeTimes = last30
    .filter((h) => h.wakeMinutes !== undefined)
    .map((h) => h.wakeMinutes as number)
  const variance = wakeTimes.length > 1
    ? Math.round(Math.sqrt(wakeTimes.reduce((s, v) => s + (v - (wakeTimes.reduce((a, b) => a + b, 0) / wakeTimes.length)) ** 2, 0) / wakeTimes.length))
    : 0

  const badNights = last30.filter((h) => h.badge === 'off').length
  const goodNights = last30.filter((h) => h.badge === 'ok').length

  const lines = [
    `Meta de acordar: ${targetWake}`,
    avgDuration !== null && `Duração média do sono (${withDuration.length} noites): ${avgH}`,
    `Variância no horário de acordar: ±${Math.floor(variance / 60)}h${variance % 60}min`,
    `Noites OK (meta ±30min): ${goodNights}/${last30.length}`,
    `Noites fora da meta: ${badNights}/${last30.length}`,
    last30[0] && `Último registro: acordou ${last30[0].wakeTime}${last30[0].sleepTime ? `, dormiu ${last30[0].sleepTime}` : ''}`,
    habitsSummary && `Hábitos da semana: ${habitsSummary}`,
  ].filter(Boolean).join('\n')

  const bigFiveBlock = bigFive
    ? `\nPERFIL DE PERSONALIDADE (Big Five ${bigFive.quarter}):
- Conscienciosidade: ${bigFive.conscientiousness}/100 (alta = disciplina para rotinas)
- Neuroticismo: ${bigFive.neuroticism}/100 (alto = sono mais fragmentado sob estresse)
- Abertura: ${bigFive.openness}/100`
    : ''

  return `Você é especialista em medicina do sono e cronobiologia.
Analise os dados reais de sono abaixo em 4 blocos curtos (2-3 frases cada).
Sem título geral, sem emojis, sem prefixos como "1." — use os rótulos exatos.

DADOS DE SONO:
${lines}${bigFiveBlock}

BENCHMARKS:
- Adultos precisam de 7-9h (American Academy of Sleep Medicine)
- Variância >45min no horário de acordar reduz performance cognitiva em 30%
- Sono <6h por 2 semanas = déficit cognitivo equivalente a 2 noites sem dormir
- Conscienciosidade alta prediz maior consistência de horários de sono

RESPONDA EXATAMENTE neste formato JSON (sem markdown, sem texto extra):
{
  "padrao": "...",
  "impacto_aprendizado": "...",
  "conexao_exercicio": "...",
  "plano_regulacao": "..."
}`
}

export async function POST(req: NextRequest) {
  let payload: SleepAnalysisPayload
  try {
    payload = await req.json()
    if (!payload.sleepHistory?.length || !payload.targetWake) {
      return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  try {
    const { key, source } = await getUserApiKey('anthropic')
    const client  = new Anthropic({ apiKey: key })
    const message = await client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 600,
      messages:   [{ role: 'user', content: buildPrompt(payload) }],
    })

    const raw = message.content[0]?.type === 'text' ? message.content[0].text.trim() : '{}'
    let analysis: Record<string, string>
    try {
      analysis = JSON.parse(raw)
    } catch {
      analysis = { padrao: raw, impacto_aprendizado: '', conexao_exercicio: '', plano_regulacao: '' }
    }

    return NextResponse.json(
      { analysis, keySource: source },
      { headers: { 'X-AI-Key-Source': source } },
    )
  } catch (err) {
    console.error('[sleep-analysis] error:', err)
    return NextResponse.json(
      { analysis: null, error: 'Não foi possível gerar a análise agora.' },
      { status: 200 },
    )
  }
}
