// ─────────────────────────────────────────────
//  Service: Módulo Foco / Pomodoro
// ─────────────────────────────────────────────

import type {
  PomoDataMap, DayPomoData, PomodoroTask, TaskPriority,
  FocusMetrics, FocusMonthlyData, RecentSession, PriorityCount,
} from '@/types/focus'
import { todayStr, genId } from '@/lib/helpers'
import { POMO_LIMITS, POMO_MAX_TOTAL, DEEP_WORK_THRESHOLD_MINUTES } from '@/lib/constants'

const MINUTES_PER_POMO = 25

// ── Helpers internos ────────────────────────

function getDayMinutes(all: PomoDataMap, dateStr: string): number {
  return (all[dateStr]?.total ?? 0) * MINUTES_PER_POMO
}

// ── Métricas globais ─────────────────────────

export function calcFocusMetrics(all: PomoDataMap): FocusMetrics {
  const today = todayStr()
  const now   = new Date()

  // Hoje
  const todayMin = getDayMinutes(all, today)

  // Últimos 7 dias
  let weekMin = 0
  for (let i = 0; i < 7; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    weekMin += getDayMinutes(all, d.toISOString().split('T')[0])
  }

  // Mês atual
  let monthMin = 0
  const year  = now.getFullYear()
  const month = now.getMonth() + 1
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  for (const [key, val] of Object.entries(all)) {
    if (key.startsWith(prefix) && key !== '__goal_hours__') {
      monthMin += (val as DayPomoData).total * MINUTES_PER_POMO
    }
  }

  // Deep work days (≥ 3h no mês atual)
  let deepWorkDays = 0
  for (const [key, val] of Object.entries(all)) {
    if (key.startsWith(prefix) && key !== '__goal_hours__') {
      const mins = (val as DayPomoData).total * MINUTES_PER_POMO
      if (mins >= DEEP_WORK_THRESHOLD_MINUTES) deepWorkDays++
    }
  }

  // Streak (dias consecutivos com ≥1 pomodoro)
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const key = d.toISOString().split('T')[0]
    if (all[key] && (all[key] as DayPomoData).total > 0) streak++
    else break
  }

  return { today: todayMin, week: weekMin, month: monthMin, deepWorkDays, streak }
}

// ── Dados para gráfico mensal ────────────────

export function buildMonthlyFocusData(all: PomoDataMap, year: number, month: number): FocusMonthlyData {
  const daysInMonth = new Date(year, month, 0).getDate()
  const labels: string[]  = []
  const values: number[]  = []

  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    labels.push(String(d))
    values.push(getDayMinutes(all, key))
  }

  return { labels, values }
}

// ── Sessões recentes ─────────────────────────

export function getRecentSessions(all: PomoDataMap, limit = 20): RecentSession[] {
  const sessions: RecentSession[] = []

  const sortedDays = Object.keys(all)
    .filter((k) => k !== '__goal_hours__')
    .sort()
    .reverse()

  for (const date of sortedDays) {
    const day = all[date] as DayPomoData
    if (!day?.tasks) continue

    for (const task of [...day.tasks].reverse()) {
      if (task.pomodoros === 0) continue
      sessions.push({
        date,
        taskName:  task.name,
        priority:  task.priority,
        pomodoros: task.pomodoros,
        minutes:   task.pomodoros * MINUTES_PER_POMO,
      })
      if (sessions.length >= limit) return sessions
    }
  }

  return sessions
}

// ── Gerenciar tarefas ────────────────────────

export function addTask(
  all: PomoDataMap,
  name: string,
  priority: TaskPriority,
): PomoDataMap | null {
  const date    = todayStr()
  const dayData = getTodayData(all)
  const tasks   = dayData.tasks

  // Verificar limite de prioridade
  const countByPrio = tasks.filter((t) => t.priority === priority).length
  if (countByPrio >= POMO_LIMITS[priority]) return null   // limite atingido

  const newTask: PomodoroTask = {
    id: genId(),
    name: name.trim(),
    priority,
    pomodoros: 0,
    log: [],
  }

  return {
    ...all,
    [date]: {
      ...dayData,
      tasks: [...tasks, newTask],
    },
  }
}

export function removeTask(all: PomoDataMap, taskId: string): PomoDataMap {
  const date    = todayStr()
  const dayData = getTodayData(all)
  const tasks   = dayData.tasks.filter((t) => t.id !== taskId)
  const total   = tasks.reduce((s, t) => s + t.pomodoros, 0)
  return { ...all, [date]: { ...dayData, tasks, total } }
}

export function togglePomodoro(
  all: PomoDataMap,
  taskId: string,
  dotIndex: number,
): PomoDataMap {
  const date    = todayStr()
  const dayData = getTodayData(all)

  const tasks = dayData.tasks.map((t) => {
    if (t.id !== taskId) return t
    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    if (dotIndex < t.pomodoros) {
      // Remove último
      return { ...t, pomodoros: t.pomodoros - 1, log: t.log.slice(0, -1) }
    } else if (t.pomodoros < POMO_MAX_TOTAL) {
      return { ...t, pomodoros: t.pomodoros + 1, log: [...t.log, timeStr] }
    }
    return t
  })

  const total = tasks.reduce((s, t) => s + t.pomodoros, 0)
  return { ...all, [date]: { ...dayData, tasks, total } }
}

function getTodayData(all: PomoDataMap): DayPomoData {
  const date = todayStr()
  return (all[date] as DayPomoData) ?? { tasks: [], total: 0 }
}

// ── Contagem por prioridade ──────────────────

export function countByPriority(tasks: PomodoroTask[]): PriorityCount {
  return tasks.reduce(
    (acc, t) => {
      acc[t.priority] = (acc[t.priority] ?? 0) + t.pomodoros
      return acc
    },
    { P1: 0, P2: 0, P3: 0 } as PriorityCount,
  )
}