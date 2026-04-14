'use client'

// ─────────────────────────────────────────────
//  Hook: useHistoricalInsights
//  Expõe analytics derivados dos dados históricos Q1 2026
// ─────────────────────────────────────────────

import {
  HISTORICAL_INSIGHTS,
  HISTORICAL_MONTHS,
  HISTORICAL_MINUTES,
  MONTHLY_TOTALS,
  MONTH_LABELS,
  HABIT_TOTALS,
  HABIT_RANKING,
  GRAND_TOTAL_MINUTES,
  MONTHLY_BAR_DATA,
  GAMIFICATION,
  MOM,
  AVG_PER_DAY,
  HABIT_MOM_FEB_MAR,
  BEST_MONTH_KEY,
  WORST_MONTH_KEY,
} from '@/data/historicalData'
import { formatTime } from '@/lib/helpers'

export function useHistoricalInsights() {
  // ── Resumo do trimestre ───────────────────

  const quarterSummary = {
    totalMinutes:  GRAND_TOTAL_MINUTES,
    totalHours:    Math.round((GRAND_TOTAL_MINUTES / 60) * 10) / 10,
    bestMonthKey:  BEST_MONTH_KEY,
    bestMonthLabel:MONTH_LABELS[BEST_MONTH_KEY],
    bestMonthMin:  MONTHLY_TOTALS[BEST_MONTH_KEY],
    worstMonthKey: WORST_MONTH_KEY,
    momJanFeb:     MOM.jan_to_feb,    // +245
    momFebMar:     MOM.feb_to_mar,    // -46
    avgPerDay:     AVG_PER_DAY,
  }

  // ── Métricas mensais formatadas ───────────

  const monthlyStats = HISTORICAL_MONTHS.map((mk) => ({
    key:      mk,
    label:    MONTH_LABELS[mk],
    minutes:  MONTHLY_TOTALS[mk],
    formatted:formatTime(MONTHLY_TOTALS[mk]),
    isBest:   mk === BEST_MONTH_KEY,
    habits:   Object.entries(HISTORICAL_MINUTES).map(([k, data]) => ({
      key:     k,
      minutes: data[mk] ?? 0,
    })),
  }))

  // ── Ranking de hábitos ────────────────────

  const habitRanking = HABIT_RANKING.map((h) => ({
    ...h,
    formattedTotal: formatTime(h.totalMin),
    momFebMar:      HABIT_MOM_FEB_MAR[h.key],
  }))

  // ── Insight de domínio de inglês ──────────

  const englishDominance = {
    totalMin:  HABIT_TOTALS.english,
    pctOfAll:  HABIT_RANKING.find(h => h.key === 'english')?.pct ?? 0,
    growth:    MOM.jan_to_feb,
  }

  // ── Alerta HIIT ───────────────────────────

  const hiitAlert = {
    febMin:  HISTORICAL_MINUTES.hiit['2026-02'],
    marMin:  HISTORICAL_MINUTES.hiit['2026-03'],
    dropPct: Math.abs(HABIT_MOM_FEB_MAR.hiit),
    isCritical: HISTORICAL_MINUTES.hiit['2026-03'] < 60,
  }

  return {
    insights:        HISTORICAL_INSIGHTS,
    quarterSummary,
    monthlyStats,
    habitRanking,
    englishDominance,
    hiitAlert,
    barData:         MONTHLY_BAR_DATA,
    gamification:    GAMIFICATION,
  }
}
