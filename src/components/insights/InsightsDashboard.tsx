'use client'

// ─────────────────────────────────────────────
//  InsightsDashboard — Painel de diagnóstico cruzado na home
//  Cruza dados de todos os módulos e chama Claude API para análise
// ─────────────────────────────────────────────

import { useState, useMemo } from 'react'
import { cn } from '@/lib/helpers'
import { useAppStore } from '@/store/appStore'
import { useProfileStore } from '@/store/profileStore'
import { useFinanceStore, currentMonthKey } from '@/store/financeStore'
import { useActiveHabitKeys, useWeekConsistency, useWeekTotalMinutes } from '@/store/selectors'
import { buildUserSnapshot, generateFullDiagnosis } from '@/lib/insightsEngine'
import { buildSleepHistory } from '@/services/sleepService'
import { totalIncome, totalExpenses, totalSavings, savingsRate } from '@/types/finance'
import { getWeekKey } from '@/lib/helpers'
import {
  Brain, Zap, TrendingUp, Moon, DollarSign,
  Activity, AlertCircle, CheckCircle2, Loader2,
} from 'lucide-react'
import { FadeInUp } from '@/components/ui/Motion'

function StatusDot({ ok }: { ok: boolean | null }) {
  if (ok === null) return <span className="text-slate-600 text-[11px]">—</span>
  return ok
    ? <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
    : <AlertCircle  size={13} className="text-amber-400 flex-shrink-0" />
}

