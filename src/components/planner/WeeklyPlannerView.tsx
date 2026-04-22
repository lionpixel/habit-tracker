// ─────────────────────────────────────────────
//  View: Weekly Planner
// ─────────────────────────────────────────────

'use client'

import { useState } from 'react'
import { Plus, LayoutGrid, ChevronLeft, ChevronRight, CalendarDays, List } from 'lucide-react'
import { useGoalsStore } from '@/store/goalsStore'
import { GoalCard, TaskRow } from './GoalCard'
import { GoalFormModal } from './GoalFormModal'
import { FadeInUp, StaggerList, StaggerItem } from '@/components/ui/Motion'
import { getWeekNumber, cn } from '@/lib/helpers'
import type { WeeklyGoal, DailyTask } from '@/types/goals'

const DAY_NAMES = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

function getWeekDates(year: number, week: number): Date[] {
  // Jan 4 is always in ISO week 1
  const jan4 = new Date(year, 0, 4)
  const day = jan4.getDay() || 7
  const monday = new Date(jan4)
  monday.setDate(jan4.getDate() - day + 1 + (week - 1) * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

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
  const [viewMode, setViewMode] = useState<'goal' | 'day'>('goal')

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
  const unlinkedTasks = dailyTasks.filter((t) => {
    const d = new Date(t.date + 'T12:00:00')
    return getWeekNumber(d) === week && d.getFullYear() === year && !allWeekTaskIds.includes(t.id)
  })

  // Day-view helpers
  const weekDates = getWeekDates(year, week)
  const todayStr = new Date().toISOString().slice(0, 10)
  const goalTitleMap: Record<string, string> = {}
  wGoals.forEach((g) => g.taskIds.forEach((tid) => { goalTitleMap[tid] = g.title }))
  const allWeekTasks = [
    ...dailyTasks.filter((t) => allWeekTaskIds.includes(t.id)),
    ...unlinkedTasks,
  ]

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
            {/* View toggle */}
            <div className="flex bg-white/[0.04] rounded-xl p-0.5">
              <button type="button" onClick={() => setViewMode('goal')}
                className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] text-xs font-semibold transition-all', viewMode === 'goal' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-500 hover:text-slate-300')}>
                <List size={13} />
              </button>
              <button type="button" onClick={() => setViewMode('day')}
                className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] text-xs font-semibold transition-all', viewMode === 'day' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-500 hover:text-slate-300')}>
                <CalendarDays size={13} />
              </button>
            </div>
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

      {/* ── Day view (Mon–Sun) ── */}
      {viewMode === 'day' && (
        <FadeInUp delay={0.05}>
          <div className="space-y-2">
            {weekDates.map((date, i) => {
              const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
              const dayTasks = allWeekTasks.filter((t) => t.date === dateStr).sort((a, b) => (a.dueTime ?? '').localeCompare(b.dueTime ?? ''))
              const isToday = dateStr === todayStr
              return (
                <div
                  key={dateStr}
                  className={cn(
                    'card p-3',
                    isToday ? 'border-emerald-500/25 bg-emerald-500/[0.03]' : '',
                  )}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={cn('text-xs font-bold w-7', isToday ? 'text-emerald-400' : 'text-slate-500')}>
                      {DAY_NAMES[i]}
                    </span>
                    <span className="text-[11px] text-slate-600 tabular-nums">
                      {date.getDate().toString().padStart(2, '0')}/{(date.getMonth() + 1).toString().padStart(2, '0')}
                    </span>
                    {isToday && <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 rounded-md">Hoje</span>}
                    {dayTasks.length > 0 && (
                      <span className="ml-auto text-[10px] text-slate-600 tabular-nums">
                        {dayTasks.filter(t => t.status === 'done').length}/{dayTasks.length}
                      </span>
                    )}
                  </div>
                  {dayTasks.length === 0 ? (
                    <p className="text-[11px] text-slate-700 italic pl-9">Nenhuma tarefa</p>
                  ) : (
                    <div className="space-y-0.5">
                      {dayTasks.map((task) => (
                        <div key={task.id} className="pl-9">
                          {goalTitleMap[task.id] && (
                            <div className="text-[10px] text-slate-600 mb-0.5">{goalTitleMap[task.id]}</div>
                          )}
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
                            onEdit={() => { setEditTask(task); setActiveWeeklyId(goalTitleMap[task.id] ? (wGoals.find(g => g.taskIds.includes(task.id))?.id ?? null) : null); setTaskFormOpen(true) }}
                            onDelete={() => deleteDailyTask(task.id)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </FadeInUp>
      )}

      {/* Weekly goals + their tasks */}
      {viewMode === 'goal' && (wGoals.length === 0 && unlinkedTasks.length === 0 ? (
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
      ))}

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
