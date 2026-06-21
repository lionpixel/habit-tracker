// ─────────────────────────────────────────────
//  View: Anual — 12 meses com breakdown por hábito
// ─────────────────────────────────────────────

'use client'

import { useState } from 'react'
import { useHabits }  from '@/hooks/useHabits'
import { StatCard }   from '@/components/ui/StatCard'
import { HabitIcon }  from '@/lib/habitIcons'
import { FadeInUp, StaggerList, StaggerItem } from '@/components/ui/Motion'
import { formatTime, getMonthKey } from '@/lib/helpers'
import { getBRTYear } from '@/lib/time'
import { useAppStore } from '@/store/appStore'
import { MONTH_NAMES } from '@/lib/constants'
import { useActiveHabitKeys } from '@/store/selectors'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { Timer, Trophy, Calendar, TrendingUp, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/helpers'
import type { TooltipProps } from 'recharts'
function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 border border-white/10 shadow-card text-sm min-w-[140px]">
      <p className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex justify-between gap-4">
          <span style={{ color: entry.color }} className="text-xs">{entry.name}</span>
          <span className="font-bold text-slate-100 text-xs">{formatTime(entry.value as number)}</span>
        </div>
      ))}
    </div>
  )
}

// ── MonthBlock ────────────────────────────────

interface MonthBlockProps {
  monthIndex:  number   // 0-11
  monthName:   string
  currentYear: number
  grandTotal:  number   // year total for bar scaling
}

function MonthBlock({ monthIndex, monthName, currentYear, grandTotal }: MonthBlockProps) {
  const { habits } = useHabits()
  const habitKeys  = useActiveHabitKeys()
  const [expanded, setExpanded] = useState(false)

  const mKey       = getMonthKey(currentYear, monthIndex + 1)
  const monthTotal = habitKeys.reduce(
    (acc, k) => acc + (habits[k].monthlyTotals[mKey] ?? 0),
    0,
  )
  const yearPct    = grandTotal > 0 ? Math.round((monthTotal / grandTotal) * 100) : 0

  const habitBreakdown = habitKeys.map((k) => ({
    key:     k,
    habit:   habits[k],
    minutes: habits[k].monthlyTotals[mKey] ?? 0,
    color:   habits[k].color,
  })).filter((h) => h.minutes > 0)

  const hasData = monthTotal > 0

  return (
    <StaggerItem>
      <div
        className={cn(
          'card overflow-hidden transition-all duration-300 cursor-pointer',
          hasData ? 'hover:border-white/[0.14]' : 'opacity-60',
        )}
        onClick={() => hasData && setExpanded((e) => !e)}
      >
        {/* Month header */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-bold text-slate-200 text-sm">{monthName}</div>
              <div className="text-[10px] text-slate-500 mt-0.5 tabular-nums">
                {hasData ? formatTime(monthTotal) : 'sem dados'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasData && (
                <span className="text-[10px] font-bold text-indigo-400 tabular-nums">{yearPct}%</span>
              )}
              {hasData && (
                expanded
                  ? <ChevronUp size={13} className="text-slate-500" />
                  : <ChevronDown size={13} className="text-slate-500" />
              )}
            </div>
          </div>

          {/* Total bar */}
          <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${yearPct}%`,
                background: hasData
                  ? 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                  : 'transparent',
              }}
            />
          </div>

          {/* Stacked mini bars per habit */}
          {hasData && (
            <div className="flex gap-0.5 h-2 rounded-full overflow-hidden">
              {habitKeys.map((k) => {
                const min = habits[k].monthlyTotals[mKey] ?? 0
                const pct = monthTotal > 0 ? (min / monthTotal) * 100 : 0
                if (pct === 0) return null
                return (
                  <div
                    key={k}
                    className="h-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: habits[k].color, opacity: 0.8 }}
                    title={`${habits[k].name}: ${formatTime(min)}`}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* Expanded breakdown */}
        {expanded && hasData && (
          <div className="px-4 pb-4 border-t border-white/[0.06] pt-3 space-y-2">
            {habitBreakdown.map(({ key, habit, minutes, color }) => (
              <div key={key} className="flex items-center gap-2.5">
                {/* Icon */}
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}18` }}
                >
                  <HabitIcon id={habit.icon} size={11} style={{ color }} />
                </div>
                {/* Name + bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-semibold text-slate-300 truncate">{habit.name}</span>
                    <span className="text-[10px] font-bold tabular-nums flex-shrink-0" style={{ color }}>
                      {formatTime(minutes)}
                    </span>
                  </div>
                  <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${monthTotal > 0 ? (minutes / monthTotal) * 100 : 0}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Month total */}
            <div className="flex items-center justify-between pt-1 border-t border-white/[0.05] mt-1">
              <span className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Total</span>
              <span className="text-xs font-black text-indigo-400 tabular-nums">{formatTime(monthTotal)}</span>
            </div>
          </div>
        )}
      </div>
    </StaggerItem>
  )
}

// ── YearlyView ────────────────────────────────

