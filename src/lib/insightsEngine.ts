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

// ── Calls via Next.js API routes (server-side) ──
// A chave ANTHROPIC_API_KEY fica somente no servidor.
// O buildPrompt vive em /api/insights/route.ts — nunca no bundle do cliente.

export async function generateInsight(ctx: MetricContext): Promise<string> {
  try {
    const res = await fetch('/api/openai/insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metricContext: ctx }),
    })

    if (res.status === 429) return 'Muitas requisições. Aguarde 1 minuto.'
    if (res.status === 503) return 'Configure OPENAI_API_KEY no servidor para ativar insights.'
    if (!res.ok)            return 'Não foi possível gerar insight agora.'

    const data = await res.json()
    return (data.insight ?? '').trim() || 'Insight indisponível.'
  } catch {
    return 'Erro de conexão ao gerar insight.'
  }
}

// ── Diagnóstico cruzado completo ─────────────

export async function generateFullDiagnosis(snapshot: UserSnapshot): Promise<string> {
  try {
    const res = await fetch('/api/insights/diagnosis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snapshot }),
    })

    if (res.status === 429) return 'Limite de diagnósticos atingido. Aguarde 1 minuto.'
    if (res.status === 503) return 'Configure ANTHROPIC_API_KEY no servidor para ativar o diagnóstico.'
    if (!res.ok)            return 'Diagnóstico indisponível no momento.'

    const data = await res.json()
    return (data.diagnosis ?? '').trim() || 'Diagnóstico indisponível.'
  } catch {
    return 'Erro ao gerar diagnóstico.'
  }
}
