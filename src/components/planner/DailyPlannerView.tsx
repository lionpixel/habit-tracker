// ─────────────────────────────────────────────
//  View: Daily Planner — today's focus
// ─────────────────────────────────────────────

'use client'

import { useState } from 'react'
import { Plus, Sun, ChevronLeft, ChevronRight, Flame } from 'lucide-react'
import { useGoalsStore } from '@/store/goalsStore'
import { TaskRow } from './GoalCard'
import { GoalFormModal } from './GoalFormModal'
import { FadeInUp } from '@/components/ui/Motion'
import { todayStr } from '@/lib/helpers'
import { PRIORITY_COLORS } from '@/types/goals'
import type { DailyTask } from '@/types/goals'
import { Clock } from 'lucide-react'

const DAY_NAMES = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const MONTH_NAMES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} de ${MONTH_NAMES[d.getMonth()]} de ${d.getFullYear()}`
}

export function DailyPlannerView() {
  const { dailyTasks, weeklyGoals, completeDailyTask, uncompleteDailyTask, deleteDailyTask } = useGoalsStore()
  const [date, setDate]         = useState(todayStr())
  const [formOpen, setFormOpen] = useState(false)
  const [editTask, setEditTask] = useState<DailyTask | null>(null)

  const today = todayStr()

  function prevDay() {
    const d = new Date(date + 'T12:00:00')
    d.setDate(d.getDate() - 1)
    setDate(d.toISOString().slice(0, 10))
  }
  function nextDay() {
    const d = new Date(date + 'T12:00:00')
    d.setDate(d.getDate() + 1)
    setDate(d.toISOString().slice(0, 10))
  }

  const tasks = dailyTasks.filter((t) => t.date === date)
    .sort((a, b) => {
      if (a.dueTime && b.dueTime) return a.dueTime.localeCompare(b.dueTime)
      if (a.dueTime) return -1
      if (b.dueTime) return 1
      const po = { critical: 0, high: 1, medium: 2, low: 3 }
      return po[a.priority] - po[b.priority]
    })

  const done       = tasks.filter((t) => t.status === 'done').length
  const total      = tasks.length
  const pct        = total > 0 ? Math.round((done / total) * 100) : 0
  const totalMins  = tasks.reduce((a, t) => a + (t.estimatedMinutes ?? 0), 0)
  const isToday    = date === today

  // Group by priority
  const byPriority = {
    critical: tasks.filter((t) => t.priority === 'critical'),
    high:     tasks.filter((t) => t.priority === 'high'),
    medium:   tasks.filter((t) => t.priority === 'medium'),
    low:      tasks.filter((t) => t.priority === 'low'),
  } as const

  // Parent goal title map
  const parentMap: Record<string, string> = {}
  weeklyGoals.forEach((wg) => {
    wg.taskIds.forEach((tid) => { parentMap[tid] = wg.title })
  })

  return (
    <div className="space-y-6">
      <FadeInUp>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Sun size={20} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-100">
                {isToday ? 'Hoje' : 'Planejamento Diário'}
              </h3>
              <p className="text-slate-500 text-sm">{formatDate(date)}</p>
            </div>
          </div>
          <button type="button" onClick={() => { setEditTask(null); setFormOpen(true) }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 text-amber-300 text-sm font-semibold hover:bg-amber-500/25 transition-colors">
            <Plus size={16} /> Nova Tarefa
          </button>
        </div>
      </FadeInUp>

      {/* Day nav */}
      <FadeInUp delay={0.03}>
        <div className="flex items-center justify-between card px-5 py-3">
          <button type="button" onClick={prevDay} className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-slate-200">
            <ChevronLeft size={16} />
          </button>
          <div className="text-center">
            <div className="font-bold text-slate-200">{formatDate(date)}</div>
            {isToday && <div className="text-[10px] text-amber-400 font-bold mt-0.5">Hoje</div>}
          </div>
          <button type="button" onClick={nextDay} className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-slate-200">
            <ChevronRight size={16} />
          </button>
        </div>
      </FadeInUp>

      {/* Progress + stats */}
      {total > 0 && (
        <FadeInUp delay={0.04}>
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
                <Flame size={15} className="text-amber-400" />
                {done}/{total} tarefas concluídas
              </div>
              <span className="text-lg font-black text-amber-400 tabular-nums">{pct}%</span>
            </div>
            <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-amber-500 to-amber-400"
                style={{ width: `${pct}%` }} />
            </div>
            {totalMins > 0 && (
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-600">
                <Clock size={11} />
                {totalMins >= 60
                  ? `${Math.floor(totalMins / 60)}h ${totalMins % 60}min estimados`
                  : `${totalMins}min estimados`}
              </div>
            )}
          </div>
        </FadeInUp>
      )}

      {/* Task groups */}
      {tasks.length === 0 ? (
        <FadeInUp delay={0.06}>
          <div className="card p-8 text-center">
            <Sun size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">{isToday ? 'Nenhuma tarefa para hoje' : 'Dia vazio'}</p>
            <p className="text-slate-600 text-sm mt-1">Adicione tarefas para começar</p>
            <button type="button" onClick={() => setFormOpen(true)}
              className="mt-4 px-5 py-2 rounded-xl bg-amber-500/15 text-amber-300 text-sm font-bold hover:bg-amber-500/25">
              + Adicionar tarefa
            </button>
          </div>
        </FadeInUp>
      ) : (
        <FadeInUp delay={0.06}>
          <div className="space-y-4">
            {(['critical','high','medium','low'] as const).map((priority) => {
              const group = byPriority[priority]
              if (!group.length) return null
              const color = PRIORITY_COLORS[priority]
              const labels = { critical: 'Crítico', high: 'Alta', medium: 'Média', low: 'Baixa' }
              return (
                <div key={priority}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>
                      {labels[priority]}
                    </span>
                    <span className="text-[10px] text-slate-600">{group.filter((t) => t.status === 'done').length}/{group.length}</span>
                  </div>
                  <div className="space-y-1">
                    {group.map((task) => (
                      <div key={task.id}>
                        <TaskRow
                          title={task.title}
                          status={task.status as 'not_started' | 'in_progress' | 'done' | 'cancelled'}
                          priority={task.priority}
                          dueTime={task.dueTime}
                          onComplete={() =>
                            task.status === 'done'
                              ? uncompleteDailyTask(task.id)
                              : completeDailyTask(task.id)
                          }
                          onEdit={() => { setEditTask(task); setFormOpen(true) }}
                          onDelete={() => deleteDailyTask(task.id)}
                        />
                        {task.estimatedMinutes && (
                          <div className="pl-10 text-[10px] text-slate-700 flex items-center gap-1 mb-1">
                            <Clock size={9} /> {task.estimatedMinutes}min
                            {parentMap[task.id] && <> · <span className="text-slate-700 truncate max-w-[150px]">{parentMap[task.id]}</span></>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </FadeInUp>
      )}

      <GoalFormModal
        open={formOpen}
        create={editTask ? undefined : { level: 'daily', context: { date } }}
        edit={editTask ? { level: 'daily', goal: editTask } : undefined}
        onClose={() => { setFormOpen(false); setEditTask(null) }}
      />
    </div>
  )
}
