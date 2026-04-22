'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ImageIcon, DollarSign, Heart, MapPin, Star, Target } from 'lucide-react'
import { cn } from '@/lib/helpers'
import type { Dream, DreamCategory, DreamStatus } from '@/types/dreams'
import { DREAM_CATEGORIES } from '@/types/dreams'
import { useDreamsStore } from '@/store/dreamsStore'
import { useGoalsStore }  from '@/store/goalsStore'

interface DreamFormModalProps {
  open:    boolean
  dream?:  Dream              // undefined = create mode
  onClose: () => void
}

type FormState = {
  title:              string
  description:        string
  category:           DreamCategory
  imageUrl:           string
  targetDate:         string
  financialTarget:    string
  financialCurrent:   string
  emotionalReason:    string
  executionPlan:      string
  progress:           number
  status:             DreamStatus
  linkedAnnualGoalId: string
}

const EMPTY: FormState = {
  title:              '',
  description:        '',
  category:           'estilo',
  imageUrl:           '',
  targetDate:         '',
  financialTarget:    '',
  financialCurrent:   '',
  emotionalReason:    '',
  executionPlan:      '',
  progress:           0,
  status:             'active',
  linkedAnnualGoalId: '',
}

export function DreamFormModal({ open, dream, onClose }: DreamFormModalProps) {
  const { addDream, updateDream } = useDreamsStore()
  const { annualGoals, hydrated: gH, hydrate: gHydrate } = useGoalsStore()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [error, setError] = useState('')

  const isEdit = !!dream

  useEffect(() => { if (!gH) gHydrate() }, [gH, gHydrate])

  useEffect(() => {
    if (dream) {
      setForm({
        title:              dream.title,
        description:        dream.description,
        category:           dream.category,
        imageUrl:           dream.imageUrl ?? '',
        targetDate:         dream.targetDate ?? '',
        financialTarget:    dream.financialTarget ? String(dream.financialTarget) : '',
        financialCurrent:   dream.financialCurrent ? String(dream.financialCurrent) : '',
        emotionalReason:    dream.emotionalReason,
        executionPlan:      dream.executionPlan,
        progress:           dream.progress,
        status:             dream.status,
        linkedAnnualGoalId: dream.linkedAnnualGoalId ?? '',
      })
    } else {
      setForm(EMPTY)
    }
    setError('')
  }, [dream, open])

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: val }))
  }

  function handleSubmit() {
    if (!form.title.trim()) { setError('O título é obrigatório.'); return }
    if (!form.emotionalReason.trim()) { setError('O motivo emocional é obrigatório.'); return }

    const payload = {
      title:              form.title.trim(),
      description:        form.description.trim(),
      category:           form.category,
      imageUrl:           form.imageUrl.trim() || undefined,
      targetDate:         form.targetDate || undefined,
      financialTarget:    form.financialTarget ? parseFloat(form.financialTarget) : undefined,
      financialCurrent:   form.financialCurrent ? parseFloat(form.financialCurrent) : undefined,
      emotionalReason:    form.emotionalReason.trim(),
      executionPlan:      form.executionPlan.trim(),
      progress:           form.progress,
      status:             form.status,
      linkedAnnualGoalId: form.linkedAnnualGoalId || undefined,
    }

    if (isEdit && dream) {
      updateDream(dream.id, payload)
    } else {
      addDream(payload)
    }
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-modal flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: 20,  scale: 0.97 }}
            transition={{ type: 'spring', damping: 26, stiffness: 340 }}
            className="relative w-full sm:max-w-xl max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-[#0d1120] border border-white/[0.07] shadow-2xl scrollable"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-[#0d1120]/95 backdrop-blur-sm border-b border-white/[0.05]">
              <div>
                <h2 className="text-base font-bold text-slate-100">
                  {isEdit ? 'Editar sonho' : 'Novo sonho'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isEdit ? 'Atualize os detalhes do seu sonho' : 'Adicione ao seu Quadro dos Sonhos 2026'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Título *
                </label>
                <input
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="Qual é o seu sonho?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Categoria
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(DREAM_CATEGORIES) as [DreamCategory, typeof DREAM_CATEGORIES[DreamCategory]][]).map(([key, cat]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => set('category', key)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all',
                        form.category === key
                          ? 'text-white'
                          : 'text-slate-500 border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]',
                      )}
                      style={form.category === key ? {
                        background: `${cat.color}18`,
                        borderColor: `${cat.color}44`,
                        color: cat.color,
                      } : undefined}
                    >
                      <span>{cat.emoji}</span>
                      <span className="truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Descrição
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Descreva seu sonho com detalhes..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                />
              </div>

              {/* Image URL */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <ImageIcon className="w-3 h-3" />
                  Imagem (URL)
                </label>
                <input
                  value={form.imageUrl}
                  onChange={(e) => set('imageUrl', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
                {form.imageUrl && (
                  <div className="relative h-24 rounded-xl overflow-hidden border border-white/[0.06]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Target date + Financial */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <MapPin className="w-3 h-3" />
                    Prazo
                  </label>
                  <input
                    type="date"
                    value={form.targetDate}
                    onChange={(e) => set('targetDate', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-200 text-sm focus:outline-none focus:border-violet-500/50 transition-colors [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <DollarSign className="w-3 h-3" />
                    Meta (R$)
                  </label>
                  <input
                    type="number"
                    value={form.financialTarget}
                    onChange={(e) => set('financialTarget', e.target.value)}
                    placeholder="0"
                    min={0}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                </div>
              </div>

              {form.financialTarget && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Valor acumulado (R$)
                  </label>
                  <input
                    type="number"
                    value={form.financialCurrent}
                    onChange={(e) => set('financialCurrent', e.target.value)}
                    placeholder="0"
                    min={0}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                </div>
              )}

              {/* Emotional reason */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <Heart className="w-3 h-3 text-rose-400" />
                  Por que esse sonho importa? *
                </label>
                <textarea
                  value={form.emotionalReason}
                  onChange={(e) => set('emotionalReason', e.target.value)}
                  placeholder="O motivo emocional que te move em direção a esse sonho..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-rose-500/40 transition-colors resize-none"
                />
              </div>

              {/* Execution plan */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <Star className="w-3 h-3 text-amber-400" />
                  Plano de execução
                </label>
                <textarea
                  value={form.executionPlan}
                  onChange={(e) => set('executionPlan', e.target.value)}
                  placeholder="Quais ações concretas te aproximam desse sonho?"
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40 transition-colors resize-none"
                />
              </div>

              {/* Link to Annual Goal */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <Target className="w-3 h-3 text-violet-400" />
                  Meta Anual vinculada
                </label>
                <select
                  value={form.linkedAnnualGoalId}
                  onChange={(e) => set('linkedAnnualGoalId', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-200 text-sm focus:outline-none focus:border-violet-500/50 transition-colors [color-scheme:dark]"
                >
                  <option value="">— Nenhuma —</option>
                  {annualGoals
                    .filter((g) => g.year === new Date().getFullYear())
                    .map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                </select>
              </div>

              {/* Progress + Status (edit only) */}
              {isEdit && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Progresso: {form.progress}%
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={form.progress}
                      onChange={(e) => set('progress', Number(e.target.value))}
                      className="w-full accent-violet-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => set('status', e.target.value as DreamStatus)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-200 text-sm focus:outline-none focus:border-violet-500/50 transition-colors [color-scheme:dark]"
                    >
                      <option value="active">Ativo</option>
                      <option value="paused">Pausado</option>
                      <option value="achieved">Conquistado</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex items-center gap-3 px-5 py-4 bg-[#0d1120]/95 backdrop-blur-sm border-t border-white/[0.05]">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-400 bg-white/[0.04] hover:bg-white/[0.08] transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 transition-all shadow-lg shadow-violet-500/20"
              >
                {isEdit ? 'Salvar' : 'Adicionar sonho'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
