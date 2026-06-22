'use client'

// ─────────────────────────────────────────────
//  BenchmarkBar — Barra horizontal de posição relativa
//  Mostra onde o usuário está vs médias nacionais e globais
// ─────────────────────────────────────────────

import { cn } from '@/lib/helpers'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface BenchmarkBarProps {
  userValue: number
  unit: string
  national?: number
  global?: number
  recommended?: number
  top10?: number
  worst25?: number
  label?: string
  higherIsBetter?: boolean
  className?: string
  compact?: boolean
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

export function BenchmarkBar({
  userValue,
  unit,
  national,
  global: globalAvg,
  recommended,
  top10,
  worst25,
  label,
  higherIsBetter = true,
  className,
  compact = false,
}: BenchmarkBarProps) {
  // Establish range
  const allValues = [userValue, national, globalAvg, recommended, top10, worst25].filter(
    (v): v is number => v !== undefined,
  )
  const minVal = Math.min(...allValues) * 0.9
  const maxVal = Math.max(...allValues) * 1.1
  const range  = maxVal - minVal || 1

  function pct(v: number) {
    return clamp(((v - minVal) / range) * 100, 2, 98)
  }

  // Determine user comparison
  const compareTarget = recommended ?? globalAvg ?? national
  const diff = compareTarget !== undefined ? userValue - compareTarget : undefined
  const diffPct = compareTarget !== undefined && compareTarget !== 0
    ? Math.round(Math.abs(diff!) / compareTarget * 100)
    : undefined

  const isAbove = diff !== undefined && diff >= 0
  const isGood  = higherIsBetter ? isAbove : !isAbove
  const diffColor = isGood ? 'text-emerald-400' : 'text-red-400'
  const DiffIcon = diff === undefined ? Minus : isGood ? TrendingUp : TrendingDown

  const markers: { val: number; label: string; color: string; size?: 'big' }[] = []
  if (worst25 !== undefined)   markers.push({ val: worst25,   label: 'pior 25%', color: '#ef4444' })
  if (national !== undefined)  markers.push({ val: national,  label: 'BR média', color: '#f59e0b' })
  if (globalAvg !== undefined) markers.push({ val: globalAvg, label: 'Global',   color: '#6366f1' })
  if (recommended !== undefined) markers.push({ val: recommended, label: 'Ideal', color: '#10b981' })
  if (top10 !== undefined)     markers.push({ val: top10,     label: 'Top 10%',  color: '#22d3ee' })

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-semibold">{label}</span>
          {diff !== undefined && diffPct !== undefined && (
            <div className={cn('flex items-center gap-1 text-[11px] font-bold', diffColor)}>
              <DiffIcon size={11} />
              {diffPct}% {isGood ? 'acima' : 'abaixo'} {recommended ? 'do ideal' : 'da média'}
            </div>
          )}
        </div>
      )}

      {/* Bar */}
      <div className="relative h-2.5 bg-white/[0.05] rounded-full overflow-visible">
        {/* Filled section up to user value */}
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct(userValue)}%`,
            background: isGood
              ? 'linear-gradient(90deg, #6366f1, #10b981)'
              : 'linear-gradient(90deg, #6366f1, #ef4444)',
          }}
        />

        {/* Reference markers */}
        {markers.map((m) => (
          <div
            key={m.label}
            className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4"
            style={{ left: `${pct(m.val)}%`, background: m.color }}
            title={`${m.label}: ${m.val} ${unit}`}
          />
        ))}

        {/* User dot */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-lg -translate-x-1/2 z-10"
          style={{
            left: `${pct(userValue)}%`,
            background: isGood ? '#10b981' : '#ef4444',
          }}
        />
      </div>

      {/* Labels */}
      {!compact && (
        <div className="relative h-4">
          {markers.map((m) => (
            <div
              key={m.label}
              className="absolute -translate-x-1/2 flex flex-col items-center gap-0.5"
              style={{ left: `${pct(m.val)}%` }}
            >
              <span className="text-[9px] font-semibold whitespace-nowrap" style={{ color: m.color }}>
                {m.val}{unit === '%' || unit === 'h' ? unit : ''}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      {!compact && markers.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {markers.map((m) => (
            <div key={m.label} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />
              <span className="text-[9px] text-slate-600">{m.label}: {m.val}{unit === '%' ? '%' : ''}</span>
            </div>
          ))}
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full border border-white bg-emerald-500" />
            <span className="text-[9px] text-slate-600">Você: {userValue}{unit === '%' ? '%' : ''}</span>
          </div>
        </div>
      )}
    </div>
  )
}
