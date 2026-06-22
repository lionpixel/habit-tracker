// ─────────────────────────────────────────────
//  Tipos: Módulo Sono
// ─────────────────────────────────────────────

export interface SleepEntry {
  wakeTime:  string           // "HH:MM"
  sleepTime: string | null
  timestamp: string           // ISO string
  quality?:  1 | 2 | 3 | 4 | 5
  notes?:    string
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
  wake:        string   // hoje acordou
  bedtime:     string   // hoje dormir (wake + 16h)
  screenOff:   string   // desligar telas (bedtime - 2h)
  nextWake:    string   // amanhã acordar (wake - 30min)
  nextBedtime: string   // amanhã dormir (nextWake + 16h)
  shutdown:    string   // alias de screenOff para compatibilidade
}

export interface SleepRulesResult {
  plan:       SleepPlan
  daysToGoal: number   // dias até atingir meta de acordar
  onGoal:     boolean  // já na meta
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
  durationMin?: number   // computed when sleepTime is available
  wakeMinutes?: number   // HH:MM → minutes (for charting)
}