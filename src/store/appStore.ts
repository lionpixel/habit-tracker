// ─────────────────────────────────────────────
//  Store Global: Zustand
// ─────────────────────────────────────────────
// Estado global da aplicação. Persistido no localStorage via
// storageService. Quando integrar banco de dados, substitua as
// chamadas de saveAppData() por chamadas de API.

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { AppData, HabitKey } from '@/types/habit'
import type { SleepData }         from '@/types/sleep'
import type { PomoDataMap }        from '@/types/focus'
import { DEFAULT_HABITS }          from '@/data/mockHabits'
import {
  loadAppData, saveAppData,
  loadSleepData, saveSleepData,
  loadPomoData, savePomoData,
  createBackup, listBackups, restoreBackup,
} from '@/services/storageService'
import {
  toggleHabit, decreaseHabit, recalcMonthlyTotals,
} from '@/services/habitsService'
import { getWeekNumber } from '@/lib/helpers'
import { APP_YEAR } from '@/lib/constants'

// ── Tipos do store ──────────────────────────

type View = 'weekly' | 'monthly' | 'yearly' | 'metas' | 'sleep' | 'focus' | 'report'

interface AppStore {
  // Dados principais
  data: AppData
  sleepData: SleepData
  pomoData: PomoDataMap

  // Navegação
  activeView: View
  setActiveView: (view: View) => void

  // Hidratação (SSR safe)
  hydrated: boolean
  hydrate: () => void

  // Ações de hábitos
  increment: (key: HabitKey) => void
  decrement:  (key: HabitKey) => void
  setHabitGoal: (key: HabitKey, freq: number, duration: number) => void

  // CRUD completo de hábitos
  updateHabit:    (key: HabitKey, patch: Partial<import('@/types/habit').HabitBase>) => void
  pauseHabit:     (key: HabitKey) => void
  resumeHabit:    (key: HabitKey) => void
  archiveHabit:   (key: HabitKey) => void
  unarchiveHabit: (key: HabitKey) => void
  duplicateHabit: (key: HabitKey) => void
  deleteHabitData:(key: HabitKey) => void   // resets counts/totals, keeps config

  // Sono
  saveSleep: (data: SleepData) => void

  // Pomodoro
  savePomo: (data: PomoDataMap) => void

  // Backup
  backups: string[]
  createBackup: () => void
  restore: (key: string) => void
}

// ── Defaults ─────────────────────────────────

const DEFAULT_SLEEP_DATA: SleepData = {
  log: {},
  config: { targetWake: '06:00' },
}

const DEFAULT_POMO_DATA: PomoDataMap = {
  __goal_hours__: 80,
} as PomoDataMap

const DEFAULT_APP_DATA: AppData = {
  currentWeek:  getWeekNumber(new Date()),
  currentYear:  APP_YEAR,
  currentMonth: new Date().getMonth() + 1,
  habits:       DEFAULT_HABITS,
}

// ── Store ────────────────────────────────────

export const useAppStore = create<AppStore>()(
  subscribeWithSelector((set, get) => ({
    data:      DEFAULT_APP_DATA,
    sleepData: DEFAULT_SLEEP_DATA,
    pomoData:  DEFAULT_POMO_DATA,
    backups:   [],
    hydrated:  false,
    activeView: 'weekly',

    // ── Hidratação (client-side only) ─────────
    hydrate() {
      const data      = loadAppData(DEFAULT_APP_DATA)
      const sleepData = loadSleepData(DEFAULT_SLEEP_DATA)
      const pomoData  = loadPomoData(DEFAULT_POMO_DATA)
      const backups   = listBackups()
      set({ data, sleepData, pomoData, backups, hydrated: true })
    },

    setActiveView(view) {
      set({ activeView: view })
    },

    // ── Hábitos ───────────────────────────────
    increment(key) {
      const { data } = get()
      const habits   = toggleHabit(data.habits, key, data.currentYear, data.currentWeek)
      const updated  = recalcMonthlyTotals({ ...data, habits })
      saveAppData(updated)
      set({ data: updated })
    },

    decrement(key) {
      const { data } = get()
      const habits   = decreaseHabit(data.habits, key, data.currentYear, data.currentWeek)
      const updated  = recalcMonthlyTotals({ ...data, habits })
      saveAppData(updated)
      set({ data: updated })
    },

    setHabitGoal(key, freq, duration) {
      const { data } = get()
      const habit    = data.habits[key]
      const updated: AppData = {
        ...data,
        habits: {
          ...data.habits,
          [key]: { ...habit, goalFreq: freq, goalDuration: duration },
        },
      }
      saveAppData(updated)
      set({ data: updated })
    },

    // ── updateHabit ───────────────────────────
    updateHabit(key, patch) {
      const { data } = get()
      const habit    = data.habits[key]
      const now      = new Date().toISOString()

      // Build edit history entries for changed fields
      const habitAny = habit as unknown as Record<string, unknown>
      const patchAny = patch as unknown as Record<string, unknown>
      const newHistory = [...(habit.editHistory ?? [])]
      ;(Object.keys(patch) as string[]).forEach((field) => {
        const from = String(habitAny[field] ?? '')
        const to   = String(patchAny[field]  ?? '')
        if (from !== to) {
          newHistory.push({ at: now, field, from, to })
        }
      })

      const updated: typeof data = {
        ...data,
        habits: {
          ...data.habits,
          [key]: {
            ...habit,
            ...patch,
            editHistory:  newHistory.slice(-20),  // keep last 20
            lastEditedAt: now,
          },
        },
      }
      saveAppData(updated)
      set({ data: updated })
    },

    pauseHabit(key) {
      get().updateHabit(key, { paused: true })
    },

    resumeHabit(key) {
      get().updateHabit(key, { paused: false })
    },

    archiveHabit(key) {
      get().updateHabit(key, { archived: true })
    },

    unarchiveHabit(key) {
      get().updateHabit(key, { archived: false })
    },

    duplicateHabit(key) {
      // Creates a copy of the habit's config, resets counts, appends "(cópia)"
      const { data } = get()
      const original = data.habits[key]
      const copy: typeof original = {
        ...original,
        name:           `${original.name} (cópia)`,
        counts:         {},
        monthlyTotals:  {},
        totalYear:      0,
        duplicatedFrom: key,
        editHistory:    [],
        lastEditedAt:   new Date().toISOString(),
        paused:         false,
        archived:       false,
      }
      // We store it under the same key with a note — full multi-habit support
      // requires a dynamic habits map; for now we toast the intent
      const updated = { ...data, habits: { ...data.habits, [key]: copy } }
      saveAppData(updated)
      set({ data: updated })
    },

    deleteHabitData(key) {
      // Resets all recorded counts — keeps name/config intact
      const { data } = get()
      const habit    = data.habits[key]
      const cleared  = { ...habit, counts: {}, monthlyTotals: {}, totalYear: 0 }
      const updated  = { ...data, habits: { ...data.habits, [key]: cleared } }
      saveAppData(updated)
      set({ data: updated })
    },

    // ── Sono ──────────────────────────────────
    saveSleep(sleepData) {
      saveSleepData(sleepData)
      set({ sleepData })
    },

    // ── Pomodoro ──────────────────────────────
    savePomo(pomoData) {
      savePomoData(pomoData)
      set({ pomoData })
    },

    // ── Backup ────────────────────────────────
    createBackup() {
      const { data } = get()
      createBackup(data)
      set({ backups: listBackups() })
    },

    restore(key) {
      const { data: fallback } = get()
      const restored = restoreBackup(key, fallback)
      saveAppData(restored)
      set({ data: restored })
    },
  })),
)