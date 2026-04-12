'use client'

import { cn } from '@/lib/helpers'
import { useHabits } from '@/hooks/useHabits'
import type { InsightType } from '@/types/habit'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  Award, TrendingUp, Flame, CheckCircle2, BarChart3,
  AlertTriangle, Sunrise, Calendar, Sparkles, LucideProps,
} from 'lucide-react'
import type { ComponentType } from 'react'

// ── Icon registry for insight iconIds ────────
const INSIGHT_ICONS: Record<string, ComponentType<LucideProps>> = {
  Award, TrendingUp, Flame, CheckCircle2, BarChart3,
  AlertTriangle, Sunrise, Calendar, Sparkles,
}

function InsightIcon({ id, className }: { id: string; className?: string }) {
  const Icon = INSIGHT_ICONS[id] ?? Sparkles
  return <Icon className={className} strokeWidth={2} />
}

// ── Style map ────────────────────────────────
type StyleEntry = {
  border:    string
  bg:        string
  iconBg:    string
  iconColor: string
  dot:       string
}

const TYPE_STYLES: Record<InsightType, StyleEntry> = {
  success: {
    border:    'border-emerald-500/20',
    bg:        'bg-emerald-500/[0.05]',
    iconBg:    'bg-emerald-500/12',
    iconColor: 'text-emerald-400',
    dot:       'bg-emerald-400',
  },
  warning: {
    border:    'border-amber-500/20',
    bg:        'bg-amber-500/[0.05]',
    iconBg:    'bg-amber-500/12',
    iconColor: 'text-amber-400',
    dot:       'bg-amber-400',
  },
  info: {
    border:    'border-violet-500/20',
    bg:        'bg-violet-500/[0.05]',
    iconBg:    'bg-violet-500/12',
    iconColor: 'text-violet-400',
    dot:       'bg-violet-400',
  },
  tip: {
    border:    'border-cyan-500/20',
    bg:        'bg-cyan-500/[0.04]',
    iconBg:    'bg-cyan-500/12',
    iconColor: 'text-cyan-400',
    dot:       'bg-cyan-400',
  },
}

const PRIORITY_BADGE: Record<string, string> = {
  high:   'text-red-400 bg-red-500/10 border-red-500/20',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  low:    'text-slate-500 bg-white/[0.04] border-white/[0.06]',
}

const CATEGORY_LABEL: Record<string, string> = {
  performance: 'Desempenho',
  risk:        'Risco',
  streak:      'Sequência',
  trend:       'Tendência',
  goal:        'Meta',
}

export function InsightCards() {
  const { insights } = useHabits()

  if (insights.length === 0) {
    return (
      <div className="card p-5">
        <EmptyState
          icon={<Sparkles className="w-5 h-5 text-slate-600" />}
          title="Ainda sem insights"
          description="Registre algumas sessões e geraremos análises personalizadas"
          size="sm"
        />
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {insights.map((insight, i) => {
        const style = TYPE_STYLES[insight.type]

        return (
          <div
            key={i}
            className={cn(
              'p-4 rounded-2xl border transition-all duration-200 cursor-default',
              'hover:translate-x-1',
              style.border,
              style.bg,
            )}
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="flex gap-3 items-start">
              {/* Icon */}
              <div className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
                style.iconBg,
              )}>
                <InsightIcon id={insight.iconId} className={cn('w-4 h-4', style.iconColor)} />
              </div>

              <div className="flex-1 min-w-0">
                {/* Title row */}
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', style.dot)} />
                  <h4 className="text-sm font-bold text-slate-200 leading-tight">{insight.title}</h4>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed">{insight.description}</p>

                {/* Footer badges */}
                <div className="flex items-center gap-2 mt-2">
                  <span className={cn(
                    'text-[10px] font-semibold px-1.5 py-0.5 rounded-md border',
                    PRIORITY_BADGE[insight.priority],
                  )}>
                    {insight.priority === 'high' ? 'Alta prioridade' : insight.priority === 'medium' ? 'Média' : 'Info'}
                  </span>
                  <span className="text-[10px] text-slate-600 font-medium">
                    {CATEGORY_LABEL[insight.category]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
