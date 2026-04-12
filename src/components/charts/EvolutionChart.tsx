'use client'

import { useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { useAppStore }  from '@/store/appStore'
import { getWeekKey, getWeekDates, formatTime } from '@/lib/helpers'
import type { HabitKey } from '@/types/habit'
import { EmptyState }   from '@/components/ui/EmptyState'
import { TrendingUp }   from 'lucide-react'

const HABIT_KEYS: HabitKey[] = ['reading', 'english', 'hiit', 'ppci', 'dopamine', 'fasting']

interface WeekPoint {
  label: string
  consistency: number
  sessions: number
  minutes: number
  weekNum: number
}

interface TooltipEntry {
  dataKey: string
  name: string
  value: number
  color: string
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-2xl border border-white/[0.1] px-4 py-3 text-xs"
      style={{
        background:    'rgba(13,17,23,0.97)',
        backdropFilter:'blur(20px)',
        boxShadow:     '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      <p className="font-bold text-slate-300 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex justify-between gap-6 mb-1">
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            {entry.name}
          </span>
          <span className="font-bold" style={{ color: entry.color }}>
            {entry.dataKey === 'minutes'
              ? formatTime(entry.value)
              : entry.dataKey === 'consistency'
              ? `${entry.value}%`
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function EvolutionChart() {
  const { data } = useAppStore()
  const { habits, currentWeek, currentYear } = data

  const chartData = useMemo<WeekPoint[]>(() => {
    const points: WeekPoint[] = []

    for (let offset = 7; offset >= 0; offset--) {
      let w = currentWeek - offset
      let y = currentYear
      if (w <= 0) { w += 52; y -= 1 }

      const wKey = getWeekKey(y, w)
      const { start: _start } = getWeekDates(y, w)

      let totalDone     = 0
      let totalPossible = 0
      let totalMinutes  = 0

      HABIT_KEYS.forEach((key) => {
        const habit = habits[key]
        const done  = habit.counts[wKey] ?? 0
        totalDone     += done
        totalPossible += habit.frequency
        totalMinutes  += done * habit.target
      })

      const consistency = totalPossible > 0
        ? Math.round((totalDone / totalPossible) * 100)
        : 0

      points.push({
        label:       `S${w}`,
        consistency,
        sessions:    totalDone,
        minutes:     totalMinutes,
        weekNum:     w,
      })
    }

    return points
  }, [habits, currentWeek, currentYear])

  const hasData = chartData.some((p) => p.sessions > 0)

  if (!hasData) {
    return (
      <div className="card p-6">
        <EmptyState
          icon={<TrendingUp className="w-5 h-5 text-slate-600" />}
          title="Dados insuficientes"
          description="Registre sessões por algumas semanas para ver sua evolução"
          size="sm"
        />
      </div>
    )
  }

  // Compute trend (last vs first non-zero week)
  const firstActive = chartData.find((p) => p.consistency > 0)
  const lastActive  = [...chartData].reverse().find((p) => p.consistency > 0)
  const trend = firstActive && lastActive && firstActive !== lastActive
    ? lastActive.consistency - firstActive.consistency
    : null

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Evolução — Últimas 8 Semanas</h3>
          <p className="text-xs text-slate-500 mt-0.5">Consistência, sessões e tempo acumulado</p>
        </div>
        {trend !== null && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl ${
            trend >= 0
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
            {trend >= 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>

      {/* Area chart — consistency */}
      <div className="mb-1">
        <p className="text-[10px] text-slate-600 uppercase tracking-wide font-semibold mb-2">
          Consistência (%)
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="gradConsistency" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradSessions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#22d3ee" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
              axisLine={false} tickLine={false} dy={6}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#64748b', fontSize: 9 }}
              axisLine={false} tickLine={false}
              tickFormatter={(v) => `${v}%`}
              width={28}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="consistency"
              name="Consistência"
              stroke="#7c3aed"
              strokeWidth={2.5}
              fill="url(#gradConsistency)"
              dot={{ fill: '#7c3aed', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#a855f7', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bar group — sessions + minutes */}
      <div>
        <p className="text-[10px] text-slate-600 uppercase tracking-wide font-semibold mb-2">
          Sessões registradas
        </p>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false} tickLine={false} dy={6}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 9 }}
              axisLine={false} tickLine={false}
              width={28}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="sessions"
              name="Sessões"
              stroke="#22d3ee"
              strokeWidth={2}
              fill="url(#gradSessions)"
              dot={{ fill: '#22d3ee', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#67e8f9', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
