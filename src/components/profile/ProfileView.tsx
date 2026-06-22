// ─────────────────────────────────────────────
//  View: Profile — corpo, evolução física
// ─────────────────────────────────────────────

'use client'

import { useEffect } from 'react'
import { User, ClipboardCheck, TrendingUp, Camera } from 'lucide-react'
import { useState } from 'react'
import { useProfileStore } from '@/store/profileStore'
import { ProfileOverview }        from './ProfileOverview'
import { BodyMetricsCard }        from './BodyMetricsCard'
import { BodyEvolutionChart }     from './BodyEvolutionChart'
import { GoalProgressCard }       from './GoalProgressCard'
import { PhysicalInsights }       from './PhysicalInsights'
import { WeeklyCheckinModal }     from './WeeklyCheckinModal'
import { ProgressPhotoTracker }   from './ProgressPhotoTracker'
import { PersonalRulesSection }   from './PersonalRulesSection'
import { BigFiveSection }          from './BigFiveSection'
import { FadeInUp } from '@/components/ui/Motion'
import { StatCard }  from '@/components/ui/StatCard'
import { todayStr }  from '@/lib/helpers'
import { imcCategory } from '@/types/profile'

export function ProfileView() {
  const { profile, history, hydrated, hydrate } = useProfileStore()
  const [checkinOpen, setCheckinOpen] = useState(false)

  useEffect(() => { if (!hydrated) hydrate() }, [hydrated, hydrate])

  const _todayCheckin = history.find((e) => e.date === todayStr())
  const lastCheckin  = history[0]

  // Change vs previous entry
  const weightDiff = history.length >= 2 && history[0].weight && history[1].weight
    ? history[0].weight - history[1].weight
    : null

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeInUp>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <User size={20} className="text-violet-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-100">Perfil</h2>
              <p className="text-slate-500 text-sm">Evolução física e métricas corporais</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCheckinOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-300 text-sm font-semibold hover:bg-emerald-500/25 transition-colors"
          >
            <ClipboardCheck size={16} />
            Check-in
          </button>
        </div>
      </FadeInUp>

      {/* Quick stats */}
      <FadeInUp delay={0.05}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<TrendingUp size={18} />}
            value={profile.weight != null ? `${profile.weight.toFixed(1)}kg` : '—'}
            label="Peso Atual"
            color="#6366f1"
            trend={weightDiff != null ? { value: -Math.round(Math.abs(weightDiff) * 10), label: '' } : undefined}
          />
          <StatCard
            icon={<TrendingUp size={18} />}
            value={profile.bodyFat != null ? `${profile.bodyFat.toFixed(1)}%` : '—'}
            label="% Gordura"
            color="#ef4444"
          />
          <StatCard
            icon={<TrendingUp size={18} />}
            value={profile.imc != null ? profile.imc.toFixed(1) : '—'}
            label={profile.imc ? imcCategory(profile.imc).label : 'IMC'}
            color={profile.imc ? imcCategory(profile.imc).color : '#64748b'}
          />
          <StatCard
            icon={<ClipboardCheck size={18} />}
            value={history.length}
            label="Check-ins"
            color="#10b981"
            meta={lastCheckin ? `Último: ${lastCheckin.date}` : undefined}
          />
        </div>
      </FadeInUp>

      {/* Profile overview / edit */}
      <FadeInUp delay={0.08}>
        <ProfileOverview />
      </FadeInUp>

      {/* Body metrics grid */}
      <FadeInUp delay={0.1}>
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Métricas Atuais</div>
          <BodyMetricsCard profile={profile} />
        </div>
      </FadeInUp>

      {/* Goal progress */}
      <FadeInUp delay={0.12}>
        <GoalProgressCard profile={profile} />
      </FadeInUp>

      {/* Insights */}
      <FadeInUp delay={0.14}>
        <PhysicalInsights profile={profile} history={history} />
      </FadeInUp>

      {/* Evolution chart */}
      <FadeInUp delay={0.16}>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
              <TrendingUp size={15} className="text-indigo-400" />
            </div>
            <h3 className="font-bold text-slate-100 text-sm">Evolução — últimos 30 dias</h3>
          </div>
          <BodyEvolutionChart history={history} />
        </div>
      </FadeInUp>

      {/* Regras Pessoais */}
      <FadeInUp delay={0.16}>
        <div className="card p-5">
          <PersonalRulesSection />
        </div>
      </FadeInUp>

      {/* Big Five — personalidade OCEAN */}
      <FadeInUp delay={0.165}>
        <div className="card p-5">
          <BigFiveSection />
        </div>
      </FadeInUp>

      {/* Progresso Visual — tracker de fotos */}
      <FadeInUp delay={0.17}>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
              <Camera size={15} className="text-violet-400" />
            </div>
            <h3 className="font-bold text-slate-100 text-sm">Progresso Visual</h3>
          </div>
          <ProgressPhotoTracker />
        </div>
      </FadeInUp>

      {/* History table */}
      {history.length > 0 && (
        <FadeInUp delay={0.18}>
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <h3 className="font-bold text-slate-200 text-sm">Histórico de Check-ins</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    {['Data','Peso','%Gord.','M.Magra','Cintura','IMC','Calorias','Água'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 20).map((entry) => (
                    <tr key={entry.date} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-400 tabular-nums whitespace-nowrap">{entry.date}</td>
                      <td className="px-4 py-3 text-slate-300 tabular-nums">{entry.weight?.toFixed(1) ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-300 tabular-nums">{entry.bodyFat?.toFixed(1) ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-300 tabular-nums">{entry.leanMass?.toFixed(1) ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-300 tabular-nums">{entry.waist ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-300 tabular-nums">{entry.imc?.toFixed(1) ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-300 tabular-nums">{entry.calories ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-300 tabular-nums">{entry.water != null ? `${entry.water}L` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FadeInUp>
      )}

      <WeeklyCheckinModal open={checkinOpen} onClose={() => setCheckinOpen(false)} />
    </div>
  )
}
