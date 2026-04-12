// ─────────────────────────────────────────────
//  Store: Quadro dos Sonhos
// ─────────────────────────────────────────────

import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import type { Dream, DreamCategory, DreamStatus } from '@/types/dreams'

interface DreamsState {
  dreams: Dream[]
  addDream:    (payload: Omit<Dream, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateDream: (id: string, patch: Partial<Omit<Dream, 'id' | 'createdAt'>>) => void
  deleteDream: (id: string) => void
  setProgress: (id: string, progress: number) => void
  setStatus:   (id: string, status: DreamStatus) => void
  getDreamsByCategory: (category: DreamCategory) => Dream[]
  getActiveDreams:     () => Dream[]
  getAchievedDreams:   () => Dream[]
}

function uid() { return Math.random().toString(36).slice(2, 11) }
function now() { return new Date().toISOString() }

export const useDreamsStore = create<DreamsState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      dreams: [],

      addDream: (payload) => {
        const dream: Dream = { ...payload, id: uid(), createdAt: now(), updatedAt: now() }
        set((s) => ({ dreams: [...s.dreams, dream] }))
      },

      updateDream: (id, patch) =>
        set((s) => ({
          dreams: s.dreams.map((d) =>
            d.id === id ? { ...d, ...patch, updatedAt: now() } : d,
          ),
        })),

      deleteDream: (id) =>
        set((s) => ({ dreams: s.dreams.filter((d) => d.id !== id) })),

      setProgress: (id, progress) =>
        set((s) => ({
          dreams: s.dreams.map((d) =>
            d.id === id
              ? { ...d, progress: Math.min(100, Math.max(0, progress)), updatedAt: now() }
              : d,
          ),
        })),

      setStatus: (id, status) =>
        set((s) => ({
          dreams: s.dreams.map((d) =>
            d.id === id
              ? { ...d, status, progress: status === 'achieved' ? 100 : d.progress, updatedAt: now() }
              : d,
          ),
        })),

      getDreamsByCategory: (category) =>
        get().dreams.filter((d) => d.category === category),

      getActiveDreams:   () => get().dreams.filter((d) => d.status === 'active'),
      getAchievedDreams: () => get().dreams.filter((d) => d.status === 'achieved'),
    })),
    { name: 'hdb_dreams' },
  ),
)
