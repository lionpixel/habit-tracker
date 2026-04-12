// ─────────────────────────────────────────────
//  Store: Finance
// ─────────────────────────────────────────────

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { MonthlyFinance, FinancialGoal, FinanceStore as FinanceData } from '@/types/finance'
import { emptyMonth } from '@/types/finance'
import { safeParse } from '@/lib/helpers'

const FINANCE_KEY = 'hdb_finance'

function loadFinance(fallback: FinanceData): FinanceData {
  if (typeof window === 'undefined') return fallback
  const raw = localStorage.getItem(FINANCE_KEY)
  return safeParse<FinanceData>(raw, fallback)
}

function saveFinance(data: FinanceData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(FINANCE_KEY, JSON.stringify(data))
}

function currentMonthKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function nanoid(): string {
  return Math.random().toString(36).slice(2, 10)
}

const DEFAULT_FINANCE_DATA: FinanceData = {
  months:  [],
  goals:   [],
  profile: { currency: 'BRL' },
}

// ── Types ────────────────────────────────────

interface FinanceStoreState {
  months:   MonthlyFinance[]
  goals:    FinancialGoal[]
  profile:  FinanceData['profile']
  hydrated: boolean
  hydrate:  () => void

  // Month data
  getMonth:    (monthKey: string) => MonthlyFinance
  updateMonth: (monthKey: string, patch: Partial<MonthlyFinance>) => void

  // Profile
  updateFinanceProfile: (patch: Partial<FinanceData['profile']>) => void

  // Goals
  addGoal:    (goal: Omit<FinancialGoal, 'id' | 'createdAt'>) => void
  updateGoal: (id: string, patch: Partial<FinancialGoal>) => void
  deleteGoal: (id: string) => void
  contributeGoal: (id: string, amount: number) => void
}

// ── Store ────────────────────────────────────

export const useFinanceStore = create<FinanceStoreState>()(
  subscribeWithSelector((set, get) => ({
    months:   DEFAULT_FINANCE_DATA.months,
    goals:    DEFAULT_FINANCE_DATA.goals,
    profile:  DEFAULT_FINANCE_DATA.profile,
    hydrated: false,

    hydrate() {
      const data = loadFinance(DEFAULT_FINANCE_DATA)
      set({ months: data.months, goals: data.goals, profile: data.profile, hydrated: true })
    },

    getMonth(monthKey) {
      return get().months.find((m) => m.monthKey === monthKey) ?? emptyMonth(monthKey)
    },

    updateMonth(monthKey, patch) {
      const { months } = get()
      const exists = months.some((m) => m.monthKey === monthKey)
      const base   = get().getMonth(monthKey)
      const merged = { ...base, ...patch }

      const updated = exists
        ? months.map((m) => (m.monthKey === monthKey ? merged : m))
        : [...months, merged].sort((a, b) => b.monthKey.localeCompare(a.monthKey))

      const data: FinanceData = { months: updated, goals: get().goals, profile: get().profile }
      saveFinance(data)
      set({ months: updated })
    },

    updateFinanceProfile(patch) {
      const updated = { ...get().profile, ...patch }
      const data: FinanceData = { months: get().months, goals: get().goals, profile: updated }
      saveFinance(data)
      set({ profile: updated })
    },

    addGoal(goal) {
      const newGoal: FinancialGoal = {
        ...goal,
        id:        nanoid(),
        createdAt: new Date().toISOString(),
      }
      const updated = [...get().goals, newGoal]
      const data: FinanceData = { months: get().months, goals: updated, profile: get().profile }
      saveFinance(data)
      set({ goals: updated })
    },

    updateGoal(id, patch) {
      const updated = get().goals.map((g) => (g.id === id ? { ...g, ...patch } : g))
      const data: FinanceData = { months: get().months, goals: updated, profile: get().profile }
      saveFinance(data)
      set({ goals: updated })
    },

    deleteGoal(id) {
      const updated = get().goals.filter((g) => g.id !== id)
      const data: FinanceData = { months: get().months, goals: updated, profile: get().profile }
      saveFinance(data)
      set({ goals: updated })
    },

    contributeGoal(id, amount) {
      const updated = get().goals.map((g) =>
        g.id === id
          ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + amount) }
          : g,
      )
      const data: FinanceData = { months: get().months, goals: updated, profile: get().profile }
      saveFinance(data)
      set({ goals: updated })
    },
  })),
)

export { currentMonthKey }
