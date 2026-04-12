// ─────────────────────────────────────────────
//  View: Mensal
// ─────────────────────────────────────────────

'use client'

import { useAppStore }  from '@/store/appStore'
import { useHabits }    from '@/hooks/useHabits'
import { StatCard }     from '@/components/ui/StatCard'
import { HabitIcon }    from '@/lib/habitIcons'
import { FadeInUp, StaggerList, StaggerItem, AnimatedCard } from '@/components/ui/Motion'
import { formatTime, formatMonthYear } from '@/lib/helpers'
import { MONTH_NAMES, HABIT_COLORS } from '@/lib/constants'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import {
  Timer, Trophy, Calendar, ChevronLeft, ChevronRight, BarChart3,
} from 'lucide-react'
import type { TooltipProps } from 'recharts'
import type { HabitKey } from '@/types/habit'

const HABIT_KEYS: HabitKey[] = ['reading', 'english', 'hiit', 'ppci', 'dopamine', 'fasting']

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="glass rounded-xl p-3 border border-white/10 shadow-card text-sm">
      <p className="font-bold text-slate-100">{item.name}</p>
      <p style={{ color: item.payload.color }} className="font-semibold">
        {formatTime(item.value as number)}
      </p>
    </div>
  )
}

export function MonthlyView() {
  useAppStore()
  const { habits, currentYear, currentMonth, getMonthMinutes } = useHabits()

  const totalMonthMin = HABIT_KEYS.reduce((acc, k) => acc + getMonthMinutes(k), 0)
  const bestHabitKey  = HABIT_KEYS.reduce((best, k) =>
    getMonthMinutes(k) > getMonthMinutes(best) ? k : best, HABIT_KEYS[0])

  const chartData = HABIT_KEYS.map((k) => ({
    name:    habits[k].name,
    minutes: getMonthMinutes(k),
    color:   HABIT_COLORS[k],
  }))

  function navigate(dir: 'prev' | 'next') {
    const store = useAppStore.getState()
    let m = store.data.currentMonth + (dir === 'next' ? 1 : -1)
    let y = store.data.currentYear
    if (m < 1)  { m = 12; y -= 1 }
    if (m > 12) { m = 1;  y += 1 }
    useAppStore.setState({ data: { ...store.data, currentMonth: m, currentYear: y } })
  }

  return (
    <div className="space-y-8">

      {/* Month navigator */}
      <FadeInUp>
        <div className="card p-4 flex items-center justify-between">
          <button
            onClick={() => navigate('prev')}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center transition-all hover:scale-105"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <div className="font-bold text-slate-100 text-lg">
              {formatMonthYear(currentYear, currentMonth)}
            </div>
            <div className="text-slate-500 text-xs">Visão Mensal</div>
          </div>
          <button
            onClick={() => navigate('next')}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center transition-all hover:scale-105"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </FadeInUp>

      {/* Stats */}
      <FadeInUp delay={0.05}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard
            icon={<Timer size={18} />}
            value={formatTime(totalMonthMin)}
            label="Total no Mês"
            color="#6366f1"
          />
          <StatCard
            icon={<Trophy size={18} />}
            value={habits[bestHabitKey].name}
            label="Melhor Hábito"
            color="#10b981"
          />
          <StatCard
            icon={<Calendar size={18} />}
            value={MONTH_NAMES[currentMonth - 1]}
            label={String(currentYear)}
            color="#8b5cf6"
          />
        </div>
      </FadeInUp>

      {/* Chart */}
      <FadeInUp delay={0.1}>
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
              <BarChart3 size={16} className="text-violet-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Desempenho Mensal por Hábito</h3>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}m`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </FadeInUp>

      {/* Per-habit breakdown */}
      <FadeInUp delay={0.15}>
        <StaggerList className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {HABIT_KEYS.map((key) => {
            const habit = habits[key]
            const min   = getMonthMinutes(key)
            const color = HABIT_COLORS[key]
            const pctVal = totalMonthMin > 0 ? Math.round((min / totalMonthMin) * 100) : 0
            return (
              <StaggerItem key={key}>
                <AnimatedCard className="card p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${color}18` }}
                    >
                      <HabitIcon id={habit.icon} size={18} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-100 truncate">{habit.name}</div>
                      <div className="text-slate-400 text-xs">{formatTime(min)}</div>
                    </div>
                    <div
                      className="text-xs font-bold tabular-nums"
                      style={{ color }}
                    >
                      {pctVal}%
                    </div>
                  </div>
                  {/* Mini progress bar */}
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pctVal}%`, backgroundColor: color }}
                    />
                  </div>
                </AnimatedCard>
              </StaggerItem>
            )
          })}
        </StaggerList>
      </FadeInUp>
    </div>
  )
}
