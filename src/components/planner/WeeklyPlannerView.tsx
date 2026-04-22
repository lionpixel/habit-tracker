// ─────────────────────────────────────────────
//  View: Weekly Planner — Notion-style board
// ─────────────────────────────────────────────

'use client'

import {
  useState, useRef, useEffect,
  type KeyboardEvent, type DragEvent,
} from 'react'
import {
  Plus, ChevronLeft, ChevronRight, ChevronDown,
  Square, CheckSquare2, Trash2, Copy, GripVertical,
  LayoutGrid, Target,
} from 'lucide-react'
import {
  usePlannerBoardStore,
  emptyWeek,
  type DayKey, type SectionKey, type BoardTask, type WeekData,
} from '@/store/plannerBoardStore'
import { useGoalsStore }  from '@/store/goalsStore'
import { GoalCard, TaskRow } from './GoalCard'
import { GoalFormModal } from './GoalFormModal'
import { FadeInUp } from '@/components/ui/Motion'
import { cn } from '@/lib/helpers'
import { getBRTWeekNumber, getBRTYear, getWeekDaysBRT, getTodayStr } from '@/lib/time'
import type { WeeklyGoal, DailyTask } from '@/types/goals'

// ── Config ────────────────────────────────────

const CURRENT_YEAR = getBRTYear()
const CURRENT_WEEK = getBRTWeekNumber()

const DAY_CONFIG: { key: DayKey; label: string }[] = [
  { key: 'monday',    label: 'Segunda'  },
  { key: 'tuesday',   label: 'Terça'    },
  { key: 'wednesday', label: 'Quarta'   },
  { key: 'thursday',  label: 'Quinta'   },
  { key: 'friday',    label: 'Sexta'    },
  { key: 'saturday',  label: 'Sábado'   },
  { key: 'sunday',    label: 'Domingo'  },
]

const LEFT_COLS  = [0, 2, 4, 6]  // Mon Wed Fri Sun
const RIGHT_COLS = [1, 3, 5]     // Tue Thu Sat

function weekKey(year: number, week: number) {
  return `${year}-W${String(week).padStart(2, '0')}`
}

// ── Priority helpers ──────────────────────────

function priority(text: string): 'A' | 'F' | 'normal' {
  const t = text.trimStart()
  if (/^A:\s*/i.test(t)) return 'A'
  if (/^F:\s*/i.test(t)) return 'F'
  return 'normal'
}

const PRIO_COLOR = {
  A:      'text-red-400',
  F:      'text-violet-400',
  normal: 'text-slate-200',
}

// Module-level drag source — avoids re-renders during drag
let _drag: { wk: string; day: DayKey; section: SectionKey; idx: number } | null = null

// ── TaskItem ─────────────────────────────────

interface TaskItemProps {
  task:    BoardTask
  wk:      string
  day:     DayKey
  section: SectionKey
  idx:     number
}

