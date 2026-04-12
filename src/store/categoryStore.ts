// ─────────────────────────────────────────────
//  Store: Categories
// ─────────────────────────────────────────────

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { HabitCategory, CategoryId } from '@/types/category'
import { DEFAULT_CATEGORIES } from '@/types/category'
import type { HabitKey } from '@/types/habit'
import { safeParse } from '@/lib/helpers'

const CATEGORY_KEY = 'hdb_categories'

function loadCategories(fallback: HabitCategory[]): HabitCategory[] {
  if (typeof window === 'undefined') return fallback
  const raw = localStorage.getItem(CATEGORY_KEY)
  return safeParse<HabitCategory[]>(raw, fallback)
}

function saveCategories(cats: HabitCategory[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CATEGORY_KEY, JSON.stringify(cats))
}

function buildDefaults(): HabitCategory[] {
  const now = new Date().toISOString()
  return DEFAULT_CATEGORIES.map((d) => ({
    ...d,
    habitKeys: [] as HabitKey[],
    createdAt: now,
  }))
}

// ── Types ─────────────────────────────────────

interface CategoryStore {
  categories: HabitCategory[]
  hydrated:   boolean
  hydrate:    () => void

  // CRUD
  addCategory:    (cat: Omit<HabitCategory, 'createdAt'>) => void
  updateCategory: (id: CategoryId, patch: Partial<HabitCategory>) => void
  archiveCategory:(id: CategoryId) => void
  deleteCategory: (id: CategoryId) => void

  // Habit assignment
  linkHabit:   (categoryId: CategoryId, habitKey: HabitKey) => void
  unlinkHabit: (categoryId: CategoryId, habitKey: HabitKey) => void

  // Goals
  setCategoryGoal: (id: CategoryId, weeklyGoalMin?: number, monthlyGoalMin?: number) => void
}

// ── Store ────────────────────────────────────

export const useCategoryStore = create<CategoryStore>()(
  subscribeWithSelector((set, get) => ({
    categories: buildDefaults(),
    hydrated:   false,

    hydrate() {
      const categories = loadCategories(buildDefaults())
      set({ categories, hydrated: true })
    },

    addCategory(cat) {
      const now = new Date().toISOString()
      const newCat: HabitCategory = { ...cat, createdAt: now }
      const updated = [...get().categories, newCat]
      saveCategories(updated)
      set({ categories: updated })
    },

    updateCategory(id, patch) {
      const now = new Date().toISOString()
      const updated = get().categories.map((c) =>
        c.id === id ? { ...c, ...patch, updatedAt: now } : c,
      )
      saveCategories(updated)
      set({ categories: updated })
    },

    archiveCategory(id) {
      get().updateCategory(id, { archived: true })
    },

    deleteCategory(id) {
      const updated = get().categories.filter((c) => c.id !== id || c.isDefault)
      saveCategories(updated)
      set({ categories: updated })
    },

    linkHabit(categoryId, habitKey) {
      const updated = get().categories.map((c) => {
        if (c.id !== categoryId) return c
        if (c.habitKeys.includes(habitKey)) return c
        return { ...c, habitKeys: [...c.habitKeys, habitKey] }
      })
      saveCategories(updated)
      set({ categories: updated })
    },

    unlinkHabit(categoryId, habitKey) {
      const updated = get().categories.map((c) => {
        if (c.id !== categoryId) return c
        return { ...c, habitKeys: c.habitKeys.filter((k) => k !== habitKey) }
      })
      saveCategories(updated)
      set({ categories: updated })
    },

    setCategoryGoal(id, weeklyGoalMin, monthlyGoalMin) {
      get().updateCategory(id, { weeklyGoalMin, monthlyGoalMin })
    },
  })),
)
