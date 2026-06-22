// ─────────────────────────────────────────────
//  Component: Expense Chart (donut + bars)
// ─────────────────────────────────────────────

'use client'

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts'
import { EXPENSE_CATEGORIES, totalExpenses } from '@/types/finance'
import type { MonthlyFinance } from '@/types/finance'
import type { TooltipProps } from 'recharts'

import { formatBRL } from '@/lib/formatBRL'

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const { name, value, payload: p } = payload[0]
  return (
    <div className="glass rounded-xl p-3 border border-white/10 shadow-card text-xs">
      <p className="font-bold mb-0.5" style={{ color: p?.color }}>{name}</p>
      <p className="text-slate-200 font-black">{formatBRL(value as number)}</p>
    </div>
  )
}

const FIELD_MAP: Record<string, keyof MonthlyFinance> = {
  housing:       'housing',
  food:          'food',
  transport:     'transport',
  health:        'health',
  education:     'education',
  entertainment: 'entertainment',
  utilities:     'utilities',
  clothing:      'clothing',
  personal:      'personal',
  debt:          'debt',
  other_expense: 'otherExpense',
}

interface ExpenseChartProps {
  month: MonthlyFinance
}

export function ExpenseChart({ month }: ExpenseChartProps) {
  const total = totalExpenses(month)
  const data  = EXPENSE_CATEGORIES.map((cat) => ({
    name:  cat.name,
    value: (month[FIELD_MAP[cat.id] as keyof MonthlyFinance] as number) ?? 0,
    color: cat.color,
  })).filter((d) => d.value > 0)

  if (!data.length) {
    return (
      <div className="card p-6 flex items-center justify-center text-slate-600 text-sm">
        Nenhum gasto registrado neste mês.
      </div>
    )
  }

  return (
    <div className="card p-5">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Gastos por Categoria</div>
      <div className="flex gap-4 items-start">
        {/* Donut */}
        <div className="flex-shrink-0 relative w-[140px] h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={2} dataKey="value">
                {data.map((entry, i) => <Cell key={i} fill={entry.color} fillOpacity={0.9} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-slate-600 uppercase tracking-wider">Total</span>
            <span className="text-xs font-black text-slate-200 tabular-nums">{formatBRL(total)}</span>
          </div>
        </div>

        {/* Bar breakdown */}
        <div className="flex-1 space-y-2 min-w-0">
          {data
            .sort((a, b) => b.value - a.value)
            .slice(0, 7)
            .map(({ name, value, color }) => {
              const pct = total > 0 ? (value / total) * 100 : 0
              return (
                <div key={name}>
                  <div className="flex items-center justify-between text-[10px] mb-0.5">
                    <span className="text-slate-400 font-semibold truncate">{name}</span>
                    <span className="font-black tabular-nums flex-shrink-0 ml-2" style={{ color }}>{Math.round(pct)}%</span>
                  </div>
                  <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
