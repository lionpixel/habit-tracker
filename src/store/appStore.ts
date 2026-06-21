// ─────────────────────────────────────────────
//  Store Global: Zustand
// ─────────────────────────────────────────────
// Estado global da aplicação. Persistido no localStorage via
// storageService. Quando integrar banco de dados, substitua as
// chamadas de saveAppData() por chamadas de API.

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { AppData, HabitKey, FastingHabit } from '@/types/habit'
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
  toggleHabit, decreaseHabit, recalcMonthlyTotals, setHabitCompletionForDate,
} from '@/services/habitsService'
import { getBRTWeekNumber, getBRTMonth, getBRTYear, getTodayStr, diffInDays } from '@/lib/time'
import { HISTORICAL_MINUTES } from '@/data/historicalData'
import { calculateFastingProgress } from '@/lib/fastingUtils'

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
  setHabitCompletion: (key: HabitKey, date: string, done: boolean) => void
  setHabitGoal: (key: HabitKey, freq: number, duration: number) => void

  // CRUD completo de hábitos
  updateHabit:    (key: HabitKey, patch: Partial<import('@/types/habit').HabitBase>) => void
  addHabit:       (key: string, habit: import('@/types/habit').HabitBase) => void
  removeHabit:    (key: string) => void     // hard delete — only for non-builtin habits
  pauseHabit:     (key: HabitKey) => void
  resumeHabit:    (key: HabitKey) => void
  archiveHabit:   (key: HabitKey) => void
  unarchiveHabit: (key: HabitKey) => void
  duplicateHabit: (key: HabitKey) => void
  deleteHabitData:(key: HabitKey) => void   // resets counts/totals, keeps config

  // Jejum
  startFasting:   () => void
  resetFasting:   () => void
  breakFasting:   () => void

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
  currentWeek:  getBRTWeekNumber(),
  currentYear:  getBRTYear(),
  currentMonth: getBRTMonth(),
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
      const raw       = loadAppData(DEFAULT_APP_DATA)
      const sleepData = loadSleepData(DEFAULT_SLEEP_DATA)
      const pomoData  = loadPomoData(DEFAULT_POMO_DATA)
      const backups   = listBackups()

      // Mescla dados históricos Q1 2026 no que vier do localStorage.
      // Garante que monthlyTotals e totalYear estejam sempre corretos,
      // independente do estado anterior do localStorage.
      const habits = { ...raw.habits } as typeof raw.habits
      ;(Object.keys(HISTORICAL_MINUTES) as HabitKey[]).forEach((key) => {
        const historicalMonths = HISTORICAL_MINUTES[key]
        const habit = habits[key]
        if (!habit) return

        const merged = { ...habit.monthlyTotals }
        Object.entries(historicalMonths).forEach(([mk, min]) => {
          // Só sobrescreve se o valor histórico for maior que o armazenado
          // (protege sessões extras que o usuário possa ter registrado)
          if ((merged[mk] ?? 0) < min) merged[mk] = min
        })

        // Recalcula totalYear como soma de todos os monthlyTotals
        const totalYear = Object.values(merged).reduce((a, b) => a + b, 0)

        ;(habits as unknown as Record<string, typeof habit>)[key] = {
          ...habit,
          monthlyTotals: merged,
          totalYear,
        }
      })

      // Auto-complete fasting if enough BRT calendar days have elapsed
      const fastingHabit = habits.fasting as FastingHabit
      if (fastingHabit.fastingStartDate && !fastingHabit.fastingComplete) {
        const todayBRT    = getTodayStr()
        const daysElapsed = Math.max(0, diffInDays(fastingHabit.fastingStartDate, todayBRT))
        const totalDays   = fastingHabit.fastingDays ?? 40
        if (daysElapsed >= totalDays) {
          ;(habits as unknown as Record<string, FastingHabit>)['fasting'] = {
            ...fastingHabit,
            fastingComplete:    true,
            fastingCompletedAt: fastingHabit.fastingCompletedAt ?? todayBRT,
            longestStreak:      Math.max(totalDays, fastingHabit.longestStreak ?? 0),
          }
        }
      }

      const fastingProgress = calculateFastingProgress(habits.fasting as FastingHabit)
      ;(habits as unknown as Record<string, FastingHabit>)['fasting'] = {
        ...(habits.fasting as FastingHabit),
        currentStreak: fastingProgress.progressDays,
      }

      const data = { ...raw, habits }
      saveAppData(data)
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

    setHabitCompletion(key, date, done) {
      const { data } = get()
      const habits   = setHabitCompletionForDate(data.habits, key, date, done)
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

    // ── addHabit ──────────────────────────────
    addHabit(key, habit) {
      const { data } = get()
      if (data.habits[key]) return  // key already exists, use updateHabit
      const updated = { ...data, habits: { ...data.habits, [key]: habit } }
      saveAppData(updated)
      set({ data: updated })
    },

    // ── removeHabit ───────────────────────────
    removeHabit(key) {
      const { data } = get()
      const { [key]: _removed, ...rest } = data.habits as Record<string, import('@/types/habit').Habit>
      const updated = { ...data, habits: rest as typeof data.habits }
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

    // ── Jejum ─────────────────────────────────

    startFasting() {
      get().resetFasting()
    },

    resetFasting() {
      const { data } = get()
      const fasting  = data.habits.fasting
      const today    = getTodayStr()
      const progress = calculateFastingProgress(fasting)

      const shouldAppendHistory = Boolean(fasting.fastingStartDate)
      const historyEntry = shouldAppendHistory
        ? {
            startedAt: fasting.fastingStartDate!,
            endedAt: fasting.fastingCompletedAt ?? today,
            completed: Boolean(fasting.fastingComplete),
            reason: fasting.fastingComplete ? ('completed' as const) : ('reset' as const),
            progressDays: progress.progressDays,
          }
        : null

      const completedCycles = fasting.fastingComplete
        ? fasting.completedCycles + 1
        : fasting.completedCycles

      const totalDays     = fasting.fastingDays ?? 40
      const longestStreak = Math.max(progress.progressDays, fasting.longestStreak ?? 0, fasting.fastingComplete ? totalDays : 0)

      const updated = {
        ...data,
        habits: {
          ...data.habits,
          fasting: {
            ...fasting,
            currentStreak:      0,
            fastingStartDate:   today,
            fastingEndDate:     undefined,
            fastingComplete:    false,
            fastingCompletedAt: undefined,
            completedCycles,
            longestStreak,
            lastReset:  today,
            lastUpdate: today,
            fastingHistory: historyEntry
              ? [...(fasting.fastingHistory ?? []), historyEntry]
              : (fasting.fastingHistory ?? []),
          },
        },
      }
      saveAppData(updated)
      set({ data: updated })
    },

    breakFasting() {
      const { data } = get()
      const fasting  = data.habits.fasting
      const today    = getTodayStr()
      const progress = calculateFastingProgress(fasting)

      const historyEntry = fasting.fastingStartDate
        ? {
            startedAt: fasting.fastingStartDate,
            endedAt: today,
            completed: false,
            reason: 'broken' as const,
            progressDays: progress.progressDays,
          }
        : null

      const longestStreak = Math.max(progress.progressDays, fasting.longestStreak ?? 0)

      const updated = {
        ...data,
        habits: {
          ...data.habits,
          fasting: {
            ...fasting,
            currentStreak:      0,
            fastingStartDate:   today,
            fastingEndDate:     undefined,
            fastingComplete:    false,
            fastingCompletedAt: undefined,
            longestStreak,
            lastReset:  today,
            lastUpdate: today,
            fastingHistory: historyEntry
              ? [...(fasting.fastingHistory ?? []), historyEntry]
              : (fasting.fastingHistory ?? []),
          },
        },
      }
      saveAppData(updated)
      set({ data: updated })
    },
  })),
)