function TaskItem({ task, wk, day, section, idx }: TaskItemProps) {
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState(task.text)
  const inputRef = useRef<HTMLInputElement>(null)
  const { updateTask, toggleTask, deleteTask, duplicateTask } = usePlannerBoardStore()

  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  function startEdit() { setDraft(task.text); setEditing(true) }

  function commit() {
    const trimmed = draft.trim()
    if (trimmed) updateTask(wk, day, section, task.id, trimmed)
    setEditing(false)
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); commit() }
    if (e.key === 'Escape') setEditing(false)
  }

  function onDragStart(e: DragEvent) {
    _drag = { wk, day, section, idx }
    e.dataTransfer.effectAllowed = 'move'
  }

  const prio = priority(task.text)

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="group flex items-start gap-1.5 py-1 px-2 rounded-lg hover:bg-white/[0.04] transition-colors cursor-default"
    >
      {/* Drag handle */}
      <GripVertical
        size={12}
        className="flex-shrink-0 mt-0.5 text-slate-800 group-hover:text-slate-600 cursor-grab active:cursor-grabbing"
      />

      {/* Checkbox */}
      <button
        type="button"
        onClick={() => toggleTask(wk, day, section, task.id)}
        className="flex-shrink-0 mt-0.5"
      >
        {task.done
          ? <CheckSquare2 size={13} className="text-emerald-400" />
          : <Square       size={13} className="text-slate-700 hover:text-slate-400 transition-colors" />
        }
      </button>

      {/* Text / Input */}
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={onKey}
          className="flex-1 min-w-0 bg-transparent text-xs text-slate-200 outline-none border-b border-violet-500/60 pb-0.5"
        />
      ) : (
        <span
          role="textbox"
          tabIndex={0}
          onClick={startEdit}
          onKeyDown={e => e.key === 'Enter' && startEdit()}
          className={cn(
            'flex-1 min-w-0 text-xs leading-relaxed cursor-text break-words',
            task.done ? 'line-through text-slate-600' : PRIO_COLOR[prio],
          )}
        >
          {task.text || <span className="text-slate-700 italic">vazio</span>}
        </span>
      )}

      {/* Hover actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          type="button"
          onClick={() => duplicateTask(wk, day, section, task.id)}
          className="p-0.5 rounded hover:bg-white/[0.06] text-slate-700 hover:text-slate-400 transition-colors"
        >
          <Copy size={10} />
        </button>
        <button
          type="button"
          onClick={() => deleteTask(wk, day, section, task.id)}
          className="p-0.5 rounded hover:bg-red-500/10 text-slate-700 hover:text-red-400 transition-colors"
        >
          <Trash2 size={10} />
        </button>
      </div>
    </div>
  )
}

// ── SectionBlock ─────────────────────────────

interface SectionBlockProps {
  wk:      string
  day:     DayKey
  section: SectionKey
  label:   string
  tasks:   BoardTask[]
}

function SectionBlock({ wk, day, section, label, tasks }: SectionBlockProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [dragOver,  setDragOver]  = useState(false)
  const [adding,    setAdding]    = useState(false)
  const [newText,   setNewText]   = useState('')
  const addRef = useRef<HTMLInputElement>(null)
  const { addTask, moveTask } = usePlannerBoardStore()

  useEffect(() => { if (adding) addRef.current?.focus() }, [adding])

  function handleAdd() {
    const text = newText.trim()
    if (text) addTask(wk, day, section, text)
    setNewText('')
    setAdding(false)
  }

  function onAddKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); handleAdd() }
    if (e.key === 'Escape') { setNewText(''); setAdding(false) }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (!_drag || _drag.wk !== wk) return
    moveTask(wk, _drag.day, _drag.section, _drag.idx, day, section, tasks.length)
    _drag = null
  }

  const done  = tasks.filter(t => t.done).length
  const total = tasks.length

  return (
    <div>
      {/* Section header */}
      <button
        type="button"
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center gap-1.5 px-2 py-1.5 hover:bg-white/[0.03] rounded-lg transition-colors"
      >
        {collapsed
          ? <ChevronRight size={10} className="text-slate-600 flex-shrink-0" />
          : <ChevronDown  size={10} className="text-slate-600 flex-shrink-0" />
        }
        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{label}</span>
        {total > 0 && (
          <span className="ml-auto text-[10px] tabular-nums text-slate-700 font-semibold">
            {done}/{total}
          </span>
        )}
      </button>

      {/* Task list + drop zone */}
      {!collapsed && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            'min-h-[16px] rounded-lg transition-colors duration-150',
            dragOver && 'bg-violet-500/10 ring-1 ring-violet-500/30',
          )}
        >
          {tasks.map((task, i) => (
            <TaskItem
              key={task.id}
              task={task}
              wk={wk}
              day={day}
              section={section}
              idx={i}
            />
          ))}

          {/* Inline add */}
          {adding ? (
            <div className="flex items-center gap-1.5 px-2 py-1">
              <GripVertical size={12} className="text-slate-800 flex-shrink-0" />
              <Square size={13} className="text-slate-700 flex-shrink-0" />
              <input
                ref={addRef}
                value={newText}
                onChange={e => setNewText(e.target.value)}
                onBlur={handleAdd}
                onKeyDown={onAddKey}
                placeholder="Nova tarefa... (A: alta  F: foco)"
                className="flex-1 min-w-0 bg-transparent text-xs text-slate-300 outline-none placeholder:text-slate-700"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex items-center gap-1 px-2 py-1 w-full text-[11px] text-slate-700 hover:text-slate-400 transition-colors rounded-lg hover:bg-white/[0.03]"
            >
              <Plus size={11} /> adicionar
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── DayCard ───────────────────────────────────

interface DayCardProps {
  wk:      string
  dayConf: { key: DayKey; label: string }
  dateStr: string
  isToday: boolean
  data:    WeekData
}

function DayCard({ wk, dayConf, dateStr, isToday, data }: DayCardProps) {
  const day     = dayConf.key
  const habits  = data[day].habits
  const tasks   = data[day].tasks
  const total   = habits.length + tasks.length
  const done    = habits.filter(t => t.done).length + tasks.filter(t => t.done).length
  const pct     = total > 0 ? Math.round((done / total) * 100) : 0
  const allDone = total > 0 && done === total

  return (
    <div className={cn(
      'rounded-2xl border bg-[#0d1117] flex flex-col gap-0 overflow-hidden',
      isToday ? 'border-emerald-500/30' : 'border-white/[0.06]',
    )}>
      {/* Header */}
      <div className={cn(
        'px-3 pt-3 pb-2',
        isToday ? 'bg-emerald-500/[0.04]' : 'bg-white/[0.01]',
      )}>
        <div className="flex items-center justify-between mb-1.5">
          <div>
            <div className={cn('text-sm font-black', isToday ? 'text-emerald-400' : 'text-slate-200')}>
              {dayConf.label}
            </div>
            {dateStr && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-slate-600 tabular-nums">
                  {dateStr.slice(8, 10)}/{dateStr.slice(5, 7)}
                </span>
                {isToday && (
                  <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                    Hoje
                  </span>
                )}
              </div>
            )}
          </div>
          {total > 0 && (
            <div className="text-right flex-shrink-0">
              <div className={cn(
                'text-sm font-black tabular-nums',
                allDone ? 'text-emerald-400' : 'text-slate-400',
              )}>
                {pct}%
              </div>
              <div className="text-[10px] text-slate-700">{done}/{total}</div>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="h-0.5 bg-white/[0.04] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width:      `${pct}%`,
                background: allDone ? '#10b981' : '#6366f1',
                boxShadow:  allDone ? '0 0 6px #10b98150' : undefined,
              }}
            />
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="flex-1 divide-y divide-white/[0.04] px-1 pb-2">
        <div className="pt-1">
          <SectionBlock wk={wk} day={day} section="habits" label="Habits" tasks={habits} />
        </div>
        <div className="pt-1">
          <SectionBlock wk={wk} day={day} section="tasks"  label="Minhas Coisas" tasks={tasks} />
        </div>
      </div>
    </div>
  )
}

// ── MetasTab (legacy weekly goals) ───────────

function MetasTab({ year, week }: { year: number; week: number }) {
  const {
    monthlyGoals, weeklyGoals, dailyTasks,
    deleteWeeklyGoal, completeDailyTask, uncompleteDailyTask, deleteDailyTask,
  } = useGoalsStore()

  const [formOpen,     setFormOpen]     = useState(false)
  const [taskFormOpen, setTaskFormOpen] = useState(false)
  const [editWeekly,   setEditWeekly]   = useState<WeeklyGoal | null>(null)
  const [editTask,     setEditTask]     = useState<DailyTask | null>(null)
  const [activeWId,    setActiveWId]    = useState<string | null>(null)

  const wGoals = weeklyGoals.filter(g => g.year === year && g.week === week)

  const parentMap: Record<string, string> = {}
  monthlyGoals.forEach(m => {
    const MONTH_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
    m.weeklyGoalIds.forEach(wid => { parentMap[wid] = `${MONTH_SHORT[m.month - 1]} — ${m.title}` })
  })

  const allWeekTaskIds = wGoals.flatMap(w => w.taskIds)
  const unlinked = dailyTasks.filter(t => {
    const d = new Date(t.date + 'T12:00:00')
    return getBRTWeekNumber(d) === week && d.getFullYear() === year && !allWeekTaskIds.includes(t.id)
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => { setEditTask(null); setActiveWId(null); setTaskFormOpen(true) }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-300 text-xs font-semibold hover:bg-amber-500/25 transition-colors"
        >
          <Plus size={13} /> Tarefa
        </button>
        <button
          type="button"
          onClick={() => { setEditWeekly(null); setFormOpen(true) }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/25 transition-colors"
        >
          <Plus size={13} /> Meta
        </button>
      </div>

      {wGoals.length === 0 && unlinked.length === 0 ? (
        <div className="card p-8 text-center">
          <LayoutGrid size={28} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-semibold">Semana sem metas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {wGoals.map(goal => {
            const gtasks  = dailyTasks.filter(t => goal.taskIds.includes(t.id))
            const gDone   = gtasks.filter(t => t.status === 'done').length
            return (
              <GoalCard
                key={goal.id}
                goal={goal}
                level="weekly"
                parentTitle={parentMap[goal.id]}
                childCount={gtasks.length}
                childDone={gDone}
                onEdit={() => { setEditWeekly(goal); setFormOpen(true) }}
                onDelete={() => deleteWeeklyGoal(goal.id)}
              >
                <div className="space-y-1">
                  {gtasks.map(task => (
                    <TaskRow
                      key={task.id}
                      title={task.title}
                      status={task.status as 'not_started' | 'in_progress' | 'done' | 'cancelled'}
                      priority={task.priority}
                      dueTime={task.dueTime}
                      onComplete={() => task.status === 'done' ? uncompleteDailyTask(task.id) : completeDailyTask(task.id)}
                      onEdit={() => { setEditTask(task); setActiveWId(goal.id); setTaskFormOpen(true) }}
                      onDelete={() => deleteDailyTask(task.id)}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => { setEditTask(null); setActiveWId(goal.id); setTaskFormOpen(true) }}
                  className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-600 hover:text-emerald-400 transition-colors font-medium"
                >
                  <Plus size={11} /> Adicionar tarefa
                </button>
              </GoalCard>
            )
          })}

          {unlinked.length > 0 && (
            <div className="card p-4">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Tarefas avulsas</div>
              <div className="space-y-1">
                {unlinked.map(task => (
                  <TaskRow
                    key={task.id}
                    title={task.title}
                    status={task.status as 'not_started' | 'in_progress' | 'done' | 'cancelled'}
                    priority={task.priority}
                    dueTime={task.dueTime}
                    onComplete={() => task.status === 'done' ? uncompleteDailyTask(task.id) : completeDailyTask(task.id)}
                    onEdit={() => { setEditTask(task); setTaskFormOpen(true) }}
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
        onClose={() => { setFormOpen(false); setEditWeekly(null) }}
      />
      <GoalFormModal
        open={taskFormOpen}
        create={editTask ? undefined : { level: 'daily', context: { weeklyGoalId: activeWId ?? undefined } }}
        edit={editTask ? { level: 'daily', goal: editTask } : undefined}
        onClose={() => { setTaskFormOpen(false); setEditTask(null); setActiveWId(null) }}
      />
    </div>
  )
}

// ── Main ──────────────────────────────────────

type TabMode = 'board' | 'metas'

export function WeeklyPlannerView() {
  const { hydrated, hydrate, getWeek } = usePlannerBoardStore()
  const [year, setYear] = useState(CURRENT_YEAR)
  const [week, setWeek] = useState(CURRENT_WEEK)
  const [tab,  setTab]  = useState<TabMode>('board')

  useEffect(() => { if (!hydrated) hydrate() }, [hydrated, hydrate])

  const wk       = weekKey(year, week)
  const boardData = hydrated ? getWeek(wk) : emptyWeek()
  const weekDates = getWeekDaysBRT(year, week)
  const todayStr  = getTodayStr()

  const isCurrentWeek = week === CURRENT_WEEK && year === CURRENT_YEAR

  function prevWeek() {
    if (week <= 1) { setWeek(52); setYear(y => y - 1) }
    else setWeek(w => w - 1)
  }
  function nextWeek() {
    if (week >= 52) { setWeek(1); setYear(y => y + 1) }
    else setWeek(w => w + 1)
  }

  // Total board stats for the week
  const totalAll = DAY_CONFIG.reduce((acc, { key }) => {
    const d = boardData[key]
    return acc + d.habits.length + d.tasks.length
  }, 0)
  const doneAll = DAY_CONFIG.reduce((acc, { key }) => {
    const d = boardData[key]
    return acc + d.habits.filter(t => t.done).length + d.tasks.filter(t => t.done).length
  }, 0)
  const weekPct = totalAll > 0 ? Math.round((doneAll / totalAll) * 100) : 0

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <FadeInUp>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <LayoutGrid size={20} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-100">Board Semanal</h3>
              <p className="text-slate-500 text-sm">
                Semana {week}, {year}{isCurrentWeek ? ' — Esta semana' : ''}
                {totalAll > 0 && (
                  <span className="ml-2 text-emerald-400 font-semibold">{weekPct}% concluído</span>
                )}
              </p>
            </div>
          </div>

          {/* Tab toggle */}
          <div className="flex bg-white/[0.04] rounded-xl p-0.5 gap-0.5">
            <button
              type="button"
              onClick={() => setTab('board')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-all',
                tab === 'board' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-500 hover:text-slate-300',
              )}
            >
              <LayoutGrid size={12} /> Board
            </button>
            <button
              type="button"
              onClick={() => setTab('metas')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-all',
                tab === 'metas' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-slate-300',
              )}
            >
              <Target size={12} /> Metas
            </button>
          </div>
        </div>
      </FadeInUp>

      {/* ── Week nav ── */}
      <FadeInUp delay={0.02}>
        <div className="flex items-center justify-between card px-5 py-3">
          <button
            type="button"
            onClick={prevWeek}
            className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
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
            className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </FadeInUp>

      {/* ── Board view ── */}
      {tab === 'board' && (
        <FadeInUp delay={0.04}>
          {/* Desktop: 2 cols, Mobile: 1 col */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-3 items-start">
            {/* Left column: Mon, Wed, Fri, Sun */}
            <div className="space-y-3">
              {LEFT_COLS.map(i => (
                <DayCard
                  key={DAY_CONFIG[i].key}
                  wk={wk}
                  dayConf={DAY_CONFIG[i]}
                  dateStr={weekDates[i] ?? ''}
                  isToday={weekDates[i] === todayStr}
                  data={boardData}
                />
              ))}
            </div>
            {/* Right column: Tue, Thu, Sat */}
            <div className="space-y-3">
              {RIGHT_COLS.map(i => (
                <DayCard
                  key={DAY_CONFIG[i].key}
                  wk={wk}
                  dayConf={DAY_CONFIG[i]}
                  dateStr={weekDates[i] ?? ''}
                  isToday={weekDates[i] === todayStr}
                  data={boardData}
                />
              ))}
            </div>
          </div>

          {/* Mobile: vertical list */}
          <div className="lg:hidden space-y-3">
            {DAY_CONFIG.map((dayConf, i) => (
              <DayCard
                key={dayConf.key}
                wk={wk}
                dayConf={dayConf}
                dateStr={weekDates[i] ?? ''}
                isToday={weekDates[i] === todayStr}
                data={boardData}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center gap-4 text-[10px] text-slate-700 px-1">
            <span className="text-red-400/70 font-semibold">A: alta prioridade</span>
            <span className="text-violet-400/70 font-semibold">F: foco/projeto</span>
            <span className="text-slate-600">arraste para mover</span>
          </div>
        </FadeInUp>
      )}

      {/* ── Metas view ── */}
      {tab === 'metas' && (
        <FadeInUp delay={0.04}>
          <MetasTab year={year} week={week} />
        </FadeInUp>
      )}
    </div>
  )
}
