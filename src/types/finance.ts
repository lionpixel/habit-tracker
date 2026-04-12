// ─────────────────────────────────────────────
//  Types: Finance system
// ─────────────────────────────────────────────

export type FinanceCategoryId =
  | 'salary' | 'freelance' | 'business' | 'investment_return' | 'other_income'
  | 'housing' | 'food' | 'transport' | 'health' | 'education'
  | 'entertainment' | 'utilities' | 'clothing' | 'personal' | 'debt' | 'other_expense'
  | 'investments' | 'emergency_fund' | 'savings'

export type TransactionType = 'income' | 'expense' | 'transfer'

export interface FinanceCategory {
  id:    FinanceCategoryId | string
  name:  string
  icon:  string     // Lucide
  color: string
  type:  'income' | 'expense' | 'neutral'
}

export interface MonthlyFinance {
  monthKey: string    // "YYYY-MM"

  // Income
  salary:          number
  freelance:       number
  business:        number
  investmentReturn:number
  otherIncome:     number

  // Expenses
  housing:         number
  food:            number
  transport:       number
  health:          number
  education:       number
  entertainment:   number
  utilities:       number
  clothing:        number
  personal:        number
  debt:            number
  otherExpense:    number

  // Savings / investments
  investments:     number
  emergencyFund:   number
  savings:         number

  notes?:          string
}

export interface FinancialGoal {
  id:          string
  name:        string
  targetAmount:number
  currentAmount:number
  deadline?:   string    // "YYYY-MM"
  icon?:       string
  color?:      string
  createdAt:   string
}

export interface FinanceStore {
  months:         MonthlyFinance[]
  goals:          FinancialGoal[]
  profile: {
    monthlyIncome?:    number
    patrimony?:        number
    emergencyTarget?:  number   // months of expenses
    currency:          string   // 'BRL'
  }
}

// Computed helpers
export function totalIncome(m: MonthlyFinance): number {
  return m.salary + m.freelance + m.business + m.investmentReturn + m.otherIncome
}

export function totalExpenses(m: MonthlyFinance): number {
  return (
    m.housing + m.food + m.transport + m.health +
    m.education + m.entertainment + m.utilities +
    m.clothing + m.personal + m.debt + m.otherExpense
  )
}

export function totalSavings(m: MonthlyFinance): number {
  return m.investments + m.emergencyFund + m.savings
}

export function netBalance(m: MonthlyFinance): number {
  return totalIncome(m) - totalExpenses(m) - totalSavings(m)
}

export function savingsRate(m: MonthlyFinance): number {
  const income = totalIncome(m)
  if (income <= 0) return 0
  return Math.round(((totalSavings(m)) / income) * 100)
}

export function emptyMonth(monthKey: string): MonthlyFinance {
  return {
    monthKey,
    salary: 0, freelance: 0, business: 0, investmentReturn: 0, otherIncome: 0,
    housing: 0, food: 0, transport: 0, health: 0, education: 0,
    entertainment: 0, utilities: 0, clothing: 0, personal: 0, debt: 0, otherExpense: 0,
    investments: 0, emergencyFund: 0, savings: 0,
  }
}

// Brazil income percentile approximation (2024 data)
export function brIncomePercentile(monthlyIncome: number): number {
  if (monthlyIncome < 500)   return 10
  if (monthlyIncome < 1000)  return 20
  if (monthlyIncome < 1412)  return 30  // salário mínimo
  if (monthlyIncome < 2000)  return 40
  if (monthlyIncome < 3000)  return 55
  if (monthlyIncome < 5000)  return 70
  if (monthlyIncome < 8000)  return 82
  if (monthlyIncome < 15000) return 92
  if (monthlyIncome < 30000) return 97
  return 99
}

// Global income percentile approximation
export function globalIncomePercentile(monthlyIncomeUSD: number): number {
  const annual = monthlyIncomeUSD * 12
  if (annual < 1000)  return 15
  if (annual < 3000)  return 30
  if (annual < 8000)  return 50
  if (annual < 15000) return 65
  if (annual < 25000) return 75
  if (annual < 50000) return 85
  if (annual < 100000)return 93
  return 99
}

export const INCOME_CATEGORIES: FinanceCategory[] = [
  { id: 'salary',           name: 'Salário',           icon: 'Banknote',    color: '#10b981', type: 'income'  },
  { id: 'freelance',        name: 'Freelas',           icon: 'Laptop',      color: '#22d3ee', type: 'income'  },
  { id: 'business',         name: 'Negócios',          icon: 'Building2',   color: '#6366f1', type: 'income'  },
  { id: 'investment_return',name: 'Rend. Invest.',     icon: 'TrendingUp',  color: '#34d399', type: 'income'  },
  { id: 'other_income',     name: 'Outras Entradas',   icon: 'PlusCircle',  color: '#a78bfa', type: 'income'  },
]

export const EXPENSE_CATEGORIES: FinanceCategory[] = [
  { id: 'housing',       name: 'Moradia',        icon: 'Home',        color: '#64748b', type: 'expense' },
  { id: 'food',          name: 'Alimentação',    icon: 'UtensilsCrossed', color: '#f59e0b', type: 'expense' },
  { id: 'transport',     name: 'Transporte',     icon: 'Car',         color: '#0ea5e9', type: 'expense' },
  { id: 'health',        name: 'Saúde',          icon: 'Heart',       color: '#ef4444', type: 'expense' },
  { id: 'education',     name: 'Educação',       icon: 'GraduationCap', color: '#8b5cf6', type: 'expense' },
  { id: 'entertainment', name: 'Lazer',          icon: 'Smile',       color: '#fbbf24', type: 'expense' },
  { id: 'utilities',     name: 'Contas',         icon: 'Zap',         color: '#f97316', type: 'expense' },
  { id: 'clothing',      name: 'Vestuário',      icon: 'Shirt',       color: '#ec4899', type: 'expense' },
  { id: 'personal',      name: 'Pessoal',        icon: 'User',        color: '#a855f7', type: 'expense' },
  { id: 'debt',          name: 'Dívidas',        icon: 'AlertCircle', color: '#dc2626', type: 'expense' },
  { id: 'other_expense', name: 'Outros',         icon: 'MoreHorizontal', color: '#475569', type: 'expense' },
]

export const SAVINGS_CATEGORIES: FinanceCategory[] = [
  { id: 'investments',    name: 'Investimentos',   icon: 'BarChart3',  color: '#10b981', type: 'neutral' },
  { id: 'emergency_fund', name: 'Reserva Emerg.',  icon: 'Shield',     color: '#0ea5e9', type: 'neutral' },
  { id: 'savings',        name: 'Poupança',        icon: 'PiggyBank',  color: '#a78bfa', type: 'neutral' },
]
