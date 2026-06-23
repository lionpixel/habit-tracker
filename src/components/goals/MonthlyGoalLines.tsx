'use client'

import { Plus } from 'lucide-react'
import { cn } from '@/lib/helpers'
import type { MonthlyGoal } from '@/types/goals'

// ── Types ─────────────────────────────────────

interface MonthlyGoalLinesProps {
  goals:      MonthlyGoal[]
  month:      string        // ex: "Junho" ou "Junho 2026"
  variant:    'board' | 'home'
  onNewGoal?: () => void
}

// ── Constants ─────────────────────────────────

const CATEGORY_LABEL: Record<string, string> = {
  saude:      'Saúde',
  financeiro: 'Fin.',
  habito:     'Hábito',
  projeto:    'Projeto',
  outro:      'Outro',
}

// ── Component ─────────────────────────────────

export function MonthlyGoalLines({ goals, month, variant, onNewGoal }: MonthlyGoalLinesProps) {
  const completed = goals.filter((g) => g.status === 'done').length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{month}</span>
          <span className="text-xs text-white/40">
            {completed}/{goals.length} concluídas
          </span>
        </div>
        {onNewGoal && (
          <button
            onClick={onNewGoal}
            className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Nova meta
          </button>
        )}
      </div>

      {/* Separator */}
      <div className="border-t border-white/10 mb-2" />

      {/* Goal lines */}
      {goals.length === 0 ? (
        <p className="text-xs text-white/30 py-3">
          Nenhuma meta para este mês.{' '}
          {onNewGoal && (
            <button
              onClick={onNewGoal}
              className="text-violet-400 hover:text-violet-300 transition-colors"
            >
              Adicionar
            </button>
          )}
        </p>
      ) : (
        <div className="space-y-1.5">
          {goals.map((goal) => {
            const pct = goal.targetValue && goal.targetValue > 0 && goal.currentValue != null
              ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
              : goal.status === 'done' ? 100 : 0

            const barColor =
              goal.status === 'done'     ? 'bg-emerald-500' :
              pct >= 70                  ? 'bg-emerald-500' :
              pct >= 40                  ? 'bg-yellow-500'  : 'bg-red-500'

            const dotColor =
              goal.status === 'done'     ? 'bg-emerald-400' :
              pct > 0                    ? 'bg-yellow-400'  : 'bg-white/20'

            const valueLabel =
              goal.currentValue != null && goal.targetValue != null
                ? `${goal.currentValue}/${goal.targetValue}${goal.targetUnit ? ' ' + goal.targetUnit : ''}`
                : goal.status === 'done'
                  ? 'Concluída'
                  : '—'

            return (
              <div
                key={goal.id}
                className="flex items-center gap-2.5 py-1.5"
              >
                {/* Status dot */}
                <div className={cn('w-2 h-2 rounded-full shrink-0', dotColor)} />

                {/* Title */}
                <span
                  className={cn(
                    'text-sm flex-1 min-w-0 truncate',
                    goal.status === 'done' || goal.status === 'cancelled'
                      ? 'text-white/40 line-through'
                      : 'text-white/80',
                  )}
                >
                  {goal.title}
                </span>

                {/* Value */}
                <span className="text-xs text-white/40 shrink-0 w-20 text-right tabular-nums">
                  {valueLabel}
                </span>

                {/* Progress bar — only on board variant */}
                {variant === 'board' && (
                  <div className="w-16 h-1.5 bg-white/10 rounded-full shrink-0">
                    <div
                      className={cn('h-full rounded-full transition-all', barColor)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}

                {/* Percentage */}
                <span className="text-xs text-white/40 shrink-0 w-8 text-right tabular-nums">
                  {pct}%
                </span>

                {/* Category */}
                <span className="text-xs text-white/25 shrink-0 w-12 text-right">
                  {CATEGORY_LABEL[goal.category ?? ''] ?? (goal.category ?? '')}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
