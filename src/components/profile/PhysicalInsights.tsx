// ─────────────────────────────────────────────
//  Component: Physical Insights
// ─────────────────────────────────────────────

'use client'

import { TrendingDown, TrendingUp, Minus, Flame, Droplets } from 'lucide-react'
import type { BodyCheckIn, PhysicalProfile } from '@/types/profile'
import { imcCategory } from '@/types/profile'

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
        <div>
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
  const insights: InsightCardProps[] = []

  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date))
  const recent = sorted.slice(-7)
  const _prev7  = sorted.slice(-14, -7)

  // Weight trend
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

  // IMC insight
  if (profile.imc) {
    const cat = imcCategory(profile.imc)
    insights.push({
      icon:  <Flame size={17} />,
      title: `IMC: ${profile.imc.toFixed(1)} — ${cat.label}`,
      body:  profile.imc < 25
        ? 'Seu IMC está dentro da faixa saudável.'
        : 'Considere ajustar alimentação e exercícios para atingir um IMC ideal.',
      color: cat.color,
    })
  }

  // Water/calories
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

  // Body fat trend
  if (recent.length >= 2) {
    const bfs = recent.filter((e) => e.bodyFat !== undefined).map((e) => e.bodyFat!)
    if (bfs.length >= 2) {
      const diff = bfs[bfs.length - 1] - bfs[0]
      if (Math.abs(diff) > 0.3) {
        insights.push({
          icon:  diff < 0 ? <TrendingDown size={17} /> : <TrendingUp size={17} />,
          title: diff < 0 ? 'Reduzindo Gordura' : 'Gordura em Alta',
          body:  `${Math.abs(diff).toFixed(1)}% de ${diff < 0 ? 'redução' : 'aumento'} recente.`,
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
