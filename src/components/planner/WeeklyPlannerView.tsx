// ─────────────────────────────────────────────
//  View: Weekly Planner
// ─────────────────────────────────────────────

'use client'

import { useState } from 'react'
import { Plus, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react'
import { useGoalsStore } from '@/store/goalsStore'
import { GoalCard, TaskRow } from './GoalCard'
import { GoalFormModal } from './GoalFormModal'
import { FadeInUp, StaggerList, StaggerItem } from '@/components/ui/Motion'
import { getWeekNumber } from '@/lib/helpers'
import type { WeeklyGoal, DailyTask } from '@/types/goals'

const CURRENT_YEAR = new Date().getFullYear()
const CURRENT_WEEK = getWeekNumber(new Date())

export function WeeklyPlannerView() {
  const { monthlyGoals, weeklyGoals, dailyTasks, deleteWeeklyGoal, completeDailyTask, uncompleteDailyTask, deleteDailyTask } = useGoalsStore()
  const [year, setYear]   = useState(CURRENT_YEAR)
  const [week, setWeek]   = useState(CURRENT_WEEK)
  const [formOpen, setFormOpen]       = useState(false)
  const [taskFormOpen, setTaskFormOpen] = useState(false)
  const [editWeekly, setEditWeekly]   = useState<WeeklyGoal | null>(null)
  const [editTask,   setEditTask]     = useState<DailyTask | null>(null)
  const [activeWeeklyId, setActiveWeeklyId] = useState<string | null>(null)

  function prevWeek() {
    if (week <= 1) { setWeek(52); setYear((y) => y - 1) }
    else setWeek((w) => w - 1)
  }
  function nextWeek() {
    setWeek((w) => w >= 52 ? 1 : w + 1)
    if (week >= 52) setYear((y) => y + 1)
  }

  const wGoals = weeklyGoals.filter((g) => g.year === year && g.week === week)

  // Parent map
  const parentMap: Record<string, string> = {}
  monthlyGoals.forEach((m) => {
    m.weeklyGoalIds.forEach((wid) => {
      const MONTH_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
      parentMap[wid] = `${MONTH_SHORT[m.month - 1]} — ${m.title}`
    })
  })

  // Unlinked tasks for this week (taskIds reference)
  const allWeekTaskIds = wGoals.flatMap((w) => w.taskIds)
  const _weekTasks = dailyTasks.filter((t) => allWeekTaskIds.includes(t.id))
  const unlinkedTasks = dailyTasks.filter((t) => {
    const d = new Date(t.date + 'T12:00:00')
    return getWeekNumber(d) === week && d.getFullYear() === year && !allWeekTaskIds.includes(t.id)
  })

  const isCurrentWeek = week === CURRENT_WEEK && year === CURRENT_YEAR

  return (
    <div className="space-y-6">
      <FadeInUp>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <LayoutGrid size={20} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-100">Planejamento Semanal</h3>
              <p className="text-slate-500 text-sm">Semana {week}, {year}{isCurrentWeek ? ' — Esta semana' : ''}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setEditTask(null); setActiveWeeklyId(null); setTaskFormOpen(true) }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/15 text-amber-300 text-xs font-semibold hover:bg-amber-500/25 transition-colors">
              <Plus size={14} /> Tarefa
            </button>
            <button type="button" onClick={() => { setEditWeekly(null); setFormOpen(true) }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/15 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/25 transition-colors">
              <Plus size={14} /> Meta
            </button>
          </div>
        </div>
      </FadeInUp>

      {/* Week nav */}
      <FadeInUp delay={0.03}>
        <div className="flex items-center justify-between card px-5 py-3">
          <button type="button" onClick={prevWeek} className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-slate-200">
            <ChevronLeft size={16} />
          </button>
          <div className="text-center">
            <div className="font-bold text-slate-200">Semana {week}</div>
            <div className="text-xs text-slate-500">{year}</div>
          </div>
          <button type="button" onClick={nextWeek} className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-slate-200">
            <ChevronRight size={16} />
          </button>
        </div>
      </FadeInUp>

      {/* Weekly goals + their tasks */}
      {wGoals.length === 0 && unlinkedTasks.length === 0 ? (
        <FadeInUp delay={0.05}>
          <div className="card p-8 text-center">
            <LayoutGrid size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">Semana vazia</p>
            <p className="text-slate-600 text-sm mt-1">Defina metas e tarefas para esta semana</p>
          </div>
        </FadeInUp>
      ) : (
        <StaggerList className="space-y-4">
          {wGoals.map((goal) => {
            const tasks     = dailyTasks.filter((t) => goal.taskIds.includes(t.id))
            const taskDone  = tasks.filter((t) => t.status === 'done').length
            return (
              <StaggerItem key={goal.id}>
                <GoalCard
                  goal={goal}
                  level="weekly"
                  parentTitle={parentMap[goal.id]}
                  childCount={tasks.length}
                  childDone={taskDone}
                  onEdit={() => { setEditWeekly(goal); setFormOpen(true) }}
                  onDelete={() => deleteWeeklyGoal(goal.id)}
                >
                  {tasks.length > 0 && (
                    <div className="space-y-1">
                      {tasks.map((task) => (
                        <TaskRow
                          key={task.id}
                          title={task.title}
                          status={task.status as 'not_started' | 'in_progress' | 'done' | 'cancelled'}
                          priority={task.priority}
                          dueTime={task.dueTime}
                          onComplete={() =>
                            task.status === 'done'
                              ? uncompleteDailyTask(task.id)
                              : completeDailyTask(task.id)
                          }
                          onEdit={() => { setEditTask(task); setActiveWeeklyId(goal.id); setTaskFormOpen(true) }}
                          onDelete={() => deleteDailyTask(task.id)}
                        />
                      ))}
                    </div>
                  )}
                  {/* Add task to this goal */}
                  <button type="button"
                    onClick={() => { setEditTask(null); setActiveWeeklyId(goal.id); setTaskFormOpen(true) }}
                    className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-600 hover:text-emerald-400 transition-colors font-medium">
                    <Plus size={11} /> Adicionar tarefa
                  </button>
                </GoalCard>
              </StaggerItem>
            )
          })}

          {/* Unlinked tasks */}
          {unlinkedTasks.length > 0 && (
            <StaggerItem>
              <div className="card p-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Tarefas avulsas</div>
                <div className="space-y-1">
                  {unlinkedTasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      title={task.title}
                      status={task.status as 'not_started' | 'in_progress' | 'done' | 'cancelled'}
                      priority={task.priority}
                      dueTime={task.dueTime}
                      onComplete={() =>
                        task.status === 'done'
                          ? uncompleteDailyTask(task.id)
                          : completeDailyTask(task.id)
                      }
                      onEdit={() => { setEditTask(task); setTaskFormOpen(true) }}
                      onDelete={() => deleteDailyTask(task.id)}
                    />
                  ))}
                </div>
              </div>
            </StaggerItem>
          )}
        </StaggerList>
      )}

      {/* Weekly goal form */}
      <GoalFormModal
        open={formOpen}
        create={editWeekly ? undefined : { level: 'weekly', context: { year, week } }}
        edit={editWeekly ? { level: 'weekly', goal: editWeekly } : undefined}
        onClose={() => { setFormOpen(false); setEditWeekly(null) }}
      />

      {/* Daily task form */}
      <GoalFormModal
        open={taskFormOpen}
        create={editTask ? undefined : { level: 'daily', context: { weeklyGoalId: activeWeeklyId ?? undefined } }}
        edit={editTask ? { level: 'daily', goal: editTask } : undefined}
        onClose={() => { setTaskFormOpen(false); setEditTask(null); setActiveWeeklyId(null) }}
      />
    </div>
  )
}
