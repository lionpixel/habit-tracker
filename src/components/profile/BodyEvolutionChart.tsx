// ─────────────────────────────────────────────
//  Component: Body Evolution Chart
// ─────────────────────────────────────────────

'use client'

import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/helpers'
import type { BodyCheckIn } from '@/types/profile'
import type { TooltipProps } from 'recharts'

type Metric = 'weight' | 'bodyFat' | 'leanMass' | 'imc' | 'waist'

const METRICS: { id: Metric; label: string; color: string; unit: string }[] = [
  { id: 'weight',  label: 'Peso',        color: '#6366f1', unit: 'kg'  },
  { id: 'bodyFat', label: '% Gordura',   color: '#ef4444', unit: '%'   },
  { id: 'leanMass',label: 'Massa Magra', color: '#22d3ee', unit: 'kg'  },
  { id: 'imc',     label: 'IMC',         color: '#10b981', unit: ''    },
  { id: 'waist',   label: 'Cintura',     color: '#f59e0b', unit: 'cm'  },
]

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 border border-white/10 shadow-card text-sm min-w-[130px]">
      <p className="text-slate-400 text-xs font-semibold mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex justify-between gap-4 text-xs">
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span className="font-bold text-slate-100 tabular-nums">
            {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

interface BodyEvolutionChartProps {
  history: BodyCheckIn[]
}

export function BodyEvolutionChart({ history }: BodyEvolutionChartProps) {
  const [activeMetrics, setActiveMetrics] = useState<Metric[]>(['weight'])

  const data = [...history]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30)
    .map((entry) => ({
      date:    entry.date.slice(5), // MM-DD
      weight:  entry.weight,
      bodyFat: entry.bodyFat,
      leanMass:entry.leanMass,
      imc:     entry.imc,
      waist:   entry.waist,
    }))

  function toggleMetric(id: Metric) {
    setActiveMetrics((prev) =>
      prev.includes(id)
        ? prev.filter((m) => m !== id)
        : [...prev, id],
    )
  }

  if (!history.length) {
    return (
      <div className="card p-8 flex flex-col items-center justify-center gap-2 text-center">
        <p className="text-slate-500 text-sm">Nenhum check-in registrado ainda.</p>
        <p className="text-slate-600 text-xs">Faça seu primeiro check-in para ver o gráfico de evolução.</p>
      </div>
    )
  }

  return (
    <div className="card p-6">
      {/* Metric toggles */}
      <div className="flex flex-wrap gap-2 mb-5">
        {METRICS.map(({ id, label, color }) => {
          const active = activeMetrics.includes(id)
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggleMetric(id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
                active
                  ? 'text-slate-100'
                  : 'bg-white/[0.04] text-slate-600 hover:text-slate-400',
              )}
              style={active ? { background: `${color}20`, color } : undefined}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: active ? color : '#475569' }}
              />
              {label}
            </button>
          )
        })}
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            {METRICS.map(({ id, color }) => (
              <linearGradient key={id} id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0}    />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          {METRICS.filter(({ id }) => activeMetrics.includes(id)).map(({ id, label, color }) => (
            <Area
              key={id}
              type="monotone"
              dataKey={id}
              name={label}
              stroke={color}
              strokeWidth={2}
              fill={`url(#grad-${id})`}
              dot={{ r: 3, fill: color, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
              connectNulls
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
