// ─────────────────────────────────────────────
//  Service: Lógica de Hábitos
// ─────────────────────────────────────────────

import type {
  AppData,
  Habit,
  HabitBase,
  HabitKey,
  HabitsMap,
  RiskAlert,
  RiskLevel,
  Insight,
  DayOfWeek,
} from '@/types/habit'
import { getWeekKey, getMonthKey } from '@/lib/helpers'
import {
  addDaysToStr,
  daysInMonthBRT,
  getDayOfWeekFromDateStr,
  getTodayStr,
  getWeekInfoFromDateStr,
  getWeekDaysBRT,
} from '@/lib/time'

const DEFAULT_WEEK_DISTRIBUTION: Record<number, DayOfWeek[]> = {
  1: [1],
  2: [1, 4],
  3: [1, 3, 5],
  4: [1, 2, 4, 5],
  5: [1, 2, 3, 4, 5],
  6: [1, 2, 3, 4, 5, 6],
  7: [1, 2, 3, 4, 5, 6, 0],
}

function normalizeDays(days: DayOfWeek[]): DayOfWeek[] {
  return [...new Set(days)].sort((a, b) => a - b) as DayOfWeek[]
}

function getFallbackSchedule(frequency: number): DayOfWeek[] {
  return DEFAULT_WEEK_DISTRIBUTION[Math.max(1, Math.min(7, frequency))] ?? [1, 3, 5]
}

function getMonthlyCadenceDays(timesPerMonth: number, year: number, month: number): number[] {
  const safeTimes = Math.max(1, Math.min(timesPerMonth, 31))
  const totalDays = daysInMonthBRT(year, month)
  if (safeTimes >= totalDays) {
    return Array.from({ length: totalDays }, (_, i) => i + 1)
  }

  const step = totalDays / safeTimes
  const picks = Array.from({ length: safeTimes }, (_, i) =>
    Math.min(totalDays, Math.max(1, Math.round(1 + i * step))),
  )
  return [...new Set(picks)].sort((a, b) => a - b)
}

export function getHabitScheduledDays(habit: Habit): DayOfWeek[] {
  if (habit.archived || habit.paused) return []

  const recurrence = habit.recurrence
  if (!recurrence) return getFallbackSchedule(habit.frequency)

  switch (recurrence.type) {
    case 'daily':
      return [1, 2, 3, 4, 5, 6, 0]
    case 'weekdays':
      return [1, 2, 3, 4, 5]
    case 'weekends':
      return [6, 0]
    case 'custom_week':
      return normalizeDays(recurrence.daysOfWeek ?? getFallbackSchedule(habit.frequency))
    case 'times_per_week':
      return getFallbackSchedule(recurrence.timesPerWeek ?? habit.frequency)
    case 'times_per_month':
      return [1, 2, 3, 4, 5, 6, 0]
    default:
      return getFallbackSchedule(habit.frequency)
  }
}

export function isHabitScheduledForDate(habit: HabitBase, dateStr: string): boolean {
  if (habit.archived || habit.paused) return false
  if (habit.startDate && dateStr < habit.startDate) return false
  if (habit.endDate && dateStr > habit.endDate) return false

  const recurrence = habit.recurrence
  if (recurrence?.type === 'times_per_month') {
    const [year, month, day] = dateStr.split('-').map(Number)
    return getMonthlyCadenceDays(recurrence.timesPerMonth ?? habit.frequency, year, month).includes(day)
  }

  const dayOfWeek = getDayOfWeekFromDateStr(dateStr) as DayOfWeek
  return getHabitScheduledDays(habit).includes(dayOfWeek)
}

function buildResolvedWeekDates(habit: HabitBase, year: number, week: number): string[] {
  const wKey = getWeekKey(year, week)
  const weekDates = getWeekDaysBRT(year, week)
  const scheduledDates = weekDates.filter((date) => isHabitScheduledForDate(habit, date))
  const explicitDates = scheduledDates.filter((date) => (habit.dailyLog?.[date] ?? 0) > 0)
  const cappedCount = Math.min(habit.counts[wKey] ?? 0, scheduledDates.length)

  if (explicitDates.length >= cappedCount) {
    return explicitDates.sort()
  }

  const merged = new Set(explicitDates)
  for (const date of scheduledDates) {
    if (merged.size >= cappedCount) break
    merged.add(date)
  }

  return [...merged].sort()
}

