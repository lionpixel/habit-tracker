// ─────────────────────────────────────────────
//  Component: Income Chart
// ─────────────────────────────────────────────

'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { INCOME_CATEGORIES } from '@/types/finance'
import type { MonthlyFinance } from '@/types/finance'
import type { TooltipProps } from 'recharts'

import { formatBRL } from '@/lib/formatBRL'

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 border border-white/10 shadow-card text-xs min-w-[140px]">
      <p className="text-slate-400 font-semibold mb-1">{label}</p>
      <p className="font-black text-emerald-400">{formatBRL(payload[0]?.value as number ?? 0)}</p>
    </div>
  )
}

const FIELD_MAP: Record<string, keyof MonthlyFinance> = {
  salary:           'salary',
  freelance:        'freelance',
  business:         'business',
  investment_return:'investmentReturn',
  other_income:     'otherIncome',
}

interface IncomeChartProps {
  month: MonthlyFinance
}

export function IncomeChart({ month }: IncomeChartProps) {
  const data = INCOME_CATEGORIES.map((cat) => ({
    name:  cat.name,
    value: (month[FIELD_MAP[cat.id] as keyof MonthlyFinance] as number) ?? 0,
    color: cat.color,
  })).filter((d) => d.value > 0)

  if (!data.length) {
    return (
      <div className="card p-6 flex items-center justify-center text-slate-600 text-sm">
        Nenhuma receita registrada neste mês.
      </div>
    )
  }

  return (
    <div className="card p-5">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Receitas por Categoria</div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${Math.round(v / 1000)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
