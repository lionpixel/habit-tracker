'use client'

import { cn } from '@/lib/helpers'
import type { DurationConfig, DurationUnit } from '@/types/habit'

interface DurationSelectorProps {
  value:    DurationConfig
  onChange: (v: DurationConfig) => void
  color?:   string
}

const UNIT_OPTIONS: { unit: DurationUnit; label: string; max: number; step: number; examples: string[] }[] = [
  { unit: 'min',       label: 'Minutos',    max: 480,  step: 5,   examples: ['15 min', '25 min', '50 min'] },
  { unit: 'hours',     label: 'Horas',      max: 12,   step: 0.5, examples: ['1h', '1.5h', '2h'] },
  { unit: 'days',      label: 'Dias',       max: 90,   step: 1,   examples: ['1 dia', '7 dias', '40 dias'] },
  { unit: 'pomodoros', label: 'Pomodoros',  max: 20,   step: 1,   examples: ['2 pomos', '4 pomos', '8 pomos'] },
]

const QUICK_PRESETS: Record<DurationUnit, number[]> = {
  min:       [10, 15, 25, 30, 45, 50, 60, 90],
  hours:     [0.5, 1, 1.5, 2, 3, 4],
  days:      [1, 3, 7, 14, 30, 40],
  pomodoros: [1, 2, 3, 4, 6, 8],
}

function toMinutes(v: DurationConfig): number {
  if (v.unit === 'min')       return v.value
  if (v.unit === 'hours')     return Math.round(v.value * 60)
  if (v.unit === 'days')      return Math.round(v.value * 1440)
  if (v.unit === 'pomodoros') return v.value * 25
  return v.value
}

function displayLabel(v: DurationConfig): string {
  if (v.unit === 'pomodoros') return `${v.value} pomodoro${v.value > 1 ? 's' : ''} (${v.value * 25} min)`
  if (v.unit === 'hours')     return `${v.value}h (${Math.round(v.value * 60)} min)`
  if (v.unit === 'days')      return `${v.value} dia${v.value > 1 ? 's' : ''}`
  return `${v.value} min`
}

export function DurationSelector({ value, onChange, color = '#7c3aed' }: DurationSelectorProps) {
  const presets = QUICK_PRESETS[value.unit]

  return (
    <div className="space-y-4">
      {/* Unit tabs */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-white/[0.04] rounded-xl border border-white/[0.06]">
        {UNIT_OPTIONS.map(({ unit, label }) => (
          <button
            key={unit}
            type="button"
            onClick={() => {
              const newUnit = unit
              // Attempt a sensible conversion
              let newVal = value.value
              if (newUnit === 'hours' && value.unit === 'min')   newVal = Math.max(0.5, Math.round(value.value / 60 * 2) / 2)
              if (newUnit === 'min' && value.unit === 'hours')   newVal = Math.round(value.value * 60)
              if (newUnit === 'pomodoros' && value.unit === 'min') newVal = Math.max(1, Math.round(value.value / 25))
              if (newUnit === 'min' && value.unit === 'pomodoros') newVal = value.value * 25
              onChange({ value: newVal, unit: newUnit })
            }}
            className={cn(
              'py-2 px-1 rounded-lg text-[11px] font-semibold transition-all text-center',
              value.unit === unit
                ? 'text-white'
                : 'text-slate-500 hover:text-slate-300',
            )}
            style={value.unit === unit ? {
              background: `linear-gradient(135deg, ${color}, ${color}cc)`,
              boxShadow: `0 2px 8px ${color}40`,
            } : {}}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Value input with +/- */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            const step = UNIT_OPTIONS.find((u) => u.unit === value.unit)?.step ?? 1
            onChange({ ...value, value: Math.max(step, parseFloat((value.value - step).toFixed(2))) })
          }}
          className="w-10 h-10 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 font-bold border border-white/[0.08] flex items-center justify-center text-xl transition-all"
        >−</button>
        <div className="flex-1 text-center">
          <input
            type="number"
            value={value.value}
            min={0}
            step={UNIT_OPTIONS.find((u) => u.unit === value.unit)?.step ?? 1}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              if (!isNaN(v) && v > 0) onChange({ ...value, value: v })
            }}
            className="input text-center text-2xl font-black w-full tabular-nums"
          />
          <p className="text-[11px] text-slate-500 mt-1">{displayLabel(value)}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            const step = UNIT_OPTIONS.find((u) => u.unit === value.unit)?.step ?? 1
            const max  = UNIT_OPTIONS.find((u) => u.unit === value.unit)?.max  ?? 9999
            onChange({ ...value, value: Math.min(max, parseFloat((value.value + step).toFixed(2))) })
          }}
          className="w-10 h-10 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 font-bold border border-white/[0.08] flex items-center justify-center text-xl transition-all"
        >+</button>
      </div>

      {/* Quick presets */}
      <div>
        <label className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold block mb-2">
          Atalhos rápidos
        </label>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChange({ ...value, value: p })}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all border',
                value.value === p
                  ? 'text-white border-transparent'
                  : 'bg-white/[0.04] text-slate-400 border-white/[0.07] hover:bg-white/[0.08]',
              )}
              style={value.value === p ? {
                background: `${color}30`,
                borderColor: `${color}50`,
              } : {}}
            >
              {p}{value.unit === 'min' ? 'm' : value.unit === 'hours' ? 'h' : value.unit === 'pomodoros' ? '🍅' : 'd'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export { toMinutes as durationToMinutes, displayLabel as durationLabel }
