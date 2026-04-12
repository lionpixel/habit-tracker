// ─────────────────────────────────────────────
//  Habit Service — preparado para backend real
//  Replace implementations with API calls when
//  connecting Supabase / Prisma
// ─────────────────────────────────────────────

import type { HabitsMap, HabitBase } from '@/types/habit'

export interface DashboardData {
  currentWeek:  number
  currentYear:  number
  habits:       HabitsMap
}

export const habitService = {
  /**
   * Fetch all habits for the current user.
   * Replace with: apiClient.get<HabitsMap>('/api/habits')
   */
  async fetchHabits(): Promise<HabitsMap | null> {
    if (typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem('habitdb-habits')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  /**
   * Fetch full dashboard data (habits + week/year context).
   * Replace with: apiClient.get<DashboardData>('/api/dashboard')
   */
  async fetchDashboardData(): Promise<DashboardData | null> {
    if (typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem('habitdb-app-data')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  /**
   * Save / update a single habit.
   * Replace with: apiClient.put(`/api/habits/${key}`, habit)
   */
  async saveHabit(key: string, habit: HabitBase): Promise<HabitBase | null> {
    if (typeof window === 'undefined') return null
    try {
      const existing = await habitService.fetchHabits()
      if (!existing) return null
      const updated = { ...existing, [key]: habit }
      localStorage.setItem('habitdb-habits', JSON.stringify(updated))
      return habit
    } catch {
      return null
    }
  },

  /**
   * Record a session increment for a habit in a specific week.
   * Replace with: apiClient.post(`/api/habits/${key}/log`, { weekKey, delta })
   */
  async logSession(
    key: string,
    weekKey: string,
    delta: 1 | -1,
  ): Promise<{ weekKey: string; count: number } | null> {
    if (typeof window === 'undefined') return null
    try {
      const existing = await habitService.fetchHabits()
      if (!existing) return null
      const habit = (existing as unknown as Record<string, HabitBase>)[key]
      if (!habit) return null
      const prev  = habit.counts[weekKey] ?? 0
      const count = Math.max(0, prev + delta)
      habit.counts[weekKey] = count
      ;(existing as unknown as Record<string, HabitBase>)[key] = habit
      localStorage.setItem('habitdb-habits', JSON.stringify(existing))
      return { weekKey, count }
    } catch {
      return null
    }
  },

  /**
   * Delete a habit by key.
   * Replace with: apiClient.delete(`/api/habits/${key}`)
   */
  async deleteHabit(key: string): Promise<void> {
    if (typeof window === 'undefined') return
    try {
      const existing = await habitService.fetchHabits()
      if (!existing) return
      delete (existing as unknown as Record<string, HabitBase>)[key]
      localStorage.setItem('habitdb-habits', JSON.stringify(existing))
    } catch {
      // silent fail — will be surfaced by real backend
    }
  },

  /**
   * Reset all counts for a given week (admin / debug utility).
   * Replace with: apiClient.delete(`/api/habits/counts/${weekKey}`)
   */
  async resetWeek(weekKey: string): Promise<void> {
    if (typeof window === 'undefined') return
    try {
      const existing = await habitService.fetchHabits()
      if (!existing) return
      const habits = existing as unknown as Record<string, HabitBase>
      Object.keys(habits).forEach((k) => {
        if (habits[k].counts[weekKey] !== undefined) {
          delete habits[k].counts[weekKey]
        }
      })
      localStorage.setItem('habitdb-habits', JSON.stringify(habits))
    } catch {
      // silent fail
    }
  },
}
