// ─────────────────────────────────────────────
//  Component: Monthly Finance Input Table
// ─────────────────────────────────────────────

'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Save } from 'lucide-react'
import * as Icons from 'lucide-react'
import {
  INCOME_CATEGORIES, EXPENSE_CATEGORIES, SAVINGS_CATEGORIES,
  totalIncome, totalExpenses, totalSavings,
} from '@/types/finance'
import type { MonthlyFinance, FinanceCategory } from '@/types/finance'
import { useFinanceStore } from '@/store/financeStore'
import { cn } from '@/lib/helpers'

import { formatBRL } from '@/lib/formatBRL'

function LucideIcon({ name, size = 14, style }: { name: string; size?: number; style?: React.CSSProperties }) {
  const Icon = (Icons as Record<string, unknown>)[name] as React.FC<{ size?: number; style?: React.CSSProperties }> | undefined
  if (!Icon) return null
  return <Icon size={size} style={style} />
}

const FIELD_MAP: Record<string, keyof MonthlyFinance> = {
  salary: 'salary', freelance: 'freelance', business: 'business',
  investment_return: 'investmentReturn', other_income: 'otherIncome',
  housing: 'housing', food: 'food', transport: 'transport', health: 'health',
  education: 'education', entertainment: 'entertainment', utilities: 'utilities',
  clothing: 'clothing', personal: 'personal', debt: 'debt', other_expense: 'otherExpense',
  investments: 'investments', emergency_fund: 'emergencyFund', savings: 'savings',
}

interface SectionProps {
  title:      string
  categories: FinanceCategory[]
  values:     Record<string, number>
  onChange:   (field: keyof MonthlyFinance, value: number) => void
  sectionTotal: number
  totalColor:  string
}

function Section({ title, categories, values, onChange, sectionTotal, totalColor }: SectionProps) {
  const [open, setOpen] = useState(true)

  return (
    <div className="border border-white/[0.06] rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{title}</span>
        </div>
        <span className="text-sm font-black tabular-nums" style={{ color: totalColor }}>{formatBRL(sectionTotal)}</span>
      </button>

      {open && (
        <div className="divide-y divide-white/[0.04]">
          {categories.map((cat) => {
            const field = FIELD_MAP[cat.id]
            const val   = field ? (values[field] ?? 0) : 0
            return (
              <div key={cat.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${cat.color}18` }}>
                  <LucideIcon name={cat.icon} size={13} style={{ color: cat.color }} />
                </div>
                <span className="flex-1 text-xs font-semibold text-slate-400 min-w-0 truncate">{cat.name}</span>
                <input
                  type="number"
                  min={0}
                  step="any"
                  className="w-32 text-right bg-white/[0.05] rounded-lg px-3 py-1.5 text-slate-200 text-xs font-bold tabular-nums border border-white/[0.06] focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white/[0.08]"
                  value={val === 0 ? '' : val}
                  placeholder="R$ 0"
                  onChange={(e) => field && onChange(field, Number(e.target.value) || 0)}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface MonthlyFinanceTableProps {
  monthKey: string
}

export function MonthlyFinanceTable({ monthKey }: MonthlyFinanceTableProps) {
  const { getMonth, updateMonth } = useFinanceStore()
  const [saved, setSaved] = useState(false)

  const _month  = getMonth(monthKey)
  const [draft, setDraft] = useState<MonthlyFinance>(() => getMonth(monthKey))

  // Keep draft in sync when monthKey changes
  const [prevKey, setPrevKey] = useState(monthKey)
  if (prevKey !== monthKey) {
    setPrevKey(monthKey)
    setDraft(getMonth(monthKey))
  }

  function handleChange(field: keyof MonthlyFinance, value: number) {
    setDraft((d) => ({ ...d, [field]: value }))
  }

  function handleSave() {
    updateMonth(monthKey, draft)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const values = draft as unknown as Record<string, number>

  return (
    <div className="space-y-3">
      {/* Company A/B inputs */}
      <div className="border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-white/[0.03]">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Faturamento Empresas (PJ)</span>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {[
            { label: 'Empresa A', field: 'companyARevenue' as keyof MonthlyFinance, color: '#6366f1' },
            { label: 'Empresa B', field: 'companyBRevenue' as keyof MonthlyFinance, color: '#0ea5e9' },
          ].map(({ label, field, color }) => (
            <div key={field} className="flex items-center gap-3 px-4 py-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
                <span style={{ color, fontSize: 11, fontWeight: 800 }}>PJ</span>
              </div>
              <span className="flex-1 text-xs font-semibold text-slate-400">{label}</span>
              <input
                type="number" min={0} step="any"
                className="w-32 text-right bg-white/[0.05] rounded-lg px-3 py-1.5 text-slate-200 text-xs font-bold tabular-nums border border-white/[0.06] focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white/[0.08]"
                value={(values[field as string] ?? 0) === 0 ? '' : values[field as string]}
                placeholder="R$ 0"
                onChange={(e) => handleChange(field, Number(e.target.value) || 0)}
              />
            </div>
          ))}
        </div>
      </div>

      <Section
        title="Receitas"
        categories={INCOME_CATEGORIES}
        values={values}
        onChange={handleChange}
        sectionTotal={totalIncome(draft)}
        totalColor="#10b981"
      />
      <Section
        title="Gastos"
        categories={EXPENSE_CATEGORIES}
        values={values}
        onChange={handleChange}
        sectionTotal={totalExpenses(draft)}
        totalColor="#ef4444"
      />
      <Section
        title="Poupança & Investimentos"
        categories={SAVINGS_CATEGORIES}
        values={values}
        onChange={handleChange}
        sectionTotal={totalSavings(draft)}
        totalColor="#6366f1"
      />

      <button
        type="button"
        onClick={handleSave}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all',
          saved
            ? 'bg-emerald-500/20 text-emerald-300'
            : 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30',
        )}
      >
        <Save size={15} />
        {saved ? 'Salvo!' : 'Salvar Mês'}
      </button>
    </div>
  )
}