export function InsightsDashboard() {
  const data           = useAppStore((s) => s.data)
  const sleepData      = useAppStore((s) => s.sleepData)
  const activeKeys     = useActiveHabitKeys()
  const consistency    = useWeekConsistency()
  const totalWeekMin   = useWeekTotalMinutes()
  const profile        = useProfileStore((s) => s.profile)
  const monthKey       = currentMonthKey()
  const getMonth       = useFinanceStore((s) => s.getMonth)
  const finMonth       = getMonth(monthKey)

  const [diagText, setDiagText] = useState<string>('')
  const [loading,  setLoading]  = useState(false)

  const { habits, currentYear, currentWeek } = data
  const wKey = getWeekKey(currentYear, currentWeek)

  // Sleep avg last 7 days
  const sleepAvgHours = useMemo(() => {
    const history = buildSleepHistory(sleepData.log, sleepData.config.targetWake, 7)
    const withDur = history.filter((h) => (h.durationMin ?? 0) > 0)
    if (!withDur.length) return undefined
    return Math.round((withDur.reduce((s, h) => s + (h.durationMin ?? 0), 0) / withDur.length / 60) * 10) / 10
  }, [sleepData])

  const income    = totalIncome(finMonth)
  const expenses  = totalExpenses(finMonth)
  const savings   = totalSavings(finMonth)
  const invRate   = savingsRate(finMonth)
  const netBal    = income - expenses - savings

  const snapshot = useMemo(() => buildUserSnapshot({
    habits: habits as Record<string, { name: string; frequency: number; target: number; archived?: boolean }>,
    weekCounts:   Object.fromEntries(activeKeys.map((k) => [k, habits[k].counts[wKey] ?? 0])),
    weekMinutes:  Object.fromEntries(activeKeys.map((k) => [k, (habits[k].counts[wKey] ?? 0) * habits[k].target])),
    weekConsistency: consistency,
    profile: {
      weight:      profile.weight,
      bodyFat:     profile.bodyFat,
      imc:         profile.imc,
      leanMass:    profile.leanMass,
      goalWeight:  profile.goalWeight,
      goalBodyFat: profile.goalBodyFat,
    },
    sleep: {
      avgHours:   sleepAvgHours,
      targetWake: sleepData.config.targetWake,
    },
    finance: {
      income:         income > 0 ? income : undefined,
      expenses:       expenses > 0 ? expenses : undefined,
      investments:    savings > 0 ? savings : undefined,
      investmentRate: income > 0 ? invRate : undefined,
      netBalance:     netBal,
    },
    fastingStreak:        habits.fasting?.currentStreak,
    longestFastingStreak: (habits.fasting as { longestStreak?: number })?.longestStreak,
  }), [habits, activeKeys, wKey, consistency, profile, sleepAvgHours, sleepData, income, expenses, savings, invRate, netBal])

  async function handleDiagnosis() {
    setLoading(true)
    setDiagText('')
    const result = await generateFullDiagnosis(snapshot)
    setDiagText(result)
    setLoading(false)
  }

  const habitsOk      = consistency >= 70
  const habitsPartial = consistency >= 40 && consistency < 70
  const sleepOk       = sleepAvgHours !== undefined ? sleepAvgHours >= 7 : null
  const bodyOk        = profile.bodyFat !== undefined ? profile.bodyFat <= 20 : null
  const finOk         = income > 0 ? invRate >= 15 : null

  const activeHabitCount = activeKeys.filter((k) => !habits[k].archived).length
  const doneCount        = activeKeys.filter((k) => (habits[k].counts[wKey] ?? 0) >= habits[k].frequency).length

  return (
    <FadeInUp>
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
              <Brain size={18} className="text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Diagnóstico Geral</h3>
              <p className="text-[11px] text-slate-500">Visão integrada de todos os módulos</p>
            </div>
          </div>
        </div>

        {/* Status cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/[0.04]">
          {/* Hábitos */}
          <div className="bg-[#0d1117] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={14} className="text-emerald-400" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hábitos</span>
              <StatusDot ok={habitsOk ? true : habitsPartial ? null : false} />
            </div>
            <div className="text-lg font-black text-slate-100 tabular-nums">{consistency}%</div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {doneCount}/{activeHabitCount} completos
            </div>
            {totalWeekMin > 0 && (
              <div className="text-[10px] text-slate-600 tabular-nums">
                {Math.round(totalWeekMin / 60)}h acumulado
              </div>
            )}
          </div>

          {/* Sono */}
          <div className="bg-[#0d1117] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Moon size={14} className="text-indigo-400" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sono</span>
              <StatusDot ok={sleepOk} />
            </div>
            <div className="text-lg font-black text-slate-100 tabular-nums">
              {sleepAvgHours !== undefined ? `${sleepAvgHours}h` : '—'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">média 7 dias</div>
            {sleepOk === false && (
              <div className="text-[10px] text-amber-500 mt-0.5">
                abaixo das 7h ideais
              </div>
            )}
          </div>

          {/* Corpo */}
          <div className="bg-[#0d1117] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-cyan-400" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Corpo</span>
              <StatusDot ok={bodyOk} />
            </div>
            {profile.bodyFat !== undefined ? (
              <>
                <div className="text-lg font-black text-slate-100 tabular-nums">{profile.bodyFat}%</div>
                <div className="text-[10px] text-slate-500 mt-0.5">gordura corporal</div>
              </>
            ) : profile.weight !== undefined ? (
              <>
                <div className="text-lg font-black text-slate-100 tabular-nums">{profile.weight}kg</div>
                <div className="text-[10px] text-slate-500 mt-0.5">peso atual</div>
              </>
            ) : (
              <>
                <div className="text-lg font-black text-slate-600">—</div>
                <div className="text-[10px] text-slate-600 mt-0.5">sem dados</div>
              </>
            )}
          </div>

          {/* Finanças */}
          <div className="bg-[#0d1117] p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={14} className="text-amber-400" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Finanças</span>
              <StatusDot ok={finOk} />
            </div>
            {income > 0 ? (
              <>
                <div className="text-lg font-black text-slate-100 tabular-nums">{invRate}%</div>
                <div className="text-[10px] text-slate-500 mt-0.5">taxa investimento</div>
                <div className={cn(
                  'text-[10px] mt-0.5 font-semibold',
                  invRate >= 20 ? 'text-emerald-500' : invRate >= 10 ? 'text-amber-500' : 'text-red-500',
                )}>
                  {invRate >= 20 ? '✓ acima do ideal' : `meta: 20%`}
                </div>
              </>
            ) : (
              <>
                <div className="text-lg font-black text-slate-600">—</div>
                <div className="text-[10px] text-slate-600 mt-0.5">sem dados</div>
              </>
            )}
          </div>
        </div>

        {/* Diagnosis section */}
        <div className="p-5">
          {!diagText && !loading && (
            <button
              onClick={handleDiagnosis}
              className={cn(
                'w-full flex items-center justify-center gap-2',
                'py-3 px-4 rounded-xl text-sm font-semibold',
                'bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 hover:text-violet-200',
                'border border-violet-500/20 hover:border-violet-500/30',
                'transition-all duration-200 active:scale-98',
              )}
            >
              <Brain size={15} />
              Gerar Diagnóstico Integrado
              <TrendingUp size={13} className="opacity-60" />
            </button>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-3 py-4">
              <Loader2 size={16} className="text-violet-400 animate-spin" />
              <span className="text-sm text-slate-400">Analisando todos os módulos…</span>
            </div>
          )}

          {diagText && !loading && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                  <Brain size={11} className="text-violet-400" />
                </div>
                <span className="text-[11px] font-bold text-violet-300 uppercase tracking-wider">
                  Diagnóstico integrado — hoje
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{diagText}</p>
              <button
                onClick={handleDiagnosis}
                className="text-[11px] text-slate-500 hover:text-slate-400 transition-colors flex items-center gap-1"
              >
                <TrendingUp size={10} /> Gerar nova análise
              </button>
            </div>
          )}
        </div>
      </div>
    </FadeInUp>
  )
}
