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
import { formatBRL } from '@/lib/formatBRL'

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
        value={formatBRL(income)}
        label="Receita Total"
        color="#10b981"
      />
      <StatCard
        icon={<TrendingDown size={18} />}
        value={formatBRL(expenses)}
        label="Gastos"
        color="#ef4444"
      />
      <StatCard
        icon={<PiggyBank size={18} />}
        value={formatBRL(savings)}
        label="Poupança / Inv."
        color="#6366f1"
        meta={`${rate}% da renda`}
      />
      <StatCard
        icon={<Wallet size={18} />}
        value={formatBRL(balance)}
        label="Saldo Livre"
        color={balance >= 0 ? '#22d3ee' : '#f97316'}
      />
    </div>
  )
}
