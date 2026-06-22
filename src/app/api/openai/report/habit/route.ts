// ─────────────────────────────────────────────
//  POST /api/openai/report/habit
//  Análise profunda de um hábito específico via GPT-4o.
//  Rate limit: 10 req/min por IP.
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { getOpenAI } from '@/lib/openai'

const rateLimitMap = new Map<string, { count: number; reset: number }>()

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  if (rateLimitMap.size > 300) {
    for (const [k, v] of rateLimitMap) {
      if (now > v.reset) rateLimitMap.delete(k)
    }
  }
  const entry = rateLimitMap.get(key)
  if (!entry || now > entry.reset) {
    rateLimitMap.set(key, { count: 1, reset: now + 60_000 })
    return true
  }
  if (entry.count >= 10) return false
  entry.count++
  return true
}

interface HabitInfo {
  name: string
  weeklyTarget: number
  sessionMinutes: number
  unit: string
  scientificFacts?: string[]
}

interface WeekHistory {
  week: number
  year: number
  sessions: number
  totalMinutes: number
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'rate_limit', analysis: 'Limite atingido. Aguarde 1 minuto.' },
      { status: 429 },
    )
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { analysis: 'Configure OPENAI_API_KEY no servidor para analisar hábitos.' },
      { status: 503 },
    )
  }

  let habit: HabitInfo
  let history: WeekHistory[]
  try {
    const body = await req.json()
    habit   = body.habit   as HabitInfo
    history = body.history as WeekHistory[]
    if (!habit?.name || !Array.isArray(history)) {
      return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const historyText = history.map((w) =>
    `Semana ${w.week} (${w.year}): ${w.sessions} sessões · ${w.totalMinutes}min`
  ).join('\n')

  const factsText = habit.scientificFacts && habit.scientificFacts.length > 0
    ? habit.scientificFacts.map((f) => `- ${f}`).join('\n')
    : 'não cadastrados'

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 600,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: `Analise o hábito do usuário com base nos dados históricos. Responde em português brasileiro.
Estruture EXATAMENTE neste formato (com os títulos em caixa alta):

1. PADRÃO IDENTIFICADO
(o que os dados revelam sobre o comportamento)

2. COMPARAÇÃO
(onde o usuário está vs médias nacionais/globais)

3. RECOMENDAÇÃO
(ajuste específico e mensurável para as próximas 2 semanas)

Seja cirúrgico — use os números reais, sem generalizações.`,
        },
        {
          role: 'user',
          content: `Hábito: ${habit.name}
Meta semanal: ${habit.weeklyTarget} sessões
Duração por sessão: ${habit.sessionMinutes} ${habit.unit}

Histórico das últimas 8 semanas:
${historyText}

Dados científicos do hábito:
${factsText}`,
        },
      ],
    })

    const analysis = (completion.choices[0]?.message?.content ?? '').trim()
    return NextResponse.json({ analysis })
  } catch (err) {
    console.error('[openai/report/habit]', err)
    return NextResponse.json(
      { analysis: 'Erro ao analisar o hábito. Tente novamente.' },
      { status: 200 },
    )
  }
}
