// ─────────────────────────────────────────────
//  Zustand selectors — memoized with subscribeWithSelector
//
//  Use these instead of `useAppStore((s) => s.something)`
//  inline — they prevent unnecessary re-renders by only
//  subscribing to the slice of state they actually need.
//
//  Each selector is a stable function reference (defined
//  outside components) so Zustand can do shallow equality.
// ─────────────────────────────────────────────

import { useAppStore } from './appStore'
import type { HabitKey } from '@/types/habit'
import { getWeekKey, getMonthKey } from '@/lib/helpers'

// ── Raw slice selectors ──────────────────────

export const selectData      = (s: ReturnType<typeof useAppStore.getState>) => s.data
export const selectHabits    = (s: ReturnType<typeof useAppStore.getState>) => s.data.habits
export const selectSleepData = (s: ReturnType<typeof useAppStore.getState>) => s.sleepData
export const selectPomoData  = (s: ReturnType<typeof useAppStore.getState>) => s.pomoData
export const selectHydrated  = (s: ReturnType<typeof useAppStore.getState>) => s.hydrated
export const selectActiveView = (s: ReturnType<typeof useAppStore.getState>) => s.activeView

// Navigation
export const selectCurrentWeek  = (s: ReturnType<typeof useAppStore.getState>) => s.data.currentWeek
export const selectCurrentYear  = (s: ReturnType<typeof useAppStore.getState>) => s.data.currentYear
export const selectCurrentMonth = (s: ReturnType<typeof useAppStore.getState>) => s.data.currentMonth

// Actions
export const selectIncrement    = (s: ReturnType<typeof useAppStore.getState>) => s.increment
export const selectDecrement    = (s: ReturnType<typeof useAppStore.getState>) => s.decrement
export const selectSetHabitGoal = (s: ReturnType<typeof useAppStore.getState>) => s.setHabitGoal

// ── Derived selectors (computed values) ──────

/**
 * Returns session count for a specific habit in the current week.
 */
export function selectHabitWeekCount(key: HabitKey) {
  return (s: ReturnType<typeof useAppStore.getState>) => {
    const { currentYear, currentWeek, habits } = s.data
    const wKey = getWeekKey(currentYear, currentWeek)
    return habits[key].counts[wKey] ?? 0
  }
}

/**
 * Returns total minutes for a specific habit in the current week.
 */
export function selectHabitWeekMinutes(key: HabitKey) {
  return (s: ReturnType<typeof useAppStore.getState>) => {
    const { currentYear, currentWeek, habits } = s.data
    const wKey   = getWeekKey(currentYear, currentWeek)
    const habit  = habits[key]
    return (habit.counts[wKey] ?? 0) * habit.target
  }
}

/**
 * Returns total sessions across all habits for the current week.
 */
export const selectWeekTotalSessions = (s: ReturnType<typeof useAppStore.getState>) => {
  const { currentYear, currentWeek, habits } = s.data
  const wKey = getWeekKey(currentYear, currentWeek)
  return (Object.keys(habits) as HabitKey[]).reduce(
    (total, key) => total + (habits[key].counts[wKey] ?? 0),
    0,
  )
}

/**
 * Returns total minutes across all habits for the current week.
 */
export const selectWeekTotalMinutes = (s: ReturnType<typeof useAppStore.getState>) => {
  const { currentYear, currentWeek, habits } = s.data
  const wKey = getWeekKey(currentYear, currentWeek)
  return (Object.keys(habits) as HabitKey[]).reduce(
    (total, key) => total + (habits[key].counts[wKey] ?? 0) * habits[key].target,
    0,
  )
}

/**
 * Returns overall consistency percentage for the current week (0-100).
 */
export const selectWeekConsistency = (s: ReturnType<typeof useAppStore.getState>) => {
  const { currentYear, currentWeek, habits } = s.data
  const wKey = getWeekKey(currentYear, currentWeek)
  let done = 0
  let possible = 0
  ;(Object.keys(habits) as HabitKey[]).forEach((key) => {
    done     += habits[key].counts[wKey] ?? 0
    possible += habits[key].frequency
  })
  return possible > 0 ? Math.round((done / possible) * 100) : 0
}

/**
 * Returns total minutes for a specific habit in the current month.
 */
export function selectHabitMonthMinutes(key: HabitKey) {
  return (s: ReturnType<typeof useAppStore.getState>) => {
    const { currentYear, currentMonth, habits } = s.data
    const mKey = getMonthKey(currentYear, currentMonth)
    return habits[key].monthlyTotals[mKey] ?? 0
  }
}

/**
 * Returns total minutes across all habits for the current month.
 */
export const selectMonthTotalMinutes = (s: ReturnType<typeof useAppStore.getState>) => {
  const { currentYear, currentMonth, habits } = s.data
  const mKey = getMonthKey(currentYear, currentMonth)
  return (Object.keys(habits) as HabitKey[]).reduce(
    (total, key) => total + (habits[key].monthlyTotals[mKey] ?? 0),
    0,
  )
}

/**
 * Returns the habit key with the highest month total.
 */
export const selectBestHabitThisMonth = (s: ReturnType<typeof useAppStore.getState>) => {
  const { currentYear, currentMonth, habits } = s.data
  const mKey = getMonthKey(currentYear, currentMonth)
  return (Object.keys(habits) as HabitKey[]).reduce((best, key) =>
    (habits[key].monthlyTotals[mKey] ?? 0) > (habits[best].monthlyTotals[mKey] ?? 0)
      ? key
      : best,
    'reading' as HabitKey,
  )
}

/**
 * Returns fasting current streak.
 */
export const selectFastingStreak = (s: ReturnType<typeof useAppStore.getState>) =>
  s.data.habits.fasting.currentStreak

// ── React hook wrappers ───────────────────────
// Convenience hooks that wrap useAppStore with the selectors above.

export function useWeekConsistency()    { return useAppStore(selectWeekConsistency) }
export function useWeekTotalMinutes()   { return useAppStore(selectWeekTotalMinutes) }
export function useWeekTotalSessions()  { return useAppStore(selectWeekTotalSessions) }
export function useMonthTotalMinutes()  { return useAppStore(selectMonthTotalMinutes) }
export function useBestHabitThisMonth() { return useAppStore(selectBestHabitThisMonth) }
export function useFastingStreak()      { return useAppStore(selectFastingStreak) }

export function useHabitWeekCount(key: HabitKey) {
  return useAppStore(selectHabitWeekCount(key))
}
export function useHabitWeekMinutes(key: HabitKey) {
  return useAppStore(selectHabitWeekMinutes(key))
}
export function useHabitMonthMinutes(key: HabitKey) {
  return useAppStore(selectHabitMonthMinutes(key))
}
