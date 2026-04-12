'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { z } from 'zod'
import { cn } from '@/lib/helpers'
import { Button } from '@/components/ui/Button'
import { X, ListTodo, Trash2, Flag, Clock } from 'lucide-react'
import type { TaskPriority } from '@/types/focus'

// ── Schema ────────────────────────────────────

const TaskSchema = z.object({
  name:     z.string().min(1, 'Nome obrigatório').max(100),
  priority: z.enum(['P1', 'P2', 'P3']),
  notes:    z.string().max(300).optional(),
})
type TaskForm = z.infer<typeof TaskSchema>

// ── Types ─────────────────────────────────────

export interface EditableTask {
  id:        string
  name:      string
  priority:  TaskPriority
  pomodoros: number
  log:       string[]
  notes?:    string
}

interface TaskEditorModalProps {
  task:     EditableTask | null  // null = create new
  dateKey:  string               // "YYYY-MM-DD"
  open:     boolean
  onClose:  () => void
  onSave:   (task: EditableTask) => void
  onDelete?: (id: string) => void
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bg: string; border: string; desc: string }> = {
  P1: { label: 'Alta',  color: '#ef4444', bg: 'bg-red-500/15',    border: 'border-red-500/30',    desc: 'Crítico — fazer hoje' },
  P2: { label: 'Média', color: '#f59e0b', bg: 'bg-amber-500/15',  border: 'border-amber-500/30',  desc: 'Importante — esta semana' },
  P3: { label: 'Baixa', color: '#6366f1', bg: 'bg-indigo-500/15', border: 'border-indigo-500/30', desc: 'Pode esperar' },
}

export function TaskEditorModal({ task, dateKey, open, onClose, onSave, onDelete }: TaskEditorModalProps) {
  const isNew = task === null

  const [form, setForm] = useState<TaskForm>({
    name:     task?.name     ?? '',
    priority: task?.priority ?? 'P2',
    notes:    task?.notes    ?? '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof TaskForm, string>>>({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  function patch<K extends keyof TaskForm>(key: K, value: TaskForm[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => { const n = { ...e }; delete n[key]; return n })
  }

  function handleSave() {
    const result = TaskSchema.safeParse(form)
    if (!result.success) {
      const errs: typeof errors = {}
      result.error.errors.forEach((e) => {
        errs[e.path[0] as keyof TaskForm] = e.message
      })
      setErrors(errs)
      return
    }

    const saved: EditableTask = {
      id:        task?.id        ?? `task-${Date.now()}`,
      name:      form.name,
      priority:  form.priority,
      pomodoros: task?.pomodoros ?? 0,
      log:       task?.log       ?? [],
      notes:     form.notes      || undefined,
    }
    onSave(saved)
    toast.success(isNew ? 'Tarefa criada!' : 'Tarefa atualizada!')
    onClose()
  }

  function handleDelete() {
    if (task && onDelete) {
      onDelete(task.id)
      toast.info('Tarefa removida')
      onClose()
    }
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
              className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/[0.1] shadow-[0_32px_80px_rgba(0,0,0,0.7)] flex flex-col"
              style={{
                background: 'linear-gradient(135deg, rgba(13,17,23,0.98), rgba(8,11,20,0.99))',
                backdropFilter: 'blur(24px)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/[0.07]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                    <ListTodo size={16} className="text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-100">{isNew ? 'Nova Tarefa' : 'Editar Tarefa'}</h2>
                    <p className="text-[10px] text-slate-500">{dateKey}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-slate-200 flex items-center justify-center transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-5">
                {/* Name */}
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1.5">Nome da tarefa</label>
                  <input
                    className={cn('input w-full', errors.name && 'border-red-500/50')}
                    value={form.name}
                    onChange={(e) => patch('name', e.target.value)}
                    placeholder="Ex: Estudar design patterns..."
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  />
                  {errors.name && <p className="text-red-400 text-[11px] mt-1">{errors.name}</p>}
                </div>

                {/* Priority */}
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-2">
                    <span className="flex items-center gap-1.5"><Flag size={11} /> Prioridade</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['P1', 'P2', 'P3'] as TaskPriority[]).map((p) => {
                      const cfg    = PRIORITY_CONFIG[p]
                      const active = form.priority === p
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => patch('priority', p)}
                          className={cn(
                            'flex flex-col items-center p-3 rounded-xl border transition-all',
                            active
                              ? `${cfg.bg} ${cfg.border}`
                              : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06]',
                          )}
                        >
                          <span
                            className="text-base font-black tabular-nums"
                            style={{ color: active ? cfg.color : '#64748b' }}
                          >
                            {p}
                          </span>
                          <span className={cn('text-[10px] font-semibold mt-0.5', active ? '' : 'text-slate-600')}
                            style={{ color: active ? cfg.color : undefined }}
                          >
                            {cfg.label}
                          </span>
                          <span className="text-[9px] text-slate-600 mt-0.5 text-center leading-tight">{cfg.desc}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1.5">Notas (opcional)</label>
                  <textarea
                    className="input w-full resize-none h-16 text-sm leading-relaxed"
                    value={form.notes ?? ''}
                    onChange={(e) => patch('notes', e.target.value)}
                    placeholder="Contexto, links, referências..."
                  />
                </div>

                {/* Stats if editing */}
                {!isNew && task && task.pomodoros > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-indigo-500/[0.08] rounded-xl border border-indigo-500/20">
                    <Clock size={14} className="text-indigo-400" />
                    <span className="text-xs text-indigo-300 font-medium">
                      {task.pomodoros} pomodoro{task.pomodoros > 1 ? 's' : ''} registrado{task.pomodoros > 1 ? 's' : ''} — {task.pomodoros * 25} min de foco
                    </span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-white/[0.07]">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
                  {!isNew && onDelete && (
                    showDeleteConfirm ? (
                      <div className="flex gap-1.5">
                        <Button variant="danger" size="sm" onClick={handleDelete}>Confirmar</Button>
                        <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>Não</Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 flex items-center justify-center transition-all"
                        title="Remover tarefa"
                      >
                        <Trash2 size={13} />
                      </button>
                    )
                  )}
                </div>
                <Button variant="primary" size="sm" onClick={handleSave}>
                  {isNew ? 'Criar tarefa' : 'Salvar'}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