function materializeWeek(habit: HabitBase, year: number, week: number): HabitBase {
  const resolved = buildResolvedWeekDates(habit, year, week)
  const wKey = getWeekKey(year, week)
  const nextLog = { ...(habit.dailyLog ?? {}) }
  let changed = (habit.counts[wKey] ?? 0) !== resolved.length

  resolved.forEach((date) => {
    if ((nextLog[date] ?? 0) === 0) changed = true
    nextLog[date] = 1
  })

  if (!changed) return habit

  return {
    ...habit,
    dailyLog: nextLog,
    counts: { ...habit.counts, [wKey]: resolved.length },
  }
}

function replaceHabit(habits: HabitsMap, key: HabitKey, habit: HabitBase): HabitsMap {
  return { ...habits, [key]: habit as HabitsMap[HabitKey] }
}

export function getHabitCompletionDatesForWeek(
  habits: HabitsMap,
  key: HabitKey,
  year: number,
  week: number,
): string[] {
  if (key === 'fasting') return []
  return buildResolvedWeekDates(habits[key], year, week)
}

export function isHabitDoneOnDate(
  habits: HabitsMap,
  key: HabitKey,
  dateStr: string,
): boolean {
  if (key === 'fasting') return false
  const { year, week } = getWeekInfoFromDateStr(dateStr)
  return buildResolvedWeekDates(habits[key], year, week).includes(dateStr)
}

export function getHabitStreak(habits: HabitsMap, key: HabitKey, anchorDate: string): number {
  if (key === 'fasting') return 0

  const habit = habits[key]
  let streak = 0
  let cursor = anchorDate
  let foundCompletedBlock = false

  for (let i = 0; i < 400; i++) {
    if (habit.startDate && cursor < habit.startDate) break

    if (isHabitScheduledForDate(habit, cursor)) {
      const done = isHabitDoneOnDate(habits, key, cursor)

      if (!foundCompletedBlock && !done) {
        cursor = addDaysToStr(cursor, -1)
        continue
      }

      foundCompletedBlock = true
      if (!done) break
      streak += 1
    }

    cursor = addDaysToStr(cursor, -1)
  }

  return streak
}

export function setHabitCompletionForDate(
  habits: HabitsMap,
  key: HabitKey,
  dateStr: string,
  done: boolean,
): HabitsMap {
  if (key === 'fasting') return habits

  const current = habits[key]
  const { year, week } = getWeekInfoFromDateStr(dateStr)
  const wKey = getWeekKey(year, week)
  const habit = materializeWeek(current, year, week)

  if (!isHabitScheduledForDate(habit, dateStr)) return habits

  const nextLog = { ...(habit.dailyLog ?? {}) }
  const isDone = (nextLog[dateStr] ?? 0) > 0
  if (isDone === done) return replaceHabit(habits, key, habit)

  if (done) nextLog[dateStr] = 1
  else delete nextLog[dateStr]

  const weekDates = getWeekDaysBRT(year, week)
  const weekCount = weekDates.reduce((total, date) => total + ((nextLog[date] ?? 0) > 0 ? 1 : 0), 0)

  return replaceHabit(habits, key, {
    ...habit,
    dailyLog: nextLog,
    counts: { ...habit.counts, [wKey]: weekCount },
  })
}

// ── Incremento / Decremento ──────────────────

export function toggleHabit(
  habits: HabitsMap,
  key: HabitKey,
  year: number,
  week: number,
): HabitsMap {
  if (key === 'fasting') return habits

  const habit = materializeWeek(habits[key], year, week)
  const scheduledDates = getWeekDaysBRT(year, week).filter((date) => isHabitScheduledForDate(habit, date))
  const currentDone = new Set(buildResolvedWeekDates(habit, year, week))
  if (currentDone.size >= Math.min(habit.frequency, scheduledDates.length)) {
    return replaceHabit(habits, key, habit)
  }

  const today = getTodayStr()
  const preferred = scheduledDates.find((date) => date === today && !currentDone.has(date))
    ?? [...scheduledDates].reverse().find((date) => date < today && !currentDone.has(date))
    ?? scheduledDates.find((date) => date > today && !currentDone.has(date))
    ?? scheduledDates.find((date) => !currentDone.has(date))

  return preferred
    ? setHabitCompletionForDate(replaceHabit(habits, key, habit), key, preferred, true)
    : replaceHabit(habits, key, habit)
}

