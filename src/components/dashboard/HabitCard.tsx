'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { cn, formatTime } from '@/lib/helpers'
import { ProgressBarAnimated, AnimatedNumber } from '@/components/ui/Motion'
import { Button }   from '@/components/ui/Button'
import { Badge }    from '@/components/ui/Badge'
import { HabitIcon } from '@/lib/habitIcons'
import { HabitEditorModal }   from '@/components/habits/HabitEditorModal'
import { FastingEditorModal }   from '@/components/habits/FastingEditorModal'
import { FastingCalendarView }  from '@/components/habits/FastingCalendarView'
import type { HabitKey } from '@/types/habit'
import { useHabits } from '@/hooks/useHabits'
import {
  Plus, Minus, Settings2, CheckCircle2,
  TrendingUp, Clock, Calendar,
  Pause,
} from 'lucide-react'
import { ScientificPillsRow } from '@/components/insights/ScientificPill'
import { SCIENTIFIC_FACTS, BENCHMARKS } from '@/lib/benchmarks'

interface HabitCardProps {
  habitKey: HabitKey
  index?: number
}

function getProgressLabel(pct: number): {
  text: string
  badge: 'slate' | 'violet' | 'emerald' | 'amber' | 'red'
} {
  if (pct >= 100) return { text: 'Completo', badge: 'emerald' }
  if (pct >= 75)  return { text: 'Quase lá', badge: 'violet' }
  if (pct >= 50)  return { text: 'Em progresso', badge: 'amber' }
  if (pct > 0)    return { text: 'Iniciado', badge: 'amber' }
  return               { text: 'Pendente', badge: 'slate' }
}

