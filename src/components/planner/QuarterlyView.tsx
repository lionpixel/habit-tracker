// ─────────────────────────────────────────────
//  View: Quarterly Goals
// ─────────────────────────────────────────────

'use client'

import { useState } from 'react'
import { Plus, Layers } from 'lucide-react'
import { useGoalsStore } from '@/store/goalsStore'
import { GoalCard } from './GoalCard'
import { GoalFormModal } from './GoalFormModal'
import { FadeInUp, StaggerList, StaggerItem } from '@/components/ui/Motion'
import { cn } from '@/lib/helpers'
import { getQuarter, getQuarterRange } from '@/types/goals'
import type { QuarterlyGoal, Quarter } from '@/types/goals'

import { getBRTYear, getBRTMonth } from '@/lib/time'
const CURRENT_YEAR  = getBRTYear()
const CURRENT_MONTH = getBRTMonth()
const CURRENT_Q     = getQuarter(CURRENT_MONTH)

const QUARTER_COLORS: Record<Quarter, string> = {
  1: '#a78bfa',
  2: '#6366f1',
  3: '#0ea5e9',
  4: '#10b981',
}

export function QuarterlyView() {
  const { annualGoals, quarterlyGoals, monthlyGoals, deleteQuarterlyGoal } = useGoalsStore()
  const [activeQ, setActiveQ] = useState<Quarter>(CURRENT_Q)
  const [formOpen, setFormOpen]   = useState(false)
  const [editTarget, setEditTarget] = useState<QuarterlyGoal | null>(null)

  const qGoals = quarterlyGoals.filter((q) => q.year === CURRENT_YEAR && q.quarter === activeQ)
  const parentMap: Record<string, string> = {}
  annualGoals.forEach((ag) => {
    ag.quarterlyGoalIds.forEach((qid) => { parentMap[qid] = ag.title })
  })

  return (
    <div className="space-y-6">
      <FadeInUp>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
              <Layers size={20} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-100">Metas Trimestrais</h3>
              <p className="text-slate-500 text-sm">3 meses de foco</p>
            </div>
          </div>
          <button type="button" onClick={() => { setEditTarget(null); setFormOpen(true) }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/15 text-indigo-300 text-sm font-semibold hover:bg-indigo-500/25 transition-colors">
            <Plus size={16} /> Nova Meta
          </button>
        </div>
      </FadeInUp>

      {/* Quarter tabs */}
      <FadeInUp delay={0.03}>
        <div className="grid grid-cols-4 gap-2">
          {([1, 2, 3, 4] as Quarter[]).map((q) => {
            const color   = QUARTER_COLORS[q]
            const isActive = q === activeQ
            const isCurrent = q === CURRENT_Q
            const goals    = quarterlyGoals.filter((g) => g.year === CURRENT_YEAR && g.quarter === q)
            const avg      = goals.length ? Math.round(goals.reduce((a, g) => a + g.progress, 0) / goals.length) : 0
            return (
              <button key={q} type="button" onClick={() => setActiveQ(q)}
                className={cn(
                  'card p-3 text-center transition-all duration-200 overflow-hidden',
                  isActive ? 'ring-2' : 'hover:border-white/[0.14]',
                )}
                style={isActive ? { ringColor: color, borderColor: color + '40' } as React.CSSProperties : undefined}
              >
                <div className="h-[2px] mb-2 rounded-full" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
                <div className="text-sm font-black" style={{ color: isActive ? color : '#64748b' }}>Q{q}</div>
                <div className="text-[10px] text-slate-600 mt-0.5">{getQuarterRange(CURRENT_YEAR, q)}</div>
                {goals.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs font-bold tabular-nums" style={{ color }}>{avg}%</div>
                    <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden mt-1">
                      <div className="h-full rounded-full transition-all" style={{ width: `${avg}%`, backgroundColor: color }} />
                    </div>
                  </div>
                )}
                {isCurrent && (
                  <div className="text-[9px] text-emerald-400 font-bold mt-1">Atual</div>
                )}
              </button>
            )
          })}
        </div>
      </FadeInUp>

      {/* Goals for active quarter */}
      {qGoals.length === 0 ? (
        <FadeInUp delay={0.05}>
          <div className="card p-8 text-center">
            <Layers size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">Nenhuma meta para Q{activeQ}</p>
            <p className="text-slate-600 text-sm mt-1">{getQuarterRange(CURRENT_YEAR, activeQ)}</p>
            <button type="button" onClick={() => setFormOpen(true)}
              className="mt-4 px-5 py-2 rounded-xl bg-indigo-500/15 text-indigo-300 text-sm font-bold hover:bg-indigo-500/25 transition-colors">
              Criar meta para Q{activeQ}
            </button>
          </div>
        </FadeInUp>
      ) : (
        <StaggerList className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {qGoals.map((goal) => {
            const children = monthlyGoals.filter((m) => goal.monthlyGoalIds.includes(m.id))
            const childDone = children.filter((m) => m.status === 'done').length
            return (
              <StaggerItem key={goal.id}>
                <GoalCard
                  goal={goal}
                  level="quarterly"
                  parentTitle={parentMap[goal.id]}
                  childCount={children.length}
                  childDone={childDone}
                  onEdit={() => { setEditTarget(goal); setFormOpen(true) }}
                  onDelete={() => deleteQuarterlyGoal(goal.id)}
                >
                  {children.map((m) => {
                    const MONTH_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
                    return (
                      <div key={m.id} className="flex items-center gap-2 py-1.5 border-b border-white/[0.04] last:border-0">
                        <div className="text-[10px] font-bold text-sky-400 w-8">{MONTH_SHORT[m.month - 1]}</div>
                        <div className="flex-1 min-w-0 text-xs text-slate-400 truncate">{m.title}</div>
                        <div className="text-[10px] font-black text-sky-400 tabular-nums">{m.progress}%</div>
                        <div className="w-16 h-1 bg-white/[0.05] rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${m.progress}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </GoalCard>
              </StaggerItem>
            )
          })}
        </StaggerList>
      )}

      <GoalFormModal
        open={formOpen}
        create={editTarget ? undefined : { level: 'quarterly', context: { year: CURRENT_YEAR, quarter: activeQ } }}
        edit={editTarget ? { level: 'quarterly', goal: editTarget } : undefined}
        onClose={() => { setFormOpen(false); setEditTarget(null) }}
      />
    </div>
  )
}
