// ─────────────────────────────────────────────
//  View: Anual — 12 meses com breakdown por hábito
//        + aba Resumo Geral comparando anos
// ─────────────────────────────────────────────

'use client'

import { useState, useMemo } from 'react'
import { useHabits }  from '@/hooks/useHabits'
import { StatCard }   from '@/components/ui/StatCard'
import { HabitIcon }  from '@/lib/habitIcons'
import { FadeInUp, StaggerList, StaggerItem } from '@/components/ui/Motion'
import { formatTime, getMonthKey, getYearTotal, cn } from '@/lib/helpers'
import { getBRTYear } from '@/lib/time'
import { useAppStore } from '@/store/appStore'
import { MONTH_NAMES } from '@/lib/constants'
import { useActiveHabitKeys } from '@/store/selectors'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts'
import {
  Timer, Trophy, Calendar, TrendingUp, TrendingDown,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  BarChart3, CalendarRange,
} from 'lucide-react'
import type { TooltipProps } from 'recharts'
import type { Habit } from '@/types/habit'

// ── Shared tooltip ────────────────────────────

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

// ── Hook: Years with any data ─────────────────

function useYearsWithData(): number[] {
  const habits     = useAppStore((s) => s.data.habits)
  const activeKeys = useActiveHabitKeys()
  return useMemo(() => {
    const yearSet = new Set<number>()
    for (const key of activeKeys) {
      for (const [mk, v] of Object.entries(habits[key]?.monthlyTotals ?? {})) {
        if (v > 0) yearSet.add(parseInt(mk.split('-')[0], 10))
      }
    }
    return [...yearSet].sort()
  }, [habits, activeKeys])
}

// ── MonthBlock ────────────────────────────────

interface MonthBlockProps {
  monthIndex:  number
  monthName:   string
  currentYear: number
  grandTotal:  number
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

          <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${yearPct}%`,
                background: hasData ? 'linear-gradient(90deg, #6366f1, #8b5cf6)' : 'transparent',
              }}
            />
          </div>

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

        {expanded && hasData && (
          <div className="px-4 pb-4 border-t border-white/[0.06] pt-3 space-y-2">
            {habitBreakdown.map(({ key, habit, minutes, color }) => (
              <div key={key} className="flex items-center gap-2.5">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}18` }}
                >
                  <HabitIcon id={habit.icon} size={11} style={{ color }} />
                </div>
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

// ── Year Detail Tab ───────────────────────────

function YearDetailTab({ currentYear }: { currentYear: number }) {
  const { habits } = useHabits()
  const HABIT_KEYS = useActiveHabitKeys()

  // Use monthlyTotals so any year works — not just the live totalYear field
  const yearTotals = useMemo(() =>
    HABIT_KEYS.reduce(
      (acc, k) => ({ ...acc, [k]: getYearTotal(habits[k]?.monthlyTotals ?? {}, currentYear) }),
      {} as Record<string, number>,
    ),
  [HABIT_KEYS, habits, currentYear])

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

  const hasAnyData = grandTotal > 0

  return (
    <div className="space-y-8">

      {/* Stats */}
      <FadeInUp delay={0.05}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Timer size={18} />}     value={formatTime(grandTotal)}          label="Total no Ano"    color="#6366f1" />
          <StatCard icon={<Trophy size={18} />}     value={bestHabit ? habits[bestHabit].name : '—'} label="Hábito Destaque" color="#10b981" />
          <StatCard icon={<Calendar size={18} />}   value={String(currentYear)}             label="Ano"             color="#8b5cf6" />
          <StatCard icon={<TrendingUp size={18} />} value={`${Math.round(grandTotal / 60)}h`} label="Horas Totais"  color="#0ea5e9" />
        </div>
      </FadeInUp>

      {/* No-data state */}
      {!hasAnyData && (
        <FadeInUp delay={0.1}>
          <div className="card p-10 text-center">
            <CalendarRange size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-semibold">Nenhuma sessão registrada em {currentYear}</p>
            <p className="text-slate-600 text-sm mt-1">
              {currentYear > getBRTYear()
                ? 'Ano futuro — os dados aparecerão quando você registrar sessões'
                : 'Navegue para um ano com dados usando os botões acima'}
            </p>
          </div>
        </FadeInUp>
      )}

      {/* Annual line chart */}
      {hasAnyData && (
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
      )}

      {/* 12-month grid */}
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

      {/* Per-habit year ranking */}
      {hasAnyData && (
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
                            style={{ width: `${pct}%`, backgroundColor: color, opacity: 0.8 }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </FadeInUp>
      )}
    </div>
  )
}

