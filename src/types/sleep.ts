// ─────────────────────────────────────────────
//  Tipos: Módulo Sono
// ─────────────────────────────────────────────

export interface SleepEntry {
  wakeTime: string        // "HH:MM"
  sleepTime: string | null
  timestamp: string       // ISO string
}

/** Chave: "YYYY-MM-DD" */
export type SleepLog = Record<string, SleepEntry>

export interface SleepConfig {
  targetWake: string      // "HH:MM" (padrão: "06:00")
}

export interface SleepData {
  log: SleepLog
  config: SleepConfig
}

export interface SleepPlan {
  wake: string
  shutdown: string
  bedtime: string
  nextWake: string
}

export interface SleepEnergyScore {
  total: number           // 0-100
  duration: number        // 0-40
  consistency: number     // 0-30
  regularity: number      // 0-30
}

export interface AdjustmentStep {
  date: string
  wakeTime: string
  status: 'done' | 'today' | 'future' | 'target'
}

export type SleepHistoryBadge = 'ok' | 'near' | 'off'

export interface SleepHistoryItem {
  date: string
  wakeTime: string
  sleepTime: string | null
  badge: SleepHistoryBadge
}