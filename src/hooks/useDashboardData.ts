'use client'

// ─────────────────────────────────────────────
//  Hook: useDashboardData
//
//  Single source of truth for all data used by the
//  WeeklyView dashboard. Aggregates habits, stats,
//  insights, risk alerts, heatmap and evolution data
//  into one coherent object so the view stays thin.
// ─────────────────────────────────────────────

import { useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import { useEvolutionData } from './useEvolutionData'
import { useHeatmapData } from './useHeatmapData'
import { generateInsights, detectRisks } from '@/services/habitsService'
import {
  selectWeekConsistency,
  selectWeekTotalMinutes,
  selectWeekTotalSessions,
  selectMonthTotalMinutes,
} from '@/store/selectors'
import { getWeekKey } from '@/lib/helpers'
import type { HabitKey, Insight, RiskAlert } from '@/types/habit'

const HABIT_KEYS: HabitKey[] = ['reading', 'english', 'hiit', 'ppci', 'dopamine', 'fasting']

export interface DashboardData {
  // Navigation
  currentWeek:     number
  currentYear:     number
  currentMonth:    number

  // Habits
  habits:          ReturnType<typeof useAppStore.getState>['data']['habits']

  // Week stats
  weekConsistency: number
  weekSessions:    number
  weekMinutes:     number
  monthMinutes:    number

  // Per-habit week counts
  habitCounts:     Record<HabitKey, number>

  // Analysis
  insights:        Insight[]
  riskAlerts:      RiskAlert[]

  // Charts
  evolution:       ReturnType<typeof useEvolutionData>
  heatmap:         ReturnType<typeof useHeatmapData>

  // State
  hydrated:        boolean
}

export function useDashboardData(): DashboardData {
  const { data, hydrated } = useAppStore()
  const { habits, currentWeek, currentYear, currentMonth } = data

  const weekConsistency = useAppStore(selectWeekConsistency)
  const weekSessions    = useAppStore(selectWeekTotalSessions)
  const weekMinutes     = useAppStore(selectWeekTotalMinutes)
  const monthMinutes    = useAppStore(selectMonthTotalMinutes)

  const evolution = useEvolutionData(8)
  const heatmap   = useHeatmapData('year')

  const habitCounts = useMemo<Record<HabitKey, number>>(() => {
    const wKey = getWeekKey(currentYear, currentWeek)
    return HABIT_KEYS.reduce((acc, key) => {
      acc[key] = habits[key].counts[wKey] ?? 0
      return acc
    }, {} as Record<HabitKey, number>)
  }, [habits, currentYear, currentWeek])

  const insights = useMemo<Insight[]>(
    () => generateInsights(habits, currentYear, currentWeek),
    [habits, currentYear, currentWeek],
  )

  const riskAlerts = useMemo<RiskAlert[]>(
    () => detectRisks(habits, currentYear, currentWeek),
    [habits, currentYear, currentWeek],
  )

  return {
    currentWeek,
    currentYear,
    currentMonth,
    habits,
    weekConsistency,
    weekSessions,
    weekMinutes,
    monthMinutes,
    habitCounts,
    insights,
    riskAlerts,
    evolution,
    heatmap,
    hydrated,
  }
}
