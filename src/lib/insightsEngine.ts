// ─────────────────────────────────────────────
//  InsightsEngine — Motor central de insights via Claude API
//  Alimenta todos os módulos: hábitos, corpo, sono, finanças, metas
// ─────────────────────────────────────────────

import type { ScientificFact, BenchmarkSet } from './benchmarks'

// ── Tipos ────────────────────────────────────

export interface MetricContext {
  module: 'habito' | 'corpo' | 'sono' | 'financas' | 'meta'
  metricName: string
  metricKey: string
  currentValue: number
  unit: string
  trend?: 'subindo' | 'caindo' | 'estavel'
  trendValue?: number
  benchmarks?: BenchmarkSet & { metricLabel?: string }
  triggeredFact?: ScientificFact
  userSnapshot?: UserSnapshot
}

export interface UserSnapshot {
  // Hábitos
  activeHabits: { name: string; weeklyCount: number; weeklyTarget: number; weeklyMinutes: number }[]
  bestHabitName: string
  worstHabitName: string
  totalWeeklyMinutes: number
  weeklyConsistencyPct: number

  // Corpo
  weight?: number
  bodyFat?: number
  bmi?: number
  leanMass?: number
  goalWeight?: number
  goalBodyFat?: number

  // Sono
  avgSleepHours?: number
  sleepDebt?: number
  wakeTimeGoal?: string
  sleepEnergyScore?: number

  // Finanças
  monthlyIncome?: number
  monthlyExpenses?: number
  monthlyInvestments?: number
  investmentRate?: number
  netBalance?: number

  // Streak
  fastingStreak?: number
  longestFastingStreak?: number
}

// ── Coletar snapshot de todos os stores ──────
//  Chamado client-side; recebe os dados já extraídos via hooks
export function buildUserSnapshot(params: {
  habits: Record<string, { name: string; frequency: number; target: number; archived?: boolean }>
  weekCounts: Record<string, number>
  weekMinutes: Record<string, number>
  weekConsistency: number
  profile?: { weight?: number; bodyFat?: number; imc?: number; leanMass?: number; goalWeight?: number; goalBodyFat?: number }
  sleep?: { avgHours?: number; energyScore?: number; targetWake?: string }
  finance?: { income?: number; expenses?: number; investments?: number; investmentRate?: number; netBalance?: number }
  fastingStreak?: number
  longestFastingStreak?: number
}): UserSnapshot {
  const activeHabits = Object.entries(params.habits)
    .filter(([, h]) => !h.archived)
    .map(([key, h]) => ({
      name: h.name,
      weeklyCount: params.weekCounts[key] ?? 0,
      weeklyTarget: h.frequency,
      weeklyMinutes: params.weekMinutes[key] ?? 0,
    }))

  const sorted = [...activeHabits].sort(
    (a, b) => (b.weeklyCount / Math.max(b.weeklyTarget, 1)) - (a.weeklyCount / Math.max(a.weeklyTarget, 1))
  )

  return {
    activeHabits,
    bestHabitName: sorted[0]?.name ?? '—',
    worstHabitName: sorted[sorted.length - 1]?.name ?? '—',
    totalWeeklyMinutes: activeHabits.reduce((s, h) => s + h.weeklyMinutes, 0),
    weeklyConsistencyPct: params.weekConsistency,
    weight: params.profile?.weight,
    bodyFat: params.profile?.bodyFat,
    bmi: params.profile?.imc,
    leanMass: params.profile?.leanMass,
    goalWeight: params.profile?.goalWeight,
    goalBodyFat: params.profile?.goalBodyFat,
    avgSleepHours: params.sleep?.avgHours,
    sleepEnergyScore: params.sleep?.energyScore,
    wakeTimeGoal: params.sleep?.targetWake,
    monthlyIncome: params.finance?.income,
    monthlyExpenses: params.finance?.expenses,
    monthlyInvestments: params.finance?.investments,
    investmentRate: params.finance?.investmentRate,
    netBalance: params.finance?.netBalance,
    fastingStreak: params.fastingStreak,
    longestFastingStreak: params.longestFastingStreak,
  }
}

// ── Gerador de insight via Claude API ─────────

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
3. Conecte com outro aspecto da vida do usuário quando relevante (sono afetando treino, etc.)
4. Termine com UMA ação concreta executável nas próximas 2 horas
5. Tom: direto, baseado em evidência, sem elogios vazios nem alarmismo

Responda APENAS com a motivação. Sem título, sem prefixo, sem aspas externas.`
}

export async function generateInsight(ctx: MetricContext): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY
  if (!apiKey) {
    return 'Configure NEXT_PUBLIC_ANTHROPIC_API_KEY para gerar insights personalizados.'
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        messages: [{ role: 'user', content: buildPrompt(ctx) }],
      }),
    })

    if (!res.ok) {
      console.error('InsightsEngine API error:', res.status)
      return 'Não foi possível gerar insight no momento. Tente novamente.'
    }

    const data = await res.json()
    return (data.content?.[0]?.text ?? '').trim() || 'Insight indisponível.'
  } catch (err) {
    console.error('InsightsEngine fetch error:', err)
    return 'Erro de conexão ao gerar insight.'
  }
}

// ── Diagnóstico cruzado completo ─────────────

export async function generateFullDiagnosis(snapshot: UserSnapshot): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY
  if (!apiKey) return 'Configure NEXT_PUBLIC_ANTHROPIC_API_KEY para diagnóstico completo.'

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

  const prompt = `Você é um coach de alta performance com visão integrada de corpo, mente e finanças.

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
1. Identifique o padrão mais importante cruzando 2 ou mais módulos (ex: sono ruim → impacto no HIIT → impacto na gordura)
2. Use os números REAIS fornecidos
3. Aponte UMA prioridade de ação para esta semana
4. Tom: coach direto, baseado em dados, sem julgamentos morais

Responda APENAS com o diagnóstico. Sem título, sem prefixo.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) return 'Diagnóstico indisponível no momento.'
    const data = await res.json()
    return (data.content?.[0]?.text ?? '').trim() || 'Diagnóstico indisponível.'
  } catch {
    return 'Erro ao gerar diagnóstico.'
  }
}
