// ─────────────────────────────────────────────
//  Constantes globais do HabitDB
// ─────────────────────────────────────────────

// localStorage keys
export const STORAGE_KEY   = 'habitSciencePro2026Complete'
export const SLEEP_KEY     = 'habitScienceSleep2026'
export const POMO_KEY      = 'habitSciencePomodoro2026'
export const BACKUP_PREFIX = 'habits_backup_'
export const MIGRATION_LOG = 'migrationLog'

// App metadata
export const APP_NAME    = 'HabitDB'
export const APP_YEAR    = 2026
export const APP_VERSION = '0.1.0'

// The 6 original builtin habit keys — always present, cannot be hard-deleted.
export const BUILTIN_HABIT_KEYS = [
  'reading', 'english', 'hiit', 'ppci', 'dopamine', 'fasting',
] as const
export type BuiltinHabitKey = typeof BUILTIN_HABIT_KEYS[number]

// Palette for new user-created habits (cycles through when no color is picked)
export const CUSTOM_HABIT_COLORS = [
  '#7c3aed', '#0ea5e9', '#f97316', '#84cc16', '#ec4899',
  '#14b8a6', '#a78bfa', '#fb923c', '#f43f5e', '#34d399',
] as const

// Nomes dos meses em português
export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março',    'Abril',
  'Maio',    'Junho',     'Julho',    'Agosto',
  'Setembro','Outubro',   'Novembro', 'Dezembro',
] as const

export const DAY_NAMES_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const

// Limites de pomodoros por prioridade/dia
export const POMO_LIMITS: Record<string, number> = {
  P1: 4,
  P2: 3,
  P3: 3,
}
export const POMO_MAX_TOTAL = 10

// Duração de sessão de foco para "deep work"
export const DEEP_WORK_THRESHOLD_MINUTES = 180  // 3h

// Limites de detecção de risco (semanas)
export const RISK_CONSECUTIVE_WEEKS = 2

// Níveis CEFR para inglês (horas acumuladas)
export const CEFR_LEVELS = [
  { level: 'A1', minHours: 0,    maxHours: 100  },
  { level: 'A2', minHours: 100,  maxHours: 250  },
  { level: 'B1', minHours: 250,  maxHours: 500  },
  { level: 'B2', minHours: 500,  maxHours: 800  },
  { level: 'C1', minHours: 800,  maxHours: 1200 },
  { level: 'C2', minHours: 1200, maxHours: Infinity },
] as const

// Duração do desafio sem açúcar
export const SUGAR_FREE_GOAL_DAYS = 40

// Cores dos hábitos
export const HABIT_COLORS = {
  reading:  '#6366f1',
  english:  '#10b981',
  hiit:     '#ef4444',
  ppci:     '#f59e0b',
  dopamine: '#8b5cf6',
  fasting:  '#06b6d4',
} as const

// Dados de comparação (média BR e mundial, min/semana)
export const COMPARISON_DATA = {
  reading:  { brAverage: 40,  worldAverage: 60,  unit: 'min/sem' },
  english:  { brAverage: 30,  worldAverage: 90,  unit: 'min/sem' },
  hiit:     { brAverage: 90,  worldAverage: 150, unit: 'min/sem' },
  ppci:     { brAverage: 20,  worldAverage: 45,  unit: 'min/sem' },
  dopamine: { brAverage: 30,  worldAverage: 60,  unit: 'min/sem' },
  fasting:  { brAverage: 0,   worldAverage: 0,   unit: 'dias'    },
} as const

// Horários padrão para módulo de sono
export const SLEEP_DEFAULTS = {
  targetWake: '06:00',
  prepTime: 30,      // minutos antes de dormir
  sleepDuration: 510, // minutos (8h30)
}

// Número máximo de backups mantidos
export const MAX_BACKUPS = 3

// Variantes de cores para toast
export const TOAST_TYPES = ['success', 'warning', 'info', 'error'] as const
export type ToastType = typeof TOAST_TYPES[number]