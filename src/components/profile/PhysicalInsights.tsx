// ─────────────────────────────────────────────
//  Component: Physical Insights
//  Inclui: TMB, TDEE, projeção gordura, hidratação, tendências
// ─────────────────────────────────────────────

'use client'

import { TrendingDown, TrendingUp, Minus, Flame, Droplets, Zap, Activity, Target } from 'lucide-react'
import type { BodyCheckIn, PhysicalProfile } from '@/types/profile'
import { imcCategory } from '@/types/profile'
import { useAppStore } from '@/store/appStore'
import { useActiveHabitKeys } from '@/store/selectors'

// ── TMB + TDEE ────────────────────────────────

const ACTIVITY_MULTIPLIER: Record<string, number> = {
  sedentary:   1.2,
  light:       1.375,
  moderate:    1.55,
  active:      1.725,
  very_active: 1.9,
}

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary:   'Sedentário',
  light:       'Leve',
  moderate:    'Moderado',
  active:      'Ativo',
  very_active: 'Muito ativo',
}

function calcTMB(sex: string | undefined, weight: number, heightCm: number, age: number): number {
  // Mifflin-St Jeor
  const base = 10 * weight + 6.25 * heightCm - 5 * age
  return sex === 'female' ? base - 161 : base + 5
}

function bodyFatCategory(bf: number, sex: string | undefined): { label: string; color: string } {
  if (sex === 'female') {
    if (bf < 14)  return { label: 'Essencial',       color: '#0ea5e9' }
    if (bf < 21)  return { label: 'Atlético',         color: '#10b981' }
    if (bf < 25)  return { label: 'Fitness',          color: '#6366f1' }
    if (bf < 32)  return { label: 'Médio',            color: '#f59e0b' }
    return              { label: 'Acima do ideal',    color: '#ef4444' }
  }
  if (bf < 6)   return { label: 'Essencial',         color: '#0ea5e9' }
  if (bf < 14)  return { label: 'Atlético',           color: '#10b981' }
  if (bf < 18)  return { label: 'Fitness',            color: '#6366f1' }
  if (bf < 25)  return { label: 'Médio',              color: '#f59e0b' }
  return              { label: 'Acima do ideal',      color: '#ef4444' }
}

// ── Insight card ──────────────────────────────

interface InsightCardProps {
  icon:    React.ReactNode
  title:   string
  body:    string
  color:   string
}

function InsightCard({ icon, title, body, color }: InsightCardProps) {
  return (
    <div className="card overflow-hidden">
      <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${color}, ${color}60, transparent)` }} />
      <div className="p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}1a` }}>
          <span style={{ color }}>{icon}</span>
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-slate-300">{title}</div>
          <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{body}</div>
        </div>
      </div>
    </div>
  )
}

interface PhysicalInsightsProps {
  profile: PhysicalProfile
  history: BodyCheckIn[]
}

