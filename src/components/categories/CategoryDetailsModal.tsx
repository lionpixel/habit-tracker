// ─────────────────────────────────────────────
//  Component: Category Details Modal
// ─────────────────────────────────────────────

'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Target, TrendingUp, Edit2, Archive, Trash2, Check } from 'lucide-react'
import * as Icons from 'lucide-react'
import { cn, formatTime } from '@/lib/helpers'
import { useCategoryStore } from '@/store/categoryStore'
import type { HabitCategory, CategoryStats } from '@/types/category'

interface CategoryDetailsModalProps {
  open:      boolean
  category:  HabitCategory | null
  stats?:    CategoryStats
  onClose:   () => void
}

function LucideIcon({ name, size = 18, style }: { name: string; size?: number; style?: React.CSSProperties }) {
  const Icon = (Icons as Record<string, unknown>)[name] as React.FC<{ size?: number; style?: React.CSSProperties }> | undefined
  if (!Icon) return null
  return <Icon size={size} style={style} />
}

const ICON_OPTIONS = [
  'Heart','Moon','Dumbbell','Apple','BookOpen','GraduationCap',
  'Briefcase','Zap','Sparkles','TrendingUp','Users','Brain',
  'Target','Smile','Home','Star','Music','Camera','Coffee','Leaf',
]

const COLOR_OPTIONS = [
  '#ef4444','#f97316','#f59e0b','#10b981','#06b6d4','#3b82f6',
  '#8b5cf6','#ec4899','#6366f1','#14b8a6','#a78bfa','#34d399',
]

