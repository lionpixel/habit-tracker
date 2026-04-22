import type { FastingHabit } from '@/types/habit'

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

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const start = new Date(habit.fastingStartDate)
  start.setHours(0, 0, 0, 0)

  const MS_PER_DAY   = 86_400_000
  const daysElapsed  = Math.floor((today.getTime() - start.getTime()) / MS_PER_DAY)
  const progressDays = Math.min(Math.max(0, daysElapsed), totalDays)
  const pct          = Math.round((progressDays / totalDays) * 100)
  const daysLeft     = Math.max(0, totalDays - progressDays)
  const isComplete   = habit.fastingComplete === true || progressDays >= totalDays

  const endDate = new Date(start)
  endDate.setDate(start.getDate() + totalDays)

  const now          = new Date()
  const daysUntilEnd = isComplete
    ? 0
    : Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / MS_PER_DAY))

  return { totalDays, progressDays, pct, daysLeft, isComplete, endDate, daysUntilEnd, hasStarted: true }
}

// Total disciplina days this year: completed cycles + current progress
export function calcFastingYearTotal(habit: FastingHabit): number {
  const totalDays        = habit.fastingDays ?? 40
  const { progressDays } = calculateFastingProgress(habit)
  return habit.completedCycles * totalDays + progressDays
}
