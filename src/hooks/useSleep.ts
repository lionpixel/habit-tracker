// ─────────────────────────────────────────────
//  Hook: useSleep
// ─────────────────────────────────────────────

'use client'

import { useAppStore } from '@/store/appStore'
import {
  buildSleepPlan,
  calcSleepRules,
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

  // Registra acordar + dormir + qualidade + notas
  function registerWakeTime(
    wakeTime:  string,
    sleepTime?: string,
    quality?:   1 | 2 | 3 | 4 | 5,
    notes?:     string,
  ) {
    const today = todayStr()
    const updated: SleepData = {
      ...sleepData,
      log: {
        ...log,
        [today]: {
          wakeTime,
          sleepTime: sleepTime ?? null,
          timestamp: new Date().toISOString(),
          ...(quality !== undefined && { quality }),
          ...(notes?.trim() && { notes: notes.trim() }),
        },
      },
    }
    saveSleep(updated)
  }

  function setTargetWake(targetWake: string) {
    saveSleep({ ...sleepData, config: { ...config, targetWake } })
  }

  // Plano + regras de sono
  const plan          = todayEntry ? buildSleepPlan(todayEntry.wakeTime) : null
  const sleepRules    = todayEntry ? calcSleepRules(todayEntry.wakeTime, config.targetWake) : null

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
    sleepRules,
    energyScore,
    adjustmentChain,
    history,
    registerWakeTime,
    setTargetWake,
  }
}