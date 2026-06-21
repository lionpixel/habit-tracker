'use client'

// ─────────────────────────────────────────────
//  Component: LifeScoreCard
//  Vida Score — painel integrado de todos os módulos
// ─────────────────────────────────────────────

import React, { useMemo }    from 'react'
import { useGoalsStore }     from '@/store/goalsStore'
import { useFinanceStore }   from '@/store/financeStore'
import { useProfileStore }   from '@/store/profileStore'
import { useCalendarStore }  from '@/store/calendarStore'
import { useSystemScore }    from '@/hooks/useSystemScore'
import { cn }                from '@/lib/helpers'
import {
  Flame, Target, TrendingUp, Dumbbell, Moon, Brain,
  Star, Zap, ChevronUp, LucideProps, CalendarDays,
} from 'lucide-react'
import type { ComponentType } from 'react'
import type { ScoreDimension } from '@/hooks/useSystemScore'

// ── Icon registry ─────────────────────────────
const ICONS: Record<string, ComponentType<LucideProps>> = {
  Flame, Target, TrendingUp, Dumbbell, Moon, Brain, Star, Zap, CalendarDays,
}
function DimIcon({ id, className, style }: { id: string; className?: string; style?: React.CSSProperties }) {
  const Icon = ICONS[id] ?? Flame
  return <Icon className={className} style={style} strokeWidth={2} />
}

// ── Circular score ring ───────────────────────
function ScoreRing({
  score, size = 120, strokeWidth = 10,
}: {
  score: number; size?: number; strokeWidth?: number
}) {
  const radius    = (size - strokeWidth * 2) / 2
  const circ      = 2 * Math.PI * radius
  const progress  = clamp(score / 100)
  const dash      = circ * progress
  const center    = size / 2

  const color = score >= 70 ? '#10b981' : score >= 45 ? '#6366f1' : '#f59e0b'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Track */}
      <circle
        cx={center} cy={center} r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={strokeWidth}
      />
      {/* Gradient definition */}
      <defs>
        <linearGradient id="score-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={color} stopOpacity={0.9} />
          <stop offset="100%" stopColor={color} stopOpacity={0.6} />
        </linearGradient>
      </defs>
      {/* Progress arc */}
      <circle
        cx={center} cy={center} r={radius}
        fill="none"
        stroke="url(#score-grad)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={0}
        transform={`rotate(-90 ${center} ${center})`}
        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)' }}
      />
    </svg>
  )
}

function clamp(v: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, v))
}

// ── Score label ───────────────────────────────
function scoreLabel(s: number): { text: string; color: string } {
  if (s >= 80) return { text: 'Excelente',    color: 'text-emerald-400' }
  if (s >= 65) return { text: 'Muito Bom',    color: 'text-violet-400'  }
  if (s >= 50) return { text: 'Em Progresso', color: 'text-violet-300'  }
  if (s >= 30) return { text: 'Atenção',      color: 'text-amber-400'   }
  return              { text: 'Iniciando',    color: 'text-slate-400'   }
}

// ── Dimension row ─────────────────────────────
function DimensionRow({ dim }: { dim: ScoreDimension }) {
  return (
    <div className="flex items-center gap-2.5">
      {/* Icon */}
      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${dim.color}18` }}
      >
        <DimIcon id={dim.icon} className="w-3 h-3" style={{ color: dim.color }} />
      </div>

      {/* Label + bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[11px] font-semibold text-slate-400">{dim.label}</span>
          <span className="text-[11px] font-black tabular-nums" style={{ color: dim.color }}>
            {dim.score}
          </span>
        </div>
        <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${dim.score}%`, background: dim.color }}
          />
        </div>
      </div>

      {/* Weight badge */}
      <span className="text-[9px] font-bold text-slate-600 w-6 text-right">
        {Math.round(dim.weight * 100)}%
      </span>
    </div>
  )
}

// ── Level badge ───────────────────────────────
function LevelBadge({ level, xpThisLevel, xpToNext }: { level: number; xpThisLevel: number; xpToNext: number }) {
  const pct = Math.round((xpThisLevel / (xpThisLevel + xpToNext)) * 100)
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
      <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
        <Star className="w-4 h-4 text-amber-400" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-bold text-amber-300">Nível {level}</span>
          <span className="text-slate-500 tabular-nums">{xpThisLevel.toLocaleString()} / {(xpThisLevel + xpToNext).toLocaleString()} XP</span>
        </div>
        <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-amber-400 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────

export function LifeScoreCard() {
  const { vidaScore, dimensions, gamification } = useSystemScore()

  // Hydrate stores that useSystemScore reads from
  const { hydrated: gH, hydrate: gHydrate } = useGoalsStore()
  const { hydrated: fH, hydrate: fHydrate } = useFinanceStore()
  const { hydrated: pH, hydrate: pHydrate } = useProfileStore()
  const { hydrated: cH, hydrate: cHydrate } = useCalendarStore()

  useMemo(() => {
    if (!gH) gHydrate()
    if (!fH) fHydrate()
    if (!pH) pHydrate()
    if (!cH) cHydrate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { text: labelText, color: labelColor } = scoreLabel(vidaScore)

  const topTwo = [...dimensions].sort((a, b) => b.score - a.score).slice(0, 2)
  const bottom = [...dimensions].sort((a, b) => a.score - b.score)[0]

  return (
    <div className="card p-5">
      {/* Header row */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Zap className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-bold text-slate-100">Vida Score</h3>
          </div>
          <p className="text-xs text-slate-500">Integração de todos os módulos</p>
        </div>
      </div>

      {/* Score ring + label */}
      <div className="flex items-center gap-5 mb-5">
        <div className="relative flex-shrink-0">
          <ScoreRing score={vidaScore} size={100} strokeWidth={8} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-slate-100 tabular-nums leading-none">{vidaScore}</span>
            <span className="text-[9px] text-slate-500 font-semibold">/ 100</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className={cn('text-base font-black leading-tight', labelColor)}>{labelText}</div>
          <p className="text-xs text-slate-500 mt-0.5 mb-3">Pontuação composta ponderada</p>

          {/* Top performers */}
          <div className="flex flex-col gap-1.5">
            {topTwo.map((d) => (
              <div key={d.key} className="flex items-center gap-1.5">
                <ChevronUp className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span className="text-[11px] text-slate-400">
                  <span className="font-bold" style={{ color: d.color }}>{d.label}</span>
                  {' '}em destaque — {d.score}/100
                </span>
              </div>
            ))}
            {bottom && bottom.score < 60 && (
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400 text-[11px]">⚠</span>
                <span className="text-[11px] text-slate-500">
                  <span className="font-semibold text-amber-400">{bottom.label}</span> precisa de atenção
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dimension bars */}
      <div className="space-y-2.5 mb-4">
        {dimensions.map((d) => (
          <DimensionRow key={d.key} dim={d} />
        ))}
      </div>

      {/* Level bar */}
      <LevelBadge
        level={gamification.level}
        xpThisLevel={gamification.xpThisLevel}
        xpToNext={gamification.xpToNext}
      />
    </div>
  )
}
