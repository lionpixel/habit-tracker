// ─────────────────────────────────────────────
//  Component: Company A/B Revenue Cards
//  Mostra faturamento por empresa com split 50% pró-labore / 50% reinvestimento
// ─────────────────────────────────────────────

'use client'

import { Building2, TrendingDown, RotateCcw } from 'lucide-react'
import { fmtBRL } from '@/types/finance'
import type { MonthlyFinance } from '@/types/finance'

interface CompanyCardProps {
  name:    string
  revenue: number
  color:   string
  accent:  string
}

function CompanyCard({ name, revenue, color, accent }: CompanyCardProps) {
  const proLabore = Math.round(revenue * 0.5)
  const reinvest  = revenue - proLabore

  return (
    <div className="card overflow-hidden">
      <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${color}, ${color}60, transparent)` }} />
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}1a` }}>
            <Building2 size={17} style={{ color }} />
          </div>
          <div>
            <div className="font-black text-slate-100 text-sm">{name}</div>
            <div className="text-xs text-slate-500 mt-0.5">Faturamento</div>
          </div>
          <div className="ml-auto font-black text-lg tabular-nums" style={{ color }}>
            {fmtBRL(revenue)}
          </div>
        </div>

        {revenue > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl" style={{ background: `${color}0d` }}>
              <TrendingDown size={13} style={{ color }} />
              <span className="text-[11px] text-slate-400 flex-1">Pró-labore (50%)</span>
              <span className="text-xs font-bold tabular-nums" style={{ color }}>{fmtBRL(proLabore)}</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl" style={{ background: `${accent}0d` }}>
              <RotateCcw size={13} style={{ color: accent }} />
              <span className="text-[11px] text-slate-400 flex-1">Reinvestimento (50%)</span>
              <span className="text-xs font-bold tabular-nums" style={{ color: accent }}>{fmtBRL(reinvest)}</span>
            </div>
          </div>
        )}

        {revenue === 0 && (
          <div className="text-[11px] text-slate-600 text-center py-2">Sem faturamento registrado</div>
        )}
      </div>
    </div>
  )
}

interface CompanyCardsSectionProps {
  month: MonthlyFinance
}

export function CompanyCardsSection({ month }: CompanyCardsSectionProps) {
  const compA = month.companyARevenue ?? 0
  const compB = month.companyBRevenue ?? 0

  if (compA === 0 && compB === 0) return null

  const totalRevenue    = compA + compB
  const totalProLabore  = Math.round(totalRevenue * 0.5)
  const totalReinvest   = totalRevenue - totalProLabore

  // Personal split from pró-labore: 20% investments, 80% living
  const personalInvest  = Math.round(totalProLabore * 0.2)
  const personalLiving  = totalProLabore - personalInvest

  return (
    <div className="space-y-4">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Empresas</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CompanyCard name="Empresa A" revenue={compA} color="#6366f1" accent="#8b5cf6" />
        <CompanyCard name="Empresa B" revenue={compB} color="#0ea5e9" accent="#22d3ee" />
      </div>

      {/* Consolidated split */}
      <div className="card p-5">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Distribuição Consolidada</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: 'Receita Total',   value: totalRevenue,   color: '#10b981' },
            { label: 'Pró-labore',      value: totalProLabore, color: '#6366f1' },
            { label: 'Reinvestimento',  value: totalReinvest,  color: '#f59e0b' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex flex-col items-center p-3 rounded-xl" style={{ background: `${color}0d` }}>
              <div className="text-xs text-slate-500 mb-1">{label}</div>
              <div className="text-base font-black tabular-nums" style={{ color }}>{fmtBRL(value)}</div>
            </div>
          ))}
        </div>

        {totalProLabore > 0 && (
          <div className="mt-3 pt-3 border-t border-white/[0.05]">
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">Divisão Pessoal (do Pró-labore)</div>
            <div className="flex gap-2">
              <div className="flex-1 text-center p-2 rounded-lg bg-emerald-500/[0.08]">
                <div className="text-[10px] text-slate-500">Investimentos (20%)</div>
                <div className="text-sm font-bold text-emerald-400 tabular-nums">{fmtBRL(personalInvest)}</div>
              </div>
              <div className="flex-1 text-center p-2 rounded-lg bg-white/[0.04]">
                <div className="text-[10px] text-slate-500">Custo de Vida (80%)</div>
                <div className="text-sm font-bold text-slate-300 tabular-nums">{fmtBRL(personalLiving)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
