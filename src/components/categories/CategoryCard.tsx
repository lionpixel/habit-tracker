// ─────────────────────────────────────────────
//  Component: CategoryCard
// ─────────────────────────────────────────────

'use client'

import { useMemo } from 'react'
import * as Icons from 'lucide-react'
import { cn } from '@/lib/helpers'
import type { HabitCategory, CategoryStats } from '@/types/category'

interface CategoryCardProps {
  category: HabitCategory
  stats?:   CategoryStats
  selected?: boolean
  onClick?:  () => void
}

function LucideIcon({ name, size = 18, style }: { name: string; size?: number; style?: React.CSSProperties }) {
  const Icon = (Icons as Record<string, unknown>)[name] as React.FC<{ size?: number; style?: React.CSSProperties }> | undefined
  if (!Icon) return null
  return <Icon size={size} style={style} />
}

function RiskBadge({ level }: { level: CategoryStats['riskLevel'] }) {
  const map = {
    low:    { label: 'OK',    className: 'text-emerald-400 bg-emerald-500/10' },
    medium: { label: 'Atenção', className: 'text-amber-400 bg-amber-500/10' },
    high:   { label: 'Risco', className: 'text-red-400 bg-red-500/10' },
  }
  const { label, className } = map[level]
  return (
    <span className={cn('text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full', className)}>
      {label}
    </span>
  )
}

export function CategoryCard({ category, stats, selected, onClick }: CategoryCardProps) {
  const color = category.color

  const consistencyWidth = useMemo(
    () => (stats ? Math.min(100, stats.consistency) : 0),
    [stats],
  )

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'card card-hover-lift w-full text-left transition-all duration-200 overflow-hidden',
        selected && 'ring-2',
        category.archived && 'opacity-50',
      )}
      style={selected ? { ringColor: color } as React.CSSProperties : undefined}
    >
      {/* Top accent */}
      <div
        className="h-[2px]"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}60, transparent)` }}
      />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}1a` }}
            >
              <LucideIcon name={category.icon} size={20} style={{ color }} />
            </div>
            <div>
              <div className="font-bold text-slate-200 text-sm leading-tight">{category.name}</div>
              <div className="text-[10px] text-slate-500 mt-0.5 leading-tight line-clamp-1">
                {category.description}
              </div>
            </div>
          </div>
          {stats && <RiskBadge level={stats.riskLevel} />}
        </div>

        {/* Stats row */}
        {stats ? (
          <>
            <div className="grid grid-cols-3 gap-1 mb-3 text-center">
              <div>
                <div className="text-sm font-black tabular-nums" style={{ color }}>
                  {stats.streak}
                </div>
                <div className="text-[9px] text-slate-600 uppercase tracking-wider">streak</div>
              </div>
              <div>
                <div className="text-sm font-black text-slate-300 tabular-nums">
                  {stats.consistency}%
                </div>
                <div className="text-[9px] text-slate-600 uppercase tracking-wider">consist.</div>
              </div>
              <div>
                <div className="text-sm font-black text-slate-300 tabular-nums">
                  {stats.habitsCompleted}/{stats.habitsTotal}
                </div>
                <div className="text-[9px] text-slate-600 uppercase tracking-wider">hábitos</div>
              </div>
            </div>

            {/* Consistency bar */}
            <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${consistencyWidth}%`, backgroundColor: color }}
              />
            </div>
          </>
        ) : (
          <div className="text-[10px] text-slate-600 italic">
            {category.habitKeys.length === 0
              ? 'Nenhum hábito vinculado'
              : `${category.habitKeys.length} hábito${category.habitKeys.length > 1 ? 's' : ''}`}
          </div>
        )}
      </div>
    </button>
  )
}
