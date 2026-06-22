'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Edit2, Trash2, Star, Pause, Play, Trophy, Calendar, DollarSign } from 'lucide-react'
import { cn } from '@/lib/helpers'
import type { Dream } from '@/types/dreams'
import { DREAM_CATEGORIES } from '@/types/dreams'
import { useDreamsStore } from '@/store/dreamsStore'
import { formatBRL } from '@/lib/formatBRL'

interface DreamCardProps {
  dream:   Dream
  onEdit:  (dream: Dream) => void
}

export function DreamCard({ dream, onEdit }: DreamCardProps) {
  const { deleteDream, setStatus } = useDreamsStore()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const cat          = DREAM_CATEGORIES[dream.category]
  const hasFinancial = !!(dream.financialTarget && dream.financialTarget > 0)
  const financialPct = hasFinancial
    ? Math.min(100, Math.round(((dream.financialCurrent ?? 0) / dream.financialTarget!) * 100))
    : 0

  const handleDelete = () => {
    if (confirmDelete) {
      deleteDream(dream.id)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 2500)
    }
  }

  const isPaused   = dream.status === 'paused'
  const isAchieved = dream.status === 'achieved'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        'relative rounded-2xl overflow-hidden border group transition-all duration-300',
        'hover:shadow-xl hover:-translate-y-0.5',
        isAchieved ? 'border-emerald-500/30 shadow-emerald-500/5'
          : isPaused  ? 'border-slate-700/50'
          : 'border-white/[0.06] hover:border-white/10',
      )}
      style={{
        background: isAchieved
          ? 'linear-gradient(160deg, #0a1a12, #0d1120)'
          : 'linear-gradient(160deg, #0d1120, #090c17)',
        boxShadow: isAchieved ? '0 0 30px rgba(16,185,129,0.06)' : undefined,
      }}
    >
      {/* ── Image / Emoji hero ── */}
      <div className="relative h-44 overflow-hidden bg-[#080b14]">
        {dream.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dream.imageUrl}
            alt={dream.title}
            className={cn(
              'w-full h-full object-cover transition-transform duration-700 group-hover:scale-105',
              isPaused && 'grayscale opacity-50',
            )}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: `radial-gradient(ellipse at center, ${cat.color}18 0%, transparent 70%)`,
              opacity: isPaused ? 0.5 : 1,
            }}
          >
            <div className="w-10 h-10 rounded-full" style={{ background: `${cat.color}30`, border: `2px solid ${cat.color}60` }} />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1120] via-[#0d1120]/30 to-transparent" />

        {/* Status pill */}
        {isAchieved && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/90 backdrop-blur-sm text-white text-[11px] font-bold shadow-lg">
            <Trophy className="w-3 h-3" />
            Conquistado
          </div>
        )}
        {isPaused && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-700/90 backdrop-blur-sm text-slate-400 text-[11px] font-bold">
            <Pause className="w-3 h-3" />
            Pausado
          </div>
        )}

        {/* Category chip */}
        <div
          className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-sm"
          style={{ background: `${cat.color}22`, color: cat.color, border: `1px solid ${cat.color}44` }}
        >
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
          {cat.label}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-4 space-y-3">
        <h3 className="font-bold text-slate-100 text-sm leading-snug line-clamp-2">
          {dream.title}
        </h3>

        {dream.description && (
          <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
            {dream.description}
          </p>
        )}

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Progresso</span>
            <span
              className="text-xs font-bold tabular-nums"
              style={{ color: dream.progress >= 100 ? '#10b981' : cat.color }}
            >
              {dream.progress}%
            </span>
          </div>
          <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${dream.progress}%` }}
              transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
              className="h-full rounded-full"
              style={{
                background: isAchieved
                  ? 'linear-gradient(90deg, #059669, #10b981)'
                  : `linear-gradient(90deg, ${cat.color}99, ${cat.color})`,
              }}
            />
          </div>
        </div>

        {/* Financial bar */}
        {hasFinancial && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[10px] text-slate-600">
                <DollarSign className="w-2.5 h-2.5" />
                Meta financeira
              </div>
              <span className="text-[10px] font-semibold text-slate-500 tabular-nums">
                {formatBRL(dream.financialCurrent ?? 0)}
                {' / '}
                {formatBRL(dream.financialTarget!)}
              </span>
            </div>
            <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${financialPct}%`, background: 'linear-gradient(90deg, #059669, #10b981)' }}
              />
            </div>
          </div>
        )}

        {/* Target date */}
        {dream.targetDate && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span>
              Prazo:{' '}
              <span className="text-slate-400 font-medium">
                {new Date(dream.targetDate + 'T00:00:00').toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
              </span>
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onEdit(dream)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold text-slate-400 bg-white/[0.04] hover:bg-white/[0.08] hover:text-slate-200 transition-all"
          >
            <Edit2 className="w-3 h-3" />
            Editar
          </button>

          {!isAchieved && (
            <button
              onClick={() => setStatus(dream.id, isPaused ? 'active' : 'paused')}
              title={isPaused ? 'Reativar' : 'Pausar'}
              className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 bg-white/[0.04] hover:bg-white/[0.08] hover:text-slate-300 transition-all"
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          )}

          {!isAchieved && dream.progress >= 80 && (
            <button
              onClick={() => setStatus(dream.id, 'achieved')}
              title="Marcar como conquistado"
              className="flex items-center justify-center w-9 h-9 rounded-xl text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all"
            >
              <Star className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleDelete}
            title={confirmDelete ? 'Confirmar exclusão' : 'Excluir'}
            className={cn(
              'flex items-center justify-center w-9 h-9 rounded-xl transition-all',
              confirmDelete
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-white/[0.04] text-slate-600 hover:bg-white/[0.08] hover:text-red-400',
            )}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
