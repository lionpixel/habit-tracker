// ─────────────────────────────────────────────
//  View: Metas (Heatmap + Calendário)
// ─────────────────────────────────────────────

'use client'

import { useHabits }   from '@/hooks/useHabits'
import { StatCard }    from '@/components/ui/StatCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { HabitIcon }   from '@/lib/habitIcons'
import { FadeInUp, StaggerList, StaggerItem, AnimatedCard } from '@/components/ui/Motion'
import { formatTime, getMonthKey } from '@/lib/helpers'
import { HABIT_COLORS } from '@/lib/constants'
import { Timer, CalendarDays, Trophy, Flame, Target } from 'lucide-react'
import type { HabitKey } from '@/types/habit'

const HABIT_KEYS: HabitKey[] = ['reading', 'english', 'hiit', 'ppci', 'dopamine', 'fasting']

export function MetasView() {
  const { habits, currentYear, currentMonth, getMonthlyGoalInfo } = useHabits()

  const mKey = getMonthKey(currentYear, currentMonth)
  const totalHoursMonth = HABIT_KEYS.reduce(
    (acc, k) => acc + (habits[k].monthlyTotals[mKey] ?? 0) / 60,
    0,
  )
  const totalHoursYear = HABIT_KEYS.reduce(
    (acc, k) => acc + habits[k].totalYear / 60,
    0,
  )
  const bestHabit = HABIT_KEYS.reduce((b, k) =>
    habits[k].totalYear > habits[b].totalYear ? k : b, HABIT_KEYS[0])

  const fastingStreak = habits.fasting.currentStreak

  return (
    <div className="space-y-8">

      {/* Header */}
      <FadeInUp>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
            <Target size={20} className="text-violet-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-100">Metas & Heatmap</h2>
            <p className="text-slate-500 text-sm">Progresso por hábito</p>
          </div>
        </div>
      </FadeInUp>

      {/* Summary stats */}
      <FadeInUp delay={0.05}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Timer size={18} />}       value={`${Math.round(totalHoursMonth)}h`} label="Horas no Mês"  color="#6366f1" />
          <StatCard icon={<CalendarDays size={18} />} value={`${Math.round(totalHoursYear)}h`}  label="Horas no Ano"  color="#10b981" />
          <StatCard icon={<Trophy size={18} />}       value={habits[bestHabit].name}             label="Melhor Hábito" color="#8b5cf6" />
          <StatCard icon={<Flame size={18} />}        value={`${fastingStreak} dias`}             label="Streak Atual"  color="#06b6d4" />
        </div>
      </FadeInUp>

      {/* Per-habit goal cards */}
      <FadeInUp delay={0.1}>
        <StaggerList className="space-y-4">
          {HABIT_KEYS.map((key) => {
            const habit = habits[key]
            const goal  = getMonthlyGoalInfo(key)
            const color = HABIT_COLORS[key]

            return (
              <StaggerItem key={key}>
                <AnimatedCard className="card p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${color}18` }}
                    >
                      <HabitIcon id={habit.icon} size={22} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-slate-100 text-lg truncate">{habit.name}</h3>
                        <span
                          className="text-sm font-black tabular-nums flex-shrink-0"
                          style={{ color: goal.progress >= 100 ? '#10b981' : color }}
                        >
                          {goal.progress}%
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {goal.sessionsDone}/{goal.sessionsPerMonth} sessões ·{' '}
                        {formatTime(goal.timeDone)}/{formatTime(goal.totalMinutes)}
                      </p>
                    </div>
                  </div>

                  <ProgressBar
                    value={goal.progress}
                    color={goal.progress >= 100 ? '#10b981' : color}
                    height="md"
                    showLabel
                  />

                  <HabitMiniHeatmap habitKey={key} color={color} />
                </AnimatedCard>
              </StaggerItem>
            )
          })}
        </StaggerList>
      </FadeInUp>
    </div>
  )
}

// ── Mini heatmap (last 12 weeks) ────────────────────

function HabitMiniHeatmap({ habitKey, color }: { habitKey: HabitKey; color: string }) {
  const { habits } = useHabits()
  const _habit = habits[habitKey]

  // Last 84 days placeholder — real per-day tracking requires daily counts
  const cells: number[] = Array.from({ length: 84 }, () => 0)

  return (
    <div className="mt-5">
      <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Últimas 12 semanas</div>
      <div
        className="grid gap-0.5 overflow-x-auto"
        style={{ gridTemplateColumns: 'repeat(84, 10px)', width: 'fit-content' }}
      >
        {cells.map((intensity, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-sm transition-opacity hover:opacity-70"
            style={{
              backgroundColor: intensity === 0 ? 'rgba(255,255,255,0.05)' : color,
              opacity: intensity === 0 ? 1 : 0.3 + intensity * 0.18,
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
        <span>Menos</span>
        {[0, 1, 2, 3, 4].map((lvl) => (
          <div
            key={lvl}
            className="w-2.5 h-2.5 rounded-sm"
            style={{
              backgroundColor: lvl === 0 ? 'rgba(255,255,255,0.05)' : color,
              opacity: lvl === 0 ? 1 : 0.3 + lvl * 0.18,
            }}
          />
        ))}
        <span>Mais</span>
      </div>
    </div>
  )
}
