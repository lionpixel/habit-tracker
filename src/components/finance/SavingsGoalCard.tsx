// ─────────────────────────────────────────────
//  Component: Savings Goal Card
// ─────────────────────────────────────────────

'use client'

import { Target, Plus } from 'lucide-react'
import * as Icons from 'lucide-react'
import { cn } from '@/lib/helpers'
import type { FinancialGoal } from '@/types/finance'

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function LucideIcon({ name, size = 16, style }: { name: string; size?: number; style?: React.CSSProperties }) {
  const Icon = (Icons as Record<string, unknown>)[name] as React.FC<{ size?: number; style?: React.CSSProperties }> | undefined
  if (!Icon) return <Target size={size} style={style} />
  return <Icon size={size} style={style} />
}

interface SavingsGoalCardProps {
  goal:          FinancialGoal
  onContribute?: () => void
  onClick?:      () => void
}

export function SavingsGoalCard({ goal, onContribute, onClick }: SavingsGoalCardProps) {
  const pct     = goal.targetAmount > 0
    ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
    : 0
  const color   = goal.color ?? '#6366f1'
  const done    = pct >= 100

  return (
    <div
      className={cn('card overflow-hidden cursor-pointer hover:border-white/[0.14] transition-all')}
      onClick={onClick}
    >
      <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${color}, ${color}60, transparent)` }} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}1a` }}>
              <LucideIcon name={goal.icon ?? 'Target'} size={17} style={{ color }} />
            </div>
            <div>
              <div className="font-bold text-slate-200 text-sm leading-tight">{goal.name}</div>
              {goal.deadline && (
                <div className="text-[10px] text-slate-600 mt-0.5">até {goal.deadline}</div>
              )}
            </div>
          </div>
          {done && (
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full whitespace-nowrap">
              Concluído
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: done ? '#10b981' : color }}
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="font-black tabular-nums" style={{ color: done ? '#10b981' : color }}>
            {fmtBRL(goal.currentAmount)}
          </span>
          <span className="text-slate-600 tabular-nums">{fmtBRL(goal.targetAmount)} · {pct}%</span>
        </div>

        {onContribute && !done && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onContribute() }}
            className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-slate-200 text-[11px] font-semibold transition-colors"
          >
            <Plus size={12} />
            Contribuir
          </button>
        )}
      </div>
    </div>
  )
}
