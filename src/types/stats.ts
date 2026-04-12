// ─────────────────────────────────────────────
//  Tipos: Estatísticas e Gráficos
// ─────────────────────────────────────────────

import type { HabitKey } from './habit'

export interface StatCard {
  label: string
  value: string | number
  meta?: string
  icon: string
  color: string
}

export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string
  borderWidth?: number
  fill?: boolean
  tension?: number
}

export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export interface WeeklyChartData {
  allHabits: ChartData
  evolution: ChartData    // últimas 8 semanas
}

export interface MonthlyGridItem {
  monthKey: string
  monthName: string
  totals: Record<HabitKey, number>
}

export interface YearlyStats {
  totalMinutes: number
  totalSessions: number
  bestHabit: HabitKey
  avgConsistency: number  // %
}

export interface ComparisonData {
  brAverage: number       // min/sem (média Brasil)
  worldAverage: number    // min/sem (média mundial)
  unit: string
}

export type ComparisonMap = Record<HabitKey, ComparisonData>

// ─────────────────────────────────────────────
//  Tipos: Metas
// ─────────────────────────────────────────────
export interface MetaSummary {
  hoursThisMonth: number
  hoursYTD: number
  bestHabit: string
  currentStreak: number
}

export interface HabitMetaCard {
  habitKey: HabitKey
  goalFreq: number
  goalDuration: number
  sessionsGoal: number    // freq × 4.33
  timeGoal: number        // sessionsGoal × duration (min)
  sessionsDone: number
  timeDone: number
  progressPct: number
  streak: number
  consistency: number     // %
  heatmapData: HeatmapDay[]
  miniCalData: MiniCalDay[]
}

export interface HeatmapDay {
  date: string            // "YYYY-MM-DD"
  intensity: 0 | 1 | 2 | 3 | 4
}

export interface MiniCalDay {
  date: string
  status: 'done' | 'missed' | 'today' | 'empty' | 'not-required'
}