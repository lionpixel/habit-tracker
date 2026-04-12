// ─────────────────────────────────────────────
//  Achievement Service — preparado para backend real
//  Replace localStorage logic with API calls
// ─────────────────────────────────────────────

import type { HabitsMap } from '@/types/habit'

// ── Types ─────────────────────────────────────

export type AchievementType =
  | 'streak'
  | 'consistency'
  | 'sessions'
  | 'minutes'
  | 'perfect_week'
  | 'comeback'
  | 'first_session'
  | 'milestone'

export interface Achievement {
  id:          string
  type:        AchievementType
  title:       string
  description: string
  iconId:      string   // Lucide icon name
  xp:          number
  unlockedAt:  string | null   // ISO date or null if locked
  progress?:   number   // 0-100 for progress-based achievements
  threshold?:  number   // target value
  current?:    number   // current value
}

// ── Achievement definitions ───────────────────

const ACHIEVEMENT_DEFS: Omit<Achievement, 'unlockedAt' | 'progress' | 'current'>[] = [
  {
    id:          'first_session',
    type:        'first_session',
    title:       'Primeiro Passo',
    description: 'Registre sua primeira sessão de qualquer hábito.',
    iconId:      'Footprints',
    xp:          50,
    threshold:   1,
  },
  {
    id:          'streak_7',
    type:        'streak',
    title:       'Semana Perfeita',
    description: 'Complete todos os hábitos por 7 dias consecutivos.',
    iconId:      'Flame',
    xp:          200,
    threshold:   7,
  },
  {
    id:          'streak_30',
    type:        'streak',
    title:       'Mês de Ferro',
    description: 'Mantenha streak por 30 dias.',
    iconId:      'ShieldCheck',
    xp:          500,
    threshold:   30,
  },
  {
    id:          'consistency_80',
    type:        'consistency',
    title:       'Alta Performance',
    description: 'Atinja 80% de consistência em uma semana.',
    iconId:      'TrendingUp',
    xp:          150,
    threshold:   80,
  },
  {
    id:          'consistency_100',
    type:        'perfect_week',
    title:       'Semana Imaculada',
    description: 'Atinja 100% de consistência em uma semana.',
    iconId:      'Star',
    xp:          300,
    threshold:   100,
  },
  {
    id:          'sessions_50',
    type:        'sessions',
    title:       'Cinquentona',
    description: 'Acumule 50 sessões totais.',
    iconId:      'CheckCircle2',
    xp:          100,
    threshold:   50,
  },
  {
    id:          'sessions_200',
    type:        'sessions',
    title:       'Duzentos Fortes',
    description: 'Acumule 200 sessões totais.',
    iconId:      'Trophy',
    xp:          400,
    threshold:   200,
  },
  {
    id:          'minutes_1000',
    type:        'minutes',
    title:       'Mil Minutos',
    description: 'Acumule 1000 minutos de hábitos.',
    iconId:      'Timer',
    xp:          250,
    threshold:   1000,
  },
  {
    id:          'minutes_5000',
    type:        'minutes',
    title:       'Cinco Mil Minutos',
    description: 'Acumule 5000 minutos de hábitos.',
    iconId:      'Zap',
    xp:          1000,
    threshold:   5000,
  },
  {
    id:          'comeback',
    type:        'comeback',
    title:       'De Volta ao Jogo',
    description: 'Retome hábitos após 7+ dias de inatividade.',
    iconId:      'RotateCcw',
    xp:          150,
    threshold:   1,
  },
]

const STORAGE_KEY = 'habitdb-achievements'

// ── Local helpers ─────────────────────────────

function loadUnlocked(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveUnlocked(unlocked: Record<string, string>) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked))
}

// ── Service ───────────────────────────────────

export const achievementService = {
  /**
   * Get all achievements with unlock status and progress.
   * Replace with: apiClient.get<Achievement[]>('/api/achievements')
   */
  getAll(habits: HabitsMap): Achievement[] {
    const unlocked = loadUnlocked()

    const habitList = Object.values(habits) as import('@/types/habit').HabitBase[]
    const totalSessions = habitList.reduce(
      (a, h) => a + Object.values(h.counts).reduce((s: number, c: number) => s + c, 0),
      0,
    )
    const totalMinutes = habitList.reduce(
      (a, h) => a + Object.values(h.counts).reduce((s: number, c: number) => s + c, 0) * h.target,
      0,
    )

    return ACHIEVEMENT_DEFS.map((def) => {
      let current = 0
      if (def.type === 'sessions')  current = totalSessions
      if (def.type === 'minutes')   current = totalMinutes
      if (def.type === 'first_session') current = totalSessions > 0 ? 1 : 0

      const progress  = def.threshold ? Math.min(100, Math.round((current / def.threshold) * 100)) : 0
      const isUnlocked = !!unlocked[def.id] || (def.threshold !== undefined && current >= def.threshold)

      return {
        ...def,
        unlockedAt: isUnlocked ? (unlocked[def.id] ?? new Date().toISOString()) : null,
        progress,
        current,
      }
    })
  },

  /**
   * Unlock a specific achievement by ID.
   * Replace with: apiClient.post(`/api/achievements/${id}/unlock`)
   */
  unlock(id: string): void {
    const unlocked = loadUnlocked()
    if (!unlocked[id]) {
      unlocked[id] = new Date().toISOString()
      saveUnlocked(unlocked)
    }
  },

  /**
   * Evaluate and auto-unlock achievements based on current state.
   * Returns list of newly unlocked achievement IDs.
   * Replace with: apiClient.post('/api/achievements/evaluate')
   */
  evaluate(habits: HabitsMap): string[] {
    const all       = achievementService.getAll(habits)
    const unlocked  = loadUnlocked()
    const newlyUnlocked: string[] = []

    all.forEach((a) => {
      if (a.unlockedAt && !unlocked[a.id]) {
        achievementService.unlock(a.id)
        newlyUnlocked.push(a.id)
      }
    })

    return newlyUnlocked
  },

  /**
   * Get total XP earned from unlocked achievements.
   * Replace with: apiClient.get<number>('/api/achievements/xp')
   */
  getTotalXP(habits: HabitsMap): number {
    return achievementService.getAll(habits)
      .filter((a) => a.unlockedAt !== null)
      .reduce((sum, a) => sum + a.xp, 0)
  },
}
