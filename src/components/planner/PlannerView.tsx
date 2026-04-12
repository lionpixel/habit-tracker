// ─────────────────────────────────────────────
//  View: Planner Hub — tabs for all levels
// ─────────────────────────────────────────────

'use client'

import { useEffect, useState } from 'react'
import { useGoalsStore } from '@/store/goalsStore'
import { AnnualGoalsView }    from './AnnualGoalsView'
import { QuarterlyView }      from './QuarterlyView'
import { MonthlyPlannerView } from './MonthlyPlannerView'
import { WeeklyPlannerView }  from './WeeklyPlannerView'
import { DailyPlannerView }   from './DailyPlannerView'
import { FadeInUp } from '@/components/ui/Motion'
import { cn } from '@/lib/helpers'
import { Calendar, Layers, CalendarDays, LayoutGrid, Sun } from 'lucide-react'

type Tab = 'annual' | 'quarterly' | 'monthly' | 'weekly' | 'daily'

const TABS: { id: Tab; label: string; icon: React.FC<{ size?: number; className?: string }>; color: string }[] = [
  { id: 'annual',    label: 'Anual',      icon: Calendar,     color: '#a78bfa' },
  { id: 'quarterly', label: 'Trimestral', icon: Layers,       color: '#6366f1' },
  { id: 'monthly',   label: 'Mensal',     icon: CalendarDays, color: '#0ea5e9' },
  { id: 'weekly',    label: 'Semanal',    icon: LayoutGrid,   color: '#10b981' },
  { id: 'daily',     label: 'Diário',     icon: Sun,          color: '#f59e0b' },
]

export function PlannerView() {
  const { hydrated, hydrate } = useGoalsStore()
  const [tab, setTab] = useState<Tab>('daily')

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
        {tab === 'annual'    && <AnnualGoalsView />}
        {tab === 'quarterly' && <QuarterlyView />}
        {tab === 'monthly'   && <MonthlyPlannerView />}
        {tab === 'weekly'    && <WeeklyPlannerView />}
        {tab === 'daily'     && <DailyPlannerView />}
      </div>
    </div>
  )
}
