// ─────────────────────────────────────────────
//  Historical Data — Fonte de verdade Q1 2026
//  Todos os valores em minutos
// ─────────────────────────────────────────────

import type { HabitKey } from '@/types/habit'
import { HABIT_COLORS }  from '@/lib/constants'

// ── Labels ───────────────────────────────────

export const HABIT_LABELS: Record<HabitKey, string> = {
  reading:  'Leitura',
  english:  'Inglês',
  hiit:     'HIIT',
  ppci:     'PPCI',
  dopamine: 'Detox',
  fasting:  'Sem Açúcar',
}

// ── Dados brutos (minutos/hábito/mês) ────────

export const HISTORICAL_MINUTES: Record<HabitKey, Record<string, number>> = {
  reading:  { '2026-01': 125,  '2026-02': 450, '2026-03': 225 },
  english:  { '2026-01': 250,  '2026-02': 850, '2026-03': 450 },
  hiit:     { '2026-01': 120,  '2026-02': 300, '2026-03': 30  },
  ppci:     { '2026-01': 100,  '2026-02': 400, '2026-03': 350 },
  dopamine: { '2026-01': 100,  '2026-02': 400, '2026-03': 250 },
  fasting:  { '2026-01': 0,    '2026-02': 0,   '2026-03': 0   },
}

export const HISTORICAL_MONTHS = ['2026-01', '2026-02', '2026-03'] as const
export type HistoricalMonthKey  = typeof HISTORICAL_MONTHS[number]

export const MONTH_LABELS: Record<HistoricalMonthKey, string> = {
  '2026-01': 'Janeiro',
  '2026-02': 'Fevereiro',
  '2026-03': 'Março',
}

export const MONTH_DAYS: Record<HistoricalMonthKey, number> = {
  '2026-01': 31,
  '2026-02': 28,
  '2026-03': 31,
}

const TRACKED_KEYS: HabitKey[] = ['reading', 'english', 'hiit', 'ppci', 'dopamine']

// ── Totais mensais (soma de todos os hábitos) ─

export const MONTHLY_TOTALS: Record<HistoricalMonthKey, number> =
  HISTORICAL_MONTHS.reduce((acc, mk) => {
    acc[mk] = TRACKED_KEYS.reduce((sum, k) => sum + (HISTORICAL_MINUTES[k][mk] ?? 0), 0)
    return acc
  }, {} as Record<HistoricalMonthKey, number>)
// Jan: 695 · Feb: 2400 · Mar: 1305

// ── Totais por hábito (soma dos 3 meses) ──────

export const HABIT_TOTALS: Record<HabitKey, number> =
  (Object.keys(HISTORICAL_MINUTES) as HabitKey[]).reduce((acc, k) => {
    acc[k] = HISTORICAL_MONTHS.reduce((sum, mk) => sum + (HISTORICAL_MINUTES[k][mk] ?? 0), 0)
    return acc
  }, {} as Record<HabitKey, number>)
// english: 1550 · ppci: 850 · reading: 800 · dopamine: 750 · hiit: 450

// ── Grand total ───────────────────────────────

export const GRAND_TOTAL_MINUTES = Object.values(MONTHLY_TOTALS).reduce((a, b) => a + b, 0)
// 4400 min ≈ 73h

// ── Melhor / pior mês ─────────────────────────

export const BEST_MONTH_KEY  = HISTORICAL_MONTHS.reduce((b, mk) =>
  MONTHLY_TOTALS[mk] > MONTHLY_TOTALS[b] ? mk : b)
// '2026-02'

export const WORST_MONTH_KEY = HISTORICAL_MONTHS.reduce((w, mk) =>
  MONTHLY_TOTALS[mk] < MONTHLY_TOTALS[w] ? mk : w)
// '2026-01'

// ── Variação mês a mês ────────────────────────