export function decreaseHabit(
  habits: HabitsMap,
  key: HabitKey,
  year: number,
  week: number,
): HabitsMap {
  if (key === 'fasting') return habits

  const habit = materializeWeek(habits[key], year, week)
  const resolved = buildResolvedWeekDates(habit, year, week)
  const targetDate = resolved[resolved.length - 1]

  return targetDate
    ? setHabitCompletionForDate(replaceHabit(habits, key, habit), key, targetDate, false)
    : replaceHabit(habits, key, habit)
}

// ── Totais mensais ───────────────────────────

export function recalcMonthlyTotals(data: AppData): AppData {
  const habits = { ...data.habits } as HabitsMap

  for (const key of Object.keys(habits) as HabitKey[]) {
    const habit    = habits[key]
    const mTotals: Record<string, number> = { ...habit.monthlyTotals }

    for (const [wKey, count] of Object.entries(habit.counts)) {
      const [yearStr, weekStr] = wKey.split('-W')
      const year = parseInt(yearStr)
      const week = parseInt(weekStr)
      const { start } = getWeekDates(year, week)
      const mKey = getMonthKey(start.getFullYear(), start.getMonth() + 1)
      const computed = count * habit.target
      mTotals[mKey] = Math.max(mTotals[mKey] ?? 0, computed)
    }

    const totalYear = Object.values(mTotals).reduce((acc, value) => acc + value, 0)
    ;(habits as unknown as Record<string, typeof habit>)[key] = {
      ...habit,
      monthlyTotals: mTotals,
      totalYear,
    }
  }

  return { ...data, habits }
}

function getWeekDates(year: number, week: number): { start: Date; end: Date } {
  const jan4       = new Date(year, 0, 4)
  const dayOfWeek  = (jan4.getDay() + 6) % 7
  const weekStart  = new Date(jan4)
  weekStart.setDate(jan4.getDate() - dayOfWeek + (week - 1) * 7)
  const weekEnd    = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  return { start: weekStart, end: weekEnd }
}

// ── Cálculo de metas mensais ─────────────────

export function calcMonthlyGoal(goalFreq: number, goalDuration: number) {
  const sessionsPerMonth = Math.round(goalFreq * 4.33)
  const totalMinutes     = sessionsPerMonth * goalDuration
  return { sessionsPerMonth, totalMinutes }
}

export function calcSessionsDoneThisMonth(
  habits: HabitsMap,
  key: HabitKey,
  year: number,
  month: number,
): number {
  const habit = habits[key]
  const mKey  = getMonthKey(year, month)
  const total = habit.monthlyTotals[mKey] ?? 0
  return Math.floor(total / habit.target)
}

// ── Detecção de riscos ───────────────────────

const RISK_SUGGESTIONS: Record<HabitKey, Record<RiskLevel, string>> = {
  reading:  {
    critical: 'Reserve 15 min antes de dormir para leitura.',
    high:     'Tente associar leitura ao café da manhã.',
    medium:   'Leia ao menos 10 páginas por dia.',
  },
  english:  {
    critical: 'Assista uma série em inglês hoje.',
    high:     'Use o app Anki por 10 min durante o almoço.',
    medium:   'Ouça um podcast em inglês no trajeto.',
  },
  hiit:     {
    critical: 'Faça ao menos 10 min de caminhada hoje.',
    high:     'Um treino curto (20 min) já faz diferença.',
    medium:   'Adicione uma sessão extra na semana.',
  },
  ppci:     {
    critical: 'Dedique 30 min ao projeto pessoal hoje.',
    high:     'Escolha UMA tarefa técnica e execute.',
    medium:   'Estude um tópico novo por 20 min.',
  },
  dopamine: {
    critical: 'Faça 5 min de respiração profunda agora.',
    high:     'Evite redes sociais pela manhã.',
    medium:   'Implemente um ritual de descanso digital.',
  },
  fasting:  {
    critical: 'Reinicie o desafio sem açúcar hoje.',
    high:     'Substitua o açúcar refinado por frutas.',
    medium:   'Reduza gradualmente o consumo.',
  },
}