// ── Year Card (usado no Resumo Geral) ─────────

interface YearCardData {
  year:     number
  total:    number
  hours:    number
  bestKey:  string | null
  yoyPct:   number | null
}

function YearCard({
  data,
  habits,
  onYearClick,
  isCurrentYear,
}: {
  data:          YearCardData
  habits:        Record<string, Habit>
  onYearClick:   (y: number) => void
  isCurrentYear: boolean
}) {
  const { year, total, hours, bestKey, yoyPct } = data
  const bestHabit = bestKey ? habits[bestKey] : null

  return (
    <button
      onClick={() => onYearClick(year)}
      className={cn(
        'card p-5 text-left w-full transition-all hover:border-white/[0.14] hover:scale-[1.01] active:scale-100',
        isCurrentYear ? 'border-violet-500/25 bg-violet-500/[0.03]' : '',
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-slate-100">{year}</span>
            {isCurrentYear && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">
                atual
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{hours}h registradas</div>
        </div>
        {yoyPct !== null && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl flex-shrink-0',
            yoyPct >= 0
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20',
          )}>
            {yoyPct >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {yoyPct > 0 ? '+' : ''}{yoyPct}% vs {year - 1}
          </div>
        )}
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
          <div className="text-xs text-slate-500 mb-0.5">Total</div>
          <div className="text-sm font-black text-slate-100 tabular-nums">{formatTime(total)}</div>
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
          <div className="text-xs text-slate-500 mb-0.5">Destaque</div>
          {bestHabit ? (
            <div className="text-sm font-black truncate" style={{ color: bestHabit.color }}>
              {bestHabit.name}
            </div>
          ) : (
            <div className="text-sm font-black text-slate-600">—</div>
          )}
        </div>
      </div>

      <div className="mt-3 text-[10px] text-slate-600 font-medium">
        Clique para ver detalhes →
      </div>
    </button>
  )
}

// ── Year Summary Tab ──────────────────────────

function YearSummaryTab({ onYearClick }: { onYearClick: (y: number) => void }) {
  const habits     = useAppStore((s) => s.data.habits)
  const activeKeys = useActiveHabitKeys()
  const todayYear  = getBRTYear()
  const yearsWithData = useYearsWithData()

  const yearData = useMemo<YearCardData[]>(() =>
    yearsWithData.map((y, i) => {
      const total = activeKeys.reduce(
        (sum, k) => sum + getYearTotal(habits[k]?.monthlyTotals ?? {}, y),
        0,
      )
      const bestKey = activeKeys.length > 0
        ? activeKeys.reduce((b, k) =>
            getYearTotal(habits[k]?.monthlyTotals ?? {}, y) >
            getYearTotal(habits[b]?.monthlyTotals ?? {}, y) ? k : b,
            activeKeys[0],
          )
        : null
      const prevTotal = i > 0
        ? activeKeys.reduce(
            (sum, k) => sum + getYearTotal(habits[k]?.monthlyTotals ?? {}, yearsWithData[i - 1]),
            0,
          )
        : null
      const yoyPct = prevTotal !== null && prevTotal > 0
        ? Math.round(((total - prevTotal) / prevTotal) * 100)
        : null
      return { year: y, total, hours: Math.round((total / 60) * 10) / 10, bestKey, yoyPct }
    }),
  [habits, activeKeys, yearsWithData])

  const chartData = yearData.map((d) => ({
    year:  String(d.year),
    total: d.total,
    hours: d.hours,
  }))

  const hasMultipleYears = yearData.length > 1

  if (yearData.length === 0) {
    return (
      <FadeInUp>
        <div className="card p-10 text-center">
          <CalendarRange size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-semibold">Nenhum dado ainda</p>
        </div>
      </FadeInUp>
    )
  }

  return (
    <div className="space-y-8">

      {/* Year cards */}
      <FadeInUp>
        <div className={cn(
          'grid gap-4',
          yearData.length === 1 ? 'grid-cols-1 max-w-sm' : 'grid-cols-1 md:grid-cols-2',
        )}>
          {yearData.map((d) => (
            <YearCard
              key={d.year}
              data={d}
              habits={habits}
              onYearClick={onYearClick}
              isCurrentYear={d.year === todayYear}
            />
          ))}
        </div>
      </FadeInUp>

      {/* Comparison chart (2+ years) */}
      {hasMultipleYears && (
        <FadeInUp delay={0.05}>
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                <BarChart3 size={16} className="text-violet-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Comparativo Anual</h3>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }} barCategoryGap="40%">
                <defs>
                  <linearGradient id="grad-year-bar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#8b5cf6" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="year"
                  tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  dy={6}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v >= 60 ? `${Math.floor(v / 60)}h` : `${v}m`}
                  width={28}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    const v = payload[0].value as number
                    return (
                      <div
                        className="rounded-xl border border-white/[0.1] px-3 py-2 text-xs"
                        style={{ background: 'rgba(13,17,23,0.97)', backdropFilter: 'blur(20px)' }}
                      >
                        <p className="font-bold text-slate-200 mb-1">{label}</p>
                        <p className="text-violet-300 font-black">{formatTime(v)}</p>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="total" fill="url(#grad-year-bar)" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.year === String(todayYear) ? 'url(#grad-year-bar)' : 'rgba(99,102,241,0.45)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </FadeInUp>
      )}

      {/* Single-year message */}
      {!hasMultipleYears && (
        <FadeInUp delay={0.05}>
          <div className="card p-6 text-center border-dashed border-white/[0.08]">
            <p className="text-slate-500 text-sm">
              Volte ano que vem para comparar {yearsWithData[0]} com {yearsWithData[0] + 1}
            </p>
            <p className="text-slate-600 text-xs mt-1">
              O gráfico comparativo aparece automaticamente quando houver 2+ anos com dados
            </p>
          </div>
        </FadeInUp>
      )}
    </div>
  )
}

// ── YearlyView ────────────────────────────────

export function YearlyView() {
  const [tab, setTab] = useState<'yearly' | 'summary'>('yearly')
  const { currentYear } = useHabits()
  const todayYear      = getBRTYear()
  const isCurrentYear  = currentYear === todayYear
  const yearsWithData  = useYearsWithData()

  const earliestYear  = yearsWithData.length > 0 ? yearsWithData[0] : todayYear
  const canGoBack     = currentYear > earliestYear
  const canGoForward  = currentYear < todayYear + 1

  function navigateYear(dir: 'prev' | 'next') {
    if (dir === 'prev' && !canGoBack)     return
    if (dir === 'next' && !canGoForward)  return
    const store = useAppStore.getState()
    const y     = store.data.currentYear + (dir === 'next' ? 1 : -1)
    useAppStore.setState({ data: { ...store.data, currentYear: y } })
  }

  function goToYear(y: number) {
    const store = useAppStore.getState()
    useAppStore.setState({ data: { ...store.data, currentYear: y } })
    setTab('yearly')
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <FadeInUp>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
            <Calendar size={20} className="text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-black text-slate-100">Visão Anual</h2>
            <p className="text-slate-500 text-sm">
              {tab === 'yearly'
                ? `${currentYear} — clique em um mês para expandir`
                : 'Comparativo histórico entre anos'}
            </p>
          </div>

          {/* Tab toggle */}
          <div className="flex rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.02] flex-shrink-0">
            <button
              onClick={() => setTab('yearly')}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold transition-all',
                tab === 'yearly'
                  ? 'bg-violet-500/20 text-violet-300'
                  : 'text-slate-500 hover:text-slate-300',
              )}
            >
              Ano Atual
            </button>
            <button
              onClick={() => setTab('summary')}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold transition-all',
                tab === 'summary'
                  ? 'bg-violet-500/20 text-violet-300'
                  : 'text-slate-500 hover:text-slate-300',
              )}
            >
              Resumo Geral
            </button>
          </div>

          {/* Year navigator — only in yearly tab */}
          {tab === 'yearly' && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => navigateYear('prev')}
                disabled={!canGoBack}
                className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed text-slate-400 hover:text-slate-200 border border-white/[0.06] flex items-center justify-center transition-all"
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
                  Este Ano
                </button>
              )}
              <button
                onClick={() => navigateYear('next')}
                disabled={!canGoForward}
                className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed text-slate-400 hover:text-slate-200 border border-white/[0.06] flex items-center justify-center transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </FadeInUp>

      {tab === 'yearly'
        ? <YearDetailTab currentYear={currentYear} />
        : <YearSummaryTab onYearClick={goToYear} />
      }
    </div>
  )
}