function momChange(from: HistoricalMonthKey, to: HistoricalMonthKey): number {
  const base = MONTHLY_TOTALS[from]
  if (base === 0) return 0
  return Math.round(((MONTHLY_TOTALS[to] - base) / base) * 100)
}

export const MOM: Record<string, number> = {
  jan_to_feb: momChange('2026-01', '2026-02'),  // +245
  feb_to_mar: momChange('2026-02', '2026-03'),  // -46
}

// ── Variação por hábito (Fev→Mar) ────────────

function habitMom(key: HabitKey, from: HistoricalMonthKey, to: HistoricalMonthKey): number {
  const base = HISTORICAL_MINUTES[key][from] ?? 0
  if (base === 0) return 0
  return Math.round(((( HISTORICAL_MINUTES[key][to] ?? 0) - base) / base) * 100)
}

export const HABIT_MOM_FEB_MAR: Record<HabitKey, number> = {
  reading:  habitMom('reading',  '2026-02', '2026-03'),  // -50
  english:  habitMom('english',  '2026-02', '2026-03'),  // -47
  hiit:     habitMom('hiit',     '2026-02', '2026-03'),  // -90
  ppci:     habitMom('ppci',     '2026-02', '2026-03'),  // -12
  dopamine: habitMom('dopamine', '2026-02', '2026-03'),  // -37
  fasting:  0,
}

// ── Média por dia ─────────────────────────────

export const AVG_PER_DAY: Record<HistoricalMonthKey, number> = {
  '2026-01': Math.round(MONTHLY_TOTALS['2026-01'] / MONTH_DAYS['2026-01']),  // 22
  '2026-02': Math.round(MONTHLY_TOTALS['2026-02'] / MONTH_DAYS['2026-02']),  // 86
  '2026-03': Math.round(MONTHLY_TOTALS['2026-03'] / MONTH_DAYS['2026-03']),  // 42
}

// ── Ranking de hábitos ────────────────────────

export const HABIT_RANKING = TRACKED_KEYS
  .sort((a, b) => HABIT_TOTALS[b] - HABIT_TOTALS[a])
  .map((key, i) => ({
    rank:     i + 1,
    key,
    name:     HABIT_LABELS[key],
    color:    (HABIT_COLORS as Record<string, string>)[key] ?? '#6366f1',
    totalMin: HABIT_TOTALS[key],
    pct:      GRAND_TOTAL_MINUTES > 0
      ? Math.round((HABIT_TOTALS[key] / GRAND_TOTAL_MINUTES) * 100)
      : 0,
  }))
// 1.Inglês 2.PPCI 3.Leitura 4.Detox 5.HIIT

// ── Tipos de insight ──────────────────────────

export type InsightKind = 'positive' | 'neutral' | 'alert' | 'critical'

export interface HistoricalInsight {
  kind:        InsightKind
  iconId:      string
  title:       string
  description: string
  priority:    'high' | 'medium' | 'low'
}

// ── Insights inteligentes gerados ────────────

const engPct  = HABIT_RANKING.find(h => h.key === 'english')?.pct ?? 0
const hiitDrop = Math.abs(HABIT_MOM_FEB_MAR.hiit)  // 90
const marDrop  = Math.abs(MOM.feb_to_mar)            // 46

