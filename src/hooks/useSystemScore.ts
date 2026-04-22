'use client'

// ─────────────────────────────────────────────
//  Hook: useSystemScore
//  Cross-module analytics — Vida Score 0-100
//
//  Dimensões e pesos:
//    Hábitos    30%  — consistência semanal + progresso anual
//    Metas      25%  — progresso médio das metas anuais
//    Finanças   15%  — taxa de poupança mensal
//    Físico     10%  — frequência de check-ins + proximidade às metas
//    Sono       10%  — entradas no log dos últimos 7 dias
//    Foco       10%  — pomodoros na semana
// ─────────────────────────────────────────────

import { useMemo }          from 'react'
import { useAppStore }      from '@/store/appStore'
import { useGoalsStore }    from '@/store/goalsStore'
import { useFinanceStore }  from '@/store/financeStore'
import { useProfileStore }  from '@/store/profileStore'
import { getWeekKey, getMonthKey } from '@/lib/helpers'
import { calculateFastingProgress, calcFastingYearTotal } from '@/lib/fastingUtils'
import { getTodayStr, addDaysToStr } from '@/lib/time'
import type { FastingHabit } from '@/types/habit'
import { totalIncome, savingsRate } from '@/types/finance'
import type { HabitKey }    from '@/types/habit'
import type { PomoDataMap } from '@/types/focus'

const HABIT_KEYS: HabitKey[] = ['reading', 'english', 'hiit', 'ppci', 'dopamine', 'fasting']

// ── Gamification thresholds ───────────────────
const XP_PER_LEVEL  = 1000
const XP_HABIT_MIN  = 1      // 1 XP por minuto de hábito
const XP_GOAL_DONE  = 500    // meta concluída
const XP_TASK_DONE  = 50     // tarefa diária concluída
const XP_SLEEP_ENTRY = 20    // entrada de sono
const XP_POMO       = 25     // 1 pomodoro = 25 min = 25 XP

// ── Score helpers ─────────────────────────────

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v))
}

function computeHabitScore(
  habits: ReturnType<typeof useAppStore.getState>['data']['habits'],
  currentYear: number,
  currentWeek: number,
): number {
  const wKey = getWeekKey(currentYear, currentWeek)
  let done = 0
  let possible = 0
  HABIT_KEYS.forEach((k) => {
    done     += habits[k].counts[wKey] ?? 0
    possible += habits[k].frequency
  })
  const weekly = possible > 0 ? (done / possible) * 100 : 50

  // Bonus from Q1 year total — more than 50h ≈ strong annual consistency
  const totalYearMin = HABIT_KEYS.reduce((a, k) => a + habits[k].totalYear, 0)
  const annualBonus  = Math.min(15, (totalYearMin / 6000) * 15) // max +15 at 100h

  // Fasting bonus — time-based: progress (discipline) + year total (consistency)
  const fasting      = habits.fasting as FastingHabit
  const fastingTotal = fasting.fastingDays ?? 40
  const { progressDays: fastingDone } = calculateFastingProgress(fasting)
  const yearTotal    = calcFastingYearTotal(fasting)
  const progressBonus   = Math.min(5, Math.round((fastingDone / fastingTotal) * 5))
  const consistencyBonus = Math.min(5, Math.round((yearTotal / (fastingTotal * 3)) * 5)) // max +5 at 3 cycles
  const fastingBonus = progressBonus + consistencyBonus  // max +10

  return clamp(Math.round(weekly * 0.8 + annualBonus + fastingBonus))
}

function computeGoalsScore(
  annualGoals: ReturnType<typeof useGoalsStore.getState>['annualGoals'],
  year: number,
): number {
  const yearGoals = annualGoals.filter((g) => g.year === year && g.status !== 'cancelled')
  if (!yearGoals.length) return 50
  const avg = yearGoals.reduce((a, g) => a + g.progress, 0) / yearGoals.length
  return clamp(Math.round(avg))
}

