// ─────────────────────────────────────────────
//  Component: Weekly Shortcut Card
//  Progresso da semana atual + link rápido
// ─────────────────────────────────────────────

'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { CalendarCheck, ArrowRight, Flame } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { useActiveHabitKeys } from '@/store/selectors'
import { isHabitDoneOnDate } from '@/services/habitsService'
import { getTodayStr, getBRTWeekNumber, getBRTYear, getWeekDaysBRT } from '@/lib/time'

export function WeeklyShortcutCard() {
  const habits     = useAppStore((s) => s.data.habits)
  const activeKeys = useActiveHabitKeys()
  const today      = getTodayStr()
  const weekDates  = getWeekDaysBRT(getBRTYear(), getBRTWeekNumber())

  const { done, total, todayDone, todayTotal } = useMemo(() => {
    let done = 0, total = 0, todayDone = 0, todayTotal = 0
    for (const date of weekDates) {
      for (const key of activeKeys) {
        const h = habits[key]
        if (!h || h.archived) continue
        total++
        if (isHabitDoneOnDate(habits, key, date)) done++
        if (date === today) {
          todayTotal++
          if (isHabitDoneOnDate(habits, key, date)) todayDone++
        }
      }
    }
    return { done, total, todayDone, todayTotal }
  }, [habits, activeKeys, weekDates, today])

  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <Link href="/weekly" className="card p-5 block group hover:border-white/[0.14] transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <CalendarCheck size={16} className="text-amber-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-100">Semana Atual</div>
            <div className="text-[11px] text-slate-500">{done}/{total} hábitos</div>
          </div>
        </div>
        <ArrowRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] mb-1.5">
          <span className="text-slate-500">Progresso semanal</span>
          <span className="font-bold text-amber-400 tabular-nums">{pct}%</span>
        </div>
        <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Today pill */}
      {todayTotal > 0 && (
        <div className="flex items-center gap-2 pt-2 border-t border-white/[0.05]">
          <Flame size={11} className="text-orange-400" />
          <span className="text-[11px] text-slate-500">
            Hoje: <span className="font-bold text-slate-300">{todayDone}/{todayTotal}</span>
          </span>
        </div>
      )}
    </Link>
  )
}
