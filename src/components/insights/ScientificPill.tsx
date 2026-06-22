'use client'

// ─────────────────────────────────────────────
//  ScientificPill — Pill clicável com fato científico + InsightTooltip
// ─────────────────────────────────────────────

import { cn } from '@/lib/helpers'
import type { ScientificFact } from '@/lib/benchmarks'
import type { MetricContext } from '@/lib/insightsEngine'
import { InsightTooltip } from './InsightTooltip'

const CATEGORY_ICON: Record<string, string> = {
  neurociencia: '🧠',
  beneficio:    '✅',
  abandono:     '⚠️',
  comparacao:   '📊',
  financeiro:   '💰',
  sono:         '😴',
  corpo:        '💪',
}

const CATEGORY_STYLE: Record<string, string> = {
  neurociencia: 'bg-violet-500/10 border-violet-500/20 text-violet-300 hover:bg-violet-500/20',
  beneficio:    'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20',
  abandono:     'bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20',
  comparacao:   'bg-blue-500/10 border-blue-500/20 text-blue-300 hover:bg-blue-500/20',
  financeiro:   'bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20',
  sono:         'bg-indigo-500/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20',
  corpo:        'bg-cyan-500/10 border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20',
}

interface ScientificPillProps {
  fact: ScientificFact
  ctx: MetricContext
  className?: string
  compact?: boolean
}

export function ScientificPill({ fact, ctx, className, compact = false }: ScientificPillProps) {
  const style = CATEGORY_STYLE[fact.category] ?? CATEGORY_STYLE.comparacao
  const icon  = CATEGORY_ICON[fact.category] ?? '📊'

  const ctxWithFact: MetricContext = {
    ...ctx,
    triggeredFact: fact,
  }

  return (
    <InsightTooltip ctx={ctxWithFact} position="auto" triggerMode="hover">
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl',
          'border text-[11px] font-medium cursor-pointer',
          'transition-all duration-200 select-none',
          style,
          className,
        )}
      >
        <span className="flex-shrink-0">{icon}</span>

        {!compact && (
          <span className="truncate max-w-[180px] leading-tight">
            {fact.stat.length > 55 ? fact.stat.slice(0, 52) + '…' : fact.stat}
          </span>
        )}

        {/* Percentage mini bar */}
        <div className="flex-shrink-0 flex items-center gap-1 ml-auto">
          <div className="w-8 h-1 bg-white/[0.08] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-current opacity-60"
              style={{ width: `${Math.min(fact.percentage, 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-bold tabular-nums opacity-70">
            {fact.percentage}%
          </span>
        </div>
      </div>
    </InsightTooltip>
  )
}

// Renderiza uma lista de pills para um módulo
interface ScientificPillsRowProps {
  facts: ScientificFact[]
  ctx: Omit<MetricContext, 'triggeredFact'>
  max?: number
  className?: string
}

export function ScientificPillsRow({ facts, ctx, max = 3, className }: ScientificPillsRowProps) {
  const visible = facts.slice(0, max)

  if (visible.length === 0) return null

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {visible.map((fact, i) => (
        <ScientificPill key={i} fact={fact} ctx={ctx as MetricContext} />
      ))}
    </div>
  )
}