export function CategoryDetailsModal({ open, category, stats, onClose }: CategoryDetailsModalProps) {
  const { updateCategory, archiveCategory, deleteCategory } = useCategoryStore()

  const [editing, setEditing]         = useState(false)
  const [name, setName]               = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon]               = useState('')
  const [color, setColor]             = useState('')
  const [weeklyGoal, setWeeklyGoal]   = useState('')
  const [monthlyGoal, setMonthlyGoal] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (category) {
      setName(category.name)
      setDescription(category.description)
      setIcon(category.icon)
      setColor(category.color)
      setWeeklyGoal(category.weeklyGoalMin ? String(category.weeklyGoalMin) : '')
      setMonthlyGoal(category.monthlyGoalMin ? String(category.monthlyGoalMin) : '')
      setEditing(false)
      setConfirmDelete(false)
    }
  }, [category, open])

  if (!category) return null

  function handleSave() {
    if (!category) return
    updateCategory(category.id, {
      name:            name.trim() || category.name,
      description:     description.trim(),
      icon,
      color,
      weeklyGoalMin:   weeklyGoal  ? Number(weeklyGoal)  : undefined,
      monthlyGoalMin:  monthlyGoal ? Number(monthlyGoal) : undefined,
    })
    setEditing(false)
  }

  function handleArchive() {
    if (!category) return
    archiveCategory(category.id)
    onClose()
  }

  function handleDelete() {
    if (!category || category.isDefault) return
    deleteCategory(category.id)
    onClose()
  }

  const c = color

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            <div
              className="glass w-full max-w-lg rounded-2xl border border-white/[0.08] shadow-modal pointer-events-auto overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Top accent */}
              <div className="h-[3px]" style={{ background: `linear-gradient(90deg, ${c}, ${c}60, transparent)` }} />

              {/* Header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${c}1a` }}
                >
                  <LucideIcon name={icon} size={20} style={{ color: c }} />
                </div>
                <div className="flex-1 min-w-0">
                  {editing ? (
                    <input
                      className="bg-white/[0.06] rounded-lg px-3 py-1.5 text-slate-200 font-bold w-full text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  ) : (
                    <h2 className="font-bold text-slate-100 text-lg">{category.name}</h2>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!editing && (
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Stats */}
                {stats && (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Streak',   value: `${stats.streak}d`,         color: c },
                      { label: 'Consist.', value: `${stats.consistency}%`,    color: '#10b981' },
                      { label: 'Score',    value: `${stats.score}/100`,       color: '#8b5cf6' },
                      { label: 'Semana',   value: formatTime(stats.weekMinutes),  color: '#0ea5e9' },
                      { label: 'Mês',      value: formatTime(stats.monthMinutes), color: '#f59e0b' },
                      { label: 'Total',    value: formatTime(stats.totalMinutes), color: '#6366f1' },
                    ].map(({ label, value, color: col }) => (
                      <div key={label} className="card p-3 text-center">
                        <div className="text-sm font-black tabular-nums" style={{ color: col }}>{value}</div>
                        <div className="text-[9px] text-slate-600 uppercase tracking-wider mt-0.5">{label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {editing ? (
                  <div className="space-y-4">
                    {/* Description */}
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
                        Descrição
                      </label>
                      <textarea
                        rows={2}
                        className="w-full bg-white/[0.06] rounded-lg px-3 py-2 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    {/* Icon picker */}
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                        Ícone
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {ICON_OPTIONS.map((ic) => (
                          <button
                            key={ic}
                            type="button"
                            onClick={() => setIcon(ic)}
                            className={cn(
                              'w-9 h-9 rounded-lg flex items-center justify-center transition-all',
                              icon === ic
                                ? 'ring-2 ring-offset-1 ring-offset-[#0f172a]'
                                : 'bg-white/[0.05] hover:bg-white/[0.1]',
                            )}
                            style={icon === ic ? { background: `${c}20` } : undefined}
                          >
                            <LucideIcon name={ic} size={16} style={{ color: icon === ic ? c : '#64748b' }} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color picker */}
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                        Cor
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {COLOR_OPTIONS.map((col) => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => setColor(col)}
                            className="w-7 h-7 rounded-full transition-transform hover:scale-110 flex items-center justify-center"
                            style={{ backgroundColor: col }}
                          >
                            {color === col && <Check size={12} className="text-white" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Goals */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
                          Meta Semanal (min)
                        </label>
                        <input
                          type="number"
                          min={0}
                          className="w-full bg-white/[0.06] rounded-lg px-3 py-2 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          value={weeklyGoal}
                          onChange={(e) => setWeeklyGoal(e.target.value)}
                          placeholder="ex: 300"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
                          Meta Mensal (min)
                        </label>
                        <input
                          type="number"
                          min={0}
                          className="w-full bg-white/[0.06] rounded-lg px-3 py-2 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          value={monthlyGoal}
                          onChange={(e) => setMonthlyGoal(e.target.value)}
                          placeholder="ex: 1200"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-slate-400 text-sm">{category.description}</p>
                    {(category.weeklyGoalMin || category.monthlyGoalMin) && (
                      <div className="flex gap-3">
                        {category.weeklyGoalMin && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Target size={13} style={{ color: c }} />
                            Semana: {formatTime(category.weeklyGoalMin)}
                          </div>
                        )}
                        {category.monthlyGoalMin && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <TrendingUp size={13} style={{ color: c }} />
                            Mês: {formatTime(category.monthlyGoalMin)}
                          </div>
                        )}
                      </div>
                    )}
                    {category.habitKeys.length > 0 && (
                      <div className="text-xs text-slate-500">
                        {category.habitKeys.length} hábito{category.habitKeys.length > 1 ? 's' : ''} vinculado{category.habitKeys.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                )}

                {/* Danger zone */}
                {!editing && (
                  <div className="border border-white/[0.06] rounded-xl p-4 space-y-2">
                    <div className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider mb-3">Ações</div>
                    <button
                      type="button"
                      onClick={handleArchive}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-amber-400 text-xs font-medium transition-colors"
                    >
                      <Archive size={14} />
                      {category.archived ? 'Desarquivar categoria' : 'Arquivar categoria'}
                    </button>
                    {!category.isDefault && (
                      confirmDelete ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleDelete}
                            className="flex-1 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30 transition-colors"
                          >
                            Confirmar exclusão
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(false)}
                            className="flex-1 px-3 py-2 rounded-lg bg-white/[0.05] text-slate-400 text-xs font-medium hover:bg-white/[0.08] transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(true)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-red-500/10 text-slate-400 hover:text-red-400 text-xs font-medium transition-colors"
                        >
                          <Trash2 size={14} />
                          Excluir categoria
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              {editing && (
                <div className="flex gap-3 px-6 py-4 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/[0.05] text-slate-400 text-sm font-semibold hover:bg-white/[0.08] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:scale-[1.01]"
                    style={{ background: `linear-gradient(135deg, ${c}, ${c}99)` }}
                  >
                    Salvar
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
