'use client'

// ─────────────────────────────────────────────
//  Gráfico: Evolução Mensal por Hábito
//  Barras empilhadas — dinâmico, lê do appStore
// ─────────────────────────────────────────────

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useMonthlyBarData } from '@/hooks/useMonthlyBarData'
import { formatTime }        from '@/lib/helpers'
import { BarChart3, TrendingDown, TrendingUp } from 'lucide-react'

interface TooltipPayloadEntry {
  dataKey: string
  name:    string
  value:   number
  color:   string
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?:  boolean
  payload?: TooltipPayloadEntry[]
  label?:   string
}) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((sum, e) => sum + (e.value ?? 0), 0)
  return (
    <div
      className="rounded-2xl border border-white/[0.1] px-4 py-3 text-xs"
      style={{
        background:    'rgba(13,17,23,0.97)',
        backdropFilter:'blur(20px)',
        boxShadow:     '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      <p className="font-bold text-slate-200 mb-2 text-sm">{label}</p>
      {payload.map((e) => (
        <div key={e.dataKey} className="flex justify-between gap-6 mb-1">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: e.color }} />
            {e.name}
          </span>
          <span className="font-bold tabular-nums" style={{ color: e.color }}>
            {formatTime(e.value)}
          </span>
        </div>
      ))}
      <div className="border-t border-white/[0.08] mt-2 pt-2 flex justify-between">
        <span className="text-slate-500">Total</span>
        <span className="font-bold text-slate-200">{formatTime(total)}</span>
      </div>
    </div>
  )
}

export function MonthlyBarChart() {
  const { bars, data, momLastTwo, bestMonth } = useMonthlyBarData()

  if (!data.length || !bars.length) return null

  const lastTwo = data.length >= 2
    ? `${data[data.length - 2].month}→${data[data.length - 1].month}`
    : null

  // Label for header: range of months shown
  const rangeLabel = data.length === 1
    ? data[0].month
    : `${data[0].month} · … · ${data[data.length - 1].month}`

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/12 flex items-center justify-center">
            <BarChart3 size={16} className="text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Evolução Mensal</h3>
            <p className="text-xs text-slate-500">{rangeLabel} — por hábito</p>
          </div>
        </div>

        {/* MoM badge — last two months */}
        {momLastTwo !== null && lastTwo && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl ${
            momLastTwo >= 0
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {momLastTwo >= 0
              ? <TrendingUp className="w-3 h-3" />
              : <TrendingDown className="w-3 h-3" />}
            {lastTwo} {momLastTwo > 0 ? '+' : ''}{momLastTwo}%
          </div>
        )}
      </div>

      {/* Totals row — last 3 months max */}
      <div className={`grid gap-3 mb-5`} style={{ gridTemplateColumns: `repeat(${Math.min(data.length, 3)}, 1fr)` }}>
        {data.slice(-3).map((d) => {
          const isBest = bestMonth?.monthKey === d.monthKey
          return (
            <div
              key={d.monthKey}
              className={`rounded-xl p-3 border text-center ${
                isBest
                  ? 'border-violet-500/30 bg-violet-500/[0.06]'
                  : 'border-white/[0.06] bg-white/[0.02]'
              }`}
            >
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{d.month}</div>
              <div className={`text-sm font-black mt-0.5 tabular-nums ${isBest ? 'text-violet-300' : 'text-slate-200'}`}>
                {formatTime(d.total)}
              </div>
              {isBest && <div className="text-[9px] text-violet-400/80 font-semibold mt-0.5">Melhor mês</div>}
            </div>
          )
        })}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }} barCategoryGap="28%">
          <defs>
            {bars.map((h) => (
              <linearGradient key={h.key} id={`grad-m-${h.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={h.color} stopOpacity={0.9} />
                <stop offset="100%" stopColor={h.color} stopOpacity={0.55} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
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
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
          <Legend
            iconType="circle"
            iconSize={7}
            wrapperStyle={{ fontSize: '10px', color: '#64748b', paddingTop: '12px' }}
          />
          {bars.map((h, i) => (
            <Bar
              key={h.key}
              dataKey={h.key}
              name={h.label}
              stackId="a"
              fill={`url(#grad-m-${h.key})`}
              radius={i === bars.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
