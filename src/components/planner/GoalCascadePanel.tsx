'use client'

// ─────────────────────────────────────────────
//  Component: GoalCascadePanel
//  Engrenagem completa: Sonho → Meta Anual → Trimestral
//  → Mensal → Semanal → Tarefas Diárias
//  Cada nível mostra progresso, status e matemática
//  automática (por semana / por dia).
// ─────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { useGoalsStore }       from '@/store/goalsStore'
import { useDreamsStore }      from '@/store/dreamsStore'
import {
  STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS,
  getQuarterMonths,
} from '@/types/goals'
import { cn } from '@/lib/helpers'
import {
  Star, Target, Layers, CalendarDays, LayoutGrid,
  Sun, ChevronRight, ChevronDown, Circle,
  CheckCircle2, Clock, Zap, TrendingUp,
} from 'lucide-react'
import type { QuarterlyGoal, MonthlyGoal, WeeklyGoal, DailyTask } from '@/types/goals'
import type { Dream } from '@/types/dreams'

// ── Helpers ───────────────────────────────────

import { getBRTYear, getBRTMonth, getBRTWeekNumber, getTodayStr } from '@/lib/time'
const YEAR  = getBRTYear()
const MONTH = getBRTMonth()
const WEEK  = getBRTWeekNumber()

function progressColor(p: number): string {
  if (p >= 80) return '#10b981'
  if (p >= 40) return '#6366f1'
  if (p > 0)   return '#f59e0b'
  return '#475569'
}

function autoMath(target: number | undefined, unit: string | undefined, period: 'month' | 'year') {
  if (!target || target <= 0) return null
  const divisor = period === 'month' ? { weeks: 4.33, days: 30 } : { weeks: 52, days: 365 }
  const perWeek = (target / divisor.weeks).toFixed(1)
  const perDay  = (target / divisor.days).toFixed(1)
  const u       = unit ?? ''
  return { perWeek: `${perWeek} ${u}/semana`, perDay: `${perDay} ${u}/dia` }
}

// ── Progress bar ──────────────────────────────

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, value)}%`, background: color }}
      />
    </div>
  )
}

// ── Level card ────────────────────────────────

interface LevelCardProps {
  icon:     React.ReactNode
  label:    string
  color:    string
  children: React.ReactNode
  depth:    number
  selected?: boolean
  onClick?: () => void
}

function LevelCard({ icon, label, color, children, depth, selected, onClick }: LevelCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border transition-all duration-200',
        depth === 0 && 'p-4',
        depth === 1 && 'p-3.5',
        depth >= 2 && 'p-3',
        selected ? 'border-opacity-40' : 'border-white/[0.06]',
        onClick && 'cursor-pointer hover:border-opacity-20',
      )}
      style={
        selected
          ? { borderColor: `${color}40`, background: `${color}06` }
          : { background: 'rgba(255,255,255,0.02)' }
      }
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}20` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>
          {label}
        </span>
      </div>
      {children}
    </div>
  )
}

// ── Connector arrow ───────────────────────────

function Connector() {
  return (
    <div className="flex items-center justify-center py-0.5">
      <ChevronDown size={14} className="text-slate-700" />
    </div>
  )
}

// ── Empty placeholder ─────────────────────────

function EmptySlot({ label, color }: { label: string; color: string }) {
  return (
    <div
      className="p-3 rounded-xl border border-dashed border-white/[0.07] text-center"
    >
      <p className="text-[11px] text-slate-600">
        Nenhum(a) <span style={{ color }}>{label}</span> vinculado(a)
      </p>
    </div>
  )
}

// ── Goal row (compact) ────────────────────────

