// ─────────────────────────────────────────────
//  Component: Monthly Finance Evolution Chart
//  Linha de receita, gastos e saldo nos últimos 12 meses
// ─────────────────────────────────────────────

'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'
import { useFinanceStore } from '@/store/financeStore'
import { totalIncome, totalExpenses, totalSavings, fmtBRL } from '@/types/finance'
import { useMemo } from 'react'

const MONTH_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

function last12Keys(): string[] {
  const keys: string[] = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return keys
}

export function MonthlyEvolutionChart() {
  const { getMonth } = useFinanceStore()

  const data = useMemo(() => {
    return last12Keys().map((key) => {
      const m    = getMonth(key)
      const inc  = totalIncome(m)
      const exp  = totalExpenses(m)
      const sav  = totalSavings(m)
      const bal  = inc - exp - sav
      const [, mm] = key.split('-')
      return {
        name:    MONTH_SHORT[parseInt(mm) - 1],
        Receita: inc,
        Gastos:  exp,
        Saldo:   bal,
      }
    })
  }, [getMonth])

  const hasData = data.some((d) => d.Receita > 0 || d.Gastos > 0)
  if (!hasData) return null

  return (
    <div className="card p-5">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Evolução Mensal (12 meses)</div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 9 }}
            axisLine={false} tickLine={false}
            tickFormatter={(v) => v >= 1000 ? `${Math.round(v/1000)}k` : String(v)}
          />
          <Tooltip
            formatter={(v: number) => fmtBRL(v)}
            contentStyle={{ background: 'rgba(13,17,23,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 11 }}
          />
          <Legend wrapperStyle={{ fontSize: '10px', color: '#64748b', paddingTop: 8 }} />
          <Line type="monotone" dataKey="Receita" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="Gastos"  stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="Saldo"   stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 3" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
