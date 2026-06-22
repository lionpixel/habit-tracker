// ─────────────────────────────────────────────
//  View: Finance
// ─────────────────────────────────────────────

'use client'

import { useState, useEffect, useMemo } from 'react'
import { DollarSign, ChevronLeft, ChevronRight, Plus, Settings } from 'lucide-react'
import { useFinanceStore, currentMonthKey } from '@/store/financeStore'
import { FinanceOverview }       from './FinanceOverview'
import { IncomeChart }           from './IncomeChart'
import { ExpenseChart }          from './ExpenseChart'
import { SavingsGoalCard }       from './SavingsGoalCard'
import { WealthProgress }        from './WealthProgress'
import { FinanceInsights }       from './FinanceInsights'
import { FinancialGoalModal }    from './FinancialGoalModal'
import { MonthlyFinanceTable }   from './MonthlyFinanceTable'
import { CompanyCardsSection }   from './CompanyCardsSection'
import { MonthlyEvolutionChart } from './MonthlyEvolutionChart'
import { FadeInUp, StaggerList, StaggerItem } from '@/components/ui/Motion'
import { totalIncome } from '@/types/finance'
import type { FinancialGoal } from '@/types/finance'

const MONTH_NAMES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

function parseMonthKey(key: string): { year: number; month: number } {
  const [y, m] = key.split('-').map(Number)
  return { year: y, month: m }
}

function formatMonthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

export function FinanceView() {
  const { goals, profile, hydrated, hydrate, getMonth } = useFinanceStore()

  useEffect(() => { if (!hydrated) hydrate() }, [hydrated, hydrate])

  const [monthKey, setMonthKey] = useState(currentMonthKey)
  const [goalModalOpen, setGoalModalOpen]     = useState(false)
  const [selectedGoal,  setSelectedGoal]      = useState<FinancialGoal | null>(null)
  const [goalModalMode, setGoalModalMode]     = useState<'create' | 'edit' | 'contribute'>('create')
  const [showTable, setShowTable]             = useState(false)

  const month = useMemo(() => getMonth(monthKey), [getMonth, monthKey])
  const { year, month: m } = parseMonthKey(monthKey)

  const income = totalIncome(month)

  const goalsSummary = useMemo(
    () => goals.map((g) => ({
      name: g.name,
      pct:  g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0,
    })),
    [goals],
  )

  function prevMonth() {
    let nm = m - 1, ny = year
    if (nm < 1) { nm = 12; ny-- }
    setMonthKey(formatMonthKey(ny, nm))
  }

  function nextMonth() {
    let nm = m + 1, ny = year
    if (nm > 12) { nm = 1; ny++ }
    setMonthKey(formatMonthKey(ny, nm))
  }

  function openGoalContrib(goal: FinancialGoal) {
    setSelectedGoal(goal)
    setGoalModalMode('contribute')
    setGoalModalOpen(true)
  }

  function openGoalEdit(goal: FinancialGoal) {
    setSelectedGoal(goal)
    setGoalModalMode('edit')
    setGoalModalOpen(true)
  }

  function openGoalCreate() {
    setSelectedGoal(null)
    setGoalModalMode('create')
    setGoalModalOpen(true)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeInUp>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <DollarSign size={20} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-100">Finanças</h2>
              <p className="text-slate-500 text-sm">Controle de renda, gastos e metas</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowTable((s) => !s)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] text-slate-400 text-sm font-semibold hover:bg-white/[0.1] transition-colors"
          >
            <Settings size={15} />
            {showTable ? 'Ver gráficos' : 'Lançar dados'}
          </button>
        </div>
      </FadeInUp>

      {/* Month navigator */}
      <FadeInUp delay={0.03}>
        <div className="flex items-center justify-between card px-5 py-3">
          <button type="button" onClick={prevMonth} className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <div className="text-center">
            <div className="font-bold text-slate-200">{MONTH_NAMES[m - 1]}</div>
            <div className="text-xs text-slate-500 tabular-nums">{year}</div>
          </div>
          <button type="button" onClick={nextMonth} className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </FadeInUp>

      {showTable ? (
        /* ── Data entry mode ── */
        <FadeInUp delay={0.05}>
          <MonthlyFinanceTable monthKey={monthKey} />
        </FadeInUp>
      ) : (
        /* ── Charts mode ── */
        <>
          {/* Company A/B */}
          <FadeInUp delay={0.04}>
            <CompanyCardsSection month={month} />
          </FadeInUp>

          {/* Stats overview */}
          <FadeInUp delay={0.05}>
            <FinanceOverview month={month} />
          </FadeInUp>

          {/* Insights */}
          <FadeInUp delay={0.07}>
            <FinanceInsights month={month} goals={goalsSummary} />
          </FadeInUp>

          {/* Income + Expense charts */}
          <FadeInUp delay={0.09}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <IncomeChart  month={month} />
              <ExpenseChart month={month} />
            </div>
          </FadeInUp>

          {/* Monthly evolution (12 months) */}
          <FadeInUp delay={0.10}>
            <MonthlyEvolutionChart />
          </FadeInUp>

          {/* Wealth/percentile */}
          {income > 0 && (
            <FadeInUp delay={0.11}>
              <WealthProgress profile={profile} monthlyIncome={income} />
            </FadeInUp>
          )}
        </>
      )}

      {/* Goals */}
      <FadeInUp delay={0.13}>
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Metas Financeiras</div>
            <button
              type="button"
              onClick={openGoalCreate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-semibold hover:bg-indigo-500/25 transition-colors"
            >
              <Plus size={13} /> Nova Meta
            </button>
          </div>

          {goals.length === 0 ? (
            <div className="card p-6 text-center text-slate-600 text-sm">
              Nenhuma meta financeira cadastrada.
            </div>
          ) : (
            <StaggerList className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {goals.map((goal) => (
                <StaggerItem key={goal.id}>
                  <SavingsGoalCard
                    goal={goal}
                    onContribute={() => openGoalContrib(goal)}
                    onClick={() => openGoalEdit(goal)}
                  />
                </StaggerItem>
              ))}
            </StaggerList>
          )}
        </div>
      </FadeInUp>

      {/* Goal modal */}
      <FinancialGoalModal
        open={goalModalOpen}
        goal={selectedGoal}
        mode={goalModalMode}
        onClose={() => setGoalModalOpen(false)}
      />
    </div>
  )
}
