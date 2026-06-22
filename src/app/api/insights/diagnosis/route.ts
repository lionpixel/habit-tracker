// ─────────────────────────────────────────────
//  API Route: /api/insights/diagnosis
//  Diagnóstico cruzado completo via Anthropic.
//  ANTHROPIC_API_KEY fica somente no servidor.
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import type { UserSnapshot } from '@/lib/insightsEngine'

// ── Rate limit compartilhado (mesmo mapa da rota irmã) ──
// Como são instâncias separadas em serverless, cada rota tem
// seu próprio mapa — isso é aceitável para uma app pessoal.
const diagRateLimitMap = new Map<string, { count: number; reset: number }>()
const RATE_LIMIT  = 5     // diagnósticos completos são mais caros
const RATE_WINDOW = 60_000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()

  if (diagRateLimitMap.size > 200) {
    for (const [key, val] of diagRateLimitMap) {
      if (now > val.reset) diagRateLimitMap.delete(key)
    }
  }

  const entry = diagRateLimitMap.get(ip)
  if (!entry || now > entry.reset) {
    diagRateLimitMap.set(ip, { count: 1, reset: now + RATE_WINDOW })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

function buildDiagnosisPrompt(snapshot: UserSnapshot): string {
  const lines = [
    snapshot.activeHabits.length > 0 &&
      `Hábitos: ${snapshot.activeHabits.map((h) => `${h.name} (${h.weeklyCount}/${h.weeklyTarget} sessões, ${h.weeklyMinutes}min)`).join('; ')}`,
    snapshot.weeklyConsistencyPct !== undefined && `Consistência semanal: ${snapshot.weeklyConsistencyPct}%`,
    snapshot.weight && `Peso: ${snapshot.weight}kg${snapshot.goalWeight ? ` → meta ${snapshot.goalWeight}kg` : ''}`,
    snapshot.bodyFat && `Gordura: ${snapshot.bodyFat}%${snapshot.goalBodyFat ? ` → meta ${snapshot.goalBodyFat}%` : ''}`,
    snapshot.bmi && `IMC: ${snapshot.bmi}`,
    snapshot.leanMass && `Massa magra: ${snapshot.leanMass}kg`,
    snapshot.avgSleepHours && `Sono médio: ${snapshot.avgSleepHours}h/noite`,
    snapshot.sleepEnergyScore !== undefined && `Score de energia do sono: ${snapshot.sleepEnergyScore}/100`,
    snapshot.monthlyIncome && `Receita mensal: R$ ${snapshot.monthlyIncome.toLocaleString('pt-BR')}`,
    snapshot.investmentRate !== undefined && `Taxa de investimento: ${snapshot.investmentRate}% (média BR: 6.3%)`,
    snapshot.netBalance !== undefined && `Saldo líquido mensal: R$ ${snapshot.netBalance.toLocaleString('pt-BR')}`,
    snapshot.fastingStreak && snapshot.fastingStreak > 0 && `Sequência de jejum: ${snapshot.fastingStreak} dias`,
  ]
    .filter(Boolean)
    .join('\n')

  return `Você é um coach de alta performance com visão integrada de corpo, mente e finanças.

DADOS REAIS DO USUÁRIO HOJE:
${lines}

BENCHMARKS RELEVANTES:
- Brasileiro médio dorme 6.9h (recomendado: 7.5h+)
- Taxa de investimento BR: 6.3% (recomendado: 20%+)
- 77% dos brasileiros não fazem exercício suficiente
- Sono <7h reduz performance de treino em 21%
- Gordura visceral e sono ruim são diretamente correlacionados

TAREFA:
Escreva um diagnóstico integrado de 3 a 4 frases que:
1. Identifique o padrão mais importante cruzando 2 ou mais módulos
2. Use os números REAIS fornecidos
3. Aponte UMA prioridade de ação para esta semana
4. Tom: coach direto, baseado em dados, sem julgamentos morais

Responda APENAS com o diagnóstico. Sem título, sem prefixo.`
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'rate_limit', message: 'Máximo 5 diagnósticos por minuto.' },
      { status: 429 },
    )
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { diagnosis: 'Configure ANTHROPIC_API_KEY no servidor para ativar o diagnóstico.' },
      { status: 503 },
    )
  }

  let snapshot: UserSnapshot
  try {
    const body = await req.json()
    snapshot = body.snapshot as UserSnapshot
    if (!snapshot?.activeHabits) {
      return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        messages: [{ role: 'user', content: buildDiagnosisPrompt(snapshot) }],
      }),
    })

    if (!res.ok) {
      console.error('[diagnosis] Anthropic error:', res.status)
      return NextResponse.json({ diagnosis: 'Diagnóstico indisponível no momento.' }, { status: 200 })
    }

    const data = await res.json()
    const diagnosis = (data.content?.[0]?.text ?? '').trim()
    return NextResponse.json({ diagnosis })
  } catch (err) {
    console.error('[diagnosis] fetch error:', err)
    return NextResponse.json({ diagnosis: 'Erro ao gerar diagnóstico.' }, { status: 200 })
  }
}
