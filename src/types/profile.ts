// ─────────────────────────────────────────────
//  Types: Physical profile & body evolution
// ─────────────────────────────────────────────

export type Sex       = 'male' | 'female' | 'other'
export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active'

export type PhysicalGoal =
  | 'lose_fat'
  | 'gain_muscle'
  | 'maintain'
  | 'improve_health'
  | 'improve_performance'

export interface PhysicalProfile {
  name?:          string
  age?:           number
  sex?:           Sex
  height?:        number   // cm
  activityLevel?: ActivityLevel
  goal?:          PhysicalGoal

  // Current metrics
  weight?:        number   // kg
  bodyFat?:       number   // %
  leanMass?:      number   // kg (computed = weight * (1 - bf/100))
  fatMass?:       number   // kg (computed)
  waist?:         number   // cm
  imc?:           number   // computed

  // Goals
  goalWeight?:    number
  goalBodyFat?:   number
  goalLeanMass?:  number
  goalWaist?:     number

  updatedAt?:          string
  preferredAiProvider?: 'openai' | 'anthropic' | 'gemini' | 'auto'
}

export interface BodyCheckIn {
  date:      string    // "YYYY-MM-DD"
  weight?:   number
  bodyFat?:  number
  leanMass?: number
  fatMass?:  number
  waist?:    number
  imc?:      number
  calories?: number
  water?:    number   // litres
  notes?:    string
}

// ── Big Five (OCEAN) ──────────────────────────

export type BigFiveSource =
  | '16personalities'
  | 'ipip-120'
  | 'bigfive-test'
  | 'manual'

export interface BigFiveHabitCompatibility {
  habitKey:      string
  habitName:     string
  compatibility: 'alta' | 'media' | 'baixa'
  explanation:   string
}

export interface BigFiveAnalysis {
  generatedAt:          string
  personalityProfile:   string
  strengthsFromTraits:  string[]
  challengesFromTraits: string[]
  habitCompatibility:   BigFiveHabitCompatibility[]
  moodPatterns:         string
  consistencyPrediction:string
  actionableInsights:   string[]
  quarterComparison:    string | null
}

export interface BigFiveResult {
  id:                string
  date:              string       // ISO date do teste (YYYY-MM-DD)
  quarter:           string       // ex: '2026-Q2'
  source:            BigFiveSource

  // escores brutos 0–100
  openness:          number
  conscientiousness: number
  extraversion:      number
  agreeableness:     number
  neuroticism:       number

  rawResultText?:    string
  aiAnalysis?:       BigFiveAnalysis
}

function getBRTPartsNow(): { year: number; month: number; day: number } {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
  const p = Object.fromEntries(fmt.formatToParts(new Date()).map(({ type, value }) => [type, value]))
  return { year: parseInt(p.year), month: parseInt(p.month), day: parseInt(p.day) }
}

export function getBigFiveQuarter(): string {
  const { year, month } = getBRTPartsNow()
  const q = Math.ceil(month / 3)
  return `${year}-Q${q}`
}

export function shouldRemindBigFive(history: BigFiveResult[]): boolean {
  if (!history.length) return true
  const { year: ny, month: nm, day: nd } = getBRTPartsNow()
  const [ly, lm, ld] = history[0].date.split('-').map(Number)
  const daysSince = Math.round(
    (Date.UTC(ny, nm - 1, nd) - Date.UTC(ly, lm - 1, ld)) / 86_400_000,
  )
  return daysSince >= 75
}

export interface ProfileStore {
  profile:         PhysicalProfile
  history:         BodyCheckIn[]
  bigFiveHistory:  BigFiveResult[]
}

// Computed helpers
export function computeIMC(weight: number, heightCm: number): number {
  const h = heightCm / 100
  return Math.round((weight / (h * h)) * 10) / 10
}

export function computeLeanMass(weight: number, bf: number): number {
  return Math.round((weight * (1 - bf / 100)) * 10) / 10
}

export function computeFatMass(weight: number, bf: number): number {
  return Math.round(weight * (bf / 100) * 10) / 10
}

export function imcCategory(imc: number): { label: string; color: string } {
  if (imc < 18.5) return { label: 'Abaixo do peso',      color: '#0ea5e9' }
  if (imc < 25)   return { label: 'Peso normal',          color: '#10b981' }
  if (imc < 30)   return { label: 'Sobrepeso',            color: '#f59e0b' }
  if (imc < 35)   return { label: 'Obesidade grau I',     color: '#ef4444' }
  if (imc < 40)   return { label: 'Obesidade grau II',    color: '#dc2626' }
  return               { label: 'Obesidade grau III',    color: '#7f1d1d' }
}

/** Normaliza altura para cm: se o usuário digitou em metros (ex: 1.85), converte */
export function normalizeHeightCm(raw: number): number {
  return raw < 3 ? Math.round(raw * 100) : raw
}

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary:   'Sedentário (< 1× semana)',
  light:       'Leve (1-2× semana)',
  moderate:    'Moderado (3-4× semana)',
  active:      'Ativo (5-6× semana)',
  very_active: 'Muito ativo (2× por dia)',
}

export const GOAL_LABELS: Record<PhysicalGoal, string> = {
  lose_fat:           'Perder gordura',
  gain_muscle:        'Ganhar massa muscular',
  maintain:           'Manter peso',
  improve_health:     'Melhorar saúde geral',
  improve_performance:'Melhorar performance',
}
