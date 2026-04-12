// ─────────────────────────────────────────────
//  Component: Category Stats Overview (top row)
// ─────────────────────────────────────────────

'use client'

import { useMemo } from 'react'
import { Target, TrendingUp, AlertTriangle, Award } from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { formatTime } from '@/lib/helpers'
import type { HabitCategory, CategoryStats } from '@/types/category'

interface CategoryStatsProps {
  categories: HabitCategory[]
  statsMap:   Record<string, CategoryStats>
}

export function CategoryStatsOverview({ categories, statsMap }: CategoryStatsProps) {
  const allStats = useMemo(
    () => categories.map((c) => statsMap[c.id]).filter(Boolean) as CategoryStats[],
    [categories, statsMap],
  )

  const totalMinutes = useMemo(
    () => allStats.reduce((a, s) => a + s.totalMinutes, 0),
    [allStats],
  )

  const avgConsistency = useMemo(() => {
    if (!allStats.length) return 0
    return Math.round(allStats.reduce((a, s) => a + s.consistency, 0) / allStats.length)
  }, [allStats])

  const atRiskCount = useMemo(
    () => allStats.filter((s) => s.riskLevel === 'high').length,
    [allStats],
  )

  const topStreak = useMemo(
    () => allStats.reduce((max, s) => (s.streak > max ? s.streak : max), 0),
    [allStats],
  )

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        icon={<TrendingUp size={18} />}
        value={formatTime(totalMinutes)}
        label="Total (mês)"
        color="#6366f1"
      />
      <StatCard
        icon={<Target size={18} />}
        value={`${avgConsistency}%`}
        label="Consist. Média"
        color="#10b981"
      />
      <StatCard
        icon={<AlertTriangle size={18} />}
        value={atRiskCount}
        label="Em Risco"
        color={atRiskCount > 0 ? '#ef4444' : '#64748b'}
      />
      <StatCard
        icon={<Award size={18} />}
        value={`${topStreak}d`}
        label="Melhor Streak"
        color="#f59e0b"
      />
    </div>
  )
}
