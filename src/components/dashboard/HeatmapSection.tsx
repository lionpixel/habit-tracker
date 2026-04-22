'use client'

import { useMemo, useRef, useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { getWeekKey, getWeekDates, formatDate } from '@/lib/helpers'
import { getBRTWeekNumber } from '@/lib/time'
import { HABIT_COLORS } from '@/lib/constants'
import type { HabitKey } from '@/types/habit'
import { cn } from '@/lib/helpers'

const HABIT_KEYS: HabitKey[] = ['reading', 'english', 'hiit', 'ppci', 'dopamine', 'fasting']
const MONTHS_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const DAYS_PT   = ['D','S','T','Q','Q','S','S']

interface WeekCell {
  weekNum: number
  year: number
  startDate: Date
  endDate: Date
  consistency: number   // 0-100
  sessions: number
  totalPossible: number
  habitBreakdown: { key: HabitKey; name: string; color: string; done: number; max: number }[]
}

function getIntensityClass(pct: number): string {
  if (pct === 0)    return 'bg-white/[0.04]'
  if (pct <= 25)    return 'bg-violet-500/20'
  if (pct <= 50)    return 'bg-violet-500/40'
  if (pct <= 75)    return 'bg-violet-500/62'
  return                   'bg-violet-500/90'
}

function getIntensityStyle(pct: number): React.CSSProperties {
  if (pct === 0) return {}
  const alpha = pct <= 25 ? 0.2 : pct <= 50 ? 0.4 : pct <= 75 ? 0.62 : 0.9
  return { background: `rgba(124,58,237,${alpha})` }
}

interface TooltipState {
  cell: WeekCell
  x: number
  y: number
}

export function HeatmapSection() {
  const { data } = useAppStore()
  const { habits, currentYear } = data
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  // Build 52-week grid for current year
  const weeks = useMemo<WeekCell[]>(() => {
    const result: WeekCell[] = []

    for (let w = 1; w <= 52; w++) {
      const { start, end } = getWeekDates(currentYear, w)
      const wKey = getWeekKey(currentYear, w)

      let totalDone     = 0
      let totalPossible = 0
      const breakdown = HABIT_KEYS.map((key) => {
        const habit = habits[key]
        const done  = habit.counts[wKey] ?? 0
        const max   = habit.frequency
        totalDone     += done
        totalPossible += max
        return { key, name: habit.name, color: HABIT_COLORS[key], done, max }
      })

      const consistency = totalPossible > 0
        ? Math.round((totalDone / totalPossible) * 100)
        : 0

      result.push({
        weekNum: w,
        year: currentYear,
        startDate: start,
        endDate: end,
        consistency,
        sessions: totalDone,
        totalPossible,
        habitBreakdown: breakdown,
      })
    }
    return result
  }, [habits, currentYear])

  // Group weeks into months for header labels
  const monthLabels = useMemo(() => {
    const labels: { month: number; col: number }[] = []
    weeks.forEach((w, i) => {
      const month = w.startDate.getMonth()
      if (i === 0 || weeks[i - 1].startDate.getMonth() !== month) {
        labels.push({ month, col: i })
      }
    })
    return labels
  }, [weeks])

  // Stats summary
  const totalSessions     = weeks.reduce((acc, w) => acc + w.sessions, 0)
  const activeWeeks       = weeks.filter((w) => w.sessions > 0).length
  const avgConsistency    = activeWeeks > 0
    ? Math.round(weeks.filter(w => w.sessions > 0).reduce((acc, w) => acc + w.consistency, 0) / activeWeeks)
    : 0
  const currentWeekNum    = getBRTWeekNumber()
  const _currentWeekCell   = weeks.find(w => w.weekNum === currentWeekNum)

  function handleCellEnter(e: React.MouseEvent, cell: WeekCell) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return
    setTooltip({
      cell,
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top,
    })
  }

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Heatmap de Consistência {currentYear}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {totalSessions} sessões · {activeWeeks} semanas ativas · {avgConsistency}% média
          </p>
        </div>
        {/* Legend */}
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="text-[10px] text-slate-600">Menos</span>
          {[0, 20, 40, 65, 90].map((alpha, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm border border-white/[0.06]"
              style={{ background: alpha === 0 ? 'rgba(255,255,255,0.04)' : `rgba(124,58,237,${alpha / 100})` }}
            />
          ))}
          <span className="text-[10px] text-slate-600">Mais</span>
        </div>
      </div>

      {/* Grid */}
      <div ref={containerRef} className="relative overflow-x-auto scrollable pb-2">
        <div className="min-w-[680px]">
          {/* Month labels */}
          <div className="relative h-5 mb-1">
            {monthLabels.map(({ month, col }) => (
              <div
                key={`${month}-${col}`}
                className="absolute text-[10px] text-slate-600 font-medium"
                style={{ left: `${(col / 52) * 100}%` }}
              >
                {MONTHS_PT[month]}
              </div>
            ))}
          </div>

          {/* Day-of-week labels + cells */}
          <div className="flex gap-[3px]">
            {/* Day labels column */}
            <div className="flex flex-col gap-[3px] mr-1">
              {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                <div
                  key={d}
                  className="w-3 h-3 flex items-center justify-center text-[8px] text-slate-700 leading-none"
                >
                  {d % 2 === 1 ? DAYS_PT[d] : ''}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((cell) => {
              const isCurrentWeek = cell.weekNum === currentWeekNum && cell.year === currentYear
              return (
                <div key={cell.weekNum} className="flex flex-col gap-[3px]">
                  {/* 7 day slots per week — all same color (weekly granularity) */}
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                    <div
                      key={day}
                      className={cn(
                        'w-3 h-3 rounded-sm transition-all duration-150 cursor-pointer',
                        'border border-white/[0.04]',
                        isCurrentWeek && 'ring-1 ring-violet-400/50 ring-offset-0',
                        day === 0 ? getIntensityClass(cell.consistency) : '',
                        day > 0 ? 'opacity-80' : '',
                      )}
                      style={day === 0 ? getIntensityStyle(cell.consistency) : {
                        background: cell.consistency > 0
                          ? `rgba(124,58,237,${(cell.consistency / 100) * 0.7})`
                          : 'rgba(255,255,255,0.03)',
                      }}
                      onMouseEnter={(e) => day === 0 && handleCellEnter(e, cell)}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              left: tooltip.x,
              top:  tooltip.y - 8,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="glass border border-white/[0.1] rounded-2xl p-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] min-w-[180px]">
              {/* Week header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-200">
                  Semana {tooltip.cell.weekNum}
                </span>
                <span className={cn(
                  'text-xs font-bold px-1.5 py-0.5 rounded-md',
                  tooltip.cell.consistency >= 75 ? 'text-emerald-400 bg-emerald-500/12' :
                  tooltip.cell.consistency >= 50 ? 'text-violet-400 bg-violet-500/12' :
                  tooltip.cell.consistency > 0   ? 'text-amber-400 bg-amber-500/12'   :
                  'text-slate-500 bg-white/[0.04]',
                )}>
                  {tooltip.cell.consistency}%
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mb-2">
                {formatDate(tooltip.cell.startDate)} – {formatDate(tooltip.cell.endDate)}
              </div>

              {/* Habit breakdown */}
              <div className="space-y-1">
                {tooltip.cell.habitBreakdown.map((h) => (
                  <div key={h.key} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: h.color }} />
                    <span className="text-[10px] text-slate-400 flex-1 truncate">{h.name}</span>
                    <span className="text-[10px] font-bold text-slate-300">{h.done}/{h.max}</span>
                  </div>
                ))}
              </div>

              {/* Sessions total */}
              <div className="mt-2 pt-2 border-t border-white/[0.06] flex justify-between">
                <span className="text-[10px] text-slate-500">Total</span>
                <span className="text-[10px] font-bold text-slate-300">
                  {tooltip.cell.sessions}/{tooltip.cell.totalPossible} sessões
                </span>
              </div>
            </div>
            {/* Arrow */}
            <div className="w-2 h-2 bg-[#0d1117] border-r border-b border-white/[0.1] rotate-45 mx-auto -mt-1" />
          </div>
        )}
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/[0.05]">
        <div className="text-center">
          <div className="text-lg font-black text-gradient-brand tabular-nums">{totalSessions}</div>
          <div className="text-[10px] text-slate-600 uppercase tracking-wide mt-0.5">Total sessões</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-black text-gradient-brand tabular-nums">{activeWeeks}</div>
          <div className="text-[10px] text-slate-600 uppercase tracking-wide mt-0.5">Sem. ativas</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-black text-gradient-brand tabular-nums">{avgConsistency}%</div>
          <div className="text-[10px] text-slate-600 uppercase tracking-wide mt-0.5">Consistência</div>
        </div>
      </div>
    </div>
  )
}
