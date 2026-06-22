'use client'

import { cn } from '@/lib/helpers'
import { useHabits } from '@/hooks/useHabits'
import type { RiskLevel } from '@/types/habit'
import { EmptyState } from '@/components/ui/EmptyState'
import { AlertTriangle, AlertCircle, Info, CheckCircle2, Lightbulb } from 'lucide-react'

type LevelConfig = {
  leftBorder: string
  bg:         string
  Icon:       React.ComponentType<{ className?: string }>
  label:      string
  iconColor:  string
  barColor:   string
  badge:      string
}

const LEVEL: Record<RiskLevel, LevelConfig> = {
  critical: {
    leftBorder: 'border-l-red-500/70',
    bg:         'bg-red-500/[0.04]',
    Icon:       AlertCircle,
    label:      'Crítico',
    iconColor:  'text-red-400',
    barColor:   '#ef4444',
    badge:      'bg-red-500/20 text-red-400 border-red-500/30',
  },
  high: {
    leftBorder: 'border-l-amber-500/70',
    bg:         'bg-amber-500/[0.04]',
    Icon:       AlertTriangle,
    label:      'Alto',
    iconColor:  'text-amber-400',
    barColor:   '#f59e0b',
    badge:      'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  medium: {
    leftBorder: 'border-l-cyan-500/60',
    bg:         'bg-cyan-500/[0.03]',
    Icon:       Info,
    label:      'Médio',
    iconColor:  'text-cyan-400',
    barColor:   '#22d3ee',
    badge:      'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  },
}

export function RiskAlerts() {
  const { risks, getWeekProgress } = useHabits()

  if (risks.length === 0) {
    return (
      <div className="card p-5">
        <EmptyState
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-400" />}
          title="Todos os hábitos estão saudáveis"
          description="Continue mantendo a consistência. Ótimo trabalho!"
          size="sm"
        />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {risks.map((risk, i) => {
        const cfg       = LEVEL[risk.level]
        const Icon      = cfg.Icon
        const weekPct   = Math.round(getWeekProgress(risk.habitKey))

        return (
          <div
            key={risk.habitKey}
            className={cn(
              'rounded-2xl border border-white/[0.07] border-l-4 overflow-hidden',
              'transition-all duration-200 hover:border-white/[0.12] hover:-translate-y-px',
              cfg.leftBorder,
              cfg.bg,
            )}
            style={{ animationDelay: `${i * 80}ms` }}
            role="alert"
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={cn('w-4 h-4 flex-shrink-0', cfg.iconColor)} />
                  <span className="text-sm font-bold text-slate-100 truncate">{risk.habitName}</span>
                </div>
                <span className={cn(
                  'text-[10px] font-semibold px-2 py-0.5 rounded-md border flex-shrink-0',
                  cfg.badge,
                )}>
                  {cfg.label}
                </span>
              </div>

              {/* Message */}
              <p className="text-xs text-slate-400 leading-relaxed mb-3">{risk.message}</p>

              {/* Suggestion */}
              <div className="flex items-start gap-1.5 mb-3">
                <Lightbulb className="w-3 h-3 text-slate-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-slate-500 leading-relaxed">{risk.suggestion}</p>
              </div>

              {/* Weekly progress bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-600 font-medium">Progresso semana atual</span>
                  <span className="text-[10px] font-bold tabular-nums" style={{ color: cfg.barColor }}>
                    {weekPct}%
                  </span>
                </div>
                <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${weekPct}%`,
                      background: cfg.barColor,
                      opacity: weekPct === 0 ? 0.3 : 1,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
