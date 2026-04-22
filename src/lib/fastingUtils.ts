import type { FastingHabit } from '@/types/habit'
import { getTodayStr, diffInDays, addDaysToStr } from './time'

export interface FastingProgress {
  totalDays:    number
  progressDays: number
  pct:          number
  daysLeft:     number
  isComplete:   boolean
  endDate:      Date | null
  daysUntilEnd: number | null
  hasStarted:   boolean
}

export function calculateFastingProgress(habit: FastingHabit): FastingProgress {
  const totalDays = habit.fastingDays ?? 40

  if (!habit.fastingStartDate) {
    return {
      totalDays,
      progressDays: 0,
      pct:          0,
      daysLeft:     totalDays,
      isComplete:   false,
      endDate:      null,
      daysUntilEnd: null,
      hasStarted:   false,
    }
  }

  const todayBRT     = getTodayStr()
  const daysElapsed  = Math.max(0, diffInDays(habit.fastingStartDate, todayBRT))
  const progressDays = Math.min(daysElapsed, totalDays)
  const pct          = Math.round((progressDays / totalDays) * 100)
  const daysLeft     = Math.max(0, totalDays - progressDays)
  const isComplete   = habit.fastingComplete === true || progressDays >= totalDays

  const endDateStr   = addDaysToStr(habit.fastingStartDate, totalDays)
  const [ey, em, ed] = endDateStr.split('-').map(Number)
  const endDate      = new Date(Date.UTC(ey, em - 1, ed))

  const daysUntilEnd = isComplete
    ? 0
    : Math.max(0, diffInDays(todayBRT, endDateStr))

  return { totalDays, progressDays, pct, daysLeft, isComplete, endDate, daysUntilEnd, hasStarted: true }
}

// Total disciplina days this year: completed cycles + current progress
export function calcFastingYearTotal(habit: FastingHabit): number {
  const totalDays        = habit.fastingDays ?? 40
  const { progressDays } = calculateFastingProgress(habit)
  return habit.completedCycles * totalDays + progressDays
}
