'use client'

import { useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import { getWeekKey, getWeekDates } from '@/lib/helpers'
import { getBRTWeekNumber, addDaysToStr, getTodayStr } from '@/lib/time'
import type { HabitKey } from '@/types/habit'

export interface HeatmapCell {
  weekNum:       number
  year:          number
  startDate:     Date
  endDate:       Date
  consistency:   number     // 0-100
  sessions:      number
  totalPossible: number
  breakdown:     {
    key:   HabitKey
    name:  string
    color: string
    done:  number
    max:   number
  }[]
}

export type HeatmapFilter = '30d' | '90d' | 'year'

export function useHeatmapData(filter: HeatmapFilter = 'year') {
  const { data } = useAppStore()
  const { habits, currentYear } = data

  const allCells = useMemo<HeatmapCell[]>(() => {
    const cells: HeatmapCell[] = []
    for (let w = 1; w <= 52; w++) {
      const { start, end } = getWeekDates(currentYear, w)
      const wKey = getWeekKey(currentYear, w)
      let done = 0, possible = 0

      const breakdown = Object.keys(habits).filter((k) => !habits[k].archived).map((key) => {
        const habit  = habits[key]
        const d      = habit.counts[wKey] ?? 0
        done     += d
        possible += habit.frequency
        return { key, name: habit.name, color: habit.color, done: d, max: habit.frequency }
      })

      cells.push({
        weekNum: w, year: currentYear,
        startDate: start, endDate: end,
        consistency:   possible > 0 ? Math.round((done / possible) * 100) : 0,
        sessions:      done,
        totalPossible: possible,
        breakdown,
      })
    }
    return cells
  }, [habits, currentYear])

  const filteredCells = useMemo<HeatmapCell[]>(() => {
    if (filter === 'year') return allCells
    const days = filter === '30d' ? 30 : 90
    const cutoffStr = addDaysToStr(getTodayStr(), -days)
    const [cy, cm, cd] = cutoffStr.split('-').map(Number)
    const cutoff = new Date(Date.UTC(cy, cm - 1, cd))
    return allCells.filter((c) => c.startDate >= cutoff)
  }, [allCells, filter])

  const stats = useMemo(() => {
    const totalSessions   = filteredCells.reduce((a, c) => a + c.sessions, 0)
    const activeWeeks     = filteredCells.filter((c) => c.sessions > 0).length
    const activeCells     = filteredCells.filter((c) => c.consistency > 0)
    const avgConsistency  = activeCells.length > 0
      ? Math.round(activeCells.reduce((a, c) => a + c.consistency, 0) / activeCells.length)
      : 0
    const bestWeek        = filteredCells.reduce(
      (best, c) => c.consistency > best.consistency ? c : best,
      filteredCells[0] ?? { consistency: 0 } as HeatmapCell,
    )
    return { totalSessions, activeWeeks, avgConsistency, bestWeek }
  }, [filteredCells])

  return { cells: filteredCells, allCells, stats, currentWeekNum: getBRTWeekNumber() }
}
