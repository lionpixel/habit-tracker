// ─────────────────────────────────────────────
//  View: Weekly Planner — connected board
// ─────────────────────────────────────────────

'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
} from 'react'
import {
  CalendarDays,
  CheckSquare2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Flame,
  GripVertical,
  LayoutGrid,
  Plus,
  Settings2,
  Square,
  Target,
  Trash2,
} from 'lucide-react'
import { useGoalsStore } from '@/store/goalsStore'
import { useCalendarStore } from '@/store/calendarStore'
import { NewHabitModal } from '@/components/habits/NewHabitModal'
import { HabitEditorModal } from '@/components/habits/HabitEditorModal'
import type { HabitKey } from '@/types/habit'
import { useHabitsForWeek, type PlannerDayKey, type PlannerHabitItem } from '@/hooks/useHabitsForWeek'
import { GoalCard, TaskRow } from './GoalCard'
import { GoalFormModal } from './GoalFormModal'
import { FadeInUp } from '@/components/ui/Motion'
import { cn } from '@/lib/helpers'
import { getBRTWeekNumber, getBRTYear, getTodayStr, getWeekInfoFromDateStr } from '@/lib/time'
import type { WeeklyGoal, DailyTask } from '@/types/goals'

const CURRENT_YEAR = getBRTYear()
const CURRENT_WEEK = getBRTWeekNumber()

type DayConfig = { key: PlannerDayKey; label: string }

const DAY_CONFIG: DayConfig[] = [
  { key: 'monday',    label: 'Segunda' },
  { key: 'tuesday',   label: 'Terça' },
  { key: 'wednesday', label: 'Quarta' },
  { key: 'thursday',  label: 'Quinta' },
  { key: 'friday',    label: 'Sexta' },
  { key: 'saturday',  label: 'Sábado' },
  { key: 'sunday',    label: 'Domingo' },
]

const LEFT_COLS = [0, 2, 4, 6]
const RIGHT_COLS = [1, 3, 5]

function priority(text: string): 'A' | 'F' | 'normal' {
  const t = text.trimStart()
  if (/^A:\s*/i.test(t)) return 'A'
  if (/^F:\s*/i.test(t)) return 'F'
  return 'normal'
}

const PRIO_COLOR = {
  A: 'text-red-400',
  F: 'text-violet-400',
  normal: 'text-slate-200',
}

let draggedTaskId: string | null = null

interface PlannerTaskItemProps {
  task: DailyTask
  onToggle: () => void
  onUpdate: (title: string) => void
  onDelete: () => void
  onDuplicate: () => void
}

function PlannerTaskItem({
  task,
  onToggle,
  onUpdate,
  onDelete,
  onDuplicate,
}: PlannerTaskItemProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task.title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function commit() {
    const trimmed = draft.trim()
    if (!trimmed) {
      onDelete()
      return
    }
    onUpdate(trimmed)
    setEditing(false)
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      commit()
    }
    if (event.key === 'Escape') {
      setDraft(task.title)
      setEditing(false)
    }
  }

  function onDragStart(event: DragEvent) {
    draggedTaskId = task.id
    event.dataTransfer.effectAllowed = 'move'
  }

  const prio = priority(task.title)
  const done = task.status === 'done'

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="group flex items-start gap-1.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/[0.04]"
    >
      <GripVertical
        size={12}
        className="mt-0.5 flex-shrink-0 cursor-grab text-slate-700 group-hover:text-slate-500"
      />

      <button type="button" onClick={onToggle} className="mt-0.5 flex-shrink-0">
        {done
          ? <CheckSquare2 size={13} className="text-emerald-400" />
          : <Square size={13} className="text-slate-700 transition-colors hover:text-slate-400" />}
      </button>

      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commit}
            onKeyDown={onKeyDown}
            className="w-full border-b border-emerald-500/50 bg-transparent pb-0.5 text-xs text-slate-200 outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={cn(
              'w-full text-left text-xs leading-relaxed',
              done ? 'text-slate-600 line-through' : PRIO_COLOR[prio],
            )}
          >
            {task.title}
          </button>
        )}

        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {task.source === 'calendar' && (
            <span className="rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-bold text-blue-300">
              Calendário
            </span>
          )}
          {task.dueTime && (
            <span className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
              {task.dueTime}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={onDuplicate}
          className="rounded p-0.5 text-slate-700 transition-colors hover:bg-white/[0.06] hover:text-slate-300"
        >
          <Copy size={10} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded p-0.5 text-slate-700 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 size={10} />
        </button>
      </div>
    </div>
  )
}

