// ─────────────────────────────────────────────
//  Tipos: Hábitos
// ─────────────────────────────────────────────

export type HabitKey =
  | 'reading'
  | 'english'
  | 'hiit'
  | 'ppci'
  | 'dopamine'
  | 'fasting'

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

export type HabitColor =
  | '#6366f1'  // reading   – índigo
  | '#10b981'  // english   – verde
  | '#ef4444'  // hiit      – vermelho
  | '#f59e0b'  // ppci      – âmbar
  | '#8b5cf6'  // dopamine  – violeta
  | '#06b6d4'  // fasting   – ciano

// Icon identifier for Lucide icon lookup (no emojis)
export type HabitIconId =
  | 'BookOpen'
  | 'Languages'
  | 'Dumbbell'
  | 'Code2'
  | 'Brain'
  | 'Apple'

/** Registro por chave de semana "YYYY-WYYYY" */
export type WeeklyCountMap = Record<string, number>

/** Registro por chave de mês "YYYY-MM" */
export type MonthlyTotalMap = Record<string, number>

export interface HabitBase {
  name:        string
  icon:        HabitIconId    // Lucide icon identifier
  color:       HabitColor
  target:      number         // minutos por sessão
  unit:        string         // ex: "min", "dias"
  frequency:   number         // vezes por semana
  description: string
  counts:      WeeklyCountMap
  monthlyTotals: MonthlyTotalMap
  totalYear:   number
  goalFreq?:      number      // 1-7 vezes/semana
  goalDuration?:  number      // minutos

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
}

export type Habit = HabitBase | EnglishHabit | FastingHabit

export interface HabitsMap {
  reading: HabitBase
  english: EnglishHabit
  hiit: HabitBase
  ppci: HabitBase
  dopamine: HabitBase
  fasting: FastingHabit
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