export function YearlyView() {
  const { habits, currentYear } = useHabits()
  const HABIT_KEYS    = useActiveHabitKeys()
  const todayYear     = getBRTYear()
  const isCurrentYear = currentYear === todayYear

  function navigateYear(dir: 'prev' | 'next') {
    const store = useAppStore.getState()
    const y = store.data.currentYear + (dir === 'next' ? 1 : -1)
    useAppStore.setState({ data: { ...store.data, currentYear: y } })
  }

  const yearTotals = HABIT_KEYS.reduce(
    (acc, k) => ({ ...acc, [k]: habits[k].totalYear }),
    {} as Record<string, number>,
  )

  const grandTotal = Object.values(yearTotals).reduce((a, b) => a + b, 0)
  const bestHabit  = HABIT_KEYS.length > 0
    ? HABIT_KEYS.reduce((b, k) => yearTotals[k] > yearTotals[b] ? k : b, HABIT_KEYS[0])
    : null

  const lineData = MONTH_NAMES.map((name, i) => {
    const mKey  = getMonthKey(currentYear, i + 1)
    const point: Record<string, string | number> = { month: name.slice(0, 3) }
    HABIT_KEYS.forEach((k) => {
      point[habits[k].name] = habits[k].monthlyTotals[mKey] ?? 0
    })
    return point
  })

  return (
    <div className="space-y-8">

      {/* Header + year navigator */}
      <FadeInUp>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
            <Calendar size={20} className="text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-black text-slate-100">Visão Anual</h2>
            <p className="text-slate-500 text-sm">{currentYear} — clique em um mês para expandir</p>
          </div>
          {/* Year nav */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => navigateYear('prev')}
              className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border border-white/[0.06] flex items-center justify-center transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {!isCurrentYear && (
              <button
                onClick={() => useAppStore.setState({
                  data: { ...useAppStore.getState().data, currentYear: todayYear },
                })}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 hover:text-violet-300 border border-violet-500/20 transition-all"
              >
                Hoje
              </button>
            )}
            <button
              onClick={() => navigateYear('next')}
              className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border border-white/[0.06] flex items-center justify-center transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </FadeInUp>

      {/* Stats */}
      <FadeInUp delay={0.05}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Timer size={18} />}       value={formatTime(grandTotal)}    label="Total no Ano"    color="#6366f1" />
          <StatCard icon={<Trophy size={18} />}       value={bestHabit ? habits[bestHabit].name : '—'} label="Hábito Destaque" color="#10b981" />
          <StatCard icon={<Calendar size={18} />}     value={String(currentYear)}       label="Ano Atual"       color="#8b5cf6" />
          <StatCard icon={<TrendingUp size={18} />}   value={`${Math.round(grandTotal / 60)}h`} label="Horas Totais" color="#0ea5e9" />
        </div>
      </FadeInUp>

      {/* Annual line chart */}
      <FadeInUp delay={0.1}>
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
              <TrendingUp size={16} className="text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Evolução Mensal por Hábito</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}m`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b', paddingTop: '16px' }} />
              {HABIT_KEYS.map((k) => (
                <Line
                  key={k}
                  type="monotone"
                  dataKey={habits[k].name}
                  stroke={habits[k].color}
                  strokeWidth={2}
                  dot={{ r: 3, fill: habits[k].color }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </FadeInUp>

      {/* 12-month grid — each block expandable */}
      <FadeInUp delay={0.15}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
            <Calendar size={15} className="text-violet-400" />
          </div>
          <h3 className="text-base font-bold text-slate-100">Meses do Ano</h3>
          <span className="text-xs text-slate-500 ml-1">— clique para ver detalhes por hábito</span>
        </div>
        <StaggerList className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {MONTH_NAMES.map((name, i) => (
            <MonthBlock
              key={name}
              monthIndex={i}
              monthName={name}
              currentYear={currentYear}
              grandTotal={grandTotal}
            />
          ))}
        </StaggerList>
      </FadeInUp>

      {/* Per-habit year totals bar chart */}
      <FadeInUp delay={0.2}>
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <Trophy size={15} className="text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Ranking por Hábito — {currentYear}</h3>
          </div>
          <div className="space-y-3">
            {[...HABIT_KEYS]
              .sort((a, b) => yearTotals[b] - yearTotals[a])
              .map((k, rank) => {
                const pct   = grandTotal > 0 ? (yearTotals[k] / grandTotal) * 100 : 0
                const color = habits[k].color
                return (
                  <div key={k} className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-600 w-4 text-center tabular-nums">
                      {rank + 1}
                    </span>
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${color}18` }}
                    >
                      <HabitIcon id={habits[k].icon} size={13} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-200 truncate">{habits[k].name}</span>
                        <span className="text-xs font-black tabular-nums flex-shrink-0" style={{ color }}>
                          {formatTime(yearTotals[k])}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-600 tabular-nums w-8 text-right">
                      {Math.round(pct)}%
                    </span>
                  </div>
                )
              })}
          </div>
        </div>
      </FadeInUp>
    </div>
  )
}
