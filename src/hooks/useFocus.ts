// ─────────────────────────────────────────────
//  Hook: useFocus (Pomodoro)
// ─────────────────────────────────────────────

'use client'

import { useAppStore } from '@/store/appStore'
import {
  calcFocusMetrics,
  buildMonthlyFocusData,
  getRecentSessions,
  addTask,
  removeTask,
  togglePomodoro,
  countByPriority,
} from '@/services/focusService'
import { todayStr } from '@/lib/helpers'
import type { TaskPriority, DayPomoData } from '@/types/focus'

export function useFocus() {
  const { pomoData, savePomo } = useAppStore()
  const now   = new Date()
  const year  = now.getFullYear()
  const month = now.getMonth() + 1

  const metrics        = calcFocusMetrics(pomoData)
  const monthlyData    = buildMonthlyFocusData(pomoData, year, month)
  const recentSessions = getRecentSessions(pomoData)

  const todayData = (pomoData[todayStr()] as DayPomoData) ?? { tasks: [], total: 0 }
  const tasksByPriority = countByPriority(todayData.tasks)

  const goalHours: number = (pomoData as Record<string, unknown>).__goal_hours__ as number ?? 80
  const monthProgress = Math.min(Math.round((metrics.month / 60 / goalHours) * 100), 100)

  function handleAddTask(name: string, priority: TaskPriority): boolean {
    if (!name.trim()) return false
    const updated = addTask(pomoData, name, priority)
    if (!updated) return false       // limite atingido
    savePomo(updated)
    return true
  }

  function handleRemoveTask(taskId: string) {
    savePomo(removeTask(pomoData, taskId))
  }

  function handleTogglePomo(taskId: string, dotIndex: number) {
    savePomo(togglePomodoro(pomoData, taskId, dotIndex))
  }

  function setGoalHours(hours: number) {
    savePomo({ ...pomoData, __goal_hours__: hours } as typeof pomoData)
  }

  return {
    metrics,
    monthlyData,
    recentSessions,
    todayData,
    tasksByPriority,
    goalHours,
    monthProgress,
    handleAddTask,
    handleRemoveTask,
    handleTogglePomo,
    setGoalHours,
  }
}