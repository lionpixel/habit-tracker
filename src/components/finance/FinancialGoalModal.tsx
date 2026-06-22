// ─────────────────────────────────────────────
//  Component: Financial Goal Modal (create/edit + contribute)
// ─────────────────────────────────────────────

'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Check, Trash2, Plus } from 'lucide-react'
import * as Icons from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import type { FinancialGoal } from '@/types/finance'

import { formatBRL } from '@/lib/formatBRL'

function LucideIcon({ name, size = 16, style }: { name: string; size?: number; style?: React.CSSProperties }) {
  const Icon = (Icons as Record<string, unknown>)[name] as React.FC<{ size?: number; style?: React.CSSProperties }> | undefined
  if (!Icon) return null
  return <Icon size={size} style={style} />
}

const ICON_OPTIONS = ['Target','PiggyBank','Home','Car','Plane','GraduationCap','Heart','Star','Gem','Shield','Briefcase','Smartphone']
const COLOR_OPTIONS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#0ea5e9','#22d3ee','#ec4899','#f97316','#34d399']

type ModalMode = 'create' | 'edit' | 'contribute'

interface FinancialGoalModalProps {
  open:    boolean
  goal?:   FinancialGoal | null
  mode?:   ModalMode
  onClose: () => void
}

export function FinancialGoalModal({ open, goal, mode = 'create', onClose }: FinancialGoalModalProps) {
  const { addGoal, updateGoal, deleteGoal, contributeGoal } = useFinanceStore()

  const [name,    setName]    = useState('')
  const [target,  setTarget]  = useState('')
  const [current, setCurrent] = useState('')
  const [deadline,setDeadline]= useState('')
  const [icon,    setIcon]    = useState(ICON_OPTIONS[0])
  const [color,   setColor]   = useState(COLOR_OPTIONS[0])
  const [contrib, setContrib] = useState('')
  const [confirmDel, setConfirmDel] = useState(false)

  useEffect(() => {
    if (open) {
      setName(   goal?.name          ?? '')
      setTarget( goal?.targetAmount  != null ? String(goal.targetAmount)  : '')
      setCurrent(goal?.currentAmount != null ? String(goal.currentAmount) : '0')
      setDeadline(goal?.deadline ?? '')
      setIcon(   goal?.icon  ?? ICON_OPTIONS[0])
      setColor(  goal?.color ?? COLOR_OPTIONS[0])
      setContrib('')
      setConfirmDel(false)
    }
  }, [open, goal])

  const isEdit = mode === 'edit' && !!goal
  const isContrib = mode === 'contribute' && !!goal

  function handleSave() {
    if (!name.trim() || !target) return
    const data = {
      name:          name.trim(),
      targetAmount:  Number(target),
      currentAmount: Number(current) || 0,
      deadline:      deadline || undefined,
      icon,
      color,
    }
    if (isEdit) {
      updateGoal(goal.id, data)
    } else {
      addGoal(data)
    }
    onClose()
  }

  function handleContribute() {
    if (!goal || !contrib) return
    contributeGoal(goal.id, Number(contrib))
    onClose()
  }

  function handleDelete() {
    if (!goal) return
    deleteGoal(goal.id)
    onClose()
  }

  const c = color

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
            <div className="glass w-full max-w-md rounded-2xl border border-white/[0.08] shadow-modal pointer-events-auto overflow-hidden">
              <div className="h-[3px]" style={{ background: `linear-gradient(90deg, ${c}, ${c}60, transparent)` }} />
              <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <h3 className="font-bold text-slate-100">
                  {isContrib ? `Contribuir — ${goal?.name}` : isEdit ? 'Editar Meta' : 'Nova Meta Financeira'}
                </h3>
                <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-slate-400 hover:text-slate-200">
                  <X size={15} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {isContrib ? (
                  <>
                    <div className="text-center py-2">
                      <div className="text-2xl font-black text-slate-100">{formatBRL(goal!.currentAmount)}</div>
                      <div className="text-xs text-slate-500">de {formatBRL(goal!.targetAmount)}</div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Valor a Contribuir (R$)</label>
                      <input
                        type="number" min={0} step="any"
                        className="w-full bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="ex: 500"
                        value={contrib}
                        onChange={(e) => setContrib(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/[0.05] text-slate-400 text-sm font-semibold">Cancelar</button>
                      <button type="button" onClick={handleContribute} disabled={!contrib}
                        className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40"
                        style={{ background: `linear-gradient(135deg, ${c}, ${c}99)` }}
                      >
                        <Plus size={15} /> Contribuir
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Name */}
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Nome da Meta</label>
                      <input
                        className="w-full bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="ex: Reserva de emergência"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Valor Alvo (R$)</label>
                        <input type="number" min={0} step="any"
                          className="w-full bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          placeholder="ex: 10000"
                          value={target}
                          onChange={(e) => setTarget(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Atual (R$)</label>
                        <input type="number" min={0} step="any"
                          className="w-full bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          placeholder="ex: 0"
                          value={current}
                          onChange={(e) => setCurrent(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Prazo (YYYY-MM, opcional)</label>
                      <input
                        className="w-full bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="ex: 2025-12"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                      />
                    </div>

                    {/* Icon */}
                    <div>
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ícone</div>
                      <div className="flex flex-wrap gap-1.5">
                        {ICON_OPTIONS.map((ic) => (
                          <button key={ic} type="button" onClick={() => setIcon(ic)}
                            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                            style={icon === ic ? { background: `${c}20` } : { background: 'rgba(255,255,255,0.05)' }}
                          >
                            <LucideIcon name={ic} size={16} style={{ color: icon === ic ? c : '#64748b' }} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color */}
                    <div>
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Cor</div>
                      <div className="flex flex-wrap gap-2">
                        {COLOR_OPTIONS.map((col) => (
                          <button key={col} type="button" onClick={() => setColor(col)}
                            className="w-7 h-7 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                            style={{ backgroundColor: col }}
                          >
                            {color === col && <Check size={11} className="text-white" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Delete */}
                    {isEdit && (
                      confirmDel ? (
                        <div className="flex gap-2">
                          <button type="button" onClick={handleDelete} className="flex-1 py-2 rounded-xl bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30">Confirmar</button>
                          <button type="button" onClick={() => setConfirmDel(false)} className="flex-1 py-2 rounded-xl bg-white/[0.05] text-slate-400 text-xs font-medium">Cancelar</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setConfirmDel(true)}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/[0.04] hover:bg-red-500/10 text-slate-500 hover:text-red-400 text-xs font-medium transition-colors"
                        >
                          <Trash2 size={13} /> Excluir meta
                        </button>
                      )
                    )}

                    <div className="flex gap-3 pt-1">
                      <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/[0.05] text-slate-400 text-sm font-semibold hover:bg-white/[0.08]">Cancelar</button>
                      <button type="button" onClick={handleSave} disabled={!name.trim() || !target}
                        className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-40"
                        style={{ background: `linear-gradient(135deg, ${c}, ${c}99)` }}
                      >
                        {isEdit ? 'Salvar' : 'Criar Meta'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
