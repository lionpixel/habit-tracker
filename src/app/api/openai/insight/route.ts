// ─────────────────────────────────────────────
//  POST /api/openai/insight
//  Insight rápido via GPT-4o-mini — usado nos hover dos cards.
//  Rate limit por userId (sessão autenticada) ou IP como fallback.
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { getOpenAI } from '@/lib/openai'
import type { MetricContext } from '@/lib/insightsEngine'

const rateLimitMap = new Map<string, { count: number; reset: number }>()
const RATE_LIMIT   = 30
const RATE_WINDOW  = 60_000

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  if (rateLimitMap.size > 500) {
    for (const [k, v] of rateLimitMap) {
      if (now > v.reset) rateLimitMap.delete(k)
    }
  }
  const entry = rateLimitMap.get(key)
  if (!entry || now > entry.reset) {
    rateLimitMap.set(key, { count: 1, reset: now + RATE_WINDOW })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'rate_limit', insight: 'Muitas requisições. Aguarde 1 minuto.' },
      { status: 429 },
    )
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { insight: 'Configure OPENAI_API_KEY no servidor para ativar insights.' },
      { status: 503 },
    )
  }

  let ctx: MetricContext
  try {
    const body = await req.json()
    ctx = body.metricContext as MetricContext
    if (!ctx?.metricName || ctx.currentValue === undefined) {
      return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const snap = ctx.userSnapshot
  const snapLines = snap
    ? [
        snap.activeHabits.length > 0 &&
          `Hábitos: ${snap.activeHabits.map((h) => `${h.name} ${h.weeklyCount}/${h.weeklyTarget}`).join(', ')}`,
        snap.weeklyConsistencyPct !== undefined && `Consistência: ${snap.weeklyConsistencyPct}%`,
        snap.weight && `Peso: ${snap.weight}kg`,
        snap.bodyFat && `Gordura: ${snap.bodyFat}%`,
        snap.avgSleepHours && `Sono médio: ${snap.avgSleepHours}h`,
        snap.investmentRate !== undefined && `Investimento: ${snap.investmentRate}%`,
        snap.fastingStreak && snap.fastingStreak > 0 && `Jejum streak: ${snap.fastingStreak} dias`,
      ].filter(Boolean).join(' | ')
    : null

  const benchmarkLine = ctx.benchmarks
    ? [
        ctx.benchmarks.national  !== undefined && `Nacional: ${ctx.benchmarks.national}`,
        ctx.benchmarks.global    !== undefined && `Global: ${ctx.benchmarks.global}`,
        ctx.benchmarks.recommended !== undefined && `Ideal: ${ctx.benchmarks.recommended}`,
        ctx.benchmarks.top10     !== undefined && `Top 10%: ${ctx.benchmarks.top10}`,
      ].filter(Boolean).join(' | ')
    : null

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 200,
      temperature: 0.85,
      messages: [
        {
          role: 'system',
          content: `Você é um coach de alta performance baseado em dados. Responde em português brasileiro.
Gere motivações curtas (2-3 frases), diretas, baseadas em evidência.
Sempre mencione o valor real do usuário. Termine com 1 ação concreta.
Nunca elogie de forma vazia. Tom: exigente mas justo.
Não use emojis em nenhuma parte da resposta.`,
        },
        {
          role: 'user',
          content: `Módulo: ${ctx.module}
Métrica: ${ctx.metricName}
Valor atual: ${ctx.currentValue} ${ctx.unit}
Tendência: ${ctx.trend ?? 'estável'}${ctx.trendValue !== undefined ? ` (${ctx.trendValue > 0 ? '+' : ''}${ctx.trendValue})` : ''}
${ctx.triggeredFact ? `Dado científico: "${ctx.triggeredFact.stat}" — ${ctx.triggeredFact.source}` : ''}
${benchmarkLine ? `Benchmarks (${ctx.unit}): ${benchmarkLine}` : ''}
${snapLines ? `Contexto do usuário: ${snapLines}` : ''}`.trim(),
        },
      ],
    })

    const insight = (completion.choices[0]?.message?.content ?? '').trim()
    return NextResponse.json({ insight })
  } catch (err) {
    console.error('[openai/insight]', err)
    return NextResponse.json(
      { insight: 'Não foi possível gerar insight agora. Tente novamente.' },
      { status: 200 },
    )
  }
}
