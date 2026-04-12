// ─────────────────────────────────────────────
//  View: Annual Goals
// ─────────────────────────────────────────────

'use client'

import { useState } from 'react'
import { Plus, Calendar } from 'lucide-react'
import { useGoalsStore } from '@/store/goalsStore'
import { GoalCard } from './GoalCard'
import { GoalFormModal } from './GoalFormModal'
import { FadeInUp, StaggerList, StaggerItem } from '@/components/ui/Motion'
import { StatCard } from '@/components/ui/StatCard'
import type { AnnualGoal } from '@/types/goals'
import { TrendingUp, Target, CheckCircle2, AlertCircle } from 'lucide-react'

const CURRENT_YEAR = new Date().getFullYear()

export function AnnualGoalsView() {
  const { annualGoals, quarterlyGoals, deleteAnnualGoal, setAnnualProgress } = useGoalsStore()
  const [formOpen, setFormOpen]   = useState(false)
  const [editTarget, setEditTarget] = useState<AnnualGoal | null>(null)

  const yearGoals = annualGoals.filter((g) => g.year === CURRENT_YEAR)

  const done       = yearGoals.filter((g) => g.status === 'done').length
  const _inProgress = yearGoals.filter((g) => g.status === 'in_progress').length
  const atRisk     = yearGoals.filter((g) => g.status === 'not_started' && g.quarterlyGoalIds.length === 0).length
  const avgProgress = yearGoals.length
    ? Math.round(yearGoals.reduce((a, g) => a + g.progress, 0) / yearGoals.length)
    : 0

  return (
    <div className="space-y-6">
      <FadeInUp>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <Calendar size={20} className="text-violet-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-100">Metas Anuais {CURRENT_YEAR}</h3>
              <p className="text-slate-500 text-sm">Grandes objetivos para o ano inteiro</p>
            </div>
          </div>
          <button type="button" onClick={() => { setEditTarget(null); setFormOpen(true) }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/15 text-violet-300 text-sm font-semibold hover:bg-violet-500/25 transition-colors">
            <Plus size={16} /> Nova Meta
          </button>
        </div>
      </FadeInUp>

      <FadeInUp delay={0.04}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={<Target size={17} />}       value={yearGoals.length}  label="Total de Metas" color="#a78bfa" />
          <StatCard icon={<CheckCircle2 size={17} />} value={done}              label="Concluídas"      color="#10b981" />
          <StatCard icon={<TrendingUp size={17} />}   value={`${avgProgress}%`} label="Progresso Médio" color="#6366f1" />
          <StatCard icon={<AlertCircle size={17} />}  value={atRisk}            label="Sem Subtarefas"  color={atRisk > 0 ? '#f59e0b' : '#64748b'} />
        </div>
      </FadeInUp>

      {yearGoals.length === 0 ? (
        <FadeInUp delay={0.06}>
          <div className="card p-10 text-center">
            <Target size={36} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">Nenhuma meta anual cadastrada</p>
            <p className="text-slate-600 text-sm mt-1">Defina seus grandes objetivos para {CURRENT_YEAR}</p>
            <button type="button" onClick={() => setFormOpen(true)}
              className="mt-4 px-5 py-2 rounded-xl bg-violet-500/20 text-violet-300 text-sm font-bold hover:bg-violet-500/30 transition-colors">
              Criar primeira meta
            </button>
          </div>
        </FadeInUp>
      ) : (
        <StaggerList className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {yearGoals.map((goal) => {
            const children = quarterlyGoals.filter((q) => goal.quarterlyGoalIds.includes(q.id))
            const childDone = children.filter((q) => q.status === 'done').length
            return (
              <StaggerItem key={goal.id}>
                <GoalCard
                  goal={goal}
                  level="annual"
                  childCount={children.length}
                  childDone={childDone}
                  onEdit={() => { setEditTarget(goal); setFormOpen(true) }}
                  onDelete={() => deleteAnnualGoal(goal.id)}
                  onSetProgress={(p) => setAnnualProgress(goal.id, p)}
                >
                  {/* Q breakdown */}
                  {children.map((q) => (
                    <div key={q.id} className="flex items-center gap-2 py-1.5 border-b border-white/[0.04] last:border-0">
                      <div className="text-[10px] font-bold text-indigo-400 w-6">Q{q.quarter}</div>
                      <div className="flex-1 min-w-0 text-xs text-slate-400 truncate">{q.title}</div>
                      <div className="text-[10px] font-black text-indigo-400 tabular-nums">{q.progress}%</div>
                      <div className="w-16 h-1 bg-white/[0.05] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${q.progress}%` }} />
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
        create={editTarget ? undefined : { level: 'annual', context: { year: CURRENT_YEAR } }}
        edit={editTarget ? { level: 'annual', goal: editTarget } : undefined}
        onClose={() => { setFormOpen(false); setEditTarget(null) }}
      />
    </div>
  )
}
