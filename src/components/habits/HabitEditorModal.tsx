'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { z } from 'zod'
import { cn, formatTime } from '@/lib/helpers'
import { useAppStore } from '@/store/appStore'
import { HabitIcon } from '@/lib/habitIcons'
import { Button } from '@/components/ui/Button'
import { RecurrenceSelector } from './RecurrenceSelector'
import { DurationSelector, durationToMinutes } from './DurationSelector'
import { HabitPreviewCard } from './HabitPreviewCard'
import type {
  HabitKey, HabitBase, HabitIconId, HabitColor,
  RecurrenceConfig, DurationConfig,
} from '@/types/habit'
import {
  X, Repeat, Clock,
  History, Copy, Pause, Play,
  Archive, Trash2, Info,
  BarChart3,
} from 'lucide-react'

// ── Zod schema for the edit form ─────────────

const HabitEditSchema = z.object({
  name:         z.string().min(1, 'Nome obrigatório').max(50),
  description:  z.string().max(200).optional(),
  category:     z.string().optional(),
  icon:         z.string().min(1),
  color:        z.string().min(1),
  frequency:    z.number().int().min(1).max(7),
  timesPerDay:  z.number().int().min(1).max(10).optional(),
  scheduleTime: z.string().optional(),
  startDate:    z.string().optional(),
  endDate:      z.string().optional(),
  weeklyGoalMin:  z.number().nonnegative().optional(),
  monthlyGoalMin: z.number().nonnegative().optional(),
})
type HabitEditForm = z.infer<typeof HabitEditSchema>

// ── Constants ─────────────────────────────────

const TABS = [
  { id: 'info',       label: 'Informações', icon: Info },
  { id: 'schedule',   label: 'Recorrência', icon: Repeat },
  { id: 'duration',   label: 'Duração',     icon: Clock },
  { id: 'goals',      label: 'Metas',       icon: BarChart3 },
  { id: 'history',    label: 'Histórico',   icon: History },
] as const
type TabId = typeof TABS[number]['id']

const ALL_ICONS = [
  'BookOpen','Languages','Dumbbell','Code2','Brain','Apple',
  'Heart','Star','Flame','Zap','Target','Trophy',
  'Music','Camera','Coffee','Moon','Sun','Wind',
  'Leaf','Droplets','Activity','Timer','Pencil','Glasses',
] as HabitIconId[]

const COLOR_OPTIONS: HabitColor[] = [
  '#6366f1', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4',
]
const EXTRA_COLORS = ['#ec4899', '#f97316', '#14b8a6', '#a855f7', '#84cc16', '#0ea5e9']

const CATEGORY_OPTIONS = [
  'Saúde', 'Aprendizado', 'Mentalidade', 'Nutrição', 'Espiritualidade',
  'Produtividade', 'Relacionamentos', 'Finanças', 'Criatividade', 'Outro',
]

// ── Component ─────────────────────────────────

interface HabitEditorModalProps {
  habitKey:  HabitKey
  open:      boolean
  onClose:   () => void
}

