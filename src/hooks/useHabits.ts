// ─────────────────────────────────────────────
//  Hook: useHabits
// ─────────────────────────────────────────────
// Abstrai acesso ao store para componentes de hábitos.

'use client'

import { useAppStore }    from '@/store/appStore'
import { getWeekKey, getMonthKey, pct } from '@/lib/helpers'
import type { HabitKey }  from '@/types/habit'
import {
  detectRisks,
  generateInsights,
  getCefrLevel,
  calcMonthlyGoal,
  calcSessionsDoneThisMonth,
} from '@/services/habitsService'

export function useHabits() {
  const { data, increment, decrement, setHabitGoal } = useAppStore()
  const { currentWeek, currentYear, currentMonth, habits } = data

  const wKey = getWeekKey(currentYear, currentWeek)
  const mKey = getMonthKey(currentYear, currentMonth)

  // Contagem atual da semana por hábito
  function getWeekCount(key: HabitKey): number {
    return habits[key].counts[wKey] ?? 0
  }

  // Progresso % da semana
  function getWeekProgress(key: HabitKey): number {
    return pct(getWeekCount(key), habits[key].frequency)
  }

  // Total de minutos na semana
  function getWeekMinutes(key: HabitKey): number {
    return getWeekCount(key) * habits[key].target
  }

  // Total de minutos no mês
  function getMonthMinutes(key: HabitKey): number {
    return habits[key].monthlyTotals[mKey] ?? 0
  }

  // Metas mensais
  function getMonthlyGoalInfo(key: HabitKey) {
    const habit = habits[key]
    const freq  = habit.goalFreq ?? habit.frequency
    const dur   = habit.goalDuration ?? habit.target
    const goal  = calcMonthlyGoal(freq, dur)
    const done  = calcSessionsDoneThisMonth(habits, key, currentYear, currentMonth)
    return {
      ...goal,
      sessionsDone: done,
      timeDone: done * dur,
      progress: pct(done, goal.sessionsPerMonth),
    }
  }

  // Nível CEFR de inglês
  const cefrInfo = (() => {
    const eng = habits.english
    const totalMin = eng.totalYear + (eng.carryoverMinutes ?? 0)
    return getCefrLevel(totalMin)
  })()

  // Riscos
  const risks = detectRisks(habits, currentYear, currentWeek)

  // Insights
  const insights = generateInsights(habits, currentYear, currentWeek)

  return {
    habits,
    currentWeek,
    currentYear,
    currentMonth,
    wKey,
    mKey,
    getWeekCount,
    getWeekProgress,
    getWeekMinutes,
    getMonthMinutes,
    getMonthlyGoalInfo,
    cefrInfo,
    risks,
    insights,
    increment,
    decrement,
    setHabitGoal,
  }
}