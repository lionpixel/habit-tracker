'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { z } from 'zod'
import { cn, formatDate } from '@/lib/helpers'
import { useAppStore } from '@/store/appStore'
import { calculateFastingProgress } from '@/lib/fastingUtils'
import { Button } from '@/components/ui/Button'
import { ProgressBarAnimated } from '@/components/ui/Motion'
import { X, Shield, Flame, Trophy, Calendar, Clock, CheckCircle2 } from 'lucide-react'
import type { FastingHabit } from '@/types/habit'

const FastingFormSchema = z.object({
  name:             z.string().min(1).max(50),
  description:      z.string().max(200).optional(),
  fastingDays:      z.number().int().min(1).max(365),
  fastingStartDate: z.string().optional(),
})
type FastingForm = z.infer<typeof FastingFormSchema>

function computeEndDate(startDate: string, days: number): Date {
  const d = new Date(startDate)
  d.setDate(d.getDate() + days)
  return d
}

interface FastingEditorModalProps {
  open:    boolean
  onClose: () => void
}

export function FastingEditorModal({ open, onClose }: FastingEditorModalProps) {
  const { data, updateHabit } = useAppStore()
  const habit = data.habits.fasting as FastingHabit

  const [form, setForm] = useState<FastingForm>({
    name:             habit.name,
    description:      habit.description,
    fastingDays:      habit.fastingDays ?? 40,
    fastingStartDate: habit.fastingStartDate ?? new Date().toISOString().slice(0, 10),
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FastingForm, string>>>({})
  const [confirmComplete, setConfirmComplete] = useState(false)
  const [confirmReset,    setConfirmReset]    = useState(false)

  useEffect(() => {
    if (!open) return
    setForm({
      name:             habit.name,
      description:      habit.description,
      fastingDays:      habit.fastingDays ?? 40,
      fastingStartDate: habit.fastingStartDate ?? new Date().toISOString().slice(0, 10),
    })
    setErrors({})
    setConfirmComplete(false)
    setConfirmReset(false)
    // Intentionally reads habit snapshot at open time only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function patch<K extends keyof FastingForm>(key: K, value: FastingForm[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => { const n = { ...e }; delete n[key]; return n })
  }

  const endDate = form.fastingStartDate
    ? computeEndDate(form.fastingStartDate, form.fastingDays)
    : null

  // Use time-based progress calculation
  const fastingProgress = calculateFastingProgress({
    ...habit,
    fastingDays:      form.fastingDays,
    fastingStartDate: form.fastingStartDate,
  })
  const streak     = fastingProgress.progressDays
  const pct        = fastingProgress.pct
  const daysLeft   = fastingProgress.daysLeft
  const isComplete = fastingProgress.isComplete

  function handleSave() {
    const result = FastingFormSchema.safeParse(form)
    if (!result.success) {
      const errs: typeof errors = {}
      result.error.errors.forEach((e) => { errs[e.path[0] as keyof FastingForm] = e.message })
      setErrors(errs)
      return
    }

    const endDateStr = endDate?.toISOString().slice(0, 10)

    updateHabit('fasting', {
      name:             form.name,
      description:      form.description ?? '',
      fastingDays:      form.fastingDays,
      fastingStartDate: form.fastingStartDate,
      fastingEndDate:   endDateStr,
    } as Partial<FastingHabit>)
    toast.success('Jejum atualizado!')
    onClose()
  }

  function handleMarkComplete() {
    const now = new Date().toISOString().slice(0, 10)
    updateHabit('fasting', {
      fastingComplete:    true,
      fastingCompletedAt: now,
      longestStreak:      Math.max(streak, habit.longestStreak ?? 0),
    } as Partial<FastingHabit>)
    toast.success('Parabéns! Jejum marcado como concluído!')
    setConfirmComplete(false)
    onClose()
  }

  function handleReset() {
    const { resetFasting } = useAppStore.getState()
    resetFasting()
    toast.info('Jejum reiniciado. Novo ciclo começou!')
    setConfirmReset(false)
    onClose()
  }

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-lg rounded-2xl border border-white/[0.1] shadow-[0_32px_80px_rgba(0,0,0,0.7)] flex flex-col max-h-[90vh]"
              style={{
                background: 'linear-gradient(135deg, rgba(13,17,23,0.98), rgba(8,11,20,0.99))',
                backdropFilter: 'blur(24px)',
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/[0.07] flex-shrink-0"
                style={{ borderTopColor: `${habit.color}40` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${habit.color}20`, boxShadow: `0 0 0 1px ${habit.color}30` }}
                  >
                    <Shield size={18} style={{ color: habit.color }} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-100">{habit.name}</h2>
                    <p className="text-[10px] text-slate-500">Configurar jejum / desafio</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 flex items-center justify-center transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">

                {/* Live progress */}
                <div
                  className="rounded-xl p-4 border relative overflow-hidden"
                  style={{ background: `${habit.color}0a`, borderColor: `${habit.color}25` }}
                >
                  <div className="flex items-baseline gap-2 mb-3">
                    <span
                      className="text-5xl font-black leading-none tabular-nums"
                      style={{
                        background: isComplete
                          ? 'linear-gradient(135deg, #10b981, #34d399)'
                          : `linear-gradient(135deg, #f1f5f9, ${habit.color})`,
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                      }}
                    >
                      {streak}
                    </span>
                    <div>
                      <div className="text-slate-300 font-bold text-sm">de {form.fastingDays} dias</div>
                      <div className="text-slate-500 text-xs">
                        {isComplete ? 'Concluído!' : `${daysLeft} restantes`}
                      </div>
                    </div>
                    {isComplete && (
                      <CheckCircle2 size={20} className="text-emerald-400 ml-auto" />
                    )}
                  </div>
                  <ProgressBarAnimated
                    value={pct}
                    color={isComplete ? '#10b981' : habit.color}
                    height={10}
                    glowing={isComplete || pct >= 75}
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-[10px] text-slate-600">0 dias</span>
                    <span className="text-[11px] font-bold tabular-nums" style={{ color: isComplete ? '#10b981' : habit.color }}>
                      {pct}% completo
                    </span>
                    <span className="text-[10px] text-slate-600">{form.fastingDays} dias</span>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1.5">Nome do desafio</label>
                  <input
                    className={cn('input w-full', errors.name && 'border-red-500/50')}
                    value={form.name}
                    onChange={(e) => patch('name', e.target.value)}
                    placeholder="Ex: 40 Dias Sem Açúcar"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1.5">Descrição</label>
                  <textarea
                    className="input w-full resize-none h-16 text-sm"
                    value={form.description ?? ''}
                    onChange={(e) => patch('description', e.target.value)}
                    placeholder="Objetivo do desafio..."
                  />
                </div>

                {/* Days stepper */}
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-2">
                    Duração do desafio (padrão: 40 dias)
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => patch('fastingDays', Math.max(1, form.fastingDays - 1))}
                      className="w-10 h-10 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 font-bold border border-white/[0.08] flex items-center justify-center text-xl transition-all"
                    >−</button>
                    <div className="flex-1 text-center">
                      <input
                        type="number"
                        className="input text-center text-3xl font-black w-full tabular-nums"
                        value={form.fastingDays}
                        min={1}
                        max={365}
                        onChange={(e) => {
                          const v = parseInt(e.target.value)
                          if (!isNaN(v) && v > 0) patch('fastingDays', v)
                        }}
                      />
                      <p className="text-[11px] text-slate-500 mt-1">dias de jejum</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => patch('fastingDays', Math.min(365, form.fastingDays + 1))}
                      className="w-10 h-10 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 font-bold border border-white/[0.08] flex items-center justify-center text-xl transition-all"
                    >+</button>
                  </div>
                  {/* Quick presets */}
                  <div className="flex gap-2 mt-3">
                    {[7, 14, 21, 30, 40, 90].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => patch('fastingDays', d)}
                        className={cn(
                          'flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition-all',
                          form.fastingDays === d
                            ? 'text-white border-transparent'
                            : 'bg-white/[0.04] text-slate-500 border-white/[0.08] hover:text-slate-300',
                        )}
                        style={form.fastingDays === d ? {
                          background: `${habit.color}25`,
                          borderColor: `${habit.color}40`,
                        } : {}}
                      >
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start date */}
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1.5">
                    <span className="flex items-center gap-1.5"><Calendar size={11} /> Data de início</span>
                  </label>
                  <input
                    type="date"
                    className="input w-full text-sm"
                    value={form.fastingStartDate ?? ''}
                    onChange={(e) => patch('fastingStartDate', e.target.value)}
                  />
                  {endDate && (
                    <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
                      <Clock size={10} />
                      Término previsto: <span className="text-slate-300 font-semibold">{formatDate(endDate)}</span>
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-1">
                  <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">Ações do desafio</p>

                  {!isComplete ? (
                    confirmComplete ? (
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.08] p-3 space-y-2">
                        <p className="text-[11px] text-emerald-400 font-medium">Marcar jejum como concluído?</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleMarkComplete}
                            className="flex-1 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition-all"
                          >
                            Confirmar
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmComplete(false)}
                            className="flex-1 py-2 rounded-lg bg-white/[0.05] text-slate-400 text-xs font-bold transition-all"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmComplete(true)}
                        className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-semibold transition-all"
                      >
                        <CheckCircle2 size={13} />
                        Marcar como concluído
                      </button>
                    )
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                      <Trophy size={14} className="text-emerald-400" />
                      <span className="text-xs text-emerald-400 font-semibold">
                        Concluído em {habit.fastingCompletedAt
                          ? formatDate(new Date(habit.fastingCompletedAt))
                          : '—'}
                      </span>
                    </div>
                  )}

                  {confirmReset ? (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.08] p-3 space-y-2">
                      <p className="text-[11px] text-amber-400 font-medium">Reiniciar o streak do jejum?</p>
                      <p className="text-[10px] text-amber-500/70">O maior streak será preservado no histórico.</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleReset}
                          className="flex-1 py-2 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30 transition-all"
                        >
                          Reiniciar
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmReset(false)}
                          className="flex-1 py-2 rounded-lg bg-white/[0.05] text-slate-400 text-xs font-bold transition-all"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmReset(true)}
                      className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-amber-400 text-xs font-semibold transition-all"
                    >
                      <Flame size={13} />
                      Reiniciar jejum (novo ciclo)
                    </button>
                  )}
                </div>

                {/* History */}
                {habit.completedCycles > 0 && (
                  <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold mb-2">Histórico</p>
                    <div className="flex gap-4">
                      <div>
                        <div className="text-xl font-black tabular-nums" style={{ color: habit.color }}>
                          {habit.completedCycles}
                        </div>
                        <div className="text-[10px] text-slate-600">ciclos completos</div>
                      </div>
                      <div>
                        <div className="text-xl font-black tabular-nums text-emerald-400">
                          {habit.longestStreak ?? 0}
                        </div>
                        <div className="text-[10px] text-slate-600">maior streak</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-white/[0.07] flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  style={{ background: `linear-gradient(135deg, ${habit.color}, ${habit.color}cc)` }}
                >
                  Salvar configuração
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
