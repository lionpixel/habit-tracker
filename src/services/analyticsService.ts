// ─────────────────────────────────────────────
//  Analytics Service — preparado para backend real
//  Replace with real API calls when connecting Supabase
// ─────────────────────────────────────────────

import type { HabitKey, HabitsMap } from '@/types/habit'
import { getWeekKey } from '@/lib/helpers'

export interface WeeklyStatsSummary {
  weekKey:           string
  consistencyScore:  number   // 0-100
  sessions:          number
  totalMinutes:      number
  streakAverage:     number
  habitBreakdown:    Record<HabitKey, { sessions: number; minutes: number }>
}

export interface AnalyticsTrend {
  direction: 'up' | 'down' | 'flat'
  delta:     number     // percentage points
  label:     string
}

export interface HabitAnalytics {
  key:                HabitKey
  currentConsistency: number     // 0-100 this week
  avgConsistency4w:   number     // rolling 4-week avg
  trend:              AnalyticsTrend
  bestWeekKey:        string
  totalSessions:      number
  totalMinutes:       number
}

const HABIT_KEYS: HabitKey[] = ['reading', 'english', 'hiit', 'ppci', 'dopamine', 'fasting']

// ── Local computation (replace with API calls) ──────────

export const analyticsService = {
  /**
   * Compute weekly stats summary for a given week.
   * Replace with: apiClient.get<WeeklyStatsSummary>(`/api/analytics/weeks/${weekKey}`)
   */
  getWeeklySummary(
    habits: HabitsMap,
    year: number,
    week: number,
  ): WeeklyStatsSummary {
    const weekKey = getWeekKey(year, week)
    let totalSessions = 0
    let totalPossible = 0
    let totalMinutes  = 0
    const breakdown = {} as Record<HabitKey, { sessions: number; minutes: number }>

    HABIT_KEYS.forEach((key) => {
      const habit    = habits[key]
      const sessions = habit.counts[weekKey] ?? 0
      const minutes  = sessions * habit.target
      totalSessions += sessions
      totalPossible += habit.frequency
      totalMinutes  += minutes
      breakdown[key] = { sessions, minutes }
    })

    const consistencyScore = totalPossible > 0
      ? Math.round((totalSessions / totalPossible) * 100)
      : 0

    return {
      weekKey,
      consistencyScore,
      sessions:     totalSessions,
      totalMinutes,
      streakAverage: 0,   // requires per-habit streak data
      habitBreakdown: breakdown,
    }
  },

  /**
   * Compute per-habit analytics across the last N weeks.
   * Replace with: apiClient.get<HabitAnalytics[]>(`/api/analytics/habits?weeks=${n}`)
   */
  getHabitAnalytics(
    habits: HabitsMap,
    currentYear: number,
    currentWeek: number,
    weeksBack = 8,
  ): HabitAnalytics[] {
    return HABIT_KEYS.map((key) => {
      const habit = habits[key]

      // Collect consistency per week
      const consistencies: number[] = []
      for (let offset = weeksBack - 1; offset >= 0; offset--) {
        let w = currentWeek - offset
        let y = currentYear
        if (w <= 0) { w += 52; y -= 1 }
        const wKey      = getWeekKey(y, w)
        const sessions  = habit.counts[wKey] ?? 0
        const pct       = habit.frequency > 0 ? (sessions / habit.frequency) * 100 : 0
        consistencies.push(pct)
      }

      const currentConsistency = consistencies[consistencies.length - 1] ?? 0
      const avgConsistency4w   = consistencies.slice(-4).reduce((a, b) => a + b, 0) / 4
      const avgFirst4          = consistencies.slice(0, 4).reduce((a, b) => a + b, 0) / 4
      const delta              = Math.round(avgConsistency4w - avgFirst4)

      const trend: AnalyticsTrend = {
        direction: delta > 2 ? 'up' : delta < -2 ? 'down' : 'flat',
        delta:     Math.abs(delta),
        label:     delta > 0 ? `+${delta}pp` : `${delta}pp`,
      }

      // Best week
      let bestWeekKey = ''
      let bestPct     = -1
      Object.entries(habit.counts).forEach(([wKey, count]) => {
        const pct = habit.frequency > 0 ? (count / habit.frequency) * 100 : 0
        if (pct > bestPct) { bestPct = pct; bestWeekKey = wKey }
      })

      const totalSessions = Object.values(habit.counts).reduce((a, b) => a + b, 0)

      return {
        key,
        currentConsistency: Math.round(currentConsistency),
        avgConsistency4w:   Math.round(avgConsistency4w),
        trend,
        bestWeekKey,
        totalSessions,
        totalMinutes: totalSessions * habit.target,
      }
    })
  },

  /**
   * Compute overall app health score (0-100).
   * Replace with: apiClient.get<number>('/api/analytics/health-score')
   */
  getHealthScore(habits: HabitsMap, currentYear: number, currentWeek: number): number {
    const analytics = analyticsService.getHabitAnalytics(habits, currentYear, currentWeek, 4)
    const avg = analytics.reduce((a, b) => a + b.avgConsistency4w, 0) / analytics.length
    return Math.round(avg)
  },
}
