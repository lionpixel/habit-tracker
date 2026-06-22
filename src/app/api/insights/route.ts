// ─────────────────────────────────────────────
//  API Route: /api/insights
//  Proxy server-side para Anthropic API.
//  A chave ANTHROPIC_API_KEY nunca chega ao browser.
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { getAnthropic, hasAnthropic } from '@/lib/anthropic'
import type { MetricContext } from '@/lib/insightsEngine'

// ── Rate limit em memória (por IP, por instância) ──
// Para produção com múltiplas instâncias use Redis/Upstash.
const rateLimitMap = new Map<string, { count: number; reset: number }>()
const RATE_LIMIT   = 30   // max requests
const RATE_WINDOW  = 60_000 // por 60 segundos

function checkRateLimit(ip: string): boolean {
  const now = Date.now()

  // Inline cleanup: remove expired entries on each check to bound memory
  // within a single warm serverless instance (no setInterval needed).
  if (rateLimitMap.size > 500) {
    for (const [key, val] of rateLimitMap) {
      if (now > val.reset) rateLimitMap.delete(key)
    }
  }

  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + RATE_WINDOW })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

// ── Prompt builder (server-side only) ─────────

function buildPrompt(ctx: MetricContext): string {
  const trendLine = ctx.trend
    ? `Tendência: ${ctx.trend}${ctx.trendValue !== undefined ? ` (${ctx.trendValue > 0 ? '+' : ''}${ctx.trendValue} ${ctx.unit})` : ''}.`
    : ''

  const benchmarkLines = ctx.benchmarks
    ? [
        ctx.benchmarks.national !== undefined && `- Média nacional: ${ctx.benchmarks.national} ${ctx.benchmarks.unit}`,
        ctx.benchmarks.global !== undefined && `- Média global: ${ctx.benchmarks.global} ${ctx.benchmarks.unit}`,
        ctx.benchmarks.recommended !== undefined && `- Recomendado: ${ctx.benchmarks.recommended} ${ctx.benchmarks.unit}`,
        ctx.benchmarks.top10 !== undefined && `- Top 10%: ${ctx.benchmarks.top10} ${ctx.benchmarks.unit}`,
        ctx.benchmarks.source && `- Fonte: ${ctx.benchmarks.source}`,
      ]
        .filter(Boolean)
        .join('\n')
    : ''

  const factLines = ctx.triggeredFact
    ? `Dado científico em foco:\n"${ctx.triggeredFact.stat}"\nFonte: ${ctx.triggeredFact.source}`
    : ''

  const snap = ctx.userSnapshot
  const snapLines = snap
    ? [
        `Contexto real do usuário:`,
        snap.activeHabits.length > 0 &&
          `- Hábitos: ${snap.activeHabits.map((h) => `${h.name} ${h.weeklyCount}/${h.weeklyTarget}`).join(', ')}`,
        snap.weeklyConsistencyPct !== undefined && `- Consistência semanal: ${snap.weeklyConsistencyPct}%`,
        snap.weight && `- Peso: ${snap.weight}kg${snap.goalWeight ? ` (meta: ${snap.goalWeight}kg)` : ''}`,
        snap.bodyFat && `- Gordura corporal: ${snap.bodyFat}%${snap.goalBodyFat ? ` (meta: ${snap.goalBodyFat}%)` : ''}`,
        snap.bmi && `- IMC: ${snap.bmi}`,
        snap.avgSleepHours && `- Sono médio: ${snap.avgSleepHours}h`,
        snap.sleepEnergyScore !== undefined && `- Score de sono: ${snap.sleepEnergyScore}/100`,
        snap.investmentRate !== undefined && `- Taxa de investimento: ${snap.investmentRate}% da renda`,
        snap.fastingStreak !== undefined && snap.fastingStreak > 0 && `- Sequência jejum: ${snap.fastingStreak} dias`,
      ]
        .filter(Boolean)
        .join('\n')
    : ''

  return `Você é um coach de alta performance com base em evidências científicas. Responde em português brasileiro, de forma direta e personalizada.

MÉTRICA EM FOCO:
- Módulo: ${ctx.module}
- Métrica: ${ctx.metricName}
- Valor atual: ${ctx.currentValue} ${ctx.unit}
${trendLine}

${benchmarkLines ? `BENCHMARKS DE COMPARAÇÃO:\n${benchmarkLines}\n` : ''}
${factLines ? `${factLines}\n` : ''}
${snapLines ? `${snapLines}\n` : ''}
TAREFA:
Gere UMA motivação de 2 a 3 frases que:
1. Use o dado científico OU benchmark de comparação fornecido
2. Mencione o valor REAL do usuário (${ctx.currentValue} ${ctx.unit}) — seja específico
3. Conecte com outro aspecto da vida do usuário quando relevante
4. Termine com UMA ação concreta executável nas próximas 2 horas
5. Tom: direto, baseado em evidência, sem elogios vazios nem alarmismo

Responda APENAS com a motivação. Sem título, sem prefixo, sem aspas externas.`
}

// ── POST /api/insights ────────────────────────

export async function POST(req: NextRequest) {
  // Rate limit por IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'rate_limit', message: 'Muitas requisições. Aguarde 1 minuto.' },
      { status: 429 },
    )
  }

  if (!hasAnthropic()) {
    return NextResponse.json(
      { error: 'not_configured', insight: 'Configure ANTHROPIC_API_KEY no servidor para ativar insights.' },
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

  try {
    const message = await getAnthropic().messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 300,
      messages:   [{ role: 'user', content: buildPrompt(ctx) }],
    })
    const insight = (message.content[0]?.type === 'text' ? message.content[0].text : '').trim()
    return NextResponse.json({ insight })
  } catch (err) {
    console.error('[insights] Anthropic error:', err)
    return NextResponse.json(
      { insight: 'Não foi possível gerar insight no momento.' },
      { status: 200 },
    )
  }
}
