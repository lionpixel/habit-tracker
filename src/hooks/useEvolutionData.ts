'use client'

import { useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import { getWeekKey } from '@/lib/helpers'
import type { HabitKey } from '@/types/habit'

const HABIT_KEYS: HabitKey[] = ['reading', 'english', 'hiit', 'ppci', 'dopamine', 'fasting']

export interface EvolutionPoint {
  label:        string     // "S14"
  weekNum:      number
  consistency:  number     // 0-100
  sessions:     number
  minutes:      number
  isCurrent:    boolean
}

export function useEvolutionData(weeksBack = 8) {
  const { data } = useAppStore()
  const { habits, currentWeek, currentYear } = data

  const points = useMemo<EvolutionPoint[]>(() => {
    const result: EvolutionPoint[] = []
    for (let offset = weeksBack - 1; offset >= 0; offset--) {
      let w = currentWeek - offset
      let y = currentYear
      if (w <= 0) { w += 52; y -= 1 }

      const wKey = getWeekKey(y, w)
      let done = 0, possible = 0, minutes = 0

      HABIT_KEYS.forEach((key) => {
        const habit = habits[key]
        const d     = habit.counts[wKey] ?? 0
        done     += d
        possible += habit.frequency
        minutes  += d * habit.target
      })

      result.push({
        label:       `S${w}`,
        weekNum:     w,
        consistency: possible > 0 ? Math.round((done / possible) * 100) : 0,
        sessions:    done,
        minutes,
        isCurrent:   offset === 0,
      })
    }
    return result
  }, [habits, currentWeek, currentYear, weeksBack])

  const hasData    = points.some((p) => p.sessions > 0)
  const avgConsist = points.length > 0
    ? Math.round(points.reduce((a, p) => a + p.consistency, 0) / points.length)
    : 0

  // trend: compare last 4 weeks vs previous 4 weeks
  const half  = Math.floor(points.length / 2)
  const first = points.slice(0, half)
  const last  = points.slice(half)
  const avgFirst = first.reduce((a, p) => a + p.consistency, 0) / (first.length || 1)
  const avgLast  = last.reduce((a, p) => a + p.consistency, 0)  / (last.length  || 1)
  const trend    = Math.round(avgLast - avgFirst)

  return { points, hasData, avgConsist, trend }
}
