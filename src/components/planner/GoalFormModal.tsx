// ─────────────────────────────────────────────
//  Component: GoalFormModal — create/edit any goal level
// ─────────────────────────────────────────────

'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Check } from 'lucide-react'
import * as Icons from 'lucide-react'
import { cn } from '@/lib/helpers'
import {
  GOAL_ICONS, GOAL_COLORS, GOAL_CATEGORY_OPTIONS,
  PRIORITY_LABELS, PRIORITY_COLORS, STATUS_LABELS,
} from '@/types/goals'
import type {
  GoalLevel, GoalPriority, GoalStatus,
  AnnualGoal, QuarterlyGoal, MonthlyGoal, WeeklyGoal, DailyTask,
  Quarter,
} from '@/types/goals'
import { useGoalsStore } from '@/store/goalsStore'

function LucideIcon({ name, size = 15, style }: { name: string; size?: number; style?: React.CSSProperties }) {
  const Icon = (Icons as Record<string, unknown>)[name] as React.FC<{ size?: number; style?: React.CSSProperties }> | undefined
  if (!Icon) return null
  return <Icon size={size} style={style} />
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">{label}</label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      className="w-full bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  )
}

// ── Types for the modal ───────────────────────

type GoalPayload =
  | { level: 'annual';    context?: { year?: number } }
  | { level: 'quarterly'; context?: { year?: number; quarter?: Quarter; annualGoalId?: string } }
  | { level: 'monthly';   context?: { year?: number; month?: number; quarterlyGoalId?: string } }
  | { level: 'weekly';    context?: { year?: number; week?: number; monthlyGoalId?: string } }
  | { level: 'daily';     context?: { date?: string; weeklyGoalId?: string } }

type EditTarget =
  | { level: 'annual';    goal: AnnualGoal }
  | { level: 'quarterly'; goal: QuarterlyGoal }
  | { level: 'monthly';   goal: MonthlyGoal }
  | { level: 'weekly';    goal: WeeklyGoal }
  | { level: 'daily';     goal: DailyTask }

interface GoalFormModalProps {
  open:     boolean
  create?:  GoalPayload
  edit?:    EditTarget
  onClose:  () => void
  onCreated?: (id: string) => void
}

const LEVEL_LABELS: Record<GoalLevel, string> = {
  annual:    'Meta Anual',
  quarterly: 'Meta Trimestral',
  monthly:   'Meta Mensal',
  weekly:    'Meta Semanal',
  daily:     'Tarefa Diária',
}

const LEVEL_COLORS: Record<GoalLevel, string> = {
  annual:    '#a78bfa',
  quarterly: '#6366f1',
  monthly:   '#0ea5e9',
  weekly:    '#10b981',
  daily:     '#f59e0b',
}

