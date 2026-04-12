'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useHabits }      from '@/hooks/useHabits'
import { HABIT_COLORS }   from '@/lib/constants'
import type { HabitKey }  from '@/types/habit'
import { formatTime }     from '@/lib/helpers'
import { EmptyState }     from '@/components/ui/EmptyState'
import { BarChart3 }      from 'lucide-react'

interface TooltipPayloadItem {
  payload: { name: string; minutes: number; color: string; progress: number }
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null

  return (
    <div
      className="px-4 py-3 rounded-2xl border border-white/[0.1] text-sm"
      style={{
        background: 'rgba(13,17,23,0.95)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
        <span className="font-bold text-slate-100">{d.name}</span>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between gap-8 text-xs">
          <span className="text-slate-500">Tempo</span>
          <span className="font-bold text-slate-200">{formatTime(d.minutes)}</span>
        </div>
        <div className="flex justify-between gap-8 text-xs">
          <span className="text-slate-500">Progresso</span>
          <span className="font-bold" style={{ color: d.progress >= 100 ? '#10b981' : d.color }}>
            {d.progress}%
          </span>
        </div>
      </div>
    </div>
  )
}

interface CustomBarProps {
  x: number
  y: number
  width: number
  height: number
  fill: string
  color?: string
  progress: number
}

function CustomBar(props: CustomBarProps) {
  const { x, y, width, height, fill, progress } = props
  const isComplete = progress >= 100
  const radius = 6

  return (
    <g>
      {/* Glow behind bar */}
      {height > 0 && (
        <rect
          x={x + width / 2 - 2}
          y={y}
          width={4}
          height={height}
          fill={fill}
          fillOpacity={0.2}
          rx={radius}
          filter="blur(4px)"
        />
      )}
      {/* Bar */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        fillOpacity={isComplete ? 0.95 : 0.8}
        rx={radius}
        ry={radius}
      />
      {/* Top highlight */}
      {height > 8 && (
        <rect
          x={x + 2}
          y={y + 2}
          width={width - 4}
          height={4}
          fill="rgba(255,255,255,0.15)"
          rx={4}
        />
      )}
    </g>
  )
}

export function WeeklyChart() {
  const { habits, currentWeek, currentYear, getWeekMinutes, getWeekProgress } = useHabits()

  const data = (Object.keys(habits) as HabitKey[]).map((key) => ({
    name:     habits[key].name,
    key,
    minutes:  getWeekMinutes(key),
    progress: getWeekProgress(key),
    color:    HABIT_COLORS[key],
    target:   habits[key].target * habits[key].frequency,
  }))

  const hasData = data.some((d) => d.minutes > 0)
  const _maxVal  = Math.max(...data.map((d) => d.minutes), 50)

  if (!hasData) {
    return (
      <div className="card p-6">
        <EmptyState
          icon={<BarChart3 className="w-6 h-6 text-slate-600" />}
          title="Nenhum dado ainda"
          description="Registre sessões para ver seu progresso no gráfico"
          size="sm"
        />
      </div>
    )
  }

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Minutos por hábito</h3>
          <p className="text-xs text-slate-500 mt-0.5">Semana {currentWeek} · {currentYear}</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {data.filter((d) => d.minutes > 0).map((d) => (
            <div key={d.key} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
              <span className="text-[10px] text-slate-500">{d.name}</span>
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 12, right: 8, left: -10, bottom: 0 }}
          barCategoryGap="30%"
        >
          <defs>
            {data.map((d) => (
              <linearGradient key={d.key} id={`grad-${d.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={d.color} stopOpacity={0.95} />
                <stop offset="100%" stopColor={d.color} stopOpacity={0.6} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
            vertical={false}
          />

          <XAxis
            dataKey="name"
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />

          <YAxis
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v >= 60 ? `${Math.floor(v / 60)}h` : `${v}m`}
            width={32}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 6 } as Record<string, unknown>}
          />

          <Bar
            dataKey="minutes"
            radius={[6, 6, 0, 0]}
            maxBarSize={56}
            shape={(props: unknown) => {
              const p = props as CustomBarProps & { name?: string }
              const item = data.find((d) => d.name === p.name)
              return <CustomBar {...p} color={item?.color} progress={item?.progress ?? 0} />
            }}
          >
            {data.map((d) => (
              <Cell
                key={d.key}
                fill={`url(#grad-${d.key})`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
