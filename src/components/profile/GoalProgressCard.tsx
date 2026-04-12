// ─────────────────────────────────────────────
//  Component: Goal Progress Card
// ─────────────────────────────────────────────

'use client'

import { Target, TrendingDown, TrendingUp } from 'lucide-react'
import type { PhysicalProfile } from '@/types/profile'

interface GoalRowProps {
  label:    string
  current:  number | undefined
  goal:     number | undefined
  unit:     string
  color:    string
  lowerIsBetter?: boolean
}

function GoalRow({ label, current, goal, unit, color, lowerIsBetter = false }: GoalRowProps) {
  if (!goal) return null

  const pct = current !== undefined
    ? lowerIsBetter
      ? goal > 0 ? Math.min(100, Math.max(0, Math.round(((current - goal) / (current || 1)) * 100))) : 0
      : Math.min(100, Math.round((current / goal) * 100))
    : 0

  const diff = current !== undefined ? current - goal : null
  const achieved = current !== undefined && (lowerIsBetter ? current <= goal : current >= goal)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-300">{label}</span>
        <div className="flex items-center gap-2 text-xs">
          {current !== undefined && (
            <span className="text-slate-400 tabular-nums">{current.toFixed(1)}</span>
          )}
          <span className="text-slate-600">/</span>
          <span className="tabular-nums font-bold" style={{ color }}>{goal.toFixed(1)} {unit}</span>
          {achieved && (
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">OK</span>
          )}
        </div>
      </div>
      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${lowerIsBetter ? Math.min(100, current !== undefined && goal > 0 ? (goal / (current || 1)) * 100 : 0) : pct}%`,
            backgroundColor: achieved ? '#10b981' : color,
          }}
        />
      </div>
      {diff !== null && !achieved && (
        <div className="flex items-center gap-1 text-[10px]" style={{ color }}>
          {lowerIsBetter
            ? <TrendingDown size={10} />
            : <TrendingUp size={10} />
          }
          {lowerIsBetter
            ? `Reduzir ${Math.abs(diff).toFixed(1)}${unit}`
            : `Aumentar ${Math.abs(diff).toFixed(1)}${unit}`
          }
        </div>
      )}
    </div>
  )
}

interface GoalProgressCardProps {
  profile: PhysicalProfile
}

export function GoalProgressCard({ profile }: GoalProgressCardProps) {
  const hasGoals = profile.goalWeight || profile.goalBodyFat || profile.goalLeanMass || profile.goalWaist
  if (!hasGoals) return null

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
          <Target size={16} className="text-violet-400" />
        </div>
        <h3 className="font-bold text-slate-100 text-sm">Metas Físicas</h3>
      </div>
      <div className="space-y-4">
        <GoalRow
          label="Meta de Peso"
          current={profile.weight}
          goal={profile.goalWeight}
          unit="kg"
          color="#6366f1"
          lowerIsBetter={profile.weight !== undefined && profile.goalWeight !== undefined && profile.goalWeight < profile.weight}
        />
        <GoalRow
          label="Meta % Gordura"
          current={profile.bodyFat}
          goal={profile.goalBodyFat}
          unit="%"
          color="#ef4444"
          lowerIsBetter
        />
        <GoalRow
          label="Meta Massa Magra"
          current={profile.leanMass}
          goal={profile.goalLeanMass}
          unit="kg"
          color="#22d3ee"
        />
        <GoalRow
          label="Meta Cintura"
          current={profile.waist}
          goal={profile.goalWaist}
          unit="cm"
          color="#10b981"
          lowerIsBetter
        />
      </div>
    </div>
  )
}