export function GoalFormModal({ open, create, edit, onClose, onCreated }: GoalFormModalProps) {
  const store = useGoalsStore()

  const level = edit?.level ?? create?.level ?? 'annual'
  const isEdit = !!edit
  const c = LEVEL_COLORS[level]

  // Form state
  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [category,    setCategory]    = useState('')
  const [icon,        setIcon]        = useState(GOAL_ICONS[0])
  const [color,       setColor]       = useState(GOAL_COLORS[0])
  const [priority,    setPriority]    = useState<GoalPriority>('medium')
  const [status,      setStatus]      = useState<GoalStatus>('not_started')
  const [progress,    setProgress]    = useState(0)
  const [targetValue, setTargetValue] = useState('')
  const [targetUnit,  setTargetUnit]  = useState('')
  const [currentValue,setCurrentValue]= useState('')
  const [notes,       setNotes]       = useState('')

  // Level-specific
  const [year,    setYear]    = useState(new Date().getFullYear())
  const [quarter, setQuarter] = useState<Quarter>(1)
  const [month,   setMonth]   = useState(new Date().getMonth() + 1)
  const [week,    setWeek]    = useState(1)
  const [date,    setDate]    = useState('')
  const [dueTime, setDueTime] = useState('')
  const [estimatedMinutes, setEstimatedMinutes] = useState('')

  useEffect(() => {
    if (open) {
      if (isEdit && edit) {
        const g = edit.goal as AnnualGoal & QuarterlyGoal & MonthlyGoal & WeeklyGoal & DailyTask
        setTitle(g.title ?? '')
        setDescription(g.description ?? '')
        setCategory(g.category ?? '')
        setIcon(g.icon ?? GOAL_ICONS[0])
        setColor(g.color ?? GOAL_COLORS[0])
        setPriority((g as { priority?: GoalPriority }).priority ?? 'medium')
        setStatus(g.status ?? 'not_started')
        setProgress(g.progress ?? 0)
        setTargetValue(g.targetValue != null ? String(g.targetValue) : '')
        setTargetUnit(g.targetUnit ?? '')
        setCurrentValue(g.currentValue != null ? String(g.currentValue) : '')
        setNotes(g.notes ?? '')
        if ('year'    in g) setYear(g.year ?? new Date().getFullYear())
        if ('quarter' in g) setQuarter((g as QuarterlyGoal).quarter ?? 1)
        if ('month'   in g) setMonth((g as MonthlyGoal).month ?? 1)
        if ('week'    in g) setWeek((g as WeeklyGoal).week ?? 1)
        if ('date'    in g) setDate((g as DailyTask).date ?? '')
        if ('dueTime' in g) setDueTime((g as DailyTask).dueTime ?? '')
        if ('estimatedMinutes' in g) setEstimatedMinutes((g as DailyTask).estimatedMinutes != null ? String((g as DailyTask).estimatedMinutes) : '')
      } else {
        setTitle(''); setDescription(''); setCategory('')
        setIcon(GOAL_ICONS[0]); setColor(GOAL_COLORS[0])
        setPriority('medium'); setStatus('not_started'); setProgress(0)
        setTargetValue(''); setTargetUnit(''); setCurrentValue('')
        setNotes(''); setDueTime(''); setEstimatedMinutes('')
        if (create) {
          const ctx = create.context as Record<string, unknown> ?? {}
          if (ctx.year)    setYear(ctx.year as number)
          if (ctx.quarter) setQuarter(ctx.quarter as Quarter)
          if (ctx.month)   setMonth(ctx.month as number)
          if (ctx.week)    setWeek(ctx.week as number)
          if (ctx.date)    setDate(ctx.date as string)
        } else {
          setDate(new Date().toISOString().slice(0, 10))
        }
      }
    }
  }, [open, isEdit, edit, create])

  function handleSave() {
    if (!title.trim()) return

    const base = {
      title:        title.trim(),
      description:  description.trim() || undefined,
      category:     category || undefined,
      icon,
      color,
      priority,
      status,
      progress,
      targetValue:  targetValue ? Number(targetValue)  : undefined,
      targetUnit:   targetUnit  || undefined,
      currentValue: currentValue ? Number(currentValue): undefined,
      notes:        notes || undefined,
    }

    let id: string | undefined

    if (isEdit && edit) {
      const gid = edit.goal.id
      switch (edit.level) {
        case 'annual':    store.updateAnnualGoal(gid, base);    break
        case 'quarterly': store.updateQuarterlyGoal(gid, base); break
        case 'monthly':   store.updateMonthlyGoal(gid, base);   break
        case 'weekly':    store.updateWeeklyGoal(gid, base);    break
        case 'daily':
          store.updateDailyTask(gid, { ...base, date, dueTime: dueTime || undefined, estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : undefined })
          break
      }
    } else {
      const ctx = (create?.context ?? {}) as Record<string, unknown>
      switch (level) {
        case 'annual':
          id = store.addAnnualGoal({ ...base, year })
          break
        case 'quarterly':
          id = store.addQuarterlyGoal({ ...base, year, quarter, annualGoalId: ctx.annualGoalId as string | undefined })
          break
        case 'monthly':
          id = store.addMonthlyGoal({ ...base, year, month, quarterlyGoalId: ctx.quarterlyGoalId as string | undefined })
          break
        case 'weekly':
          id = store.addWeeklyGoal({ ...base, year, week, monthlyGoalId: ctx.monthlyGoalId as string | undefined })
          break
        case 'daily':
          id = store.addDailyTask({ ...base, date, dueTime: dueTime || undefined, estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : undefined, weeklyGoalId: ctx.weeklyGoalId as string | undefined })
          break
      }
    }

    if (id && onCreated) onCreated(id)
    onClose()
  }

  const PRIORITIES: GoalPriority[] = ['critical', 'high', 'medium', 'low']
  const STATUSES: GoalStatus[] = ['not_started', 'in_progress', 'done', 'cancelled']

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            <div className="glass w-full max-w-xl rounded-2xl border border-white/[0.08] shadow-modal pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]">
              <div className="h-[3px]" style={{ background: `linear-gradient(90deg, ${c}, ${c}60, transparent)` }} />

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${c}20` }}>
                    <LucideIcon name={icon} size={14} style={{ color: c }} />
                  </div>
                  <h3 className="font-bold text-slate-100">
                    {isEdit ? 'Editar' : 'Nova'} {LEVEL_LABELS[level]}
                  </h3>
                </div>
                <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-slate-400 hover:text-slate-200">
                  <X size={15} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <Field label="Título *">
                  <TextInput value={title} onChange={setTitle} placeholder={`ex: Ganhar R$ 120.000 no ano`} />
                </Field>

                <Field label="Descrição">
                  <textarea rows={2} className="w-full bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                    value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Contexto e motivação..." />
                </Field>

                {/* Level-specific date fields */}
                {level === 'annual' && (
                  <Field label="Ano">
                    <input type="number" className="w-full bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={year} onChange={(e) => setYear(Number(e.target.value))} />
                  </Field>
                )}

                {level === 'quarterly' && (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Ano">
                      <input type="number" className="w-full bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={year} onChange={(e) => setYear(Number(e.target.value))} />
                    </Field>
                    <Field label="Trimestre">
                      <select className="w-full bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={quarter} onChange={(e) => setQuarter(Number(e.target.value) as Quarter)}>
                        <option value={1}>Q1 (Jan–Mar)</option>
                        <option value={2}>Q2 (Abr–Jun)</option>
                        <option value={3}>Q3 (Jul–Set)</option>
                        <option value={4}>Q4 (Out–Dez)</option>
                      </select>
                    </Field>
                  </div>
                )}

                {level === 'monthly' && (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Ano">
                      <input type="number" className="w-full bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={year} onChange={(e) => setYear(Number(e.target.value))} />
                    </Field>
                    <Field label="Mês">
                      <select className="w-full bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                        {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].map((m, i) => (
                          <option key={i + 1} value={i + 1}>{m}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                )}

                {level === 'weekly' && (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Ano">
                      <input type="number" className="w-full bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={year} onChange={(e) => setYear(Number(e.target.value))} />
                    </Field>
                    <Field label="Semana do ano">
                      <input type="number" min={1} max={53} className="w-full bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={week} onChange={(e) => setWeek(Number(e.target.value))} />
                    </Field>
                  </div>
                )}

                {level === 'daily' && (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Data">
                      <input type="date" className="w-full bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={date} onChange={(e) => setDate(e.target.value)} />
                    </Field>
                    <Field label="Horário (opcional)">
                      <input type="time" className="w-full bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
                    </Field>
                    <Field label="Estimativa (min)">
                      <input type="number" min={0} className="w-full bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={estimatedMinutes} onChange={(e) => setEstimatedMinutes(e.target.value)} placeholder="ex: 30" />
                    </Field>
                  </div>
                )}

                {/* Target value */}
                {level !== 'daily' && (
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Valor alvo">
                      <input type="number" min={0} className="w-full bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={targetValue} onChange={(e) => setTargetValue(e.target.value)} placeholder="ex: 120000" />
                    </Field>
                    <Field label="Unidade">
                      <TextInput value={targetUnit} onChange={setTargetUnit} placeholder="ex: R$, kg" />
                    </Field>
                    <Field label="Valor atual">
                      <input type="number" min={0} className="w-full bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} placeholder="ex: 0" />
                    </Field>
                  </div>
                )}

                {/* Priority */}
                <Field label="Prioridade">
                  <div className="flex gap-2 flex-wrap mt-1">
                    {PRIORITIES.map((p) => (
                      <button key={p} type="button" onClick={() => setPriority(p)}
                        className={cn('px-3 py-1.5 rounded-lg text-xs font-bold transition-all', priority === p ? 'text-white' : 'bg-white/[0.05] text-slate-500 hover:text-slate-300')}
                        style={priority === p ? { background: PRIORITY_COLORS[p] } : undefined}
                      >
                        {PRIORITY_LABELS[p]}
                      </button>
                    ))}
                  </div>
                </Field>

                {/* Status + progress (edit only) */}
                {isEdit && (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Status">
                      <select className="w-full bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={status} onChange={(e) => setStatus(e.target.value as GoalStatus)}>
                        {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                    </Field>
                    {level !== 'daily' && (
                      <Field label={`Progresso: ${progress}%`}>
                        <input type="range" min={0} max={100} className="w-full mt-2"
                          value={progress} onChange={(e) => setProgress(Number(e.target.value))} />
                      </Field>
                    )}
                  </div>
                )}

                {/* Category */}
                <Field label="Categoria">
                  <div className="flex flex-wrap gap-2 mt-1">
                    {GOAL_CATEGORY_OPTIONS.map((cat) => (
                      <button key={cat} type="button" onClick={() => setCategory(category === cat ? '' : cat)}
                        className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold transition-all',
                          category === cat
                            ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40'
                            : 'bg-white/[0.05] text-slate-500 hover:text-slate-400'
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </Field>

                {/* Icon */}
                <Field label="Ícone">
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {GOAL_ICONS.map((ic) => (
                      <button key={ic} type="button" onClick={() => setIcon(ic)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={icon === ic ? { background: `${color}20` } : { background: 'rgba(255,255,255,0.05)' }}
                      >
                        <LucideIcon name={ic} size={14} style={{ color: icon === ic ? color : '#64748b' }} />
                      </button>
                    ))}
                  </div>
                </Field>

                {/* Color */}
                <Field label="Cor">
                  <div className="flex flex-wrap gap-2 mt-1">
                    {GOAL_COLORS.map((col) => (
                      <button key={col} type="button" onClick={() => setColor(col)}
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                        style={{ backgroundColor: col }}
                      >
                        {color === col && <Check size={11} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Notas">
                  <textarea rows={2} className="w-full bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                    value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas adicionais..." />
                </Field>
              </div>

              {/* Footer */}
              <div className="flex gap-3 px-6 py-4 border-t border-white/[0.06] flex-shrink-0">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/[0.05] text-slate-400 text-sm font-semibold hover:bg-white/[0.08]">
                  Cancelar
                </button>
                <button type="button" onClick={handleSave} disabled={!title.trim()}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-40 transition-all hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${c}, ${c}99)` }}
                >
                  {isEdit ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
