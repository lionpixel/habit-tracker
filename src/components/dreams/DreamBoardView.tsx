'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Sparkles, Trophy, Star, TrendingUp, DollarSign } from 'lucide-react'
import { cn } from '@/lib/helpers'
import { useDreamsStore } from '@/store/dreamsStore'
import { DREAM_CATEGORIES } from '@/types/dreams'
import type { Dream, DreamCategory } from '@/types/dreams'
import { DreamCard } from './DreamCard'
import { formatBRL } from '@/lib/formatBRL'
import { DreamFormModal } from './DreamFormModal'

type Filter = 'all' | DreamCategory

const CATEGORY_FILTERS: { key: Filter; label: string; color?: string }[] = [
  { key: 'all', label: 'Todos' },
  ...Object.entries(DREAM_CATEGORIES).map(([key, val]) => ({
    key:   key as DreamCategory,
    label: val.label,
    color: val.color,
  })),
]

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
        <Sparkles size={28} className="text-violet-400" />
      </div>
      <h3 className="text-slate-300 font-bold mb-1.5">Nenhum sonho aqui</h3>
      <p className="text-slate-600 text-sm max-w-xs mb-5">
        Adicione seus sonhos e metas de vida para visualizar o que você está construindo.
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-500 transition-all shadow-lg shadow-violet-500/20"
      >
        <Plus className="w-4 h-4" />
        Adicionar sonho
      </button>
    </motion.div>
  )
}

export function DreamBoardView() {
  const { dreams } = useDreamsStore()
  const [filter, setFilter]     = useState<Filter>('all')
  const [modalOpen, setModal]   = useState(false)
  const [editing, setEditing]   = useState<Dream | undefined>()

  // ── Stats ──
  const total     = dreams.length
  const achieved  = dreams.filter((d) => d.status === 'achieved').length
  const active    = dreams.filter((d) => d.status === 'active').length
  const totalFinancial = dreams.reduce((sum, d) => sum + (d.financialTarget ?? 0), 0)
  const doneFinancial  = dreams.reduce((sum, d) => sum + (d.financialCurrent ?? 0), 0)

  // ── Filtered list ──
  const filtered = filter === 'all'
    ? dreams
    : dreams.filter((d) => d.category === filter)

  const openCreate = () => { setEditing(undefined); setModal(true) }
  const openEdit   = (dream: Dream) => { setEditing(dream); setModal(true) }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            Quadro dos Sonhos 2026
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Visualize o que você está construindo — missão por missão.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-500 transition-all shadow-lg shadow-violet-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Novo sonho
        </button>
      </div>

      {/* ── Stats ── */}
      {total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Star,       label: 'Total',        value: total,    color: '#7c3aed' },
            { icon: TrendingUp, label: 'Em progresso', value: active,   color: '#0ea5e9' },
            { icon: Trophy,     label: 'Conquistados', value: achieved, color: '#10b981' },
            {
              icon: DollarSign,
              label: 'Meta financeira',
              value: formatBRL(totalFinancial),
              sub:   doneFinancial > 0
                ? `${formatBRL(doneFinancial)} acumulado`
                : undefined,
              color: '#f59e0b',
            },
          ].map(({ icon: Icon, label, value, sub, color }) => (
            <div
              key={label}
              className="p-4 rounded-2xl border border-white/[0.05] bg-white/[0.02]"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${color}18` }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                </div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
              </div>
              <div className="text-lg font-black text-slate-100">{value}</div>
              {sub && <div className="text-[10px] text-slate-600 mt-0.5">{sub}</div>}
            </div>
          ))}
        </div>
      )}

      {/* ── Category filters ── */}
      <div className="flex gap-2 overflow-x-auto scrollable pb-1">
        {CATEGORY_FILTERS.map(({ key, label, color }) => {
          const count = key === 'all'
            ? total
            : dreams.filter((d) => d.category === key).length

          if (key !== 'all' && count === 0) return null

          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all flex-shrink-0',
                filter === key
                  ? 'bg-violet-500/15 border-violet-500/30 text-violet-300'
                  : 'bg-white/[0.03] border-white/[0.06] text-slate-500 hover:text-slate-300 hover:bg-white/[0.06]',
              )}
            >
              {color && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />}
              {label}
              {count > 0 && (
                <span
                  className={cn(
                    'ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                    filter === key ? 'bg-violet-500/30 text-violet-300' : 'bg-white/[0.06] text-slate-600',
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <EmptyState onAdd={openCreate} />
          ) : (
            filtered.map((dream) => (
              <DreamCard key={dream.id} dream={dream} onEdit={openEdit} />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Motivational footer */}
      {total > 0 && achieved > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15"
        >
          <Trophy className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-sm text-emerald-300/80">
            <span className="font-bold text-emerald-300">{achieved} sonho{achieved > 1 ? 's' : ''} conquistado{achieved > 1 ? 's' : ''}.</span>
            {' '}Cada conquista é prova de que seus outros sonhos também são possíveis.
          </p>
        </motion.div>
      )}

      {/* Modal */}
      <DreamFormModal
        open={modalOpen}
        dream={editing}
        onClose={() => setModal(false)}
      />
    </div>
  )
}
