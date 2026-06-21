'use client'

// ─────────────────────────────────────────────
//  Hook: useHistoricalInsights
//
//  Métricas dinâmicas lidas do appStore (habit.monthlyTotals,
//  habit.totalYear). Os textos de insight Q1 continuam em
//  historicalData.ts — são análise editorial, não recalculável.
// ─────────────────────────────────────────────

import { useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import { useActiveHabitKeys } from '@/store/selectors'
import {
  HISTORICAL_INSIGHTS,
  GAMIFICATION,
} from '@/data/historicalData'
import { formatTime } from '@/lib/helpers'

// Meses Q1 que sempre fazem parte desta análise
const Q1_MONTHS = ['2026-01', '2026-02', '2026-03'] as const
type Q1Month = typeof Q1_MONTHS[number]

const Q1_LABELS: Record<Q1Month, string> = {
  '2026-01': 'Janeiro',
  '2026-02': 'Fevereiro',
  '2026-03': 'Março',
}

const MONTH_DAYS: Record<Q1Month, number> = {
  '2026-01': 31,
  '2026-02': 28,
  '2026-03': 31,
}

export function useHistoricalInsights() {
  const habits     = useAppStore((s) => s.data.habits)
  const activeKeys = useActiveHabitKeys()

  // ── Totais Q1 por hábito/mês (do store) ──────

  const q1Totals = useMemo(() => {
    const byMonth: Record<Q1Month, number> = { '2026-01': 0, '2026-02': 0, '2026-03': 0 }
    const byHabit: Record<string, number>  = {}

    for (const key of activeKeys) {
      const mt = habits[key]?.monthlyTotals ?? {}
      let habitQ1 = 0
      for (const mk of Q1_MONTHS) {
        const v = mt[mk] ?? 0
        byMonth[mk] += v
        habitQ1     += v
      }
      byHabit[key] = habitQ1
    }

    return { byMonth, byHabit }
  }, [habits, activeKeys])

  const grandTotal = useMemo(
    () => Object.values(q1Totals.byMonth).reduce((a, b) => a + b, 0),
    [q1Totals],
  )

  // ── Melhor / pior mês Q1 ─────────────────────

  const bestMonthKey = useMemo<Q1Month>(() =>
    Q1_MONTHS.reduce((b, mk) =>
      q1Totals.byMonth[mk] > q1Totals.byMonth[b] ? mk : b,
    ),
  [q1Totals])

  const worstMonthKey = useMemo<Q1Month>(() =>
    Q1_MONTHS.reduce((w, mk) =>
      q1Totals.byMonth[mk] < q1Totals.byMonth[w] ? mk : w,
    ),
  [q1Totals])

  // ── MoM Q1 ───────────────────────────────────

  const momJanFeb = useMemo(() => {
    const base = q1Totals.byMonth['2026-01']
    if (!base) return 0
    return Math.round(((q1Totals.byMonth['2026-02'] - base) / base) * 100)
  }, [q1Totals])

  const momFebMar = useMemo(() => {
    const base = q1Totals.byMonth['2026-02']
    if (!base) return 0
    return Math.round(((q1Totals.byMonth['2026-03'] - base) / base) * 100)
  }, [q1Totals])

  // ── Ranking de hábitos (totalYear do store) ───

  const habitRanking = useMemo(() => {
    const tracked = activeKeys.filter(
      (k) => !(habits[k] as { isSpecial?: boolean }).isSpecial,
    )
    return tracked
      .map((key) => ({
        key,
        name:     habits[key].name,
        color:    habits[key].color,
        totalMin: habits[key].totalYear,
        q1Min:    q1Totals.byHabit[key] ?? 0,
        pct:      grandTotal > 0
          ? Math.round(((q1Totals.byHabit[key] ?? 0) / grandTotal) * 100)
          : 0,
      }))
      .sort((a, b) => b.totalMin - a.totalMin)
      .map((h, i) => ({
        ...h,
        rank:           i + 1,
        formattedTotal: formatTime(h.totalMin),
      }))
  }, [habits, activeKeys, q1Totals, grandTotal])

  // ── Métricas mensais Q1 ───────────────────────

  const monthlyStats = useMemo(() =>
    Q1_MONTHS.map((mk) => ({
      key:       mk,
      label:     Q1_LABELS[mk],
      minutes:   q1Totals.byMonth[mk],
      formatted: formatTime(q1Totals.byMonth[mk]),
      isBest:    mk === bestMonthKey,
      habits:    activeKeys.map((k) => ({
        key:     k,
        minutes: habits[k]?.monthlyTotals?.[mk] ?? 0,
      })),
    })),
  [q1Totals, bestMonthKey, activeKeys, habits])

  // ── Avg por dia Q1 ────────────────────────────

  const avgPerDay = useMemo(() =>
    (Object.entries(q1Totals.byMonth) as [Q1Month, number][]).reduce((acc, [mk, v]) => ({
      ...acc,
      [mk]: Math.round(v / MONTH_DAYS[mk]),
    }), {} as Record<Q1Month, number>),
  [q1Totals])

  // ── Domínio do inglês ─────────────────────────

  const englishDominance = useMemo(() => {
    const engKey   = 'english'
    const engHabit = habits[engKey]
    if (!engHabit) return null
    const engQ1 = q1Totals.byHabit[engKey] ?? 0
    const engRank = habitRanking.find((h) => h.key === engKey)
    return {
      totalMin: engHabit.totalYear,
      q1Min:    engQ1,
      pctOfAll: engRank?.pct ?? 0,
      growth:   momJanFeb,
    }
  }, [habits, q1Totals, habitRanking, momJanFeb])

  // ── Alerta HIIT ───────────────────────────────

  const hiitAlert = useMemo(() => {
    const hiit = habits['hiit']
    if (!hiit) return null
    const febMin = hiit.monthlyTotals?.['2026-02'] ?? 0
    const marMin = hiit.monthlyTotals?.['2026-03'] ?? 0
    const base   = febMin
    const dropPct = base > 0 ? Math.abs(Math.round(((marMin - base) / base) * 100)) : 0
    return { febMin, marMin, dropPct, isCritical: marMin < 60 }
  }, [habits])

  // ── Quarter summary ───────────────────────────

  const quarterSummary = {
    totalMinutes:   grandTotal,
    totalHours:     Math.round((grandTotal / 60) * 10) / 10,
    bestMonthKey,
    bestMonthLabel: Q1_LABELS[bestMonthKey],
    bestMonthMin:   q1Totals.byMonth[bestMonthKey],
    worstMonthKey,
    momJanFeb,
    momFebMar,
    avgPerDay,
  }

  return {
    insights:        HISTORICAL_INSIGHTS,
    quarterSummary,
    monthlyStats,
    habitRanking,
    englishDominance,
    hiitAlert,
    gamification:    GAMIFICATION,
  }
}
