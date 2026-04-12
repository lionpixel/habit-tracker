'use client'

import { cn } from '@/lib/helpers'
import { useHabits } from '@/hooks/useHabits'
import type { RiskLevel } from '@/types/habit'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { AlertTriangle, AlertCircle, Info, CheckCircle2, Lightbulb } from 'lucide-react'

type LevelStyle = {
  border: string
  bg: string
  Icon: React.ComponentType<{ className?: string }>
  badge: 'emerald' | 'amber' | 'red' | 'cyan'
  label: string
  iconColor: string
}

const LEVEL_STYLES: Record<RiskLevel, LevelStyle> = {
  critical: {
    border:    'border-red-500/20',
    bg:        'bg-red-500/[0.06]',
    Icon:      AlertCircle,
    badge:     'red',
    label:     'Crítico',
    iconColor: 'text-red-400',
  },
  high: {
    border:    'border-amber-500/20',
    bg:        'bg-amber-500/[0.06]',
    Icon:      AlertTriangle,
    badge:     'amber',
    label:     'Alto',
    iconColor: 'text-amber-400',
  },
  medium: {
    border:    'border-cyan-500/20',
    bg:        'bg-cyan-500/[0.05]',
    Icon:      Info,
    badge:     'cyan',
    label:     'Médio',
    iconColor: 'text-cyan-400',
  },
}

export function RiskAlerts() {
  const { risks } = useHabits()

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
        const style = LEVEL_STYLES[risk.level]
        const Icon  = style.Icon

        return (
          <div
            key={risk.habitKey}
            className={cn(
              'p-4 rounded-2xl border transition-all duration-200',
              'hover:border-white/[0.12] animate-slide-in-right',
              style.border,
              style.bg,
            )}
            style={{ animationDelay: `${i * 80}ms` }}
            role="alert"
          >
            <div className="flex gap-3 items-start">
              <div className={cn('mt-0.5 flex-shrink-0', style.iconColor)}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-bold text-slate-200">{risk.habitName}</span>
                  <Badge variant={style.badge} size="sm" dot>{style.label}</Badge>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-2">{risk.message}</p>
                <div className="flex items-start gap-1.5">
                  <Lightbulb className="w-3 h-3 text-slate-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-500 leading-relaxed">{risk.suggestion}</p>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