export function HabitCard({ habitKey, index = 0 }: HabitCardProps) {
  const {
    habits,
    getWeekCount, getWeekProgress, getWeekMinutes,
    getMonthMinutes, getMonthlyGoalInfo,
    increment, decrement,
    cefrInfo,
  } = useHabits()

  const habit    = habits[habitKey]
  const count    = getWeekCount(habitKey)
  const progress = getWeekProgress(habitKey)
  const weekMin  = getWeekMinutes(habitKey)
  const monthMin = getMonthMinutes(habitKey)
  const goalInfo = getMonthlyGoalInfo(habitKey)
  const isFull   = count >= habit.frequency
  const isEnglish = habitKey === 'english'
  const isFasting = habitKey === 'fasting'

  const [editorOpen,  setEditorOpen]  = useState(false)
  const [fastingOpen, setFastingOpen] = useState(false)

  // Archived habits render minimised
  if (habit.archived) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.06 }}
        className="card p-4 opacity-50 hover:opacity-75 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${habit.color}18` }}>
            <HabitIcon id={habit.icon} className="w-4 h-4" style={{ color: habit.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-400 truncate">{habit.name}</p>
            <p className="text-[10px] text-slate-600">Arquivado</p>
          </div>
          <button
            onClick={() => setEditorOpen(true)}
            className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-500 hover:text-slate-300 flex items-center justify-center transition-all"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {editorOpen && (
          <HabitEditorModal habitKey={habitKey} open={editorOpen} onClose={() => setEditorOpen(false)} />
        )}
      </motion.article>
    )
  }

  // Fasting gets its own premium card + calendar
  if (isFasting) {
    return (
      <>
        <FastingCalendarView onEdit={() => setFastingOpen(true)} />
        <FastingEditorModal open={fastingOpen} onClose={() => setFastingOpen(false)} />
      </>
    )
  }

  function handleIncrement() {
    if (isFull) return
    increment(habitKey)
    toast.success(`${habit.name} registrado!`, {
      description: `${count + 1}/${habit.frequency} sessões esta semana`,
    })
  }

  function handleDecrement() {
    if (count <= 0) return
    decrement(habitKey)
    toast.info(`${habit.name} removido`)
  }

  const progressLabel = getProgressLabel(progress)

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: index * 0.06 }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className={cn('card relative overflow-hidden group cursor-default', habit.paused && 'opacity-70')}
      >
        {/* Top gradient accent */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] rounded-t-card"
          style={{ background: `linear-gradient(90deg, ${habit.color}, ${habit.color}66, transparent)` }}
        />

        {/* Hover glow */}
        <motion.div
          className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${habit.color}10, transparent 70%)`, transform: 'translate(30%,-30%)' }}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />

        {/* Paused overlay */}
        {habit.paused && (
          <div className="absolute top-2 left-2 z-10">
            <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold">
              <Pause size={8} /> Pausado
            </span>
          </div>
        )}

        <div className="p-5">
          {/* ── Header ── */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <motion.div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${habit.color}18`, boxShadow: `0 0 0 1px ${habit.color}30` }}
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                <HabitIcon id={habit.icon} className="w-5 h-5" style={{ color: habit.color }} />
              </motion.div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-100 leading-tight">{habit.name}</h3>
                <p className="text-xs text-slate-500 truncate mt-0.5">{habit.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Badge variant={progressLabel.badge} size="sm" dot>
                {progressLabel.text}
              </Badge>
              {/* Edit button */}
              <motion.button
                onClick={() => setEditorOpen(true)}
                title="Editar hábito"
                className="w-7 h-7 rounded-lg bg-white/[0.05] text-slate-500 hover:text-slate-300 hover:bg-white/[0.08] flex items-center justify-center transition-colors duration-200"
                whileTap={{ scale: 0.85 }}
              >
                <Settings2 className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>

          {/* ── Counter ── */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative flex items-baseline gap-1">
              <span
                className="text-5xl font-black leading-none"
                style={{
                  background: isFull
                    ? 'linear-gradient(135deg, #10b981, #34d399)'
                    : `linear-gradient(135deg, #f1f5f9, ${habit.color})`,
                  WebkitBackgroundClip: 'text',
                  backgroundClip:       'text',
                  color: 'transparent',
                }}
              >
                <AnimatedNumber value={count} duration={0.6} />
              </span>
              <span className="text-slate-500 text-sm font-semibold">
                /{habit.frequency}
              </span>
            </div>
            <AnimatePresence>
              {isFull && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="ml-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" fill="currentColor" fillOpacity={0.15} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Weekly progress ── */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Progresso semanal</span>
              <span className="text-[11px] font-bold tabular-nums" style={{ color: isFull ? '#10b981' : habit.color }}>
                {progress}%
              </span>
            </div>
            <ProgressBarAnimated
              value={progress}
              color={habit.color}
              gradient={isFull ? 'linear-gradient(90deg, #059669, #10b981, #34d399)' : undefined}
              height={8}
              glowing={isFull}
            />
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { icon: <Clock className="w-3 h-3 text-slate-600" />, label: 'Semana', value: formatTime(weekMin) },
              { icon: <Calendar className="w-3 h-3 text-slate-600" />, label: 'Mês',    value: formatTime(monthMin) },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.05]">
                <div className="flex items-center gap-1.5 mb-1">
                  {stat.icon}
                  <span className="text-[10px] text-slate-600 uppercase tracking-wide font-semibold">{stat.label}</span>
                </div>
                <div className="text-sm font-bold text-slate-200 tabular-nums">{stat.value}</div>
              </div>
            ))}

            {isEnglish && (
              <div className="col-span-2 bg-white/[0.04] rounded-xl p-3 border border-white/[0.05]">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <TrendingUp className="w-3 h-3 text-slate-600" />
                  <span className="text-[10px] text-slate-600 uppercase tracking-wide font-semibold">Nível CEFR</span>
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold" style={{ color: habit.color }}>{cefrInfo.level}</span>
                  <span className="text-xs text-slate-500">→ {cefrInfo.nextLevel}</span>
                  <span className="text-xs font-bold text-slate-400">{cefrInfo.progressInLevel}%</span>
                </div>
                <ProgressBarAnimated value={cefrInfo.progressInLevel} color={habit.color} height={4} />
              </div>
            )}
          </div>

          {/* ── Monthly goal ── */}
          {habit.goalFreq && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Meta mensal</span>
                <span className="text-[10px] text-slate-500">{goalInfo.sessionsDone}/{goalInfo.sessionsPerMonth} sessões</span>
              </div>
              <ProgressBarAnimated
                value={goalInfo.progress}
                color={goalInfo.progress >= 100 ? '#10b981' : habit.color}
                height={4}
                glowing={goalInfo.progress >= 100}
              />
            </div>
          )}

          {/* ── Scientific facts ── */}
          {(() => {
            const facts = SCIENTIFIC_FACTS[habitKey] ?? []
            if (facts.length === 0) return null
            const benchKey = habitKey === 'hiit' ? 'exercise' : habitKey === 'reading' ? 'reading' : null
            const bench = benchKey ? BENCHMARKS.habits[benchKey as keyof typeof BENCHMARKS.habits] : undefined
            return (
              <ScientificPillsRow
                facts={facts}
                max={2}
                className="mb-4"
                ctx={{
                  module: 'habito',
                  metricName: habit.name,
                  metricKey: habitKey,
                  currentValue: progress,
                  unit: '%',
                  trend: progress >= 80 ? 'subindo' : progress >= 40 ? 'estavel' : 'caindo',
                  benchmarks: bench ? { ...bench, metricLabel: habit.name } : undefined,
                }}
              />
            )
          })()}

          {/* ── Action buttons ── */}
          <div className="grid grid-cols-2 gap-2">
            <motion.div whileTap={{ scale: 0.96 }}>
              <Button
                size="sm"
                variant={isFull ? 'subtle' : 'primary'}
                onClick={handleIncrement}
                disabled={isFull || habit.paused}
                icon={<Plus className="w-3.5 h-3.5" />}
                className="w-full"
                style={(!isFull && !habit.paused) ? {
                  background: `linear-gradient(135deg, ${habit.color}, ${habit.color}cc)`,
                } : undefined}
              >
                {isFull ? 'Completo' : habit.paused ? 'Pausado' : 'Registrar'}
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.96 }}>
              <Button
                size="sm"
                variant="danger"
                onClick={handleDecrement}
                disabled={count <= 0 || habit.paused}
                icon={<Minus className="w-3.5 h-3.5" />}
                className="w-full"
              >
                Desfazer
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.article>

      {/* Editor modal */}
      <HabitEditorModal
        habitKey={habitKey}
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
      />
    </>
  )
}