function computeFinanceScore(
  months: ReturnType<typeof useFinanceStore.getState>['months'],
  year: number,
  month: number,
): number {
  const mKey = getMonthKey(year, month)
  const m    = months.find((e) => e.monthKey === mKey)
  if (!m) return 50
  const inc = totalIncome(m)
  if (inc <= 0) return 50
  const rate = savingsRate(m)
  // 0% → 20, 20% → 80, 40%+ → 100
  return clamp(Math.round(20 + rate * 4))
}

function computePhysicalScore(
  history: ReturnType<typeof useProfileStore.getState>['history'],
  profile: ReturnType<typeof useProfileStore.getState>['profile'],
): number {
  if (!history.length) return 50

  // Frequency: at least 1 check-in per 2 weeks in last 60 days
  const cutoffStr = addDaysToStr(getTodayStr(), -60)
  const recent    = history.filter((e) => e.date >= cutoffStr)
  const freqScore = clamp((recent.length / 4) * 60, 0, 60)

  // Goal proximity
  let goalScore = 40
  if (profile.weight && profile.goalWeight) {
    const diff    = Math.abs(profile.weight - profile.goalWeight)
    goalScore     = clamp(Math.round(40 - diff * 4), 0, 40)
  } else if (recent.length > 0) {
    goalScore = 30
  }

  return clamp(Math.round(freqScore + goalScore))
}

function computeSleepScore(
  log: Record<string, { wakeTime: string; sleepTime: string | null; timestamp: string }>,
  targetWake: string,
): number {
  const keys  = Object.keys(log)
  if (!keys.length) return 50

  // Last 7 days coverage
  const cutoff    = addDaysToStr(getTodayStr(), -7)
  const recent7   = keys.filter((k) => k >= cutoff)
  const coverage  = (recent7.length / 7) * 60  // max 60 from frequency

  // Wake time consistency (last 7 entries)
  const last7 = keys.sort().slice(-7)
  const [tH, tM] = targetWake.split(':').map(Number)
  const targetMin = tH * 60 + tM

  let consistency = 40
  if (last7.length > 0) {
    const diffs = last7.map((k) => {
      const [h, m] = log[k].wakeTime.split(':').map(Number)
      return Math.abs((h * 60 + m) - targetMin)
    })
    const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length
    // Within 30 min = full score, > 120 min = 0
    consistency = clamp(Math.round(40 - (avgDiff / 3)))
  }

  return clamp(Math.round(coverage + consistency))
}

function computeFocusScore(pomoData: PomoDataMap): number {
  const cutoff = addDaysToStr(getTodayStr(), -7)

  let totalPomos = 0
  Object.entries(pomoData).forEach(([key, val]) => {
    if (key.startsWith('__')) return
    if (key >= cutoff && val && typeof val === 'object' && 'total' in val) {
      totalPomos += (val as { total: number }).total
    }
  })

  // Target: ~14 pomos/week (2/day) → score 80. 25+ → 100
  return clamp(Math.round((totalPomos / 20) * 100))
}

// ── Gamification ──────────────────────────────

