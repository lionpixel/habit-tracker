// ─────────────────────────────────────────────
//  Service: LocalStorage (futuramente → DB)
// ─────────────────────────────────────────────
// Para substituir por Supabase/Firebase/Prisma:
//   1. Troque as implementações abaixo por chamadas de API
//   2. As assinaturas das funções permanecem as mesmas
//   3. Adicione `async/await` onde necessário

import type { AppData }   from '@/types/habit'
import type { SleepData } from '@/types/sleep'
import type { PomoDataMap } from '@/types/focus'
import {
  STORAGE_KEY,
  SLEEP_KEY,
  POMO_KEY,
  BACKUP_PREFIX,
  MAX_BACKUPS,
} from '@/lib/constants'
import { safeParse, todayStr } from '@/lib/helpers'

// ── Hábitos ─────────────────────────────────

export function loadAppData(fallback: AppData): AppData {
  if (typeof window === 'undefined') return fallback
  const raw = localStorage.getItem(STORAGE_KEY)
  return safeParse<AppData>(raw, fallback)
}

export function saveAppData(data: AppData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// ── Sono ────────────────────────────────────

export function loadSleepData(fallback: SleepData): SleepData {
  if (typeof window === 'undefined') return fallback
  const raw = localStorage.getItem(SLEEP_KEY)
  return safeParse<SleepData>(raw, fallback)
}

export function saveSleepData(data: SleepData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SLEEP_KEY, JSON.stringify(data))
}

// ── Pomodoro ─────────────────────────────────

export function loadPomoData(fallback: PomoDataMap): PomoDataMap {
  if (typeof window === 'undefined') return fallback
  const raw = localStorage.getItem(POMO_KEY)
  return safeParse<PomoDataMap>(raw, fallback)
}

export function savePomoData(data: PomoDataMap): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(POMO_KEY, JSON.stringify(data))
}

// ── Backup / Restore ─────────────────────────

/** Cria backup diário e mantém apenas os MAX_BACKUPS mais recentes */
export function createBackup(data: AppData): void {
  if (typeof window === 'undefined') return
  const key = `${BACKUP_PREFIX}${todayStr()}`
  localStorage.setItem(key, JSON.stringify(data))
  pruneBackups()
}

function pruneBackups(): void {
  const keys = Object.keys(localStorage)
    .filter((k) => k.startsWith(BACKUP_PREFIX))
    .sort()
    .reverse()

  keys.slice(MAX_BACKUPS).forEach((k) => localStorage.removeItem(k))
}

export function listBackups(): string[] {
  if (typeof window === 'undefined') return []
  return Object.keys(localStorage)
    .filter((k) => k.startsWith(BACKUP_PREFIX))
    .sort()
    .reverse()
}

export function restoreBackup(key: string, fallback: AppData): AppData {
  if (typeof window === 'undefined') return fallback
  const raw = localStorage.getItem(key)
  return safeParse<AppData>(raw, fallback)
}

// ── Export JSON ──────────────────────────────

export function exportDataAsJson(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `habitdb-backup-${todayStr()}.json`
  a.click()
  URL.revokeObjectURL(url)
}