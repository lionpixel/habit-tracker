// ─────────────────────────────────────────────
//  Component: Project Form Modal
// ─────────────────────────────────────────────

'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Check, Plus, Trash2 } from 'lucide-react'
import * as Icons from 'lucide-react'
import { useGoalsStore } from '@/store/goalsStore'
import {
  PRIORITY_LABELS, PRIORITY_COLORS, STATUS_LABELS,
  GOAL_ICONS, GOAL_COLORS, GOAL_CATEGORY_OPTIONS,
} from '@/types/goals'
import type { Project, GoalStatus, GoalPriority } from '@/types/goals'
import { cn } from '@/lib/helpers'

function LucideIcon({ name, size = 14, style }: { name: string; size?: number; style?: React.CSSProperties }) {
  const Icon = (Icons as Record<string, unknown>)[name] as React.FC<{ size?: number; style?: React.CSSProperties }> | undefined
  if (!Icon) return null
  return <Icon size={size} style={style} />
}

interface ProjectFormModalProps {
  open:    boolean
  project?: Project | null
  onClose: () => void
}

export function ProjectFormModal({ open, project, onClose }: ProjectFormModalProps) {
  const { addProject, updateProject, deleteProject, addMilestone } = useGoalsStore()
  const isEdit = !!project

  const [name,       setName]       = useState('')
  const [description,setDescription]= useState('')
  const [category,   setCategory]   = useState('')
  const [icon,       setIcon]       = useState(GOAL_ICONS[0])
  const [color,      setColor]      = useState(GOAL_COLORS[0])
  const [priority,   setPriority]   = useState<GoalPriority>('medium')
  const [status,     setStatus]     = useState<GoalStatus>('not_started')
  const [progress,   setProgress]   = useState(0)
  const [startDate,  setStartDate]  = useState('')
  const [deadline,   setDeadline]   = useState('')
  const [notes,      setNotes]      = useState('')
  const [newMilestone, setNewMilestone] = useState('')
  const [confirmDel, setConfirmDel] = useState(false)

  useEffect(() => {
    if (open) {
      setName(       project?.name        ?? '')
      setDescription(project?.description ?? '')
      setCategory(   project?.category    ?? '')
      setIcon(       project?.icon        ?? GOAL_ICONS[0])
      setColor(      project?.color       ?? GOAL_COLORS[0])
      setPriority(   project?.priority    ?? 'medium')
      setStatus(     project?.status      ?? 'not_started')
      setProgress(   project?.progress    ?? 0)
      setStartDate(  project?.startDate   ?? '')
      setDeadline(   project?.deadline    ?? '')
      setNotes(      project?.notes       ?? '')
      setNewMilestone('')
      setConfirmDel(false)
    }
  }, [open, project])

  const c = color

  function handleSave() {
    if (!name.trim()) return
    const data = {
      name: name.trim(), description: description || undefined,
      category: category || undefined, icon, color, priority, status, progress,
      startDate: startDate || undefined, deadline: deadline || undefined,
      notes: notes || undefined, linkedGoalIds: project?.linkedGoalIds ?? [],
    }
    if (isEdit && project) {
      updateProject(project.id, data)
    } else {
      addProject(data)
    }
    onClose()
  }

  function handleAddMilestone() {
    if (!newMilestone.trim() || !isEdit || !project) return
    addMilestone(project.id, { title: newMilestone.trim(), completed: false })
    setNewMilestone('')
  }

  const PRIORITIES: GoalPriority[] = ['critical', 'high', 'medium', 'low']
  const STATUSES: GoalStatus[]     = ['not_started', 'in_progress', 'done', 'cancelled']

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
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
                <h3 className="font-bold text-slate-100">{isEdit ? 'Editar Projeto' : 'Novo Projeto'}</h3>
                <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-slate-400 hover:text-slate-200"><X size={15} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Nome *</label>
                  <input className="w-full bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={name} onChange={(e) => setName(e.target.value)} placeholder="ex: Lançar produto X" />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Descrição</label>
                  <textarea rows={2} className="w-full bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                    value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Início</label>
                    <input type="date" className="w-full bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Prazo</label>
                    <input type="date" className="w-full bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Prioridade</label>
                  <div className="flex gap-2 flex-wrap">
                    {PRIORITIES.map((p) => (
                      <button key={p} type="button" onClick={() => setPriority(p)}
                        className={cn('px-3 py-1.5 rounded-lg text-xs font-bold transition-all', priority === p ? 'text-white' : 'bg-white/[0.05] text-slate-500 hover:text-slate-300')}
                        style={priority === p ? { background: PRIORITY_COLORS[p] } : undefined}>
                        {PRIORITY_LABELS[p]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status + progress */}
                {isEdit && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Status</label>
                      <select className="w-full bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={status} onChange={(e) => setStatus(e.target.value as GoalStatus)}>
                        {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Progresso: {progress}%</label>
                      <input type="range" min={0} max={100} className="w-full mt-2"
                        value={progress} onChange={(e) => setProgress(Number(e.target.value))} />
                    </div>
                  </div>
                )}

                {/* Category */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Categoria</label>
                  <div className="flex flex-wrap gap-2">
                    {GOAL_CATEGORY_OPTIONS.map((cat) => (
                      <button key={cat} type="button" onClick={() => setCategory(category === cat ? '' : cat)}
                        className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold transition-all',
                          category === cat ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40' : 'bg-white/[0.05] text-slate-500 hover:text-slate-400')}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icon + Color */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Ícone</label>
                    <div className="flex flex-wrap gap-1.5">
                      {GOAL_ICONS.slice(0, 8).map((ic) => (
                        <button key={ic} type="button" onClick={() => setIcon(ic)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                          style={icon === ic ? { background: `${c}20` } : { background: 'rgba(255,255,255,0.05)' }}>
                          <LucideIcon name={ic} size={14} style={{ color: icon === ic ? c : '#64748b' }} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Cor</label>
                    <div className="flex flex-wrap gap-2">
                      {GOAL_COLORS.slice(0, 8).map((col) => (
                        <button key={col} type="button" onClick={() => setColor(col)}
                          className="w-7 h-7 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                          style={{ backgroundColor: col }}>
                          {color === col && <Check size={11} className="text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Milestones (edit mode) */}
                {isEdit && project && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Marcos do Projeto</label>
                    <div className="flex gap-2 mb-2">
                      <input className="flex-1 bg-white/[0.06] rounded-lg px-3 py-2 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Nome do marco..."
                        value={newMilestone}
                        onChange={(e) => setNewMilestone(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddMilestone()}
                      />
                      <button type="button" onClick={handleAddMilestone}
                        className="px-3 py-2 rounded-lg bg-indigo-500/20 text-indigo-300 text-sm font-semibold hover:bg-indigo-500/30">
                        <Plus size={15} />
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-600">{project.milestones.length} marcos cadastrados</div>
                  </div>
                )}

                {/* Delete */}
                {isEdit && project && (
                  confirmDel ? (
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { deleteProject(project.id); onClose() }}
                        className="flex-1 py-2 rounded-xl bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30">Confirmar exclusão</button>
                      <button type="button" onClick={() => setConfirmDel(false)}
                        className="flex-1 py-2 rounded-xl bg-white/[0.05] text-slate-400 text-xs font-medium">Cancelar</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setConfirmDel(true)}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/[0.04] hover:bg-red-500/10 text-slate-500 hover:text-red-400 text-xs font-medium transition-colors">
                      <Trash2 size={13} /> Excluir projeto
                    </button>
                  )
                )}
              </div>

              <div className="flex gap-3 px-6 py-4 border-t border-white/[0.06] flex-shrink-0">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/[0.05] text-slate-400 text-sm font-semibold hover:bg-white/[0.08]">Cancelar</button>
                <button type="button" onClick={handleSave} disabled={!name.trim()}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${c}, ${c}99)` }}>
                  {isEdit ? 'Salvar' : 'Criar Projeto'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
