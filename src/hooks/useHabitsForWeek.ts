'use client'

import { useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import {
  selectCurrentWeek,
  selectCurrentYear,
  selectHabits,
  selectSetHabitCompletion,
} from '@/store/selectors'
import { getWeekDaysBRT, getTodayStr } from '@/lib/time'
import { getHabitStreak, isHabitDoneOnDate, isHabitScheduledForDate } from '@/services/habitsService'
import type { HabitKey } from '@/types/habit'

export type PlannerDayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export interface PlannerHabitItem {
  key: HabitKey
  name: string
  color: string
  date: string
  done: boolean
  streak: number
  meta: string
  locked: boolean
}

const DAY_KEYS: PlannerDayKey[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

export function useHabitsForWeek(yearArg?: number, weekArg?: number) {
  const habits = useAppStore(selectHabits)
  const setHabitCompletion = useAppStore(selectSetHabitCompletion)
  const currentYear = useAppStore(selectCurrentYear)
  const currentWeek = useAppStore(selectCurrentWeek)

  const year = yearArg ?? currentYear
  const week = weekArg ?? currentWeek

  const weekDates = useMemo(() => getWeekDaysBRT(year, week), [year, week])
  const todayStr = getTodayStr()

  const byDay = useMemo(() => {
    return weekDates.reduce((acc, date, index) => {
      const dayKey = DAY_KEYS[index]
      // Exclude archived habits and the special fasting habit from the planner
      const plannerKeys = Object.keys(habits).filter(
        (k) => !habits[k].archived && !(habits[k] as { isSpecial?: boolean }).isSpecial,
      )
      acc[dayKey] = plannerKeys
        .filter((key) => isHabitScheduledForDate(habits[key], date))
        .map((key) => {
          const habit = habits[key]
          const done = isHabitDoneOnDate(habits, key, date)
          const goalFreq = habit.goalFreq ?? habit.frequency
          const goalDuration = habit.goalDuration ?? habit.target
          return {
            key,
            name: habit.name,
            color: habit.color,
            date,
            done,
            streak: getHabitStreak(habits, key, date),
            meta: `${goalDuration}${habit.unit} • ${goalFreq}x/sem`,
            locked: date > todayStr,
          }
        })
      return acc
    }, {} as Record<PlannerDayKey, PlannerHabitItem[]>)
  }, [habits, todayStr, weekDates])

  function toggleHabit(key: HabitKey, date: string, done: boolean) {
    setHabitCompletion(key, date, done)
  }

  function getHabitsForDay(day: PlannerDayKey): PlannerHabitItem[] {
    return byDay[day] ?? []
  }

  return {
    weekDates,
    byDay,
    getHabitsForDay,
    toggleHabit,
  }
}