export function detectRisks(
  habits: HabitsMap,
  currentYear: number,
  currentWeek: number,
): RiskAlert[] {
  const alerts: RiskAlert[] = []

  for (const key of Object.keys(habits) as HabitKey[]) {
    const habit  = habits[key]
    const last3: number[] = []

    for (let i = 0; i < 3; i++) {
      let w = currentWeek - i
      let y = currentYear
      if (w <= 0) { w += 52; y -= 1 }
      const wKey = getWeekKey(y, w)
      const count = habit.counts[wKey] ?? 0
      const ratio = count / habit.frequency
      last3.push(ratio)
    }

    const isCritical = last3[0] === 0 && last3[1] === 0
    const isHigh     = last3.every((r) => r < 0.4)
    const isMedium   = last3[0] < 0.5 && last3[1] < 0.5

    let level: RiskLevel | null = null
    if (isCritical)       level = 'critical'
    else if (isHigh)      level = 'high'
    else if (isMedium)    level = 'medium'

    if (level) {
      alerts.push({
        habitKey:   key,
        habitName:  habit.name,
        level,
        message:    buildRiskMessage(habit.name, level, last3),
        suggestion: RISK_SUGGESTIONS[key]?.[level] ?? 'Mantenha o foco e retome a consistência.',
      })
    }
  }

  return alerts
}

function buildRiskMessage(name: string, level: RiskLevel, last3: number[]): string {
  const pct = (r: number) => `${Math.round(r * 100)}%`
  if (level === 'critical') return `${name}: zero sessões nas últimas 2 semanas.`
  if (level === 'high')     return `${name}: média abaixo de 40% nas últimas 3 semanas (${last3.map(pct).join(', ')}).`
  return `${name}: abaixo de 50% nas últimas 2 semanas (${last3.slice(0, 2).map(pct).join(', ')}).`
}

// ── Geração de insights avançados ───────────

