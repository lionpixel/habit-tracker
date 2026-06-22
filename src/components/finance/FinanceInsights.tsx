// ─────────────────────────────────────────────
//  Component: Finance Insights
// ─────────────────────────────────────────────

'use client'

import { TrendingUp, AlertTriangle, PiggyBank, Award } from 'lucide-react'
import {
  totalIncome, totalExpenses, totalSavings, netBalance, savingsRate,
} from '@/types/finance'
import { formatBRL } from '@/lib/formatBRL'
import type { MonthlyFinance } from '@/types/finance'

interface InsightItem {
  icon:  React.ReactNode
  title: string
  body:  string
  color: string
}

interface FinanceInsightsProps {
  month: MonthlyFinance
  goals?: { name: string; pct: number }[]
}

export function FinanceInsights({ month, goals }: FinanceInsightsProps) {
  const income   = totalIncome(month)
  const expenses = totalExpenses(month)
  const _savings  = totalSavings(month)
  const balance  = netBalance(month)
  const rate     = savingsRate(month)

  const insights: InsightItem[] = []

  if (income === 0) return null

  // Savings rate
  if (rate >= 20) {
    insights.push({
      icon:  <PiggyBank size={17} />,
      title: `Taxa de poupança: ${rate}%`,
      body:  rate >= 30 ? 'Excelente! Você está poupando acima de 30% da renda.' : 'Bom! Meta ideal é poupar 20% ou mais da renda.',
      color: '#10b981',
    })
  } else {
    insights.push({
      icon:  <AlertTriangle size={17} />,
      title: `Poupança baixa: ${rate}%`,
      body:  'Tente economizar ao menos 20% da sua renda mensal.',
      color: '#f59e0b',
    })
  }

  // Balance
  if (balance > 0) {
    insights.push({
      icon:  <TrendingUp size={17} />,
      title: 'Saldo positivo',
      body:  `Você tem ${formatBRL(Math.round(balance))} de sobra neste mês. Considere investir!`,
      color: '#22d3ee',
    })
  } else if (balance < 0) {
    insights.push({
      icon:  <AlertTriangle size={17} />,
      title: 'Saldo negativo',
      body:  `Seus gastos excedem sua renda em ${formatBRL(Math.abs(Math.round(balance)))}.`,
      color: '#ef4444',
    })
  }

  // Biggest expense
  const expenseRatio = income > 0 ? expenses / income : 0
  if (expenseRatio > 0.7) {
    insights.push({
      icon:  <AlertTriangle size={17} />,
      title: 'Gastos elevados',
      body:  `${Math.round(expenseRatio * 100)}% da renda vai para despesas. Revise onde pode cortar.`,
      color: '#ef4444',
    })
  }

  // Goal milestone
  if (goals) {
    const nearDone = goals.filter((g) => g.pct >= 90 && g.pct < 100)
    nearDone.slice(0, 1).forEach(({ name, pct }) => {
      insights.push({
        icon:  <Award size={17} />,
        title: `Meta quase lá — ${name}`,
        body:  `${pct}% concluído. Mais um esforço!`,
        color: '#a78bfa',
      })
    })
  }

  if (!insights.length) return null

  return (
    <div>
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Insights</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((ins, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${ins.color}, ${ins.color}60, transparent)` }} />
            <div className="p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${ins.color}1a` }}>
                <span style={{ color: ins.color }}>{ins.icon}</span>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-300">{ins.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{ins.body}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
