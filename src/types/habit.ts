// ─────────────────────────────────────────────
//  Tipos: Hábitos
// ─────────────────────────────────────────────

// Widened to string to support user-created habits with dynamic keys.
// The builtin keys are still valid string literals.
export type HabitKey = string

// ─────────────────────────────────────────────
//  Recurrence
// ─────────────────────────────────────────────
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6   // 0=Sun … 6=Sat
export type RecurrenceType =
  | 'daily'
  | 'weekdays'
  | 'weekends'
  | 'custom_week'    // custom days of week
  | 'times_per_week' // N times per week, any day
  | 'times_per_month'

export interface RecurrenceConfig {
  type:           RecurrenceType
  timesPerWeek?:  number         // 1-7
  timesPerMonth?: number         // 1-31
  daysOfWeek?:    DayOfWeek[]    // which days when type = custom_week
}

// ─────────────────────────────────────────────
//  Duration
// ─────────────────────────────────────────────
export type DurationUnit = 'min' | 'hours' | 'days' | 'pomodoros'

export interface DurationConfig {
  value: number
  unit:  DurationUnit
}

// ─────────────────────────────────────────────
//  Edit history
// ─────────────────────────────────────────────
export interface HabitEditEntry {
  at:    string   // ISO date
  field: string
  from:  string
  to:    string
}

// Widened to string to support custom colors beyond the original 6.
export type HabitColor = string

// Widened to string; icon registry validates at render time via HabitIcon component.
export type HabitIconId = string

// ─────────────────────────────────────────────
//  Meta type — controls label & tracking mode
// ─────────────────────────────────────────────
export type MetaType = 'sessoes' | 'tempo' | 'paginas' | 'streak'

/** Registro por chave de semana "YYYY-WYYYY" */
export type WeeklyCountMap = Record<string, number>

/** Registro por chave de mês "YYYY-MM" */
export type MonthlyTotalMap = Record<string, number>
export type DailyCompletionMap = Record<string, number>

export interface FastingHistoryEntry {
  startedAt: string
  endedAt: string
  completed: boolean
  reason: 'completed' | 'broken' | 'reset'
  progressDays: number
}

export interface HabitBase {
  name:        string
  icon:        HabitIconId    // Lucide icon identifier
  color:       HabitColor
  target:      number         // minutos por sessão (or pages/streak units)
  unit:        string         // ex: "min", "dias", "páginas"
  frequency:   number         // vezes por semana
  description: string
  counts:      WeeklyCountMap
  dailyLog?:   DailyCompletionMap
  monthlyTotals: MonthlyTotalMap
  totalYear:   number
  goalFreq?:      number      // 1-7 vezes/semana
  goalDuration?:  number      // minutos (or target unit)
  metaType?:      MetaType    // controls display label in cards

  // ── Extended fields ──────────────────────
  category?:        string             // 'health' | 'learning' | 'mindset' | 'nutrition' | 'custom'
  scheduleTime?:    string             // "HH:MM" — optional daily time
  startDate?:       string             // "YYYY-MM-DD"
  endDate?:         string             // "YYYY-MM-DD"
  recurrence?:      RecurrenceConfig
  duration?:        DurationConfig     // explicit duration (overrides target)
  paused?:          boolean
  archived?:        boolean
  editHistory?:     HabitEditEntry[]
  lastEditedAt?:    string             // ISO date
  duplicatedFrom?:  string             // original habit key
  weeklyGoalMin?:   number             // total minutes goal per week
  monthlyGoalMin?:  number             // total minutes goal per month
  timesPerDay?:     number             // how many times per day (default 1)
}

export interface EnglishHabit extends HabitBase {
  seriesCounts: WeeklyCountMap
  carryoverMinutes: number
}

export interface FastingHabit extends HabitBase {
  currentStreak:    number
  completedCycles:  number
  lastUpdate:       string    // "YYYY-MM-DD"
  lastReset:        string    // "YYYY-MM-DD"
  isSpecial:        true
  // ── Fasting-specific ───────────────────
  fastingDays?:     number    // total days in challenge (default 40)
  fastingStartDate?: string   // "YYYY-MM-DD"
  fastingEndDate?:  string    // "YYYY-MM-DD" computed
  fastingComplete?: boolean
  fastingCompletedAt?: string // "YYYY-MM-DD"
  longestStreak?:   number
  // ── Daily log ─────────────────────────
  fastingLog?:      { date: string; completed: boolean }[] // legacy — kept for notes compat
  fastingNotes?:    Record<string, string>                 // optional notes per day
  fastingYearTotal?: number                                // computed: cycles*days + progress
  fastingHistory?:  FastingHistoryEntry[]
}

export type Habit = HabitBase | EnglishHabit | FastingHabit

// Index signature allows user-created habits with dynamic string keys.
// Named properties still have their specific types for builtin habits.
export interface HabitsMap {
  reading: HabitBase
  english: EnglishHabit
  hiit: HabitBase
  ppci: HabitBase
  dopamine: HabitBase
  fasting: FastingHabit
  [key: string]: Habit
}

// ─────────────────────────────────────────────
//  Estado global da aplicação
// ─────────────────────────────────────────────
export interface AppData {
  currentWeek: number
  currentYear: number
  currentMonth: number
  habits: HabitsMap
}

// ─────────────────────────────────────────────
//  Detecção de risco
// ─────────────────────────────────────────────
export type RiskLevel = 'critical' | 'high' | 'medium'

export interface RiskAlert {
  habitKey: HabitKey
  habitName: string
  level: RiskLevel
  message: string
  suggestion: string
}

// ─────────────────────────────────────────────
//  Insights
// ─────────────────────────────────────────────
export type InsightType = 'success' | 'warning' | 'info' | 'tip'

export interface Insight {
  type: InsightType
  iconId: string   // Lucide icon identifier
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: 'performance' | 'risk' | 'streak' | 'trend' | 'goal'
}
