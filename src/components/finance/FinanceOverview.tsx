// ─────────────────────────────────────────────
//  Component: Finance Overview Stats
// ─────────────────────────────────────────────

'use client'

import { TrendingUp, TrendingDown, PiggyBank, Wallet } from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import {
  totalIncome, totalExpenses, totalSavings, netBalance, savingsRate,
} from '@/types/finance'
import type { MonthlyFinance } from '@/types/finance'

function fmtBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

interface FinanceOverviewProps {
  month: MonthlyFinance
}

export function FinanceOverview({ month }: FinanceOverviewProps) {
  const income   = totalIncome(month)
  const expenses = totalExpenses(month)
  const savings  = totalSavings(month)
  const balance  = netBalance(month)
  const rate     = savingsRate(month)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        icon={<TrendingUp size={18} />}
        value={fmtBRL(income)}
        label="Receita Total"
        color="#10b981"
      />
      <StatCard
        icon={<TrendingDown size={18} />}
        value={fmtBRL(expenses)}
        label="Gastos"
        color="#ef4444"
      />
      <StatCard
        icon={<PiggyBank size={18} />}
        value={fmtBRL(savings)}
        label="Poupança / Inv."
        color="#6366f1"
        meta={`${rate}% da renda`}
      />
      <StatCard
        icon={<Wallet size={18} />}
        value={fmtBRL(balance)}
        label="Saldo Livre"
        color={balance >= 0 ? '#22d3ee' : '#f97316'}
      />
    </div>
  )
}