function computeXP(
  habits: ReturnType<typeof useAppStore.getState>['data']['habits'],
  annualGoals: ReturnType<typeof useGoalsStore.getState>['annualGoals'],
  dailyTasks: ReturnType<typeof useGoalsStore.getState>['dailyTasks'],
  log: Record<string, unknown>,
  pomoData: PomoDataMap,
): { totalXP: number; level: number; xpToNext: number; xpThisLevel: number } {
  // Habit XP — total minutes × 1
  const habitXP = HABIT_KEYS.reduce((a, k) => a + habits[k].totalYear, 0) * XP_HABIT_MIN

  // Goals XP
  const goalsXP = annualGoals.filter((g) => g.status === 'done').length * XP_GOAL_DONE

  // Tasks XP
  const tasksXP = dailyTasks.filter((t) => t.status === 'done').length * XP_TASK_DONE

  // Sleep XP
  const sleepXP = Object.keys(log).length * XP_SLEEP_ENTRY

  // Focus XP
  let totalPomos = 0
  Object.entries(pomoData).forEach(([key, val]) => {
    if (key.startsWith('__')) return
    if (val && typeof val === 'object' && 'total' in val) {
      totalPomos += (val as { total: number }).total
    }
  })
  const focusXP = totalPomos * XP_POMO

  const totalXP      = habitXP + goalsXP + tasksXP + sleepXP + focusXP
  const level        = Math.floor(totalXP / XP_PER_LEVEL) + 1
  const xpThisLevel  = totalXP % XP_PER_LEVEL
  const xpToNext     = XP_PER_LEVEL - xpThisLevel

  return { totalXP, level, xpToNext, xpThisLevel }
}

// ── Main hook ─────────────────────────────────

export interface ScoreDimension {
  key:      string
  label:    string
  score:    number     // 0-100
  weight:   number     // 0-1
  color:    string
  icon:     string     // Lucide id
}

export interface SystemScore {
  vidaScore: number   // 0-100 weighted composite
  dimensions: ScoreDimension[]
  gamification: {
    totalXP:      number
    level:        number
    xpToNext:     number
    xpThisLevel:  number
  }
  weekChange: number | null  // placeholder, computed later when we store history
}

export function useSystemScore(): SystemScore {
  const { data, sleepData, pomoData } = useAppStore()
  const { annualGoals, dailyTasks, hydrated: gH } = useGoalsStore()
  const { months, hydrated: fH }      = useFinanceStore()
  const { history, profile, hydrated: pH } = useProfileStore()

  const { habits, currentYear, currentWeek, currentMonth } = data

  return useMemo(() => {
    // Compute individual scores
    const habitScore    = computeHabitScore(habits, currentYear, currentWeek)
    const goalsScore    = gH ? computeGoalsScore(annualGoals, currentYear) : 50
    const financeScore  = fH ? computeFinanceScore(months, currentYear, currentMonth) : 50
    const physicalScore = pH ? computePhysicalScore(history, profile) : 50
    const sleepScore    = computeSleepScore(sleepData.log, sleepData.config.targetWake)
    const focusScore    = computeFocusScore(pomoData)

    // Weighted vida score
    const vidaScore = Math.round(
      habitScore   * 0.30 +
      goalsScore   * 0.25 +
      financeScore * 0.15 +
      physicalScore * 0.10 +
      sleepScore   * 0.10 +
      focusScore   * 0.10,
    )

    const dimensions: ScoreDimension[] = [
      { key: 'habits',   label: 'Hábitos',   score: habitScore,    weight: 0.30, color: '#6366f1', icon: 'Flame'      },
      { key: 'goals',    label: 'Metas',     score: goalsScore,    weight: 0.25, color: '#10b981', icon: 'Target'     },
      { key: 'finance',  label: 'Finanças',  score: financeScore,  weight: 0.15, color: '#f59e0b', icon: 'TrendingUp' },
      { key: 'physical', label: 'Físico',    score: physicalScore, weight: 0.10, color: '#ef4444', icon: 'Dumbbell'   },
      { key: 'sleep',    label: 'Sono',      score: sleepScore,    weight: 0.10, color: '#8b5cf6', icon: 'Moon'       },
      { key: 'focus',    label: 'Foco',      score: focusScore,    weight: 0.10, color: '#06b6d4', icon: 'Brain'      },
    ]

    const gamification = computeXP(habits, annualGoals, dailyTasks, sleepData.log, pomoData)

    return { vidaScore, dimensions, gamification, weekChange: null }
  }, [
    habits, currentYear, currentWeek, currentMonth,
    annualGoals, dailyTasks, gH,
    months, fH,
    history, profile, pH,
    sleepData, pomoData,
  ])
}
