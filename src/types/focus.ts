// ─────────────────────────────────────────────
//  Tipos: Módulo Foco / Pomodoro
// ─────────────────────────────────────────────

export type TaskPriority = 'P1' | 'P2' | 'P3'

export interface PomodoroTask {
  id: string
  name: string
  priority: TaskPriority
  pomodoros: number     // 0-10
  log: string[]         // timestamps "HH:MM"
}

/** Chave: "YYYY-MM-DD" */
export interface DayPomoData {
  tasks: PomodoroTask[]
  total: number         // soma de todos pomodoros do dia
}

export type PomoDataMap = Record<string, DayPomoData> & {
  __goal_hours__?: number
}

export interface FocusMetrics {
  today: number         // minutos hoje
  week: number          // minutos últimos 7 dias
  month: number         // minutos no mês
  deepWorkDays: number  // dias com ≥180 min
  streak: number        // dias consecutivos com ≥1 pomodoro
}

export interface FocusMonthlyData {
  labels: string[]      // dias 1-31
  values: number[]      // minutos por dia
}

export interface RecentSession {
  date: string
  taskName: string
  priority: TaskPriority
  pomodoros: number
  minutes: number
}

export interface PriorityCount {
  P1: number
  P2: number
  P3: number
}