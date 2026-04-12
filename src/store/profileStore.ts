// ─────────────────────────────────────────────
//  Store: Physical Profile & Body Evolution
// ─────────────────────────────────────────────

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { PhysicalProfile, BodyCheckIn, ProfileStore as ProfileData } from '@/types/profile'
import { computeIMC, computeLeanMass, computeFatMass } from '@/types/profile'
import { safeParse, todayStr } from '@/lib/helpers'

const PROFILE_KEY = 'hdb_profile'

function loadProfile(fallback: ProfileData): ProfileData {
  if (typeof window === 'undefined') return fallback
  const raw = localStorage.getItem(PROFILE_KEY)
  return safeParse<ProfileData>(raw, fallback)
}

function saveProfile(data: ProfileData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PROFILE_KEY, JSON.stringify(data))
}

const DEFAULT_PROFILE_DATA: ProfileData = {
  profile: {},
  history: [],
}

// ── Types ────────────────────────────────────

interface ProfileStoreState {
  profile:  PhysicalProfile
  history:  BodyCheckIn[]
  hydrated: boolean
  hydrate:  () => void

  updateProfile: (patch: Partial<PhysicalProfile>) => void

  // Check-in — creates or updates the entry for today (or given date)
  saveCheckIn: (entry: Partial<BodyCheckIn> & { date?: string }) => void
  deleteCheckIn: (date: string) => void
}

// ── Store ────────────────────────────────────

export const useProfileStore = create<ProfileStoreState>()(
  subscribeWithSelector((set, get) => ({
    profile:  DEFAULT_PROFILE_DATA.profile,
    history:  DEFAULT_PROFILE_DATA.history,
    hydrated: false,

    hydrate() {
      const data = loadProfile(DEFAULT_PROFILE_DATA)
      set({ profile: data.profile, history: data.history, hydrated: true })
    },

    updateProfile(patch) {
      const now = new Date().toISOString()
      const base = get().profile
      const merged: PhysicalProfile = { ...base, ...patch, updatedAt: now }

      // Recompute derived fields when weight / bodyFat / height change
      const w  = merged.weight   ?? base.weight
      const bf = merged.bodyFat  ?? base.bodyFat
      const h  = merged.height   ?? base.height

      if (w && h)  merged.imc      = computeIMC(w, h)
      if (w && bf) merged.leanMass = computeLeanMass(w, bf)
      if (w && bf) merged.fatMass  = computeFatMass(w, bf)

      const data: ProfileData = { profile: merged, history: get().history }
      saveProfile(data)
      set({ profile: merged })
    },

    saveCheckIn(entry) {
      const date    = entry.date ?? todayStr()
      const history = get().history
      const existing = history.find((e) => e.date === date) ?? {}

      // Merge and recompute derived fields
      const merged: BodyCheckIn = { ...existing, ...entry, date }
      if (merged.weight && merged.bodyFat) {
        merged.leanMass = computeLeanMass(merged.weight, merged.bodyFat)
        merged.fatMass  = computeFatMass(merged.weight, merged.bodyFat)
      }
      const profile = get().profile
      if (merged.weight && profile.height) {
        merged.imc = computeIMC(merged.weight, profile.height)
      }

      const updated = history.some((e) => e.date === date)
        ? history.map((e) => (e.date === date ? merged : e))
        : [...history, merged].sort((a, b) => b.date.localeCompare(a.date))

      // Also update current profile with latest values
      const now = new Date().toISOString()
      const updatedProfile: PhysicalProfile = {
        ...profile,
        ...(merged.weight   !== undefined && { weight:   merged.weight }),
        ...(merged.bodyFat  !== undefined && { bodyFat:  merged.bodyFat }),
        ...(merged.leanMass !== undefined && { leanMass: merged.leanMass }),
        ...(merged.fatMass  !== undefined && { fatMass:  merged.fatMass }),
        ...(merged.waist    !== undefined && { waist:    merged.waist }),
        ...(merged.imc      !== undefined && { imc:      merged.imc }),
        updatedAt: now,
      }

      const data: ProfileData = { profile: updatedProfile, history: updated }
      saveProfile(data)
      set({ profile: updatedProfile, history: updated })
    },

    deleteCheckIn(date) {
      const updated = get().history.filter((e) => e.date !== date)
      const data: ProfileData = { profile: get().profile, history: updated }
      saveProfile(data)
      set({ history: updated })
    },
  })),
)
