// ─────────────────────────────────────────────
//  Component: Wealth Progress + Income Percentile
// ─────────────────────────────────────────────

'use client'

import { Globe } from 'lucide-react'
import { brIncomePercentile, globalIncomePercentile } from '@/types/finance'
import type { FinanceStore } from '@/types/finance'

interface WealthProgressProps {
  profile:      FinanceStore['profile']
  monthlyIncome: number
}

function PercentileBar({ pct, color, label }: { pct: number; color: string; label: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-slate-400 font-semibold">{label}</span>
        <span className="font-black tabular-nums" style={{ color }}>top {100 - pct}%</span>
      </div>
      <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <div className="text-[10px] text-slate-600 mt-0.5">Você está acima de {pct}% da população</div>
    </div>
  )
}

export function WealthProgress({ profile, monthlyIncome }: WealthProgressProps) {
  if (!monthlyIncome) return null

  const brPct     = brIncomePercentile(monthlyIncome)
  // Approximation: assume BRL/USD 5.0
  const usdIncome = monthlyIncome / 5
  const globalPct = globalIncomePercentile(usdIncome)

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
          <Globe size={16} className="text-indigo-400" />
        </div>
        <h3 className="font-bold text-slate-100 text-sm">Comparativo de Renda</h3>
      </div>
      <div className="space-y-4">
        <PercentileBar pct={brPct}     color="#10b981" label="Brasil"       />
        <PercentileBar pct={globalPct} color="#6366f1" label="Global (USD)" />
      </div>
      {profile.emergencyTarget && (
        <div className="mt-4 pt-4 border-t border-white/[0.06] text-xs text-slate-500">
          Meta de reserva: {profile.emergencyTarget} meses de despesas
        </div>
      )}
    </div>
  )
}