interface HabitRowProps {
  item: PlannerHabitItem
  onToggle: (done: boolean) => void
  onEdit?: () => void
}

function HabitRow({ item, onToggle, onEdit }: HabitRowProps) {
  return (
    <div className="group/hr flex items-start gap-2 rounded-xl px-2 py-1.5 hover:bg-white/[0.03]">
      <button
        type="button"
        disabled={item.locked}
        onClick={() => onToggle(!item.done)}
        className="mt-0.5 flex-shrink-0 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {item.done
          ? <CheckSquare2 size={13} className="text-emerald-400" />
          : <Square size={13} className="text-slate-700 transition-colors hover:text-slate-400" />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-xs font-semibold',
              item.done ? 'text-slate-500 line-through' : 'text-slate-200',
            )}
          >
            {item.name}
          </span>
          <span
            className="rounded-md px-1.5 py-0.5 text-[9px] font-bold"
            style={{ background: `${item.color}18`, color: item.color }}
          >
            streak {item.streak}
          </span>
        </div>
        <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
          {item.meta}
        </div>
      </div>

      {onEdit && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit() }}
          className="mt-0.5 flex-shrink-0 opacity-0 group-hover/hr:opacity-100 transition-opacity text-slate-700 hover:text-slate-400"
        >
          <Settings2 size={11} />
        </button>
      )}
    </div>
  )
}

interface HabitsSectionProps {
  items: PlannerHabitItem[]
  onToggle: (item: PlannerHabitItem, done: boolean) => void
  onEditHabit?: (key: HabitKey) => void
}

