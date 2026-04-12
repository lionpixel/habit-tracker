// ─────────────────────────────────────────────
//  Hook: useSleep
// ─────────────────────────────────────────────

'use client'

import { useAppStore } from '@/store/appStore'
import {
  buildSleepPlan,
  calculateEnergyScore,
  buildAdjustmentChain,
  buildSleepHistory,
} from '@/services/sleepService'
import { todayStr } from '@/lib/helpers'
import type { SleepData } from '@/types/sleep'

export function useSleep() {
  const { sleepData, saveSleep } = useAppStore()
  const { log, config } = sleepData

  // Entrada de hoje
  const todayEntry = log[todayStr()]

  // Registra acordar + dormir
  function registerWakeTime(wakeTime: string, sleepTime?: string) {
    const today = todayStr()
    const updated: SleepData = {
      ...sleepData,
      log: {
        ...log,
        [today]: {
          wakeTime,
          sleepTime: sleepTime ?? null,
          timestamp: new Date().toISOString(),
        },
      },
    }
    saveSleep(updated)
  }

  function setTargetWake(targetWake: string) {
    saveSleep({ ...sleepData, config: { ...config, targetWake } })
  }

  // Plano
  const plan = todayEntry ? buildSleepPlan(todayEntry.wakeTime) : null

  // Score de energia
  const energyScore = todayEntry
    ? calculateEnergyScore(todayEntry.wakeTime, todayEntry.sleepTime, log)
    : null

  // Cadeia de ajuste
  const adjustmentChain = todayEntry
    ? buildAdjustmentChain(todayEntry.wakeTime, config.targetWake)
    : []

  // Histórico
  const history = buildSleepHistory(log, config.targetWake)

  return {
    log,
    config,
    todayEntry,
    plan,
    energyScore,
    adjustmentChain,
    history,
    registerWakeTime,
    setTargetWake,
  }
}