function GoalRow({
  title, progress, status, priority, targetValue, targetUnit, currentValue,
  color, selected, onClick, math,
}: {
  title: string
  progress: number
  status: string
  priority: string
  targetValue?: number
  targetUnit?: string
  currentValue?: number
  color: string
  selected?: boolean
  onClick?: () => void
  math?: { perWeek: string; perDay: string } | null
}) {
  const pColor = progressColor(progress)
  return (
    <div
      className={cn(
        'group rounded-xl border p-3 transition-all duration-200',
        selected ? 'border-opacity-40' : 'border-white/[0.06] hover:border-white/[0.1]',
        onClick && 'cursor-pointer',
      )}
      style={
        selected
          ? { borderColor: `${color}40`, background: `${color}08` }
          : { background: 'rgba(255,255,255,0.02)' }
      }
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {selected
            ? <ChevronDown size={12} className="flex-shrink-0 mt-0.5" style={{ color }} />
            : <ChevronRight size={12} className="flex-shrink-0 mt-0.5 text-slate-600 group-hover:text-slate-400" />
          }
          <p className="text-xs font-semibold text-slate-200 leading-snug">{title}</p>
        </div>
        <span
          className="text-xs font-black tabular-nums flex-shrink-0"
          style={{ color: pColor }}
        >
          {progress}%
        </span>
      </div>

      <MiniBar value={progress} color={pColor} />

      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
          style={{ background: `${STATUS_COLORS[status as keyof typeof STATUS_COLORS]}18`, color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] }}
        >
          {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
        </span>
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
          style={{ background: `${PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS]}15`, color: PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] }}
        >
          {PRIORITY_LABELS[priority as keyof typeof PRIORITY_LABELS]}
        </span>
        {targetValue !== undefined && (
          <span className="text-[9px] text-slate-500 font-medium">
            {currentValue !== undefined ? `${currentValue}/${targetValue}` : `meta: ${targetValue}`} {targetUnit ?? ''}
          </span>
        )}
      </div>

      {/* Auto-math breakdown */}
      {math && selected && (
        <div className="mt-2 pt-2 border-t border-white/[0.05] grid grid-cols-2 gap-1.5">
          <div className="flex items-center gap-1">
            <Zap size={9} className="text-violet-400" />
            <span className="text-[10px] text-slate-500">{math.perWeek}</span>
          </div>
          <div className="flex items-center gap-1">
            <Sun size={9} className="text-amber-400" />
            <span className="text-[10px] text-slate-500">{math.perDay}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Task row ──────────────────────────────────

function TaskRow({ task }: { task: DailyTask }) {
  const done   = task.status === 'done'
  const pColor = PRIORITY_COLORS[task.priority]
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
      {done
        ? <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />
        : <Circle      size={12} className="text-slate-600 flex-shrink-0" />
      }
      <span className={cn('text-xs flex-1 min-w-0 truncate', done ? 'line-through text-slate-600' : 'text-slate-300')}>
        {task.title}
      </span>
      {task.estimatedMinutes && (
        <span className="flex items-center gap-0.5 text-[9px] text-slate-600 flex-shrink-0">
          <Clock size={8} /> {task.estimatedMinutes}m
        </span>
      )}
      <span
        className="text-[9px] font-bold px-1 py-0.5 rounded flex-shrink-0"
        style={{ background: `${pColor}15`, color: pColor }}
      >
        {task.priority}
      </span>
    </div>
  )
}

// ── Main component ────────────────────────────

export function GoalCascadePanel() {
  const {
    annualGoals, quarterlyGoals, monthlyGoals,
    weeklyGoals, dailyTasks, hydrated, hydrate,
  } = useGoalsStore()

  const { dreams } = useDreamsStore()

  useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrated, hydrate])

  const [selectedAnnual,    setSelectedAnnual]    = useState<string | null>(null)
  const [selectedQuarterly, setSelectedQuarterly] = useState<string | null>(null)
  const [selectedMonthly,   setSelectedMonthly]   = useState<string | null>(null)
  const [selectedWeekly,    setSelectedWeekly]    = useState<string | null>(null)
  const [showDreams,        setShowDreams]         = useState(false)

  // Filter to current year
  const yearGoals = annualGoals.filter((g) => g.year === YEAR)

  // Quarterly goals linked to selected annual
  const qGoals: QuarterlyGoal[] = selectedAnnual
    ? quarterlyGoals.filter((q) => q.annualGoalId === selectedAnnual && q.year === YEAR)
    : []

  // Monthly goals linked to selected quarterly
  const mGoals: MonthlyGoal[] = selectedQuarterly
    ? monthlyGoals.filter((m) => m.quarterlyGoalId === selectedQuarterly && m.year === YEAR)
    : []

  // Weekly goals linked to selected monthly
  const wGoals: WeeklyGoal[] = selectedMonthly
    ? weeklyGoals.filter((w) => w.monthlyGoalId === selectedMonthly && w.year === YEAR)
    : []

  // Daily tasks linked to selected weekly
  const todayStr  = getTodayStr()
  const tasks: DailyTask[] = selectedWeekly
    ? dailyTasks.filter((t) => t.weeklyGoalId === selectedWeekly && t.date === todayStr)
    : []

  // Dreams linked to selected annual goal
  const linkedDreams: Dream[] = selectedAnnual
    ? dreams.filter((d) => d.linkedAnnualGoalId === selectedAnnual)
    : []

  function toggleAnnual(id: string) {
    if (selectedAnnual === id) {
      setSelectedAnnual(null); setSelectedQuarterly(null); setSelectedMonthly(null); setSelectedWeekly(null)
    } else {
      setSelectedAnnual(id); setSelectedQuarterly(null); setSelectedMonthly(null); setSelectedWeekly(null)
    }
  }

  function toggleQuarterly(id: string) {
    if (selectedQuarterly === id) { setSelectedQuarterly(null); setSelectedMonthly(null); setSelectedWeekly(null) }
    else { setSelectedQuarterly(id); setSelectedMonthly(null); setSelectedWeekly(null) }
  }

  function toggleMonthly(id: string) {
    if (selectedMonthly === id) { setSelectedMonthly(null); setSelectedWeekly(null) }
    else { setSelectedMonthly(id); setSelectedWeekly(null) }
  }

  function toggleWeekly(id: string) {
    setSelectedWeekly(selectedWeekly === id ? null : id)
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center">
          <TrendingUp size={15} className="text-violet-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-100">Cascata de Metas</h3>
          <p className="text-xs text-slate-500">Sonho → Meta Anual → Trimestral → Mensal → Semanal → Tarefa</p>
        </div>
      </div>

      {/* Cascade chain guide */}
      <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-bold overflow-x-auto pb-1">
        {[
          { label: 'Sonho', color: '#f59e0b', icon: <Star size={9} /> },
          { label: 'Anual', color: '#a78bfa', icon: <Target size={9} /> },
          { label: 'Trim.', color: '#6366f1', icon: <Layers size={9} /> },
          { label: 'Mensal', color: '#0ea5e9', icon: <CalendarDays size={9} /> },
          { label: 'Semanal', color: '#10b981', icon: <LayoutGrid size={9} /> },
          { label: 'Diário', color: '#f59e0b', icon: <Sun size={9} /> },
        ].map(({ label, color, icon }, i, arr) => (
          <>
            <div
              key={label}
              className="flex items-center gap-1 px-2 py-1 rounded-lg flex-shrink-0"
              style={{ background: `${color}15`, color }}
            >
              {icon} {label}
            </div>
            {i < arr.length - 1 && (
              <ChevronRight key={`arr-${i}`} size={10} className="text-slate-700 flex-shrink-0" />
            )}
          </>
        ))}
      </div>

      {/* ── Level 1: Annual goals ── */}
      <LevelCard icon={<Target size={12} />} label="Metas Anuais" color="#a78bfa" depth={0}>
        {yearGoals.length === 0 ? (
          <EmptySlot label="meta anual" color="#a78bfa" />
        ) : (
          <div className="space-y-2">
            {yearGoals.map((g) => {
              const math = autoMath(g.targetValue, g.targetUnit, 'year')
              return (
                <GoalRow
                  key={g.id}
                  title={g.title}
                  progress={g.progress}
                  status={g.status}
                  priority={g.priority}
                  targetValue={g.targetValue}
                  targetUnit={g.targetUnit}
                  currentValue={g.currentValue}
                  color="#a78bfa"
                  selected={selectedAnnual === g.id}
                  onClick={() => toggleAnnual(g.id)}
                  math={math}
                />
              )
            })}
          </div>
        )}
      </LevelCard>

      {/* ── Dreams linked to annual ── */}
      {selectedAnnual && (
        <>
          <Connector />
          <LevelCard icon={<Star size={12} />} label="Sonhos Vinculados" color="#f59e0b" depth={1}>
            {linkedDreams.length === 0 ? (
              <p className="text-[11px] text-slate-600">
                Nenhum sonho vinculado a esta meta.
                <span className="text-amber-500/70"> Vincule no Quadro de Sonhos.</span>
              </p>
            ) : (
              <div className="space-y-1.5">
                {linkedDreams.map((d) => (
                  <div key={d.id} className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/[0.05] border border-amber-500/20">
                    <Star size={10} className="text-amber-400 flex-shrink-0" />
                    <span className="text-xs font-semibold text-amber-300 flex-1 min-w-0 truncate">{d.title}</span>
                    {d.targetDate && (
                      <span className="text-[9px] text-amber-500/70 flex-shrink-0">até {d.targetDate.slice(0, 7)}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowDreams(!showDreams)}
              className="mt-2 w-full text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
            >
              {showDreams ? 'Ocultar' : 'Ver todos os sonhos'}
            </button>
            {showDreams && dreams.slice(0, 5).map((d) => (
              <div key={d.id} className="flex items-center gap-2 p-2 mt-1 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <Star size={9} className="text-slate-600 flex-shrink-0" />
                <span className="text-xs text-slate-500 flex-1 min-w-0 truncate">{d.title}</span>
                <span className="text-[9px] text-slate-700">{d.category}</span>
              </div>
            ))}
          </LevelCard>
        </>
      )}

      {/* ── Level 2: Quarterly ── */}
      {selectedAnnual && (
        <>
          <Connector />
          <LevelCard icon={<Layers size={12} />} label="Metas Trimestrais" color="#6366f1" depth={1}>
            {qGoals.length === 0 ? (
              <EmptySlot label="meta trimestral" color="#6366f1" />
            ) : (
              <div className="space-y-2">
                {qGoals.map((q) => {
                  const months = getQuarterMonths(q.quarter)
                  const label  = `Q${q.quarter} — ${['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][months[0]-1]}–${['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][months[2]-1]}`
                  return (
                    <GoalRow
                      key={q.id}
                      title={`${label}: ${q.title}`}
                      progress={q.progress}
                      status={q.status}
                      priority={q.priority}
                      targetValue={q.targetValue}
                      targetUnit={q.targetUnit}
                      currentValue={q.currentValue}
                      color="#6366f1"
                      selected={selectedQuarterly === q.id}
                      onClick={() => toggleQuarterly(q.id)}
                      math={autoMath(q.targetValue, q.targetUnit, 'month')}
                    />
                  )
                })}
              </div>
            )}
          </LevelCard>
        </>
      )}

      {/* ── Level 3: Monthly ── */}
      {selectedQuarterly && (
        <>
          <Connector />
          <LevelCard icon={<CalendarDays size={12} />} label="Metas Mensais" color="#0ea5e9" depth={2}>
            {mGoals.length === 0 ? (
              <EmptySlot label="meta mensal" color="#0ea5e9" />
            ) : (
              <div className="space-y-2">
                {mGoals.map((m) => {
                  const monthNames = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
                  const isCurrent  = m.month === MONTH
                  const math       = autoMath(m.targetValue, m.targetUnit, 'month')
                  return (
                    <GoalRow
                      key={m.id}
                      title={`${monthNames[m.month - 1]}: ${m.title}`}
                      progress={m.progress}
                      status={m.status}
                      priority={m.priority}
                      targetValue={m.targetValue}
                      targetUnit={m.targetUnit}
                      currentValue={m.currentValue}
                      color={isCurrent ? '#0ea5e9' : '#334155'}
                      selected={selectedMonthly === m.id}
                      onClick={() => toggleMonthly(m.id)}
                      math={math}
                    />
                  )
                })}
              </div>
            )}
          </LevelCard>
        </>
      )}

      {/* ── Level 4: Weekly ── */}
      {selectedMonthly && (
        <>
          <Connector />
          <LevelCard icon={<LayoutGrid size={12} />} label="Metas Semanais" color="#10b981" depth={3}>
            {wGoals.length === 0 ? (
              <EmptySlot label="meta semanal" color="#10b981" />
            ) : (
              <div className="space-y-2">
                {wGoals.map((w) => {
                  const isCurrent = w.week === WEEK
                  return (
                    <GoalRow
                      key={w.id}
                      title={`Sem ${w.week}: ${w.title}`}
                      progress={w.progress}
                      status={w.status}
                      priority={w.priority}
                      color={isCurrent ? '#10b981' : '#1e3a2f'}
                      selected={selectedWeekly === w.id}
                      onClick={() => toggleWeekly(w.id)}
                      math={null}
                    />
                  )
                })}
              </div>
            )}
          </LevelCard>
        </>
      )}

      {/* ── Level 5: Daily tasks ── */}
      {selectedWeekly && (
        <>
          <Connector />
          <LevelCard icon={<Sun size={12} />} label={`Tarefas de Hoje — ${new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: 'numeric', month: 'short' }).format(new Date())}`} color="#f59e0b" depth={4}>
            {tasks.length === 0 ? (
              <EmptySlot label="tarefa de hoje" color="#f59e0b" />
            ) : (
              <div className="space-y-1.5">
                {tasks.map((t) => (
                  <TaskRow key={t.id} task={t} />
                ))}
                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-600">
                  <span>{tasks.filter((t) => t.status === 'done').length}/{tasks.length} concluídas</span>
                  <span>
                    {tasks.reduce((a, t) => a + (t.estimatedMinutes ?? 0), 0)}min estimados
                  </span>
                </div>
              </div>
            )}
          </LevelCard>
        </>
      )}

      {/* Empty state */}
      {yearGoals.length === 0 && (
        <div className="text-center py-10">
          <Target size={32} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 font-semibold text-sm">Nenhuma meta anual criada</p>
          <p className="text-slate-600 text-xs mt-1">Acesse a aba &ldquo;Anual&rdquo; para adicionar suas metas de {YEAR}</p>
        </div>
      )}
    </div>
  )
}
