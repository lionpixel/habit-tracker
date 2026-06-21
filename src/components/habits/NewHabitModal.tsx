'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { z } from 'zod'
import { cn } from '@/lib/helpers'
import { useAppStore } from '@/store/appStore'
import { HabitIcon } from '@/lib/habitIcons'
import { Button } from '@/components/ui/Button'
import type { HabitBase, MetaType } from '@/types/habit'
import { CUSTOM_HABIT_COLORS } from '@/lib/constants'
import { getBRTWeekNumber, getBRTMonth, getBRTYear } from '@/lib/time'
import { getWeekKey, getMonthKey } from '@/lib/helpers'
import { X } from 'lucide-react'

// ── Types ─────────────────────────────────────

type MetaConfig = {
  label: string          // label for value field
  unit: string           // stored unit string
  placeholder: string
  defaultValue: number
}

const META_CONFIGS: Record<MetaType, MetaConfig> = {
  sessoes: { label: 'Sessões por semana',   unit: 'sessões', placeholder: 'Ex: 4',  defaultValue: 4  },
  tempo:   { label: 'Minutos por sessão',   unit: 'min',     placeholder: 'Ex: 30', defaultValue: 30 },
  paginas: { label: 'Páginas por sessão',   unit: 'páginas', placeholder: 'Ex: 10', defaultValue: 10 },
  streak:  { label: 'Dias no desafio',      unit: 'dias',    placeholder: 'Ex: 30', defaultValue: 30 },
}

const AVAILABLE_ICONS = [
  'BookOpen', 'Languages', 'Dumbbell', 'Code2', 'Brain', 'Apple',
  'Star', 'Heart', 'Moon', 'Sun', 'Zap', 'Target',
  'Music', 'Coffee', 'Bike', 'Wind', 'Flame',
]

const AVAILABLE_COLORS = [
  '#6366f1', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4',
  ...CUSTOM_HABIT_COLORS,
]

// ── Schema ────────────────────────────────────

const NewHabitSchema = z.object({
  name:       z.string().min(1, 'Nome obrigatório').max(50),
  description:z.string().max(200).optional(),
  icon:       z.string().min(1),
  color:      z.string().min(1),
  metaType:   z.enum(['sessoes', 'tempo', 'paginas', 'streak']),
  metaValue:  z.number().int().min(1).max(999),
  frequency:  z.number().int().min(1).max(7),
})

type NewHabitForm = z.infer<typeof NewHabitSchema>

// ── Props ─────────────────────────────────────

interface NewHabitModalProps {
  open:    boolean
  onClose: () => void
}

// ── slugify ───────────────────────────────────

function toKey(name: string): string {
  return name
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    .slice(0, 32) || 'habito'
}

function uniqueKey(base: string, habits: Record<string, unknown>): string {
  if (!habits[base]) return base
  let i = 2
  while (habits[`${base}_${i}`]) i++
  return `${base}_${i}`
}

// ── Component ─────────────────────────────────

