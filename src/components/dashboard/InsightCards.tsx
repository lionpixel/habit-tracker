'use client'

import { useState }               from 'react'
import { cn }                     from '@/lib/helpers'
import { useHabits }              from '@/hooks/useHabits'
import { useHistoricalInsights }  from '@/hooks/useHistoricalInsights'
import type { InsightType }       from '@/types/habit'
import type { InsightKind }       from '@/data/historicalData'
import { EmptyState }             from '@/components/ui/EmptyState'
import {
  Award, TrendingUp, TrendingDown, Flame, CheckCircle2, BarChart3,
  AlertTriangle, Sunrise, Calendar, Sparkles, Trophy,
  Languages, Brain, LucideProps,
} from 'lucide-react'
import type { ComponentType } from 'react'

// ── Icon registry ─────────────────────────────
const INSIGHT_ICONS: Record<string, ComponentType<LucideProps>> = {
  Award, TrendingUp, TrendingDown, Flame, CheckCircle2, BarChart3,
  AlertTriangle, Sunrise, Calendar, Sparkles, Trophy, Languages, Brain,
}

function InsightIcon({ id, className }: { id: string; className?: string }) {
  const Icon = INSIGHT_ICONS[id] ?? Sparkles
  return <Icon className={className} strokeWidth={2} />
}

// ── Estilos por tipo (insights semanais) ──────
type StyleEntry = { border: string; bg: string; iconBg: string; iconColor: string; dot: string }

const TYPE_STYLES: Record<InsightType, StyleEntry> = {
  success: { border: 'border-emerald-500/20', bg: 'bg-emerald-500/[0.05]', iconBg: 'bg-emerald-500/12', iconColor: 'text-emerald-400', dot: 'bg-emerald-400' },
  warning: { border: 'border-amber-500/20',   bg: 'bg-amber-500/[0.05]',   iconBg: 'bg-amber-500/12',   iconColor: 'text-amber-400',   dot: 'bg-amber-400'   },
  info:    { border: 'border-violet-500/20',  bg: 'bg-violet-500/[0.05]',  iconBg: 'bg-violet-500/12',  iconColor: 'text-violet-400',  dot: 'bg-violet-400'  },
  tip:     { border: 'border-cyan-500/20',    bg: 'bg-cyan-500/[0.04]',    iconBg: 'bg-cyan-500/12',    iconColor: 'text-cyan-400',    dot: 'bg-cyan-400'    },
}

// ── Estilos por kind (insights históricos) ────
const KIND_STYLES: Record<InsightKind, StyleEntry> = {
  positive: { border: 'border-emerald-500/20', bg: 'bg-emerald-500/[0.05]', iconBg: 'bg-emerald-500/12', iconColor: 'text-emerald-400', dot: 'bg-emerald-400' },
  neutral:  { border: 'border-violet-500/20',  bg: 'bg-violet-500/[0.05]',  iconBg: 'bg-violet-500/12',  iconColor: 'text-violet-400',  dot: 'bg-violet-400'  },
  alert:    { border: 'border-amber-500/20',   bg: 'bg-amber-500/[0.05]',   iconBg: 'bg-amber-500/12',   iconColor: 'text-amber-400',   dot: 'bg-amber-400'   },
  critical: { border: 'border-red-500/20',     bg: 'bg-red-500/[0.05]',     iconBg: 'bg-red-500/12',     iconColor: 'text-red-400',     dot: 'bg-red-400'     },
}

const KIND_LABEL: Record<InsightKind, string> = {
  positive: 'Positivo',
  neutral:  'Neutro',
  alert:    'Alerta',
  critical: 'Crítico',
}

const PRIORITY_BADGE: Record<string, string> = {
  high:   'text-red-400 bg-red-500/10 border-red-500/20',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  low:    'text-slate-500 bg-white/[0.04] border-white/[0.06]',
}

const CATEGORY_LABEL: Record<string, string> = {
  performance: 'Desempenho', risk: 'Risco', streak: 'Sequência',
  trend: 'Tendência', goal: 'Meta',
}

// ── Componente de card individual ─────────────
function InsightCard({
  iconId, title, description, priority, tag, style, delay,
}: {
  iconId:      string
  title:       string
  description: string
  priority:    'high' | 'medium' | 'low'
  tag:         string
  style:       StyleEntry
  delay:       number
}) {
  return (
    <div
      className={cn(
        'p-4 rounded-2xl border transition-all duration-200 cursor-default hover:translate-x-1',
        style.border, style.bg,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex gap-3 items-start">
        <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0', style.iconBg)}>
          <InsightIcon id={iconId} className={cn('w-4 h-4', style.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', style.dot)} />
            <h4 className="text-sm font-bold text-slate-200 leading-tight">{title}</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-md border', PRIORITY_BADGE[priority])}>
              {priority === 'high' ? 'Alta prioridade' : priority === 'medium' ? 'Média' : 'Info'}
            </span>
            <span className="text-[10px] text-slate-600 font-medium">{tag}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── InsightCards ──────────────────────────────
export function InsightCards() {
  const { insights: weeklyInsights }           = useHabits()
  const { insights: historicalInsights }       = useHistoricalInsights()
  const [tab, setTab]                          = useState<'historical' | 'weekly'>('historical')

  const hasWeekly     = weeklyInsights.length > 0
  const hasHistorical = historicalInsights.length > 0

  return (
    <div className="space-y-3">
      {/* Tab switcher */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab('historical')}
          className={cn(
            'flex-1 py-2 rounded-xl text-xs font-bold transition-all',
            tab === 'historical'
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
              : 'bg-white/[0.04] text-slate-500 border border-white/[0.06] hover:text-slate-300',
          )}
        >
          Q1 2026
        </button>
        <button
          type="button"
          onClick={() => setTab('weekly')}
          className={cn(
            'flex-1 py-2 rounded-xl text-xs font-bold transition-all',
            tab === 'weekly'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'bg-white/[0.04] text-slate-500 border border-white/[0.06] hover:text-slate-300',
          )}
        >
          Esta Semana
        </button>
      </div>

      {/* Historical insights */}
      {tab === 'historical' && (
        <div className="space-y-2.5">
          {hasHistorical ? (
            historicalInsights.map((ins, i) => (
              <InsightCard
                key={i}
                iconId={ins.iconId}
                title={ins.title}
                description={ins.description}
                priority={ins.priority}
                tag={KIND_LABEL[ins.kind]}
                style={KIND_STYLES[ins.kind]}
                delay={i * 60}
              />
            ))
          ) : (
            <div className="card p-5">
              <EmptyState
                icon={<Sparkles className="w-5 h-5 text-slate-600" />}
                title="Sem dados históricos"
                description="Dados do Q1 2026 ainda não disponíveis"
                size="sm"
              />
            </div>
          )}
        </div>
      )}

      {/* Weekly insights */}
      {tab === 'weekly' && (
        <div className="space-y-2.5">
          {hasWeekly ? (
            weeklyInsights.map((insight, i) => (
              <InsightCard
                key={i}
                iconId={insight.iconId}
                title={insight.title}
                description={insight.description}
                priority={insight.priority}
                tag={CATEGORY_LABEL[insight.category] ?? insight.category}
                style={TYPE_STYLES[insight.type]}
                delay={i * 70}
              />
            ))
          ) : (
            <div className="card p-5">
              <EmptyState
                icon={<Sparkles className="w-5 h-5 text-slate-600" />}
                title="Ainda sem insights"
                description="Registre algumas sessões e geraremos análises personalizadas"
                size="sm"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
