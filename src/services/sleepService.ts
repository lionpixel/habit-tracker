// ─────────────────────────────────────────────
//  Service: Módulo Sono
// ─────────────────────────────────────────────

import type {
  SleepData, SleepPlan, SleepEnergyScore,
  AdjustmentStep, SleepHistoryItem, SleepHistoryBadge,
} from '@/types/sleep'
import { timeToMinutes, minutesToTime, subtractMinutes } from '@/lib/helpers'
import { SLEEP_DEFAULTS } from '@/lib/constants'

// ── Plano de horários ────────────────────────

export function buildSleepPlan(wakeStr: string): SleepPlan {
  const nextWake   = subtractMinutes(wakeStr, SLEEP_DEFAULTS.prepTime)          // wake − 30 min
  const bedtime    = subtractMinutes(nextWake, SLEEP_DEFAULTS.sleepDuration)    // nextWake − 8h30
  const shutdown   = subtractMinutes(bedtime, SLEEP_DEFAULTS.prepTime)          // bed − 30 min
  return { wake: wakeStr, shutdown, bedtime, nextWake }
}

// ── Score de energia ─────────────────────────

export function calculateEnergyScore(
  wakeStr: string,
  sleepStr: string | null,
  log: SleepData['log'],
): SleepEnergyScore {
  // Duração (0-40 pts)
  let duration = 0
  if (sleepStr) {
    const wakeMin  = timeToMinutes(wakeStr)
    const sleepMin = timeToMinutes(sleepStr)
    const actualMin = wakeMin > sleepMin
      ? wakeMin - sleepMin
      : 1440 - sleepMin + wakeMin
    const idealMin = SLEEP_DEFAULTS.sleepDuration
    const diff  = Math.abs(actualMin - idealMin)
    duration = Math.max(0, 40 - Math.round((diff / 30) * 10))
  }

  // Consistência (0-30 pts) — desvio em relação ao dia anterior
  const entries = Object.entries(log).sort(([a], [b]) => a.localeCompare(b))
  let consistency = 30
  if (entries.length >= 2) {
    const prevWake = entries[entries.length - 2][1].wakeTime
    const diff = Math.abs(timeToMinutes(wakeStr) - timeToMinutes(prevWake))
    consistency = Math.max(0, 30 - Math.round((diff / 30) * 10))
  }

  // Regularidade (0-30 pts) — dias consecutivos registrados × 6, max 30
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 5; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().split('T')[0]
    if (log[key]) streak++
    else break
  }
  const regularity = Math.min(streak * 6, 30)

  return { total: duration + consistency + regularity, duration, consistency, regularity }
}

// ── Cadeia de ajuste gradual ─────────────────

export function buildAdjustmentChain(
  todayWakeStr: string,
  targetWakeStr: string,
): AdjustmentStep[] {
  const todayMin  = timeToMinutes(todayWakeStr)
  const targetMin = timeToMinutes(targetWakeStr)
  const STEP_MIN  = 30

  const steps: AdjustmentStep[] = []
  const today = new Date()
  let current = todayMin

  let idx = 0
  while (current > targetMin && idx < 14) {
    const d = new Date(today)
    d.setDate(today.getDate() + idx)
    const dateStr = d.toISOString().split('T')[0]
    steps.push({
      date:     dateStr,
      wakeTime: minutesToTime(current),
      status:   idx === 0 ? 'today' : current - STEP_MIN <= targetMin ? 'target' : 'future',
    })
    current -= STEP_MIN
    idx++
  }

  // Adiciona o alvo se não incluído
  if (!steps.find((s) => s.wakeTime === targetWakeStr)) {
    const d = new Date(today)
    d.setDate(today.getDate() + idx)
    steps.push({
      date:     d.toISOString().split('T')[0],
      wakeTime: targetWakeStr,
      status:   'target',
    })
  }

  return steps
}

// ── Histórico ────────────────────────────────

export function buildSleepHistory(
  log: SleepData['log'],
  targetWake: string,
  days = 7,
): SleepHistoryItem[] {
  const history: SleepHistoryItem[] = []
  const targetMin = timeToMinutes(targetWake)
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const entry = log[key]

    if (!entry) continue

    const wakeMin = timeToMinutes(entry.wakeTime)
    const diff    = Math.abs(wakeMin - targetMin)
    let badge: SleepHistoryBadge = 'ok'
    if (diff > 60)      badge = 'off'
    else if (diff > 30) badge = 'near'

    history.push({
      date:      key,
      wakeTime:  entry.wakeTime,
      sleepTime: entry.sleepTime,
      badge,
    })
  }

  return history
}