export function NewHabitModal({ open, onClose }: NewHabitModalProps) {
  const { data, addHabit } = useAppStore()

  const [form, setForm] = useState<NewHabitForm>({
    name:       '',
    description:'',
    icon:       'Star',
    color:      CUSTOM_HABIT_COLORS[0],
    metaType:   'tempo',
    metaValue:  30,
    frequency:  5,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof NewHabitForm, string>>>({})

  function patch<K extends keyof NewHabitForm>(key: K, value: NewHabitForm[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => { const n = { ...e }; delete n[key]; return n })
  }

  function handleClose() {
    setForm({
      name: '', description: '', icon: 'Star', color: CUSTOM_HABIT_COLORS[0],
      metaType: 'tempo', metaValue: 30, frequency: 5,
    })
    setErrors({})
    onClose()
  }

  function handleCreate() {
    const result = NewHabitSchema.safeParse(form)
    if (!result.success) {
      const errs: typeof errors = {}
      result.error.errors.forEach((e) => {
        const field = e.path[0] as keyof NewHabitForm
        errs[field] = e.message
      })
      setErrors(errs)
      return
    }

    const { metaType, metaValue, frequency } = form
    const cfg = META_CONFIGS[metaType]
    const target = metaValue

    const year = getBRTYear()
    const week = getBRTWeekNumber()
    const wKey = getWeekKey(year, week)
    const mKey = getMonthKey(year, getBRTMonth())

    const newHabit: HabitBase = {
      name:         form.name.trim(),
      description:  form.description?.trim() ?? '',
      icon:         form.icon,
      color:        form.color,
      target,
      unit:         cfg.unit,
      frequency:    metaType === 'streak' ? 7 : frequency,
      counts:       { [wKey]: 0 },
      monthlyTotals:{ [mKey]: 0 },
      totalYear:    0,
      goalFreq:     metaType === 'streak' ? 7 : frequency,
      goalDuration: target,
      metaType,
    }

    const key = uniqueKey(toKey(form.name.trim()), data.habits)
    addHabit(key, newHabit)
    toast.success(`Hábito "${form.name}" criado!`)
    handleClose()
  }

  const metaCfg = META_CONFIGS[form.metaType]

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed inset-x-4 top-[10%] bottom-auto z-modal mx-auto max-w-lg"
            initial={{ opacity: 0, y: -24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          >
            <div className="glass rounded-2xl border border-white/10 shadow-card p-6 space-y-5">

              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-100">Novo Hábito</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Configure e adicione à sua rotina</p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-slate-200 flex items-center justify-center transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Preview strip */}
              <div
                className="flex items-center gap-3 p-3 rounded-xl border"
                style={{ background: `${form.color}12`, borderColor: `${form.color}30` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${form.color}25` }}
                >
                  <HabitIcon id={form.icon} className="w-5 h-5" style={{ color: form.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-100 truncate">
                    {form.name || 'Nome do hábito'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {metaCfg.label}: {form.metaValue} {metaCfg.unit}
                    {form.metaType !== 'streak' && ` · ${form.frequency}x/sem`}
                  </p>
                </div>
              </div>

              {/* Nome */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Nome *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => patch('name', e.target.value)}
                  placeholder="Ex: Tocar Violão"
                  maxLength={50}
                  className={cn(
                    'w-full bg-white/[0.05] border rounded-xl px-3 py-2.5 text-sm text-slate-100',
                    'placeholder:text-slate-600 focus:outline-none focus:ring-1',
                    errors.name
                      ? 'border-red-500/50 focus:ring-red-500/50'
                      : 'border-white/[0.08] focus:ring-violet-500/50 focus:border-violet-500/30',
                  )}
                />
                {errors.name && <p className="text-[11px] text-red-400 mt-1">{errors.name}</p>}
              </div>

              {/* Descrição */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Descrição
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => patch('description', e.target.value)}
                  placeholder="Breve descrição do hábito"
                  maxLength={200}
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/30"
                />
              </div>

              {/* Ícone */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Ícone
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_ICONS.map((id) => (
                    <button
                      key={id}
                      onClick={() => patch('icon', id)}
                      className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center transition-all',
                        form.icon === id
                          ? 'border-2 ring-1'
                          : 'bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1]',
                      )}
                      style={form.icon === id ? {
                        background: `${form.color}20`,
                        borderColor: form.color,
                        boxShadow: `0 0 0 1px ${form.color}40`,
                      } : {}}
                    >
                      <HabitIcon id={id} className="w-4 h-4"
                        style={{ color: form.icon === id ? form.color : '#64748b' }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Cor */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Cor
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => patch('color', c)}
                      className={cn(
                        'w-7 h-7 rounded-lg transition-all',
                        form.color === c ? 'scale-125 ring-2 ring-white/30' : 'hover:scale-110',
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Tipo de meta */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Tipo de Meta
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(META_CONFIGS) as MetaType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        patch('metaType', type)
                        patch('metaValue', META_CONFIGS[type].defaultValue)
                      }}
                      className={cn(
                        'px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all border',
                        form.metaType === type
                          ? 'border-violet-500/40 bg-violet-500/15 text-violet-300'
                          : 'border-white/[0.08] bg-white/[0.04] text-slate-400 hover:bg-white/[0.08]',
                      )}
                    >
                      {META_CONFIGS[type].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Valor da meta + frequência */}
              <div className={cn('grid gap-3', form.metaType === 'streak' ? 'grid-cols-1' : 'grid-cols-2')}>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    {metaCfg.label}
                  </label>
                  <input
                    type="number"
                    min={1} max={999}
                    value={form.metaValue}
                    onChange={(e) => patch('metaValue', parseInt(e.target.value) || 1)}
                    placeholder={metaCfg.placeholder}
                    className={cn(
                      'w-full bg-white/[0.05] border rounded-xl px-3 py-2.5 text-sm text-slate-100',
                      'focus:outline-none focus:ring-1',
                      errors.metaValue
                        ? 'border-red-500/50 focus:ring-red-500/50'
                        : 'border-white/[0.08] focus:ring-violet-500/50 focus:border-violet-500/30',
                    )}
                  />
                  {errors.metaValue && <p className="text-[11px] text-red-400 mt-1">{errors.metaValue}</p>}
                </div>

                {form.metaType !== 'streak' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Sessões por semana
                    </label>
                    <input
                      type="number"
                      min={1} max={7}
                      value={form.frequency}
                      onChange={(e) => patch('frequency', parseInt(e.target.value) || 1)}
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/30"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <Button variant="ghost" onClick={handleClose} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleCreate} className="flex-1">
                  Criar Hábito
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