export function generateInsights(
  habits: HabitsMap,
  year: number,
  week: number,
): Insight[] {
  const insights: Insight[] = []
  const habitKeys = Object.keys(habits) as HabitKey[]

  // ─ Helper: get ratio for a week ─
  const weekRatio = (key: HabitKey, w: number, y: number) => {
    let ww = w; let yy = y
    if (ww <= 0) { ww += 52; yy -= 1 }
    const wKey = getWeekKey(yy, ww)
    const count = habits[key].counts[wKey] ?? 0
    return count / habits[key].frequency
  }

  // ─ 1. Best habit this week ─
  let best: HabitKey | null = null
  let bestRatio = 0
  for (const key of habitKeys) {
    const r = weekRatio(key, week, year)
    if (r > bestRatio) { bestRatio = r; best = key }
  }
  if (best && bestRatio >= 0.8) {
    insights.push({
      type:        'success',
      iconId:      'Award',
      title:       `${habits[best].name} em destaque`,
      description: `${Math.round(bestRatio * 100)}% da meta atingida esta semana. Consistência excelente!`,
      priority:    'high',
      category:    'performance',
    })
  }

  // ─ 2. Improving trend (current week > 2 weeks ago) ─
  for (const key of habitKeys) {
    const now  = weekRatio(key, week, year)
    const prev = weekRatio(key, week - 2, year)
    if (now > 0 && prev > 0 && now - prev >= 0.3) {
      insights.push({
        type:        'success',
        iconId:      'TrendingUp',
        title:       `Você está melhorando em ${habits[key].name}`,
        description: `+${Math.round((now - prev) * 100)}p.p. comparado a 2 semanas atrás. Continue assim!`,
        priority:    'medium',
        category:    'trend',
      })
      break // max 1 trend insight
    }
  }

  // ─ 3. Streak (habit at 100% this week and last) ─
  for (const key of habitKeys) {
    const thisWeek = weekRatio(key, week, year)
    const lastWeek = weekRatio(key, week - 1, year)
    if (thisWeek >= 1 && lastWeek >= 1) {
      insights.push({
        type:        'success',
        iconId:      'Flame',
        title:       `Sequência ativa: ${habits[key].name}`,
        description: `Meta cumprida 2 semanas seguidas. Sequências longas constroem hábitos duradouros.`,
        priority:    'high',
        category:    'streak',
      })
    }
  }

  // ─ 4. Weekly goal hit ─
  const totalSessions = habitKeys.reduce((acc, k) => {
    const wKey = getWeekKey(year, week)
    return acc + (habits[k].counts[wKey] ?? 0)
  }, 0)
  const totalPossible = habitKeys.reduce((acc, k) => acc + habits[k].frequency, 0)
  const overallPct    = totalPossible > 0 ? Math.round((totalSessions / totalPossible) * 100) : 0

  if (overallPct >= 80) {
    insights.push({
      type:        'success',
      iconId:      'CheckCircle2',
      title:       `${overallPct}% da meta semanal`,
      description: `${totalSessions} de ${totalPossible} sessões concluídas. Desempenho excelente!`,
      priority:    'high',
      category:    'goal',
    })
  } else if (totalSessions > 0) {
    insights.push({
      type:        'info',
      iconId:      'BarChart3',
      title:       `${totalSessions} sessões esta semana`,
      description: `${overallPct}% da meta. Cada sessão conta — consistência supera intensidade.`,
      priority:    'medium',
      category:    'performance',
    })
  }

  // ─ 5. Habito em risco de abandono ─
  let abandonRisk: HabitKey | null = null
  let lowestConsistency = 1
  for (const key of habitKeys) {
    const last3avg = [0,1,2].reduce((acc, i) => acc + weekRatio(key, week - i, year), 0) / 3
    if (last3avg < lowestConsistency) { lowestConsistency = last3avg; abandonRisk = key }
  }
  if (abandonRisk && lowestConsistency < 0.3 && lowestConsistency > 0) {
    insights.push({
      type:        'warning',
      iconId:      'AlertTriangle',
      title:       `Risco de abandono: ${habits[abandonRisk].name}`,
      description: `Consistência média de ${Math.round(lowestConsistency * 100)}% nas últimas 3 semanas. Intervenção recomendada.`,
      priority:    'high',
      category:    'risk',
    })
  }

  // ─ 6. Morning productivity tip ─
  if (overallPct < 50 && totalSessions === 0) {
    insights.push({
      type:        'tip',
      iconId:      'Sunrise',
      title:       'Dica: comece a manhã com 1 hábito',
      description: `Fazer sua primeira sessão antes das 9h aumenta em 3x a chance de manter consistência.`,
      priority:    'low',
      category:    'trend',
    })
  }

  // ─ 7. Monthly goal approaching ─
  const now = new Date()
  const daysInMonth  = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysLeft     = daysInMonth - now.getDate()
  if (daysLeft <= 7) {
    const nearGoal = habitKeys.filter((key) => {
      const wKey  = getWeekKey(year, week)
      const done  = habits[key].counts[wKey] ?? 0
      const max   = habits[key].frequency
      return done / max >= 0.75
    })
    if (nearGoal.length >= 3) {
      insights.push({
        type:        'info',
        iconId:      'Calendar',
        title:       `${daysLeft} dias para fechar o mês forte`,
        description: `${nearGoal.length} hábitos acima de 75% da meta. Empurrão final para encerrar o mês no topo.`,
        priority:    'medium',
        category:    'goal',
      })
    }
  }

  return insights.slice(0, 6) // max 6 insights
}

// ── Nível CEFR de inglês ─────────────────────

export function getCefrLevel(totalMinutes: number): {
  level: string
  nextLevel: string
  progressInLevel: number
} {
  const hours = totalMinutes / 60
  const LEVELS = [
    { level: 'A1', min: 0,    max: 100  },
    { level: 'A2', min: 100,  max: 250  },
    { level: 'B1', min: 250,  max: 500  },
    { level: 'B2', min: 500,  max: 800  },
    { level: 'C1', min: 800,  max: 1200 },
    { level: 'C2', min: 1200, max: Infinity },
  ]

  for (let i = 0; i < LEVELS.length; i++) {
    const { level, min, max } = LEVELS[i]
    if (hours >= min && hours < max) {
      const next  = LEVELS[i + 1]?.level ?? 'C2 Completo'
      const range = max === Infinity ? 400 : max - min
      const prog  = Math.min(((hours - min) / range) * 100, 100)
      return { level, nextLevel: next, progressInLevel: Math.round(prog) }
    }
  }

  return { level: 'C2', nextLevel: '—', progressInLevel: 100 }
}