export const HISTORICAL_INSIGHTS: HistoricalInsight[] = [
  {
    kind:        'positive',
    iconId:      'Trophy',
    title:       `Melhor mês: ${MONTH_LABELS[BEST_MONTH_KEY]}`,
    description: `${Math.round(MONTHLY_TOTALS[BEST_MONTH_KEY] / 60)}h de prática total — +${MOM.jan_to_feb}% acima de Janeiro. Pico de consistência do trimestre.`,
    priority:    'high',
  },
  {
    kind:        'positive',
    iconId:      'Languages',
    title:       'Inglês é seu hábito dominante',
    description: `${Math.round(HABIT_TOTALS.english / 60)}h em 3 meses (${engPct}% do total). Hábito mais consistente do trimestre.`,
    priority:    'high',
  },
  {
    kind:        'critical',
    iconId:      'TrendingDown',
    title:       `HIIT caiu ${hiitDrop}% em Março`,
    description: `Fevereiro: 5h → Março: 30min. Queda mais severa do trimestre. Impacto direto na meta de condicionamento físico.`,
    priority:    'high',
  },
  {
    kind:        'alert',
    iconId:      'TrendingDown',
    title:       `Queda geral de ${marDrop}% em Março`,
    description: `Após pico em Fevereiro (${Math.round(MONTHLY_TOTALS['2026-02'] / 60)}h), Março fechou com ${Math.round(MONTHLY_TOTALS['2026-03'] / 60)}h. Retomada em Abril é essencial.`,
    priority:    'high',
  },
  {
    kind:        'positive',
    iconId:      'TrendingUp',
    title:       'PPCI manteve consistência',
    description: `Jan: ${HISTORICAL_MINUTES.ppci['2026-01']}min → Fev: ${HISTORICAL_MINUTES.ppci['2026-02']}min → Mar: ${HISTORICAL_MINUTES.ppci['2026-03']}min. Menor queda entre todos os hábitos (${Math.abs(HABIT_MOM_FEB_MAR.ppci)}%).`,
    priority:    'medium',
  },
  {
    kind:        'neutral',
    iconId:      'Brain',
    title:       'Detox de Dopamina cresceu significativamente',
    description: `Jan: ${HISTORICAL_MINUTES.dopamine['2026-01']}min → Fev: ${HISTORICAL_MINUTES.dopamine['2026-02']}min. Aumento de 300%. Verifique equilíbrio entre detox e foco.`,
    priority:    'medium',
  },
]

// ── Dados para gráfico de barras agrupado ─────

export interface MonthlyBarPoint {
  month:    string
  reading:  number
  english:  number
  hiit:     number
  ppci:     number
  dopamine: number
  total:    number
}

export const MONTHLY_BAR_DATA: MonthlyBarPoint[] = HISTORICAL_MONTHS.map((mk) => ({
  month:    MONTH_LABELS[mk],
  reading:  HISTORICAL_MINUTES.reading[mk]  ?? 0,
  english:  HISTORICAL_MINUTES.english[mk]  ?? 0,
  hiit:     HISTORICAL_MINUTES.hiit[mk]     ?? 0,
  ppci:     HISTORICAL_MINUTES.ppci[mk]     ?? 0,
  dopamine: HISTORICAL_MINUTES.dopamine[mk] ?? 0,
  total:    MONTHLY_TOTALS[mk],
}))

// ── Gamificação ───────────────────────────────

// XP = 1 ponto por minuto de prática
export const GAMIFICATION = {
  totalXP:   GRAND_TOTAL_MINUTES,                              // 4400
  level:     Math.floor(GRAND_TOTAL_MINUTES / 500) + 1,        // 9
  xpToNext:  500 - (GRAND_TOTAL_MINUTES % 500),
  achievements: [
    { id: 'feb_peak',     label: 'Fevereiro Épico',       desc: `${Math.round(MONTHLY_TOTALS['2026-02']/60)}h em um mês`,           unlocked: true  },
    { id: 'english_dom',  label: 'Inglês Imparável',      desc: `Hábito dominante por 3 meses`,                                    unlocked: true  },
    { id: 'ppci_steady',  label: 'Consistência PPCI',     desc: 'Menor queda mês a mês',                                           unlocked: true  },
    { id: 'hiit_alert',   label: 'Atleta em Risco',       desc: 'HIIT zerado em Março — retome o treino',                          unlocked: false },
    { id: 'q1_complete',  label: 'Q1 Concluído',          desc: `${Math.round(GRAND_TOTAL_MINUTES/60)}h acumuladas no trimestre`,   unlocked: true  },
  ],
}
