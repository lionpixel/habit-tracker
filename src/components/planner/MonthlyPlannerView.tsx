// ─────────────────────────────────────────────
//  View: Monthly Planner
// ─────────────────────────────────────────────

'use client'

import { useState } from 'react'
import { Plus, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useGoalsStore } from '@/store/goalsStore'
import { GoalCard } from './GoalCard'
import { GoalFormModal } from './GoalFormModal'
import { FadeInUp, StaggerList, StaggerItem } from '@/components/ui/Motion'
import { StatCard } from '@/components/ui/StatCard'
import { TrendingUp, CheckCircle2, Clock, Target } from 'lucide-react'
import type { MonthlyGoal } from '@/types/goals'

const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const CURRENT_YEAR  = new Date().getFullYear()
const CURRENT_MONTH = new Date().getMonth() + 1

export function MonthlyPlannerView() {
  const { quarterlyGoals, monthlyGoals, weeklyGoals, deleteMonthlyGoal } = useGoalsStore()
  const [year, setYear]   = useState(CURRENT_YEAR)
  const [month, setMonth] = useState(CURRENT_MONTH)
  const [formOpen, setFormOpen]     = useState(false)
  const [editTarget, setEditTarget] = useState<MonthlyGoal | null>(null)

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  const mGoals = monthlyGoals.filter((m) => m.year === year && m.month === month)

  // Parent map
  const parentMap: Record<string, string> = {}
  quarterlyGoals.forEach((q) => {
    q.monthlyGoalIds.forEach((mid) => { parentMap[mid] = `Q${q.quarter} — ${q.title}` })
  })

  const done       = mGoals.filter((g) => g.status === 'done').length
  const inProgress = mGoals.filter((g) => g.status === 'in_progress').length
  const avgProgress = mGoals.length
    ? Math.round(mGoals.reduce((a, g) => a + g.progress, 0) / mGoals.length)
    : 0

  return (
    <div className="space-y-6">
      <FadeInUp>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center">
              <CalendarDays size={20} className="text-sky-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-100">Planejamento Mensal</h3>
              <p className="text-slate-500 text-sm">Metas e entregas do mês</p>
            </div>
          </div>
          <button type="button" onClick={() => { setEditTarget(null); setFormOpen(true) }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/15 text-sky-300 text-sm font-semibold hover:bg-sky-500/25 transition-colors">
            <Plus size={16} /> Nova Meta
          </button>
        </div>
      </FadeInUp>

      {/* Month nav */}
      <FadeInUp delay={0.03}>
        <div className="flex items-center justify-between card px-5 py-3">
          <button type="button" onClick={prevMonth} className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-slate-200">
            <ChevronLeft size={16} />
          </button>
          <div className="text-center">
            <div className="font-bold text-slate-200">{MONTH_NAMES[month - 1]}</div>
            <div className="text-xs text-slate-500 tabular-nums">{year}</div>
          </div>
          <button type="button" onClick={nextMonth} className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-slate-200">
            <ChevronRight size={16} />
          </button>
        </div>
      </FadeInUp>

      {/* Stats */}
      {mGoals.length > 0 && (
        <FadeInUp delay={0.05}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={<Target size={17} />}       value={mGoals.length}  label="Metas"          color="#0ea5e9" compact />
            <StatCard icon={<CheckCircle2 size={17} />} value={done}           label="Concluídas"     color="#10b981" compact />
            <StatCard icon={<Clock size={17} />}        value={inProgress}     label="Em Andamento"   color="#6366f1" compact />
            <StatCard icon={<TrendingUp size={17} />}   value={`${avgProgress}%`} label="Progresso"  color="#0ea5e9" compact />
          </div>
        </FadeInUp>
      )}

      {mGoals.length === 0 ? (
        <FadeInUp delay={0.06}>
          <div className="card p-8 text-center">
            <CalendarDays size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">Nenhuma meta para {MONTH_NAMES[month - 1]}</p>
            <button type="button" onClick={() => setFormOpen(true)}
              className="mt-4 px-5 py-2 rounded-xl bg-sky-500/15 text-sky-300 text-sm font-bold hover:bg-sky-500/25">
              Criar meta para {MONTH_NAMES[month - 1]}
            </button>
          </div>
        </FadeInUp>
      ) : (
        <StaggerList className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mGoals.map((goal) => {
            const children  = weeklyGoals.filter((w) => goal.weeklyGoalIds.includes(w.id))
            const childDone = children.filter((w) => w.status === 'done').length
            return (
              <StaggerItem key={goal.id}>
                <GoalCard
                  goal={goal}
                  level="monthly"
                  parentTitle={parentMap[goal.id]}
                  childCount={children.length}
                  childDone={childDone}
                  onEdit={() => { setEditTarget(goal); setFormOpen(true) }}
                  onDelete={() => deleteMonthlyGoal(goal.id)}
                >
                  {children.map((w) => (
                    <div key={w.id} className="flex items-center gap-2 py-1.5 border-b border-white/[0.04] last:border-0">
                      <div className="text-[10px] font-bold text-emerald-400 w-10">Sem {w.week}</div>
                      <div className="flex-1 min-w-0 text-xs text-slate-400 truncate">{w.title}</div>
                      <div className="text-[10px] font-black text-emerald-400 tabular-nums">{w.progress}%</div>
                      <div className="w-16 h-1 bg-white/[0.05] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${w.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </GoalCard>
              </StaggerItem>
            )
          })}
        </StaggerList>
      )}

      <GoalFormModal
        open={formOpen}
        create={editTarget ? undefined : { level: 'monthly', context: { year, month } }}
        edit={editTarget ? { level: 'monthly', goal: editTarget } : undefined}
        onClose={() => { setFormOpen(false); setEditTarget(null) }}
      />
    </div>
  )
}
