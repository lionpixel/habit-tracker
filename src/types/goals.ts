// ─────────────────────────────────────────────
//  Types: Personal Organization System
//  Hierarchy: Annual → Quarterly → Monthly → Weekly → Daily
// ─────────────────────────────────────────────

export type GoalStatus   = 'not_started' | 'in_progress' | 'done' | 'cancelled'
export type GoalPriority = 'critical' | 'high' | 'medium' | 'low'
export type GoalLevel    = 'annual' | 'quarterly' | 'monthly' | 'weekly' | 'daily'

export const STATUS_LABELS: Record<GoalStatus, string> = {
  not_started: 'Não iniciado',
  in_progress: 'Em andamento',
  done:        'Finalizado',
  cancelled:   'Cancelado',
}

export const STATUS_COLORS: Record<GoalStatus, string> = {
  not_started: '#475569',
  in_progress: '#6366f1',
  done:        '#10b981',
  cancelled:   '#ef4444',
}

export const PRIORITY_LABELS: Record<GoalPriority, string> = {
  critical: 'Crítico',
  high:     'Alto',
  medium:   'Médio',
  low:      'Baixo',
}

export const PRIORITY_COLORS: Record<GoalPriority, string> = {
  critical: '#ef4444',
  high:     '#f97316',
  medium:   '#f59e0b',
  low:      '#64748b',
}

// ── Base ──────────────────────────────────────

export interface BaseGoal {
  id:          string
  title:       string
  description?: string
  category?:   string     // CategoryId
  priority:    GoalPriority
  status:      GoalStatus
  progress:    number     // 0-100
  notes?:      string
  color?:      string
  icon?:       string
  tags?:       string[]
  createdAt:   string
  updatedAt?:  string

  // Metric target (e.g. "R$ 10.000", "3 contratos")
  targetValue?: number
  targetUnit?:  string    // "R$", "kg", "contratos"
  currentValue?: number
}

// ── Annual ────────────────────────────────────

export interface AnnualGoal extends BaseGoal {
  year:              number
  quarterlyGoalIds:  string[]
}

// ── Quarterly ────────────────────────────────

export type Quarter = 1 | 2 | 3 | 4

export interface QuarterlyGoal extends BaseGoal {
  year:           number
  quarter:        Quarter
  annualGoalId?:  string   // parent
  monthlyGoalIds: string[]
}

// ── Monthly ───────────────────────────────────

export interface MonthlyGoal extends BaseGoal {
  year:             number
  month:            number   // 1-12
  quarterlyGoalId?: string   // parent
  weeklyGoalIds:    string[]
  calendarEventId?: string
}

// ── Weekly ────────────────────────────────────

export interface WeeklyGoal extends BaseGoal {
  year:           number
  week:           number    // ISO week number
  monthlyGoalId?: string    // parent
  taskIds:        string[]
}

// ── Daily Task ────────────────────────────────

export interface DailyTask {
  id:               string
  title:            string
  description?:     string
  date:             string    // YYYY-MM-DD
  weeklyGoalId?:    string    // parent
  dueTime?:         string    // HH:MM
  priority:         GoalPriority
  status:           GoalStatus
  category?:        string
  estimatedMinutes?: number
  actualMinutes?:   number
  sortOrder?:       number
  source?:          'manual' | 'calendar'
  calendarEventId?: string
  notes?:           string
  tags?:            string[]
  createdAt:        string
  completedAt?:     string
  pomosPlanned?:    number   // 1 | 2  (2+2+1 system)
  pomosCompleted?:  number   // 0..pomosPlanned
}

// ── Personal Rules ────────────────────────────

export type RuleCategory = 'social' | 'consumo' | 'foco' | 'saude' | 'outro'

export interface PersonalRule {
  id:             string
  title:          string
  description?:   string
  category:       RuleCategory
  limit?:         number      // e.g. 3 (vezes/dia)
  limitUnit?:     string      // e.g. 'vez/dia'
  days?:          number[]    // 0=dom..6=sab; undefined = every day
  completedDates: string[]    // YYYY-MM-DD dates marked done
  createdAt:      string
}

// ── Project ───────────────────────────────────

export interface ProjectMilestone {
  id:           string
  title:        string
  deadline?:    string      // YYYY-MM-DD
  completed:    boolean
  completedAt?: string
}

export interface Project {
  id:          string
  name:        string
  description?: string
  status:      GoalStatus
  progress:    number      // 0-100
  category?:   string
  priority:    GoalPriority
  startDate?:  string      // YYYY-MM-DD
  deadline?:   string      // YYYY-MM-DD
  color?:      string
  icon?:       string
  milestones:  ProjectMilestone[]
  linkedGoalIds: string[]  // any level goal ids
  notes?:      string
  tags?:       string[]
  createdAt:   string
  updatedAt?:  string
}

// ── Store shape ───────────────────────────────

export interface GoalsStore {
  annualGoals:    AnnualGoal[]
  quarterlyGoals: QuarterlyGoal[]
  monthlyGoals:   MonthlyGoal[]
  weeklyGoals:    WeeklyGoal[]
  dailyTasks:     DailyTask[]
  projects:       Project[]
  notes:          Record<string, string>  // "YYYY-WNN" → markdown content
  personalRules:  PersonalRule[]
}

// ── Helpers ───────────────────────────────────

export function getQuarter(month: number): Quarter {
  if (month <= 3) return 1
  if (month <= 6) return 2
  if (month <= 9) return 3
  return 4
}

export function getQuarterMonths(quarter: Quarter): number[] {
  return [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [10, 11, 12],
  ][quarter - 1]
}

export function getQuarterLabel(quarter: Quarter): string {
  return `Q${quarter}`
}

export function getQuarterRange(year: number, quarter: Quarter): string {
  const months = getQuarterMonths(quarter)
  const MONTH_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return `${MONTH_SHORT[months[0] - 1]}–${MONTH_SHORT[months[2] - 1]} ${year}`
}

export function getDaysUntil(dateStr: string): number {
  // Import inline to avoid circular deps — both are pure string ops
  const [ty, tm, td] = dateStr.split('-').map(Number)
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
  const p = Object.fromEntries(fmt.formatToParts(new Date()).map(({ type, value }) => [type, value]))
  const [ny, nm, nd] = [parseInt(p.year), parseInt(p.month), parseInt(p.day)]
  return (
    Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(ny, nm - 1, nd)) / 86_400_000)
  )
}

export function isOverdue(dateStr: string): boolean {
  return getDaysUntil(dateStr) < 0
}

export function computeProgressFromChildren(childProgresses: number[]): number {
  if (!childProgresses.length) return 0
  return Math.round(childProgresses.reduce((a, b) => a + b, 0) / childProgresses.length)
}

export function deriveStatus(progress: number, manualStatus?: GoalStatus): GoalStatus {
  if (manualStatus === 'cancelled') return 'cancelled'
  if (manualStatus === 'done' || progress >= 100) return 'done'
  if (progress > 0) return 'in_progress'
  return 'not_started'
}

export const GOAL_CATEGORY_OPTIONS = [
  'Financeiro', 'Carreira', 'Saúde', 'Relacionamentos',
  'Educação', 'Pessoal', 'Negócios', 'Espiritualidade',
]

export const GOAL_ICONS = [
  'Target','TrendingUp','DollarSign','Briefcase','Heart','BookOpen',
  'Users','Star','Zap','Award','Flame','Globe','Rocket','Shield',
]

export const GOAL_COLORS = [
  '#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#0ea5e9',
  '#22d3ee','#ec4899','#f97316','#34d399','#a78bfa','#38bdf8',
]