export function PhysicalInsights({ profile, history }: PhysicalInsightsProps) {
  const habits     = useAppStore((s) => s.data.habits)
  const activeKeys = useActiveHabitKeys()

  const insights: InsightCardProps[] = []
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date))
  const recent = sorted.slice(-7)

  // ── Tendência de peso ─────────────────────
  if (recent.length >= 2) {
    const weights = recent.filter((e) => e.weight !== undefined).map((e) => e.weight!)
    if (weights.length >= 2) {
      const diff  = weights[weights.length - 1] - weights[0]
      const trend = diff > 0.5 ? 'up' : diff < -0.5 ? 'down' : 'flat'
      insights.push({
        icon:  trend === 'up' ? <TrendingUp size={17} /> : trend === 'down' ? <TrendingDown size={17} /> : <Minus size={17} />,
        title: 'Tendência de Peso',
        body:  trend === 'flat'
          ? 'Peso estável nos últimos registros.'
          : `${trend === 'down' ? 'Perda' : 'Ganho'} de ${Math.abs(diff).toFixed(1)}kg nas últimas medições.`,
        color: trend === 'down' ? '#10b981' : trend === 'up' ? '#f59e0b' : '#64748b',
      })
    }
  }

  // ── IMC ───────────────────────────────────
  if (profile.imc) {
    const cat = imcCategory(profile.imc)
    insights.push({
      icon:  <Flame size={17} />,
      title: `IMC: ${profile.imc.toFixed(1)} — ${cat.label}`,
      body:  profile.imc < 25
        ? 'Seu IMC está dentro da faixa saudável (18,5–24,9).'
        : 'Considere ajustar alimentação e exercícios para atingir IMC < 25.',
      color: cat.color,
    })
  }

  // ── TMB + TDEE ────────────────────────────
  if (profile.weight && profile.height && profile.age) {
    const tmb  = Math.round(calcTMB(profile.sex, profile.weight, profile.height, profile.age))
    const mult = ACTIVITY_MULTIPLIER[profile.activityLevel ?? 'sedentary'] ?? 1.2
    const tdee = Math.round(tmb * mult)
    const lvl  = ACTIVITY_LABELS[profile.activityLevel ?? 'sedentary'] ?? 'Sedentário'
    insights.push({
      icon:  <Zap size={17} />,
      title: `TMB: ${tmb} kcal · TDEE: ${tdee} kcal`,
      body:  `Nível de atividade: ${lvl}. Coma abaixo de ${tdee} kcal para perder gordura; acima para ganhar massa.`,
      color: '#f59e0b',
    })
  }

  // ── % Gordura corporal ────────────────────
  if (profile.bodyFat) {
    const cat = bodyFatCategory(profile.bodyFat, profile.sex)
    insights.push({
      icon:  <Activity size={17} />,
      title: `Gordura Corporal: ${profile.bodyFat.toFixed(1)}% — ${cat.label}`,
      body:  cat.label === 'Atlético' || cat.label === 'Fitness'
        ? 'Percentual de gordura em ótima faixa para performance.'
        : `Meta sugerida: ${profile.sex === 'female' ? '14–20%' : '6–17%'} para faixa atlética/fitness.`,
      color: cat.color,
    })
  }

  // ── Projeção HIIT ─────────────────────────
  if (profile.bodyFat && profile.weight) {
    const hiitKey    = activeKeys.find((k) => habits[k]?.name?.toLowerCase().includes('hiit') || k === 'hiit')
    const hiitHabit  = hiitKey ? habits[hiitKey] : null
    const sessPerWeek = hiitHabit?.frequency ?? 0

    if (sessPerWeek > 0 && profile.bodyFat > 13) {
      const targetBf     = 13
      const diffPct      = profile.bodyFat - targetBf
      const fatKg        = (diffPct / 100) * profile.weight
      const kcalPerSess  = 400
      const kcalPerWeek  = kcalPerSess * sessPerWeek
      const weeksNeeded  = Math.ceil((fatKg * 7700) / (kcalPerWeek * 7))
      insights.push({
        icon:  <Target size={17} />,
        title: `Projeção HIIT → ${targetBf}% gordura`,
        body:  `Com ${sessPerWeek}x/sem de HIIT (~${kcalPerSess}kcal/sessão), você pode atingir ${targetBf}% gordura em ≈ ${weeksNeeded} semanas.`,
        color: '#10b981',
      })
    }
  }

  // ── Hidratação ────────────────────────────
  const recentWithWater = recent.filter((e) => e.water !== undefined)
  if (recentWithWater.length) {
    const avgWater = recentWithWater.reduce((a, e) => a + e.water!, 0) / recentWithWater.length
    insights.push({
      icon:  <Droplets size={17} />,
      title: 'Hidratação Média',
      body:  `Média de ${avgWater.toFixed(1)}L por dia. ${avgWater >= 2 ? 'Ótimo!' : 'Tente aumentar para 2L diários.'}`,
      color: '#0ea5e9',
    })
  }

  // ── Tendência gordura ─────────────────────
  if (recent.length >= 2) {
    const bfs = recent.filter((e) => e.bodyFat !== undefined).map((e) => e.bodyFat!)
    if (bfs.length >= 2) {
      const diff = bfs[bfs.length - 1] - bfs[0]
      if (Math.abs(diff) > 0.3) {
        insights.push({
          icon:  diff < 0 ? <TrendingDown size={17} /> : <TrendingUp size={17} />,
          title: diff < 0 ? 'Reduzindo Gordura' : 'Gordura em Alta',
          body:  `${Math.abs(diff).toFixed(1)}% de ${diff < 0 ? 'redução' : 'aumento'} nos últimos registros.`,
          color: diff < 0 ? '#10b981' : '#ef4444',
        })
      }
    }
  }

  if (!insights.length) return null

  return (
    <div>
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Insights</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((ins, i) => <InsightCard key={i} {...ins} />)}
      </div>
    </div>
  )
}
