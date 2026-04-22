// ─────────────────────────────────────────────
//  View: Planner Hub — tabs for all levels
// ─────────────────────────────────────────────

'use client'

import { useEffect, useState, useMemo } from 'react'
import { useGoalsStore } from '@/store/goalsStore'
import { AnnualGoalsView }    from './AnnualGoalsView'
import { QuarterlyView }      from './QuarterlyView'
import { MonthlyPlannerView } from './MonthlyPlannerView'
import { WeeklyPlannerView }  from './WeeklyPlannerView'
import { DailyPlannerView }   from './DailyPlannerView'
import { GoalCascadePanel }   from './GoalCascadePanel'
import { FadeInUp } from '@/components/ui/Motion'
import { cn } from '@/lib/helpers'
import {
  Calendar, Layers, CalendarDays, LayoutGrid, Sun, GitBranch,
  TrendingUp, CheckCircle2, AlertCircle,
} from 'lucide-react'

type Tab = 'cascade' | 'annual' | 'quarterly' | 'monthly' | 'weekly' | 'daily'

const TABS: { id: Tab; label: string; icon: React.FC<{ size?: number; className?: string }>; color: string }[] = [
  { id: 'cascade',   label: 'Cascata',    icon: GitBranch,    color: '#f59e0b' },
  { id: 'annual',    label: 'Anual',      icon: Calendar,     color: '#a78bfa' },
  { id: 'quarterly', label: 'Trimestral', icon: Layers,       color: '#6366f1' },
  { id: 'monthly',   label: 'Mensal',     icon: CalendarDays, color: '#0ea5e9' },
  { id: 'weekly',    label: 'Semanal',    icon: LayoutGrid,   color: '#10b981' },
  { id: 'daily',     label: 'Diário',     icon: Sun,          color: '#f59e0b' },
]

// ── Today's Breakdown banner ──────────────────
// Shows: meta do dia / quanto precisa / quanto já fez
// Based on monthly goals with targetValue

function TodayBreakdown() {
  const { monthlyGoals, dailyTasks } = useGoalsStore()

  const breakdown = useMemo(() => {
    const now         = new Date()
    const year        = now.getFullYear()
    const month       = now.getMonth() + 1
    const daysInMonth = new Date(year, month, 0).getDate()
    const dayOfMonth  = now.getDate()
    const daysLeft    = daysInMonth - dayOfMonth + 1  // including today

    const goals = monthlyGoals.filter(
      (g) => g.year === year && g.month === month && g.targetValue && g.targetValue > 0 && g.status !== 'cancelled'
    )

    return goals.map((g) => {
      const target    = g.targetValue!
      const current   = g.currentValue ?? 0
      const remaining = Math.max(0, target - current)
      const perDay    = target / daysInMonth
      const perWeek   = target / 4.33
      const neededToday = daysLeft > 0 ? remaining / daysLeft : 0
      const unit      = g.targetUnit ?? ''
      const pct       = Math.min(100, Math.round((current / target) * 100))
      // Expected progress by today
      const expected  = Math.round((dayOfMonth / daysInMonth) * 100)
      const onTrack   = pct >= expected - 5

      return {
        id: g.id, title: g.title, unit,
        target, current, remaining, perDay, perWeek, neededToday,
        pct, expected, onTrack,
      }
    })
  }, [monthlyGoals])

  // Today's tasks done/total
  const now         = new Date()
  const _todayStr   = now.toISOString().slice(0, 10)
  const todayTasks  = dailyTasks.filter((t) => t.date === _todayStr)
  const todayDone      = todayTasks.filter((t) => t.status === 'done').length

  if (breakdown.length === 0 && todayTasks.length === 0) return null

  return (
    <FadeInUp delay={0.02}>
      <div className="card p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun size={15} className="text-amber-400" />
            <span className="text-sm font-bold text-slate-200">Hoje</span>
            <span className="text-xs text-slate-600">
              {now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
            </span>
          </div>
          {todayTasks.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <CheckCircle2 size={12} className={todayDone === todayTasks.length ? 'text-emerald-400' : 'text-slate-600'} />
              <span className={todayDone === todayTasks.length ? 'text-emerald-400' : 'text-slate-500'}>
                {todayDone}/{todayTasks.length} tarefas
              </span>
            </div>
          )}
        </div>

        {/* Goal breakdown rows */}
        {breakdown.map((item) => (
          <div key={item.id} className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  {item.onTrack
                    ? <TrendingUp size={11} className="text-emerald-400 flex-shrink-0" />
                    : <AlertCircle size={11} className="text-amber-400 flex-shrink-0" />
                  }
                  <span className="text-xs font-semibold text-slate-300 truncate">{item.title}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-1 pl-4">
                  <span className="text-[11px] text-slate-500">
                    Meta: <span className="font-bold text-slate-300">
                      {item.target.toLocaleString('pt-BR')}{item.unit && ` ${item.unit}`}
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    /semana: <span className="font-semibold text-sky-400">
                      {item.perWeek.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}{item.unit && ` ${item.unit}`}
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    /dia: <span className="font-semibold text-violet-400">
                      {item.perDay.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}{item.unit && ` ${item.unit}`}
                    </span>
                  </span>
                  {item.neededToday > 0 && (
                    <span className="text-[11px] text-slate-500">
                      Precisa hoje: <span className={cn('font-bold', item.onTrack ? 'text-emerald-400' : 'text-amber-400')}>
                        {item.neededToday.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}{item.unit && ` ${item.unit}`}
                      </span>
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs font-black tabular-nums" style={{ color: item.onTrack ? '#10b981' : '#f59e0b' }}>
                  {item.pct}%
                </div>
                <div className="text-[10px] text-slate-600">esperado {item.expected}%</div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${item.pct}%`,
                  background: item.onTrack ? '#10b981' : '#f59e0b',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </FadeInUp>
  )
}

// ── Main component ────────────────────────────

export function PlannerView() {
  const { hydrated, hydrate } = useGoalsStore()
  const [tab, setTab] = useState<Tab>('cascade')

  useEffect(() => { if (!hydrated) hydrate() }, [hydrated, hydrate])

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeInUp>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
            <Calendar size={20} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-100">Planejamento</h2>
            <p className="text-slate-500 text-sm">Do anual ao diário — tudo conectado</p>
          </div>
        </div>
      </FadeInUp>

      {/* Today's Breakdown */}
      <TodayBreakdown />

      {/* Tab bar */}
      <FadeInUp delay={0.03}>
        <div className="flex gap-1 p-1 bg-white/[0.04] rounded-2xl border border-white/[0.06]">
          {TABS.map(({ id, label, icon: Icon, color }) => {
            const active = tab === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  'flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200',
                  active
                    ? 'text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]',
                )}
                style={active ? { background: `${color}20`, color } : undefined}
              >
                <Icon size={14} className={active ? '' : 'opacity-60'} />
                <span className="hidden sm:block">{label}</span>
                <span className="sm:hidden text-[10px]">{label.slice(0, 3)}</span>
              </button>
            )
          })}
        </div>
      </FadeInUp>

      {/* Active view */}
      <div>
        {tab === 'cascade'   && <GoalCascadePanel />}
        {tab === 'annual'    && <AnnualGoalsView />}
        {tab === 'quarterly' && <QuarterlyView />}
        {tab === 'monthly'   && <MonthlyPlannerView />}
        {tab === 'weekly'    && <WeeklyPlannerView />}
        {tab === 'daily'     && <DailyPlannerView />}
      </div>
    </div>
  )
}
