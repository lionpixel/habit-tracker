// ─────────────────────────────────────────────
//  Component: Category Insights
// ─────────────────────────────────────────────

'use client'

import * as Icons from 'lucide-react'
import type { CategoryInsight } from '@/types/category'

function LucideIcon({ name, size = 16, style }: { name: string; size?: number; style?: React.CSSProperties }) {
  const Icon = (Icons as Record<string, unknown>)[name] as React.FC<{ size?: number; style?: React.CSSProperties }> | undefined
  if (!Icon) return null
  return <Icon size={size} style={style} />
}

const INSIGHT_COLORS: Record<string, string> = {
  most_consistent: '#10b981',
  most_invested:   '#6366f1',
  at_risk:         '#ef4444',
  most_neglected:  '#f59e0b',
  most_improved:   '#22d3ee',
  goal_achieved:   '#a78bfa',
}

interface CategoryInsightsProps {
  insights: CategoryInsight[]
}

export function CategoryInsights({ insights }: CategoryInsightsProps) {
  if (!insights.length) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {insights.map((insight, i) => {
        const color = INSIGHT_COLORS[insight.type] ?? '#6366f1'
        return (
          <div
            key={i}
            className="card overflow-hidden"
          >
            <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${color}, ${color}60, transparent)` }} />
            <div className="p-4 flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}1a` }}
              >
                <LucideIcon name={insight.iconId} size={17} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-300 leading-tight">{insight.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{insight.body}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Insight generator ─────────────────────────

import type { HabitCategory, CategoryStats } from '@/types/category'

export function generateInsights(
  categories: HabitCategory[],
  statsMap: Record<string, CategoryStats>,
): CategoryInsight[] {
  const insights: CategoryInsight[] = []
  const withStats = categories
    .map((c) => ({ cat: c, stats: statsMap[c.id] }))
    .filter((x): x is { cat: HabitCategory; stats: CategoryStats } => !!x.stats)

  if (!withStats.length) return []

  // Most consistent
  const mostConsistent = withStats.reduce((a, b) =>
    b.stats.consistency > a.stats.consistency ? b : a,
  )
  if (mostConsistent.stats.consistency >= 70) {
    insights.push({
      type:       'most_consistent',
      categoryId: mostConsistent.cat.id,
      title:      `${mostConsistent.cat.name} — Mais Consistente`,
      body:       `${mostConsistent.stats.consistency}% de consistência este mês. Excelente!`,
      iconId:     'TrendingUp',
    })
  }

  // At risk
  const atRisk = withStats.filter((x) => x.stats.riskLevel === 'high')
  atRisk.slice(0, 2).forEach(({ cat, stats }) => {
    insights.push({
      type:       'at_risk',
      categoryId: cat.id,
      title:      `${cat.name} — Em Risco`,
      body:       `Apenas ${stats.consistency}% de consistência. Requer atenção.`,
      iconId:     'AlertTriangle',
    })
  })

  // Most invested (time)
  const mostInvested = withStats.reduce((a, b) =>
    b.stats.monthMinutes > a.stats.monthMinutes ? b : a,
  )
  if (mostInvested.stats.monthMinutes > 0) {
    const hours = Math.round(mostInvested.stats.monthMinutes / 60)
    insights.push({
      type:       'most_invested',
      categoryId: mostInvested.cat.id,
      title:      `${mostInvested.cat.name} — Mais Investido`,
      body:       `${hours}h dedicadas este mês.`,
      iconId:     'Clock',
    })
  }

  // Most neglected (lowest time, active cats)
  const active = withStats.filter((x) => !x.cat.archived && x.cat.habitKeys.length > 0)
  if (active.length > 2) {
    const neglected = active.reduce((a, b) =>
      b.stats.monthMinutes < a.stats.monthMinutes ? b : a,
    )
    if (neglected.stats.monthMinutes < 30) {
      insights.push({
        type:       'most_neglected',
        categoryId: neglected.cat.id,
        title:      `${neglected.cat.name} — Negligenciado`,
        body:       'Menos de 30 min dedicados este mês. Que tal retomar?',
        iconId:     'AlertCircle',
      })
    }
  }

  return insights
}
