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
type StyleEntry = {
  leftBorder: string
  bg:         string
  iconBg:     string
  iconColor:  string
  barColor:   string
  badge:      string
}

const TYPE_STYLES: Record<InsightType, StyleEntry> = {
  success: {
    leftBorder: 'border-l-emerald-500/70',
    bg:         'bg-emerald-500/[0.04]',
    iconBg:     'bg-emerald-500/12',
    iconColor:  'text-emerald-400',
    barColor:   '#10b981',
    badge:      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  warning: {
    leftBorder: 'border-l-amber-500/70',
    bg:         'bg-amber-500/[0.04]',
    iconBg:     'bg-amber-500/12',
    iconColor:  'text-amber-400',
    barColor:   '#f59e0b',
    badge:      'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  info: {
    leftBorder: 'border-l-violet-500/70',
    bg:         'bg-violet-500/[0.04]',
    iconBg:     'bg-violet-500/12',
    iconColor:  'text-violet-400',
    barColor:   '#7c3aed',
    badge:      'bg-violet-500/20 text-violet-400 border-violet-500/30',
  },
  tip: {
    leftBorder: 'border-l-cyan-500/70',
    bg:         'bg-cyan-500/[0.03]',
    iconBg:     'bg-cyan-500/12',
    iconColor:  'text-cyan-400',
    barColor:   '#22d3ee',
    badge:      'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  },
}

const KIND_STYLES: Record<InsightKind, StyleEntry> = {
  positive: {
    leftBorder: 'border-l-emerald-500/70',
    bg:         'bg-emerald-500/[0.04]',
    iconBg:     'bg-emerald-500/12',
    iconColor:  'text-emerald-400',
    barColor:   '#10b981',
    badge:      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  neutral: {
    leftBorder: 'border-l-violet-500/70',
    bg:         'bg-violet-500/[0.04]',
    iconBg:     'bg-violet-500/12',
    iconColor:  'text-violet-400',
    barColor:   '#7c3aed',
    badge:      'bg-violet-500/20 text-violet-400 border-violet-500/30',
  },
  alert: {
    leftBorder: 'border-l-amber-500/70',
    bg:         'bg-amber-500/[0.04]',
    iconBg:     'bg-amber-500/12',
    iconColor:  'text-amber-400',
    barColor:   '#f59e0b',
    badge:      'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  critical: {
    leftBorder: 'border-l-red-500/70',
    bg:         'bg-red-500/[0.04]',
    iconBg:     'bg-red-500/12',
    iconColor:  'text-red-400',
    barColor:   '#ef4444',
    badge:      'bg-red-500/20 text-red-400 border-red-500/30',
  },
}

const KIND_LABEL: Record<InsightKind, string> = {
  positive: 'Positivo',
  neutral:  'Neutro',
  alert:    'Alerta',
  critical: 'Crítico',
}

const PRIORITY_LABEL: Record<string, string> = {
  high:   'Alta prioridade',
  medium: 'Média',
  low:    'Info',
}

const PRIORITY_BADGE: Record<string, string> = {
  high:   'bg-red-500/10 text-red-400 border-red-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  low:    'bg-white/[0.04] text-slate-500 border-white/[0.06]',
}

const CATEGORY_LABEL: Record<string, string> = {
  performance: 'Desempenho',
  risk:        'Risco',
  streak:      'Sequência',
  trend:       'Tendência',
  goal:        'Meta',
}

// Percentual visual por kind/type (para barra de dados)
const KIND_BAR: Record<InsightKind, number> = {
  positive: 78,
  neutral:  52,
  alert:    28,
  critical: 12,
}
const TYPE_BAR: Record<InsightType, number> = {
  success: 82,
  info:    60,
  warning: 32,
  tip:     65,
}

// ── Card individual ───────────────────────────
function InsightCard({
  iconId, title, description, priority, tag, style, delay, barValue,
}: {
  iconId:    string
  title:     string
  description: string
  priority:  'high' | 'medium' | 'low'
  tag:       string
  style:     StyleEntry
  delay:     number
  barValue:  number
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/[0.07] border-l-4 overflow-hidden',
        'transition-all duration-200 hover:border-white/[0.12] hover:-translate-y-px',
        style.leftBorder,
        style.bg,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-2">
          <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5', style.iconBg)}>
            <InsightIcon id={iconId} className={cn('w-4 h-4', style.iconColor)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="text-sm font-bold text-slate-100 leading-tight">{title}</h4>
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-md border flex-shrink-0', style.badge)}>
                {tag}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Priority */}
        <div className="flex items-center gap-2 mb-3 pl-11">
          <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-md border', PRIORITY_BADGE[priority])}>
            {PRIORITY_LABEL[priority]}
          </span>
        </div>

        {/* Data bar */}
        <div className="pl-11 space-y-1">
          <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${barValue}%`, background: style.barColor }}
            />
          </div>
          <div className="flex justify-end">
            <span className="text-[10px] font-bold tabular-nums" style={{ color: style.barColor }}>
              {barValue}%
            </span>
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
            'flex-1 py-2 rounded-xl text-xs font-bold transition-all border',
            tab === 'historical'
              ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
              : 'bg-white/[0.04] text-slate-500 border-white/[0.06] hover:text-slate-300',
          )}
        >
          Q1 2026
        </button>
        <button
          type="button"
          onClick={() => setTab('weekly')}
          className={cn(
            'flex-1 py-2 rounded-xl text-xs font-bold transition-all border',
            tab === 'weekly'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
              : 'bg-white/[0.04] text-slate-500 border-white/[0.06] hover:text-slate-300',
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
                barValue={KIND_BAR[ins.kind]}
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
                barValue={TYPE_BAR[insight.type]}
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
