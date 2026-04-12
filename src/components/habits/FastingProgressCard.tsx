'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { formatDate } from '@/lib/helpers'
import { ProgressBarAnimated } from '@/components/ui/Motion'
import { AnimatedCounter } from '@/components/animations/AnimatedCounter'
import type { FastingHabit } from '@/types/habit'
import {
  Flame, Trophy, Calendar, CheckCircle2, Clock,
  TrendingUp, Shield,
} from 'lucide-react'

interface FastingProgressCardProps {
  habit:   FastingHabit
  onEdit?: () => void
}

function computeFastingProgress(habit: FastingHabit) {
  const totalDays    = habit.fastingDays ?? 40
  const streak       = habit.currentStreak
  const pct          = Math.min(100, Math.round((streak / totalDays) * 100))
  const daysLeft     = Math.max(0, totalDays - streak)
  const isComplete   = habit.fastingComplete ?? streak >= totalDays

  let endDate: Date | null = null
  if (habit.fastingStartDate) {
    const start = new Date(habit.fastingStartDate)
    endDate     = new Date(start)
    endDate.setDate(start.getDate() + totalDays)
  }

  let daysUntilEnd: number | null = null
  if (endDate) {
    const now       = new Date()
    daysUntilEnd    = Math.max(0, Math.round((endDate.getTime() - now.getTime()) / 86400000))
  }

  return { totalDays, streak, pct, daysLeft, isComplete, endDate, daysUntilEnd }
}

export function FastingProgressCard({ habit, onEdit }: FastingProgressCardProps) {
  const {
    totalDays, streak, pct, daysLeft, isComplete, endDate, daysUntilEnd,
  } = useMemo(() => computeFastingProgress(habit), [habit])

  const color = habit.color

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card relative overflow-hidden"
    >
      {/* Top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}66, transparent)` }}
      />

      {/* Radial glow */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color}12, transparent 70%)`,
          transform: 'translate(30%, -30%)',
        }}
      />

      <div className="p-5 relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: `${color}18`, boxShadow: `0 0 0 1px ${color}30` }}
            >
              <Shield size={20} style={{ color }} />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">{habit.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{habit.description}</p>
            </div>
          </div>

          {isComplete ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
              <CheckCircle2 size={12} className="text-emerald-400" />
              <span className="text-[11px] font-bold text-emerald-400">Concluído!</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border"
              style={{ background: `${color}15`, borderColor: `${color}30` }}
            >
              <Flame size={12} style={{ color }} />
              <span className="text-[11px] font-bold" style={{ color }}>Em andamento</span>
            </div>
          )}
        </div>

        {/* Big number */}
        <div className="flex items-baseline gap-2 mb-4">
          <span
            className="text-6xl font-black leading-none tabular-nums"
            style={{
              background: isComplete
                ? 'linear-gradient(135deg, #10b981, #34d399)'
                : `linear-gradient(135deg, #f1f5f9, ${color})`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            <AnimatedCounter value={streak} />
          </span>
          <div>
            <div className="text-slate-300 font-bold text-sm">de {totalDays} dias</div>
            <div className="text-slate-500 text-xs">{daysLeft > 0 ? `${daysLeft} restantes` : 'desafio concluído'}</div>
          </div>
        </div>

        {/* Progress ring + bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">Progresso</span>
            <span className="text-sm font-black tabular-nums" style={{ color: isComplete ? '#10b981' : color }}>
              {pct}%
            </span>
          </div>
          <ProgressBarAnimated
            value={pct}
            color={isComplete ? '#10b981' : color}
            gradient={isComplete ? 'linear-gradient(90deg, #059669, #10b981, #34d399)' : undefined}
            height={12}
            glowing={isComplete}
          />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            {
              icon: <Calendar size={13} style={{ color }} />,
              label: 'Início',
              value: habit.fastingStartDate
                ? formatDate(new Date(habit.fastingStartDate))
                : '—',
            },
            {
              icon: <Clock size={13} style={{ color }} />,
              label: 'Previsão de término',
              value: endDate ? formatDate(endDate) : '—',
            },
            {
              icon: <TrendingUp size={13} style={{ color }} />,
              label: 'Ciclos completos',
              value: `${habit.completedCycles} ciclos`,
            },
            {
              icon: <Trophy size={13} style={{ color }} />,
              label: 'Maior sequência',
              value: `${Math.max(streak, habit.longestStreak ?? 0)} dias`,
            },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.05]">
              <div className="flex items-center gap-1.5 mb-1">
                {icon}
                <span className="text-[9px] text-slate-600 uppercase tracking-wider font-semibold">{label}</span>
              </div>
              <div className="text-xs font-bold text-slate-200 tabular-nums">{value}</div>
            </div>
          ))}
        </div>

        {/* Countdown */}
        {daysUntilEnd !== null && !isComplete && (
          <div
            className="flex items-center justify-center gap-3 p-3 rounded-xl border mb-3"
            style={{ background: `${color}08`, borderColor: `${color}25` }}
          >
            <Flame size={16} style={{ color }} />
            <div className="text-center">
              <div className="text-xs text-slate-500">Dias até o fim</div>
              <div className="text-xl font-black tabular-nums" style={{ color }}>
                {daysUntilEnd}
              </div>
            </div>
          </div>
        )}

        {/* Completed banner */}
        {isComplete && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <Trophy size={18} className="text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-400">Desafio concluído!</p>
              {habit.fastingCompletedAt && (
                <p className="text-[10px] text-emerald-500/70 mt-0.5">
                  Finalizado em {formatDate(new Date(habit.fastingCompletedAt))}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Edit button */}
        {onEdit && (
          <button
            onClick={onEdit}
            className="w-full mt-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] text-slate-400 hover:text-slate-200 text-xs font-semibold transition-all"
          >
            Configurar jejum
          </button>
        )}
      </div>
    </motion.div>
  )
}
