'use client'

import { HabitIcon } from '@/lib/habitIcons'
import { formatTime } from '@/lib/helpers'
import type { HabitBase, RecurrenceConfig } from '@/types/habit'
import { Clock, Calendar, Repeat, Flame } from 'lucide-react'
import { durationToMinutes } from './DurationSelector'

interface HabitPreviewCardProps {
  habit: Partial<HabitBase> & { name: string }
}

function recurrenceLabel(r?: RecurrenceConfig, freq?: number): string {
  if (!r) return `${freq ?? 5}×/semana`
  if (r.type === 'daily')           return 'Todos os dias'
  if (r.type === 'weekdays')        return 'Dias úteis (5×/sem)'
  if (r.type === 'weekends')        return 'Fins de semana (2×/sem)'
  if (r.type === 'times_per_week')  return `${r.timesPerWeek}×/semana`
  if (r.type === 'times_per_month') return `${r.timesPerMonth}×/mês`
  if (r.type === 'custom_week')     return `${r.daysOfWeek?.length ?? 0} dias específicos`
  return '—'
}

function effectiveFrequency(r?: RecurrenceConfig, freq?: number): number {
  if (!r) return freq ?? 5
  if (r.type === 'daily')           return 7
  if (r.type === 'weekdays')        return 5
  if (r.type === 'weekends')        return 2
  if (r.type === 'times_per_week')  return r.timesPerWeek  ?? 3
  if (r.type === 'custom_week')     return r.daysOfWeek?.length ?? 0
  return freq ?? 5
}

export function HabitPreviewCard({ habit }: HabitPreviewCardProps) {
  const color = habit.color ?? '#7c3aed'

  const sessionMin  = habit.duration
    ? durationToMinutes(habit.duration)
    : (habit.target ?? 50)

  const freqPerWeek = effectiveFrequency(habit.recurrence, habit.frequency)
  const weekMin     = freqPerWeek * sessionMin
  const monthMin    = Math.round(freqPerWeek * 4.33) * sessionMin

  return (
    <div
      className="rounded-xl p-4 border relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${color}12, ${color}06)`,
        borderColor: `${color}30`,
      }}
    >
      {/* Radial glow */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color}20, transparent 70%)`,
          transform: 'translate(30%, -30%)',
        }}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-4 relative">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}20`, boxShadow: `0 0 0 1px ${color}30` }}
        >
          {habit.icon && (
            <HabitIcon id={habit.icon} size={18} style={{ color }} />
          )}
        </div>
        <div>
          <p className="font-bold text-slate-100 text-sm leading-tight">{habit.name || 'Novo hábito'}</p>
          {habit.description && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{habit.description}</p>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 relative">
        {[
          { icon: <Repeat size={11} />, label: 'Frequência', value: recurrenceLabel(habit.recurrence, habit.frequency) },
          { icon: <Clock size={11} />,  label: 'Por sessão',  value: formatTime(sessionMin) },
          { icon: <Calendar size={11} />, label: 'Por semana', value: formatTime(weekMin) },
          { icon: <Flame size={11} />,  label: 'Por mês',    value: formatTime(monthMin) },
        ].map(({ icon, label, value }) => (
          <div key={label} className="bg-white/[0.04] rounded-lg p-2.5 border border-white/[0.05]">
            <div className="flex items-center gap-1 mb-1">
              <span style={{ color }}>{icon}</span>
              <span className="text-[9px] text-slate-600 uppercase tracking-wider font-semibold">{label}</span>
            </div>
            <div className="text-xs font-bold text-slate-200 tabular-nums">{value}</div>
          </div>
        ))}
      </div>

      {/* Labels */}
      <div className="flex flex-wrap gap-1.5 mt-3 relative">
        {habit.category && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-md font-semibold border"
            style={{ background: `${color}15`, borderColor: `${color}30`, color }}
          >
            {habit.category}
          </span>
        )}
        {habit.paused && (
          <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-400">
            Pausado
          </span>
        )}
        {habit.archived && (
          <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-slate-500/15 border border-slate-500/30 text-slate-400">
            Arquivado
          </span>
        )}
        {habit.startDate && (
          <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-white/[0.05] border border-white/[0.08] text-slate-400">
            Início: {habit.startDate}
          </span>
        )}
      </div>
    </div>
  )
}
