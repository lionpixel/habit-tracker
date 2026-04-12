'use client'

import { cn } from '@/lib/helpers'
import type { RecurrenceConfig, RecurrenceType, DayOfWeek } from '@/types/habit'

interface RecurrenceSelectorProps {
  value:    RecurrenceConfig
  onChange: (v: RecurrenceConfig) => void
  color?:   string
}

const RECURRENCE_OPTIONS: { type: RecurrenceType; label: string; sub?: string }[] = [
  { type: 'daily',           label: 'Todos os dias',          sub: '7×/sem' },
  { type: 'weekdays',        label: 'Dias úteis',             sub: '5×/sem' },
  { type: 'weekends',        label: 'Fins de semana',         sub: '2×/sem' },
  { type: 'times_per_week',  label: 'N vezes por semana',     sub: 'personalizado' },
  { type: 'custom_week',     label: 'Dias específicos',       sub: 'escolher dias' },
  { type: 'times_per_month', label: 'N vezes por mês',        sub: 'personalizado' },
]

const DAYS: { day: DayOfWeek; label: string; short: string }[] = [
  { day: 1, label: 'Segunda', short: 'SEG' },
  { day: 2, label: 'Terça',   short: 'TER' },
  { day: 3, label: 'Quarta',  short: 'QUA' },
  { day: 4, label: 'Quinta',  short: 'QUI' },
  { day: 5, label: 'Sexta',   short: 'SEX' },
  { day: 6, label: 'Sábado',  short: 'SAB' },
  { day: 0, label: 'Domingo', short: 'DOM' },
]

export function RecurrenceSelector({ value, onChange, color = '#7c3aed' }: RecurrenceSelectorProps) {
  function setType(type: RecurrenceType) {
    const defaults: RecurrenceConfig = { type }
    if (type === 'times_per_week')  defaults.timesPerWeek  = value.timesPerWeek  ?? 3
    if (type === 'times_per_month') defaults.timesPerMonth = value.timesPerMonth ?? 12
    if (type === 'custom_week')     defaults.daysOfWeek    = value.daysOfWeek    ?? [1, 3, 5]
    if (type === 'daily')           defaults.timesPerWeek  = 7
    if (type === 'weekdays')        defaults.timesPerWeek  = 5
    if (type === 'weekends')        defaults.timesPerWeek  = 2
    onChange(defaults)
  }

  function toggleDay(day: DayOfWeek) {
    const current = value.daysOfWeek ?? []
    const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day]
    onChange({ ...value, daysOfWeek: next.sort((a, b) => a - b) })
  }

  return (
    <div className="space-y-4">
      {/* Type selector */}
      <div className="grid grid-cols-2 gap-2">
        {RECURRENCE_OPTIONS.map(({ type, label, sub }) => {
          const active = value.type === type
          return (
            <button
              key={type}
              type="button"
              onClick={() => setType(type)}
              className={cn(
                'flex flex-col items-start p-3 rounded-xl border text-left transition-all',
                active
                  ? 'border-transparent text-white'
                  : 'bg-white/[0.04] border-white/[0.08] text-slate-300 hover:bg-white/[0.07] hover:border-white/[0.12]',
              )}
              style={active ? {
                background: `linear-gradient(135deg, ${color}30, ${color}18)`,
                borderColor: `${color}50`,
                boxShadow: `0 0 0 1px ${color}30`,
              } : {}}
            >
              <span className="text-xs font-bold leading-tight">{label}</span>
              {sub && (
                <span className={cn('text-[10px] mt-0.5', active ? 'text-white/60' : 'text-slate-600')}>
                  {sub}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Times per week stepper */}
      {value.type === 'times_per_week' && (
        <div>
          <label className="text-xs text-slate-500 block mb-2 uppercase tracking-wider font-semibold">
            Vezes por semana
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onChange({ ...value, timesPerWeek: Math.max(1, (value.timesPerWeek ?? 3) - 1) })}
              className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 font-bold border border-white/[0.08] flex items-center justify-center text-lg transition-all"
            >−</button>
            <div className="flex-1 text-center">
              <span className="text-3xl font-black text-slate-100 tabular-nums">{value.timesPerWeek ?? 3}</span>
              <span className="text-slate-500 text-xs ml-1">×/semana</span>
            </div>
            <button
              type="button"
              onClick={() => onChange({ ...value, timesPerWeek: Math.min(7, (value.timesPerWeek ?? 3) + 1) })}
              className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 font-bold border border-white/[0.08] flex items-center justify-center text-lg transition-all"
            >+</button>
          </div>
        </div>
      )}

      {/* Times per month stepper */}
      {value.type === 'times_per_month' && (
        <div>
          <label className="text-xs text-slate-500 block mb-2 uppercase tracking-wider font-semibold">
            Vezes por mês
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onChange({ ...value, timesPerMonth: Math.max(1, (value.timesPerMonth ?? 12) - 1) })}
              className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 font-bold border border-white/[0.08] flex items-center justify-center text-lg transition-all"
            >−</button>
            <div className="flex-1 text-center">
              <span className="text-3xl font-black text-slate-100 tabular-nums">{value.timesPerMonth ?? 12}</span>
              <span className="text-slate-500 text-xs ml-1">×/mês</span>
            </div>
            <button
              type="button"
              onClick={() => onChange({ ...value, timesPerMonth: Math.min(31, (value.timesPerMonth ?? 12) + 1) })}
              className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 font-bold border border-white/[0.08] flex items-center justify-center text-lg transition-all"
            >+</button>
          </div>
        </div>
      )}

      {/* Day-of-week picker */}
      {value.type === 'custom_week' && (
        <div>
          <label className="text-xs text-slate-500 block mb-2 uppercase tracking-wider font-semibold">
            Escolha os dias
          </label>
          <div className="flex gap-1.5">
            {DAYS.map(({ day, short, label }) => {
              const active = (value.daysOfWeek ?? []).includes(day)
              return (
                <button
                  key={day}
                  type="button"
                  title={label}
                  onClick={() => toggleDay(day)}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-[10px] font-bold transition-all border',
                    active
                      ? 'text-white border-transparent'
                      : 'bg-white/[0.04] text-slate-500 border-white/[0.08] hover:text-slate-300 hover:bg-white/[0.07]',
                  )}
                  style={active ? {
                    background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                    boxShadow: `0 2px 8px ${color}40`,
                  } : {}}
                >
                  {short}
                </button>
              )
            })}
          </div>
          {(value.daysOfWeek?.length ?? 0) > 0 && (
            <p className="text-[11px] text-slate-500 mt-2">
              {value.daysOfWeek?.length}×/semana nos dias selecionados
            </p>
          )}
        </div>
      )}
    </div>
  )
}