function HabitsSection({ items, onToggle, onEditHabit }: HabitsSectionProps) {
  const [collapsed, setCollapsed] = useState(false)
  const done = items.filter((item) => item.done).length
  const total = items.length

  return (
    <div>
      <button
        type="button"
        onClick={() => setCollapsed((current) => !current)}
        className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.03]"
      >
        <ChevronDown
          size={10}
          className={cn('text-slate-600 transition-transform', collapsed && '-rotate-90')}
        />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Habits</span>
        {total > 0 && (
          <span className="ml-auto text-[10px] font-semibold tabular-nums text-slate-700">
            {done}/{total}
          </span>
        )}
      </button>

      {!collapsed && (
        <div className="min-h-[16px] rounded-lg">
          {items.length === 0 ? (
            <div className="px-2 py-2 text-[11px] text-slate-700">
              Nenhum hábito programado para este dia.
            </div>
          ) : (
            items.map((item) => (
              <HabitRow
                key={`${item.key}-${item.date}`}
                item={item}
                onToggle={(done) => onToggle(item, done)}
                onEdit={onEditHabit ? () => onEditHabit(item.key as HabitKey) : undefined}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

interface TasksSectionProps {
  date: string
  tasks: DailyTask[]
  onToggle: (task: DailyTask) => void
  onUpdate: (task: DailyTask, title: string) => void
  onDelete: (task: DailyTask) => void
  onDuplicate: (task: DailyTask) => void
  onAdd: (title: string) => void
  onDropTask: (taskId: string, targetDate: string) => void
}

function TasksSection({
  date,
  tasks,
  onToggle,
  onUpdate,
  onDelete,
  onDuplicate,
  onAdd,
  onDropTask,
}: TasksSectionProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  function commitAdd() {
    const title = draft.trim()
    if (!title) {
      setDraft('')
      setAdding(false)
      return
    }
    onAdd(title)
    setDraft('')
    setAdding(false)
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      commitAdd()
    }
    if (event.key === 'Escape') {
      setDraft('')
      setAdding(false)
    }
  }

  function onDrop(event: DragEvent) {
    event.preventDefault()
    setDragOver(false)
    if (!draggedTaskId) return
    onDropTask(draggedTaskId, date)
    draggedTaskId = null
  }

  const done = tasks.filter((task) => task.status === 'done').length
  const total = tasks.length

  return (
    <div>
      <button
        type="button"
        onClick={() => setCollapsed((current) => !current)}
        className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.03]"
      >
        <ChevronDown
          size={10}
          className={cn('text-slate-600 transition-transform', collapsed && '-rotate-90')}
        />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Tarefas</span>
        {total > 0 && (
          <span className="ml-auto text-[10px] font-semibold tabular-nums text-slate-700">
            {done}/{total}
          </span>
        )}
      </button>

      {!collapsed && (
        <div
          onDragOver={(event) => {
            event.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            'min-h-[16px] rounded-lg transition-colors',
            dragOver && 'bg-emerald-500/10 ring-1 ring-emerald-500/25',
          )}
        >
          {tasks.map((task) => (
            <PlannerTaskItem
              key={task.id}
              task={task}
              onToggle={() => onToggle(task)}
              onUpdate={(title) => onUpdate(task, title)}
              onDelete={() => onDelete(task)}
              onDuplicate={() => onDuplicate(task)}
            />
          ))}

          {adding ? (
            <div className="flex items-center gap-1.5 px-2 py-1">
              <GripVertical size={12} className="flex-shrink-0 text-slate-800" />
              <Square size={13} className="flex-shrink-0 text-slate-700" />
              <input
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onBlur={commitAdd}
                onKeyDown={onKeyDown}
                placeholder="Nova tarefa..."
                className="flex-1 bg-transparent text-xs text-slate-300 outline-none placeholder:text-slate-700"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex w-full items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-slate-700 transition-colors hover:bg-white/[0.03] hover:text-slate-400"
            >
              <Plus size={11} /> adicionar
            </button>
          )}
        </div>
      )}
    </div>
  )
}

interface DayCardProps {
  dayConf: DayConfig
  date: string
  isToday: boolean
  habits: PlannerHabitItem[]
  tasks: DailyTask[]
  onToggleHabit: (item: PlannerHabitItem, done: boolean) => void
  onEditHabit?: (key: HabitKey) => void
  onToggleTask: (task: DailyTask) => void
  onUpdateTask: (task: DailyTask, title: string) => void
  onDeleteTask: (task: DailyTask) => void
  onDuplicateTask: (task: DailyTask) => void
  onAddTask: (date: string, title: string) => void
  onDropTask: (taskId: string, targetDate: string) => void
}

function DayCard({
  dayConf,
  date,
  isToday,
  habits,
  tasks,
  onToggleHabit,
  onEditHabit,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
  onDuplicateTask,
  onAddTask,
  onDropTask,
}: DayCardProps) {
  const total = habits.length + tasks.length
  const done = habits.filter((item) => item.done).length + tasks.filter((task) => task.status === 'done').length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const allDone = total > 0 && done === total

  return (
    <div className={cn(
      'flex flex-col gap-0 overflow-hidden rounded-2xl border bg-[#0d1117]',
      isToday ? 'border-emerald-500/30' : 'border-white/[0.06]',
    )}>
      <div className={cn('px-3 pb-2 pt-3', isToday ? 'bg-emerald-500/[0.04]' : 'bg-white/[0.01]')}>
        <div className="mb-1.5 flex items-center justify-between">
          <div>
            <div className={cn('text-sm font-black', isToday ? 'text-emerald-400' : 'text-slate-200')}>
              {dayConf.label}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="text-[10px] tabular-nums text-slate-600">
                {date.slice(8, 10)}/{date.slice(5, 7)}
              </span>
              {isToday && (
                <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-500">
                  Hoje
                </span>
              )}
            </div>
          </div>

          {total > 0 && (
            <div className="flex-shrink-0 text-right">
              <div className={cn('text-sm font-black tabular-nums', allDone ? 'text-emerald-400' : 'text-slate-400')}>
                {pct}%
              </div>
              <div className="text-[10px] text-slate-700">{done}/{total}</div>
            </div>
          )}
        </div>

        {total > 0 && (
          <div className="h-0.5 overflow-hidden rounded-full bg-white/[0.04]">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: allDone ? '#10b981' : '#6366f1',
                boxShadow: allDone ? '0 0 6px #10b98150' : undefined,
              }}
            />
          </div>
        )}
      </div>

      <div className="flex-1 divide-y divide-white/[0.04] px-1 pb-2">
        <div className="pt-1">
          <HabitsSection items={habits} onToggle={onToggleHabit} onEditHabit={onEditHabit} />
        </div>
        <div className="pt-1">
          <TasksSection
            date={date}
            tasks={tasks}
            onToggle={onToggleTask}
            onUpdate={onUpdateTask}
            onDelete={onDeleteTask}
            onDuplicate={onDuplicateTask}
            onAdd={(title) => onAddTask(date, title)}
            onDropTask={onDropTask}
          />
        </div>
      </div>
    </div>
  )
}

function MetasTab({ year, week }: { year: number; week: number }) {
  const {
    monthlyGoals,
    weeklyGoals,
    dailyTasks,
    deleteWeeklyGoal,
    completeDailyTask,
    uncompleteDailyTask,
    deleteDailyTask,
  } = useGoalsStore()

  const [formOpen, setFormOpen] = useState(false)
  const [taskFormOpen, setTaskFormOpen] = useState(false)
  const [editWeekly, setEditWeekly] = useState<WeeklyGoal | null>(null)
  const [editTask, setEditTask] = useState<DailyTask | null>(null)
  const [activeWId, setActiveWId] = useState<string | null>(null)

  const wGoals = weeklyGoals.filter((goal) => goal.year === year && goal.week === week)

  const parentMap: Record<string, string> = {}
  monthlyGoals.forEach((goal) => {
    const MONTH_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    goal.weeklyGoalIds.forEach((id) => { parentMap[id] = `${MONTH_SHORT[goal.month - 1]} — ${goal.title}` })
  })

  const allWeekTaskIds = wGoals.flatMap((goal) => goal.taskIds)
  const unlinked = dailyTasks.filter((task) => {
    const info = getWeekInfoFromDateStr(task.date)
    return info.year === year && info.week === week && !allWeekTaskIds.includes(task.id)
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setEditTask(null)
            setActiveWId(null)
            setTaskFormOpen(true)
          }}
          className="flex items-center gap-1.5 rounded-xl bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/25"
        >
          <Plus size={13} /> Tarefa
        </button>
        <button
          type="button"
          onClick={() => {
            setEditWeekly(null)
            setFormOpen(true)
          }}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/25"
        >
          <Plus size={13} /> Meta
        </button>
      </div>

      {wGoals.length === 0 && unlinked.length === 0 ? (
        <div className="card p-8 text-center">
          <LayoutGrid size={28} className="mx-auto mb-3 text-slate-700" />
          <p className="text-sm font-semibold text-slate-500">Semana sem metas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {wGoals.map((goal) => {
            const tasks = dailyTasks.filter((task) => goal.taskIds.includes(task.id))
            const done = tasks.filter((task) => task.status === 'done').length

            return (
              <GoalCard
                key={goal.id}
                goal={goal}
                level="weekly"
                parentTitle={parentMap[goal.id]}
                childCount={tasks.length}
                childDone={done}
                onEdit={() => {
                  setEditWeekly(goal)
                  setFormOpen(true)
                }}
                onDelete={() => deleteWeeklyGoal(goal.id)}
              >
                <div className="space-y-1">
                  {tasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      title={task.title}
                      status={task.status as 'not_started' | 'in_progress' | 'done' | 'cancelled'}
                      priority={task.priority}
                      dueTime={task.dueTime}
                      onComplete={() => task.status === 'done' ? uncompleteDailyTask(task.id) : completeDailyTask(task.id)}
                      onEdit={() => {
                        setEditTask(task)
                        setActiveWId(goal.id)
                        setTaskFormOpen(true)
                      }}
                      onDelete={() => deleteDailyTask(task.id)}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditTask(null)
                    setActiveWId(goal.id)
                    setTaskFormOpen(true)
                  }}
                  className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-slate-600 transition-colors hover:text-emerald-400"
                >
                  <Plus size={11} /> Adicionar tarefa
                </button>
              </GoalCard>
            )
          })}

          {unlinked.length > 0 && (
            <div className="card p-4">
              <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Tarefas avulsas</div>
              <div className="space-y-1">
                {unlinked.map((task) => (
                  <TaskRow
                    key={task.id}
                    title={task.title}
                    status={task.status as 'not_started' | 'in_progress' | 'done' | 'cancelled'}
                    priority={task.priority}
                    dueTime={task.dueTime}
                    onComplete={() => task.status === 'done' ? uncompleteDailyTask(task.id) : completeDailyTask(task.id)}
                    onEdit={() => {
                      setEditTask(task)
                      setTaskFormOpen(true)
                    }}
                    onDelete={() => deleteDailyTask(task.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <GoalFormModal
        open={formOpen}
        create={editWeekly ? undefined : { level: 'weekly', context: { year, week } }}
        edit={editWeekly ? { level: 'weekly', goal: editWeekly } : undefined}
        onClose={() => {
          setFormOpen(false)
          setEditWeekly(null)
        }}
      />
      <GoalFormModal
        open={taskFormOpen}
        create={editTask ? undefined : { level: 'daily', context: { weeklyGoalId: activeWId ?? undefined } }}
        edit={editTask ? { level: 'daily', goal: editTask } : undefined}
        onClose={() => {
          setTaskFormOpen(false)
          setEditTask(null)
          setActiveWId(null)
        }}
      />

    </div>
  )
}

type TabMode = 'board' | 'metas'

export function WeeklyPlannerView() {
  const { hydrated, hydrate, dailyTasks, addDailyTask, updateDailyTask, completeDailyTask, uncompleteDailyTask, deleteDailyTask } = useGoalsStore()
  const calendarHydrated = useCalendarStore((state) => state.hydrated)
  const hydrateCalendar = useCalendarStore((state) => state.hydrate)
  const updateCalendarEvent = useCalendarStore((state) => state.updateEvent)
  const deleteCalendarEvent = useCalendarStore((state) => state.deleteEvent)
  const [year, setYear] = useState(CURRENT_YEAR)
  const [week, setWeek] = useState(CURRENT_WEEK)
  const [tab, setTab] = useState<TabMode>('board')
  const [newHabitOpen, setNewHabitOpen] = useState(false)
  const [editingHabitKey, setEditingHabitKey] = useState<HabitKey | null>(null)

  useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrated, hydrate])

  useEffect(() => {
    if (!calendarHydrated) hydrateCalendar()
  }, [calendarHydrated, hydrateCalendar])

  const { weekDates, byDay, toggleHabit } = useHabitsForWeek(year, week)
  const todayStr = getTodayStr()

  const tasksByDay = useMemo(() => {
    const weekDateSet = new Set(weekDates)
    const grouped = DAY_CONFIG.reduce((acc, dayConf, index) => {
      const date = weekDates[index]
      acc[dayConf.key] = dailyTasks
        .filter((task) => weekDateSet.has(task.date) && task.date === date)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.createdAt.localeCompare(b.createdAt))
      return acc
    }, {} as Record<PlannerDayKey, DailyTask[]>)
    return grouped
  }, [dailyTasks, weekDates])

  function prevWeek() {
    if (week <= 1) {
      setWeek(52)
      setYear((current) => current - 1)
    } else {
      setWeek((current) => current - 1)
    }
  }

  function nextWeek() {
    if (week >= 52) {
      setWeek(1)
      setYear((current) => current + 1)
    } else {
      setWeek((current) => current + 1)
    }
  }

  function addTask(date: string, title: string) {
    addDailyTask({
      title,
      date,
      priority: 'medium',
      status: 'not_started',
      source: 'manual',
      sortOrder: Date.now(),
    })
  }

  function duplicateTask(task: DailyTask) {
    addDailyTask({
      title: task.title,
      description: task.description,
      date: task.date,
      weeklyGoalId: task.weeklyGoalId,
      dueTime: task.dueTime,
      priority: task.priority,
      status: 'not_started',
      category: task.category,
      estimatedMinutes: task.estimatedMinutes,
      actualMinutes: task.actualMinutes,
      notes: task.notes,
      tags: task.tags,
      source: 'manual',
      sortOrder: Date.now(),
    })
  }

  function toggleTask(task: DailyTask) {
    if (task.status === 'done') uncompleteDailyTask(task.id)
    else completeDailyTask(task.id)
  }

  function moveTask(taskId: string, targetDate: string) {
    const task = dailyTasks.find((item) => item.id === taskId)
    updateDailyTask(taskId, {
      date: targetDate,
      sortOrder: Date.now(),
    })
    if (task?.calendarEventId) {
      updateCalendarEvent(task.calendarEventId, { date: targetDate })
    }
  }

  const totalAll = DAY_CONFIG.reduce((acc, day) => {
    return acc + byDay[day.key].length + tasksByDay[day.key].length
  }, 0)
  const doneAll = DAY_CONFIG.reduce((acc, day) => {
    return acc
      + byDay[day.key].filter((item) => item.done).length
      + tasksByDay[day.key].filter((task) => task.status === 'done').length
  }, 0)
  const weekPct = totalAll > 0 ? Math.round((doneAll / totalAll) * 100) : 0
  const isCurrentWeek = week === CURRENT_WEEK && year === CURRENT_YEAR

  return (
    <div className="space-y-5">
      <FadeInUp>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15">
              <LayoutGrid size={20} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-100">Board Semanal</h3>
              <p className="text-sm text-slate-500">
                Semana {week}, {year}{isCurrentWeek ? ' — Esta semana' : ''}
                {totalAll > 0 && (
                  <span className="ml-2 font-semibold text-emerald-400">{weekPct}% concluído</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/weekly"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.04] text-slate-400 hover:bg-white/[0.07] hover:text-slate-200 border border-white/[0.07] transition-all"
            >
              <CalendarDays size={12} /> Ver Semanal
            </a>
            <button
              type="button"
              onClick={() => setNewHabitOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-500/15 text-violet-300 hover:bg-violet-500/25 border border-violet-500/20 transition-all"
            >
              <Plus size={12} /> Hábito
            </button>

          <div className="flex gap-0.5 rounded-xl bg-white/[0.04] p-0.5">
            <button
              type="button"
              onClick={() => setTab('board')}
              className={cn(
                'flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-xs font-semibold transition-all',
                tab === 'board' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-500 hover:text-slate-300',
              )}
            >
              <LayoutGrid size={12} /> Board
            </button>
            <button
              type="button"
              onClick={() => setTab('metas')}
              className={cn(
                'flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-xs font-semibold transition-all',
                tab === 'metas' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-slate-300',
              )}
            >
              <Target size={12} /> Metas
            </button>
          </div>
          </div>
        </div>
      </FadeInUp>

      <FadeInUp delay={0.02}>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="card flex items-center gap-3 px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15">
              <Flame size={18} className="text-violet-300" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-100">
                Hábitos sincronizados
              </div>
              <div className="text-xs text-slate-500">Checklist real via `habitsStore`</div>
            </div>
          </div>

          <div className="card flex items-center gap-3 px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15">
              <CalendarDays size={18} className="text-blue-300" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-100">
                Tarefas conectadas
              </div>
              <div className="text-xs text-slate-500">Itens do calendário entram aqui automaticamente</div>
            </div>
          </div>

          <div className="card flex items-center gap-3 px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15">
              <Target size={18} className="text-emerald-300" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-100">
                LifeScore em cascata
              </div>
              <div className="text-xs text-slate-500">Hábitos, tarefas e calendário afetam o sistema</div>
            </div>
          </div>
        </div>
      </FadeInUp>

      <FadeInUp delay={0.03}>
        <div className="card flex items-center justify-between px-5 py-3">
          <button
            type="button"
            onClick={prevWeek}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] text-slate-400 transition-colors hover:bg-white/[0.1] hover:text-slate-200"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="text-center">
            <div className="font-bold text-slate-200">Semana {week}</div>
            <div className="text-xs text-slate-500">{year}</div>
          </div>
          <button
            type="button"
            onClick={nextWeek}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] text-slate-400 transition-colors hover:bg-white/[0.1] hover:text-slate-200"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </FadeInUp>

      {tab === 'board' && (
        <FadeInUp delay={0.05}>
          <div className="hidden items-start gap-3 lg:grid lg:grid-cols-2">
            <div className="space-y-3">
              {LEFT_COLS.map((index) => (
                <DayCard
                  key={DAY_CONFIG[index].key}
                  dayConf={DAY_CONFIG[index]}
                  date={weekDates[index]}
                  isToday={weekDates[index] === todayStr}
                  habits={byDay[DAY_CONFIG[index].key]}
                  tasks={tasksByDay[DAY_CONFIG[index].key]}
                  onToggleHabit={(item, done) => toggleHabit(item.key, item.date, done)}
                  onEditHabit={(key) => setEditingHabitKey(key)}
                  onToggleTask={toggleTask}
                  onUpdateTask={(task, title) => {
                    updateDailyTask(task.id, { title })
                    if (task.calendarEventId) {
                      updateCalendarEvent(task.calendarEventId, { title })
                    }
                  }}
                  onDeleteTask={(task) => {
                    if (task.calendarEventId) deleteCalendarEvent(task.calendarEventId)
                    else deleteDailyTask(task.id)
                  }}
                  onDuplicateTask={duplicateTask}
                  onAddTask={addTask}
                  onDropTask={moveTask}
                />
              ))}
            </div>

            <div className="space-y-3">
              {RIGHT_COLS.map((index) => (
                <DayCard
                  key={DAY_CONFIG[index].key}
                  dayConf={DAY_CONFIG[index]}
                  date={weekDates[index]}
                  isToday={weekDates[index] === todayStr}
                  habits={byDay[DAY_CONFIG[index].key]}
                  tasks={tasksByDay[DAY_CONFIG[index].key]}
                  onToggleHabit={(item, done) => toggleHabit(item.key, item.date, done)}
                  onEditHabit={(key) => setEditingHabitKey(key)}
                  onToggleTask={toggleTask}
                  onUpdateTask={(task, title) => {
                    updateDailyTask(task.id, { title })
                    if (task.calendarEventId) {
                      updateCalendarEvent(task.calendarEventId, { title })
                    }
                  }}
                  onDeleteTask={(task) => {
                    if (task.calendarEventId) deleteCalendarEvent(task.calendarEventId)
                    else deleteDailyTask(task.id)
                  }}
                  onDuplicateTask={duplicateTask}
                  onAddTask={addTask}
                  onDropTask={moveTask}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3 lg:hidden">
            {DAY_CONFIG.map((dayConf, index) => (
              <DayCard
                key={dayConf.key}
                dayConf={dayConf}
                date={weekDates[index]}
                isToday={weekDates[index] === todayStr}
                habits={byDay[dayConf.key]}
                tasks={tasksByDay[dayConf.key]}
                onToggleHabit={(item, done) => toggleHabit(item.key, item.date, done)}
                onToggleTask={toggleTask}
                onUpdateTask={(task, title) => {
                  updateDailyTask(task.id, { title })
                  if (task.calendarEventId) {
                    updateCalendarEvent(task.calendarEventId, { title })
                  }
                }}
                onDeleteTask={(task) => {
                  if (task.calendarEventId) deleteCalendarEvent(task.calendarEventId)
                  else deleteDailyTask(task.id)
                }}
                onDuplicateTask={duplicateTask}
                onAddTask={addTask}
                onDropTask={moveTask}
              />
            ))}
          </div>

          <div className="mt-3 flex items-center gap-4 px-1 text-[10px] text-slate-700">
            <span className="font-semibold text-red-400/70">A: alta prioridade</span>
            <span className="font-semibold text-violet-400/70">F: foco/projeto</span>
            <span className="text-slate-600">hábitos vêm do store real</span>
            <span className="text-slate-600">arraste tarefas para outro dia</span>
          </div>
        </FadeInUp>
      )}

      {tab === 'metas' && (
        <FadeInUp delay={0.05}>
          <MetasTab year={year} week={week} />
        </FadeInUp>
      )}

      {/* FEAT-02: criar hábito direto do planner */}
      <NewHabitModal open={newHabitOpen} onClose={() => setNewHabitOpen(false)} />

      {/* FEAT-03: editar hábito pelo board */}
      {editingHabitKey && (
        <HabitEditorModal
          habitKey={editingHabitKey}
          open={true}
          onClose={() => setEditingHabitKey(null)}
        />
      )}
    </div>
  )
}