export function HabitEditorModal({ habitKey, open, onClose }: HabitEditorModalProps) {
  const { data, updateHabit, pauseHabit, resumeHabit, archiveHabit, unarchiveHabit, duplicateHabit, deleteHabitData } = useAppStore()
  const habit = data.habits[habitKey]

  const [tab,  setTab]  = useState<TabId>('info')
  const [form, setForm] = useState<HabitEditForm>({
    name:        habit.name,
    description: habit.description,
    category:    habit.category ?? '',
    icon:        habit.icon,
    color:       habit.color,
    frequency:   habit.frequency,
    timesPerDay: habit.timesPerDay ?? 1,
    scheduleTime:    habit.scheduleTime ?? '',
    startDate:   habit.startDate ?? '',
    endDate:     habit.endDate ?? '',
    weeklyGoalMin:   habit.weeklyGoalMin,
    monthlyGoalMin:  habit.monthlyGoalMin,
  })
  const [recurrence, setRecurrence] = useState<RecurrenceConfig>(
    habit.recurrence ?? { type: 'times_per_week', timesPerWeek: habit.frequency }
  )
  const [duration, setDuration] = useState<DurationConfig>(
    habit.duration ?? { value: habit.target, unit: 'min' }
  )
  const [errors, setErrors] = useState<Partial<Record<keyof HabitEditForm, string>>>({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm({
      name:        habit.name,
      description: habit.description,
      category:    habit.category ?? '',
      icon:        habit.icon,
      color:       habit.color,
      frequency:   habit.frequency,
      timesPerDay: habit.timesPerDay ?? 1,
      scheduleTime:    habit.scheduleTime ?? '',
      startDate:   habit.startDate ?? '',
      endDate:     habit.endDate ?? '',
      weeklyGoalMin:   habit.weeklyGoalMin,
      monthlyGoalMin:  habit.monthlyGoalMin,
    })
    setRecurrence(habit.recurrence ?? { type: 'times_per_week', timesPerWeek: habit.frequency })
    setDuration(habit.duration ?? { value: habit.target, unit: 'min' })
    setTab('info')
    setErrors({})
    setShowDeleteConfirm(false)
    // Intentionally reads habit snapshot at open/habitKey time only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, habitKey])

  function patch<K extends keyof HabitEditForm>(key: K, value: HabitEditForm[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => { const n = { ...e }; delete n[key]; return n })
  }

  function handleSave() {
    const result = HabitEditSchema.safeParse(form)
    if (!result.success) {
      const errs: typeof errors = {}
      result.error.errors.forEach((e) => {
        const field = e.path[0] as keyof HabitEditForm
        errs[field] = e.message
      })
      setErrors(errs)
      setTab('info')
      return
    }

    const sessionMin = durationToMinutes(duration)

    updateHabit(habitKey, {
      name:           form.name,
      description:    form.description ?? '',
      category:       form.category,
      icon:           form.icon as HabitIconId,
      color:          form.color as HabitColor,
      frequency:      form.frequency,
      timesPerDay:    form.timesPerDay,
      scheduleTime:   form.scheduleTime || undefined,
      startDate:      form.startDate || undefined,
      endDate:        form.endDate   || undefined,
      recurrence,
      duration,
      target:         sessionMin,
      goalDuration:   sessionMin,
      weeklyGoalMin:  form.weeklyGoalMin,
      monthlyGoalMin: form.monthlyGoalMin,
    })
    toast.success(`${form.name} atualizado!`)
    onClose()
  }

  function handleDuplicate() {
    duplicateHabit(habitKey)
    toast.success(`${habit.name} duplicado!`)
    onClose()
  }

  function handleTogglePause() {
    if (habit.paused) {
      resumeHabit(habitKey)
      toast.success(`${habit.name} retomado!`)
    } else {
      pauseHabit(habitKey)
      toast.info(`${habit.name} pausado`)
    }
    onClose()
  }

  function handleToggleArchive() {
    if (habit.archived) {
      unarchiveHabit(habitKey)
      toast.success(`${habit.name} restaurado!`)
    } else {
      archiveHabit(habitKey)
      toast.info(`${habit.name} arquivado`)
    }
    onClose()
  }

  function handleDelete() {
    deleteHabitData(habitKey)
    toast.success(`Dados de ${habit.name} apagados`)
    setShowDeleteConfirm(false)
    onClose()
  }

  // Live preview habit object
  const previewHabit: Partial<HabitBase> & { name: string } = {
    name:        form.name,
    description: form.description,
    category:    form.category,
    icon:        form.icon as HabitIconId,
    color:       form.color as HabitColor,
    frequency:   form.frequency,
    target:      durationToMinutes(duration),
    recurrence,
    duration,
    paused:      habit.paused,
    archived:    habit.archived,
    startDate:   form.startDate || undefined,
  }

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-white/[0.1] shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
              style={{
                background: 'linear-gradient(135deg, rgba(13,17,23,0.98), rgba(8,11,20,0.99))',
                backdropFilter: 'blur(24px)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.07] flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${habit.color}20`, boxShadow: `0 0 0 1px ${habit.color}30` }}
                  >
                    <HabitIcon id={habit.icon} size={18} style={{ color: habit.color }} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-100 leading-tight">{habit.name}</h2>
                    <p className="text-xs text-slate-500">Editar hábito</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-slate-200 flex items-center justify-center transition-all"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Status badges */}
              {(habit.paused || habit.archived || habit.lastEditedAt) && (
                <div className="flex items-center gap-2 px-6 py-2 bg-white/[0.02] border-b border-white/[0.05] flex-shrink-0">
                  {habit.paused && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 font-semibold">
                      Pausado
                    </span>
                  )}
                  {habit.archived && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-500/15 border border-slate-500/30 text-slate-400 font-semibold">
                      Arquivado
                    </span>
                  )}
                  {habit.lastEditedAt && (
                    <span className="text-[10px] text-slate-600 ml-auto">
                      Editado em {new Date(habit.lastEditedAt).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              )}

              {/* Tabs */}
              <div className="flex gap-0.5 px-4 pt-3 pb-0 flex-shrink-0 overflow-x-auto">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-[11px] font-semibold transition-all whitespace-nowrap border-b-2',
                      tab === id
                        ? 'text-white border-violet-500 bg-violet-500/10'
                        : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/[0.04]',
                    )}
                  >
                    <Icon size={11} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-0">

                  {/* Left: tab content */}
                  <div className="p-5 space-y-5 border-r border-white/[0.05]">

                    {/* ── INFO ── */}
                    {tab === 'info' && (
                      <div className="space-y-4">
                        {/* Name */}
                        <div>
                          <label className="text-xs text-slate-400 font-semibold block mb-1.5">Nome</label>
                          <input
                            className={cn('input w-full', errors.name && 'border-red-500/50 focus:border-red-500/70')}
                            value={form.name}
                            onChange={(e) => patch('name', e.target.value)}
                            placeholder="Nome do hábito"
                          />
                          {errors.name && <p className="text-red-400 text-[11px] mt-1">{errors.name}</p>}
                        </div>

                        {/* Description */}
                        <div>
                          <label className="text-xs text-slate-400 font-semibold block mb-1.5">Descrição</label>
                          <textarea
                            className="input w-full resize-none h-20 text-sm leading-relaxed"
                            value={form.description ?? ''}
                            onChange={(e) => patch('description', e.target.value)}
                            placeholder="Descreva o objetivo deste hábito..."
                          />
                        </div>

                        {/* Category */}
                        <div>
                          <label className="text-xs text-slate-400 font-semibold block mb-1.5">Categoria</label>
                          <div className="flex flex-wrap gap-1.5">
                            {CATEGORY_OPTIONS.map((cat) => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => patch('category', form.category === cat ? '' : cat)}
                                className={cn(
                                  'px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all',
                                  form.category === cat
                                    ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                                    : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:border-white/[0.14] hover:text-slate-300',
                                )}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Icon */}
                        <div>
                          <label className="text-xs text-slate-400 font-semibold block mb-1.5">Ícone</label>
                          <div className="flex flex-wrap gap-2">
                            {ALL_ICONS.map((id) => (
                              <button
                                key={id}
                                type="button"
                                onClick={() => patch('icon', id)}
                                className={cn(
                                  'w-9 h-9 rounded-xl flex items-center justify-center border transition-all',
                                  form.icon === id
                                    ? 'border-transparent text-white'
                                    : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-white/[0.08]',
                                )}
                                style={form.icon === id ? {
                                  background: `${form.color}25`,
                                  borderColor: `${form.color}50`,
                                  boxShadow: `0 0 0 1px ${form.color}30`,
                                } : {}}
                                title={id}
                              >
                                <HabitIcon id={id} size={16} style={form.icon === id ? { color: form.color } : {}} />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Color */}
                        <div>
                          <label className="text-xs text-slate-400 font-semibold block mb-1.5">Cor</label>
                          <div className="flex flex-wrap gap-2">
                            {[...COLOR_OPTIONS, ...EXTRA_COLORS].map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => patch('color', c)}
                                className={cn(
                                  'w-7 h-7 rounded-full transition-all border-2',
                                  form.color === c ? 'scale-110 border-white shadow-lg' : 'border-transparent hover:scale-105',
                                )}
                                style={{ backgroundColor: c }}
                                title={c}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-slate-400 font-semibold block mb-1.5">Data de início</label>
                            <input
                              type="date"
                              className="input w-full text-sm"
                              value={form.startDate ?? ''}
                              onChange={(e) => patch('startDate', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 font-semibold block mb-1.5">Data de término</label>
                            <input
                              type="date"
                              className="input w-full text-sm"
                              value={form.endDate ?? ''}
                              onChange={(e) => patch('endDate', e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Schedule time */}
                        <div>
                          <label className="text-xs text-slate-400 font-semibold block mb-1.5">
                            Horário (opcional)
                          </label>
                          <input
                            type="time"
                            className="input w-full text-sm"
                            value={form.scheduleTime ?? ''}
                            onChange={(e) => patch('scheduleTime', e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {/* ── SCHEDULE ── */}
                    {tab === 'schedule' && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-slate-400 font-semibold block mb-3">Tipo de recorrência</label>
                          <RecurrenceSelector
                            value={recurrence}
                            onChange={(r) => {
                              setRecurrence(r)
                              const freq = r.timesPerWeek ?? r.daysOfWeek?.length ?? form.frequency
                              patch('frequency', Math.min(7, Math.max(1, freq)))
                            }}
                            color={form.color}
                          />
                        </div>

                        <div>
                          <label className="text-xs text-slate-400 font-semibold block mb-1.5">
                            Vezes por dia
                          </label>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => patch('timesPerDay', Math.max(1, (form.timesPerDay ?? 1) - 1))}
                              className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 font-bold border border-white/[0.08] flex items-center justify-center text-xl transition-all"
                            >−</button>
                            <div className="flex-1 text-center">
                              <span className="text-2xl font-black text-slate-100 tabular-nums">{form.timesPerDay ?? 1}</span>
                              <span className="text-slate-500 text-xs ml-1">×/dia</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => patch('timesPerDay', Math.min(10, (form.timesPerDay ?? 1) + 1))}
                              className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 font-bold border border-white/[0.08] flex items-center justify-center text-xl transition-all"
                            >+</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── DURATION ── */}
                    {tab === 'duration' && (
                      <DurationSelector
                        value={duration}
                        onChange={setDuration}
                        color={form.color}
                      />
                    )}

                    {/* ── GOALS ── */}
                    {tab === 'goals' && (
                      <div className="space-y-5">
                        <div>
                          <label className="text-xs text-slate-400 font-semibold block mb-1.5">Meta semanal (minutos)</label>
                          <input
                            type="number"
                            className="input w-full"
                            value={form.weeklyGoalMin ?? ''}
                            onChange={(e) => patch('weeklyGoalMin', e.target.value ? Number(e.target.value) : undefined)}
                            placeholder={`Sugerido: ${form.frequency * durationToMinutes(duration)} min`}
                          />
                          <p className="text-[11px] text-slate-600 mt-1">
                            Padrão: {formatTime(form.frequency * durationToMinutes(duration))}/semana
                          </p>
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 font-semibold block mb-1.5">Meta mensal (minutos)</label>
                          <input
                            type="number"
                            className="input w-full"
                            value={form.monthlyGoalMin ?? ''}
                            onChange={(e) => patch('monthlyGoalMin', e.target.value ? Number(e.target.value) : undefined)}
                            placeholder={`Sugerido: ${Math.round(form.frequency * 4.33 * durationToMinutes(duration))} min`}
                          />
                          <p className="text-[11px] text-slate-600 mt-1">
                            Padrão: {formatTime(Math.round(form.frequency * 4.33 * durationToMinutes(duration)))}/mês
                          </p>
                        </div>

                        {/* Consistency info */}
                        <div className="bg-indigo-500/[0.08] border border-indigo-500/20 rounded-xl p-4">
                          <p className="text-xs text-indigo-300 font-semibold mb-2">Cálculo de consistência</p>
                          <div className="space-y-1 text-[11px] text-indigo-400/80">
                            <p>• Consistência semanal = sessões ÷ frequência × 100%</p>
                            <p>• Consistência mensal = total de sessões ÷ sessões esperadas × 100%</p>
                            <p>• Streak: dias consecutivos acima de 80% de consistência</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── HISTORY ── */}
                    {tab === 'history' && (
                      <div className="space-y-3">
                        {(habit.editHistory?.length ?? 0) === 0 ? (
                          <div className="text-center py-8">
                            <History size={32} className="text-slate-700 mx-auto mb-2" />
                            <p className="text-slate-500 text-sm">Nenhuma alteração registrada ainda.</p>
                          </div>
                        ) : (
                          habit.editHistory!.slice().reverse().map((entry, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                              <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-semibold text-slate-300">{entry.field}</span>
                                  <span className="text-[10px] text-slate-600">
                                    {new Date(entry.at).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  <span className="line-through text-red-400/60">{entry.from || '—'}</span>
                                  <span className="mx-1.5 text-slate-600">→</span>
                                  <span className="text-emerald-400/80">{entry.to || '—'}</span>
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: preview */}
                  <div className="p-4 space-y-4 bg-white/[0.01]">
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">Pré-visualização</p>
                    <HabitPreviewCard habit={previewHabit} />

                    {/* Quick actions */}
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">Ações rápidas</p>

                      <button
                        type="button"
                        onClick={handleDuplicate}
                        className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] text-slate-300 text-xs font-medium transition-all"
                      >
                        <Copy size={13} className="text-slate-500" />
                        Duplicar hábito
                      </button>

                      <button
                        type="button"
                        onClick={handleTogglePause}
                        className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] hover:bg-amber-500/10 border border-white/[0.07] hover:border-amber-500/30 text-slate-300 hover:text-amber-300 text-xs font-medium transition-all"
                      >
                        {habit.paused
                          ? <Play size={13} className="text-amber-400" />
                          : <Pause size={13} className="text-amber-400" />
                        }
                        {habit.paused ? 'Retomar hábito' : 'Pausar hábito'}
                      </button>

                      <button
                        type="button"
                        onClick={handleToggleArchive}
                        className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] hover:bg-slate-500/10 border border-white/[0.07] hover:border-slate-500/30 text-slate-300 hover:text-slate-200 text-xs font-medium transition-all"
                      >
                        <Archive size={13} className="text-slate-500" />
                        {habit.archived ? 'Restaurar' : 'Arquivar'}
                      </button>

                      {!showDeleteConfirm ? (
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] hover:bg-red-500/10 border border-white/[0.07] hover:border-red-500/30 text-slate-400 hover:text-red-400 text-xs font-medium transition-all"
                        >
                          <Trash2 size={13} />
                          Apagar dados
                        </button>
                      ) : (
                        <div className="rounded-xl border border-red-500/30 bg-red-500/[0.08] p-3 space-y-2">
                          <p className="text-[11px] text-red-400 font-medium">Apagar todos os registros?</p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleDelete}
                              className="flex-1 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-[11px] font-bold transition-all border border-red-500/30"
                            >
                              Confirmar
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowDeleteConfirm(false)}
                              className="flex-1 py-1.5 rounded-lg bg-white/[0.05] text-slate-400 text-[11px] font-bold transition-all"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-white/[0.07] flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  style={{ background: `linear-gradient(135deg, ${form.color}, ${form.color}cc)` }}
                >
                  Salvar alterações
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
