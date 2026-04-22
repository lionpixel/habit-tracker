// ─────────────────────────────────────────────
//  View: Review — Revisões automáticas integradas
// ─────────────────────────────────────────────

'use client'

import { useEffect, useMemo } from 'react'
import { RotateCcw, TrendingUp, TrendingDown, Target, CheckCircle2, AlertTriangle, Award, Flame, Zap } from 'lucide-react'
import { useGoalsStore } from '@/store/goalsStore'
import { useProfileStore } from '@/store/profileStore'
import { useFinanceStore } from '@/store/financeStore'
import { useHabits } from '@/hooks/useHabits'
import { FadeInUp } from '@/components/ui/Motion'
import { StatCard } from '@/components/ui/StatCard'
import { getMonthKey, formatTime } from '@/lib/helpers'
import { getBRTYear, getBRTMonth, getBRTWeekNumber, getTodayStr } from '@/lib/time'
import { totalIncome, totalExpenses, savingsRate } from '@/types/finance'
import { getQuarter } from '@/types/goals'

const YEAR  = getBRTYear()
const MONTH = getBRTMonth()
const WEEK  = getBRTWeekNumber()
const QUARTER = getQuarter(MONTH)

function InsightCard({ icon, title, body, color, type }: {
  icon: React.ReactNode; title: string; body: string; color: string; type: 'success' | 'warning' | 'info' | 'danger'
}) {
  const bg = { success: '#10b98118', warning: '#f59e0b18', info: '#6366f118', danger: '#ef444418' }[type]
  return (
    <div className="card overflow-hidden">
      <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${color}, ${color}60, transparent)` }} />
      <div className="p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
          <span style={{ color }}>{icon}</span>
        </div>
        <div>
          <div className="text-xs font-bold text-slate-300 leading-tight">{title}</div>
          <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{body}</div>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center text-slate-500">{icon}</div>
      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">{label}</h3>
    </div>
  )
}

export function ReviewView() {
  const { hydrated: gHydrated, hydrate: gHydrate, annualGoals, quarterlyGoals, monthlyGoals, weeklyGoals, dailyTasks, projects } = useGoalsStore()
  const { hydrated: pHydrated, hydrate: pHydrate, history } = useProfileStore()
  const { hydrated: fHydrated, hydrate: fHydrate, getMonth } = useFinanceStore()
  const { habits, currentYear, currentWeek } = useHabits()

  useEffect(() => {
    if (!gHydrated) gHydrate()
    if (!pHydrated) pHydrate()
    if (!fHydrated) fHydrate()
  }, [gHydrated, gHydrate, pHydrated, pHydrate, fHydrated, fHydrate])

  const mKey  = getMonthKey(YEAR, MONTH)
  const month = getMonth(mKey)

  // ── Metrics ─────────────────────────────────

  const annualYear  = annualGoals.filter((g) => g.year === YEAR)
  const currentQ    = quarterlyGoals.filter((g) => g.year === YEAR && g.quarter === QUARTER)
  const currentM    = monthlyGoals.filter((g) => g.year === YEAR && g.month === MONTH)
  const currentW    = weeklyGoals.filter((g) => g.year === YEAR && g.week === WEEK)
  const todayTasks  = dailyTasks.filter((t) => t.date === getTodayStr())
  const activeProjects = projects.filter((p) => p.status === 'in_progress')

  const annualAvg   = annualYear.length ? Math.round(annualYear.reduce((a, g) => a + g.progress, 0) / annualYear.length) : 0
  const _weeklyAvg   = currentW.length   ? Math.round(currentW.reduce((a, g) => a + g.progress, 0)   / currentW.length)   : 0
  const todayDone   = todayTasks.filter((t) => t.status === 'done').length
  const todayPct    = todayTasks.length ? Math.round((todayDone / todayTasks.length) * 100) : 0

  // Finance
  const income      = totalIncome(month)
  const expenses    = totalExpenses(month)
  const rate        = savingsRate(month)

  // Habits — week consistency
  const habitKeys = Object.keys(habits) as (keyof typeof habits)[]
  const _mKey2     = getMonthKey(currentYear, MONTH)
  const weekHabitMinutes = habitKeys.reduce((a, k) => {
    const h = habits[k]
    return a + Object.entries(h.counts ?? {}).filter(([key]) => key === `${currentYear}-W${String(currentWeek).padStart(2, '0')}`).reduce((s, [, v]) => s + (typeof v === 'number' ? v : 0), 0)
  }, 0)

  // Physical
  const _latestCheckin = history[0]
  const weightDiff = history.length >= 2 && history[0].weight && history[1].weight
    ? history[0].weight - history[1].weight
    : null

  // ── Insights ────────────────────────────────

  const insights = useMemo(() => {
    const list: { icon: React.ReactNode; title: string; body: string; color: string; type: 'success' | 'warning' | 'info' | 'danger'; section: string }[] = []

    // Goals
    if (annualAvg >= 50) {
      list.push({ section: 'goals', type: 'success', icon: <Award size={16} />, title: 'Metas anuais no caminho certo', body: `${annualAvg}% de progresso médio nas metas do ano. Excelente ritmo!`, color: '#10b981' })
    } else if (annualYear.length > 0) {
      list.push({ section: 'goals', type: 'warning', icon: <AlertTriangle size={16} />, title: 'Metas anuais abaixo do esperado', body: `Apenas ${annualAvg}% de progresso médio. Revise suas prioridades.`, color: '#f59e0b' })
    }

    const overdueGoals = [...currentM, ...currentW].filter((g) => g.status !== 'done' && g.status !== 'cancelled')
    if (overdueGoals.length > 2) {
      list.push({ section: 'goals', type: 'warning', icon: <AlertTriangle size={16} />, title: `${overdueGoals.length} metas ativas em aberto`, body: 'Foque em concluir as metas do período atual antes de criar novas.', color: '#f97316' })
    }

    if (todayTasks.length > 0) {
      list.push({ section: 'daily', type: todayPct === 100 ? 'success' : todayPct >= 50 ? 'info' : 'warning',
        icon: todayPct === 100 ? <CheckCircle2 size={16} /> : <Target size={16} />,
        title: todayPct === 100 ? 'Dia concluído!' : `${todayPct}% do dia concluído`,
        body: todayPct === 100 ? `Todas as ${todayTasks.length} tarefas de hoje estão feitas. Ótimo trabalho!` : `${todayDone} de ${todayTasks.length} tarefas concluídas.`,
        color: todayPct === 100 ? '#10b981' : '#6366f1' })
    }

    if (activeProjects.length > 3) {
      list.push({ section: 'projects', type: 'warning', icon: <AlertTriangle size={16} />, title: 'Muitos projetos simultâneos', body: `${activeProjects.length} projetos em andamento. Considere focar em menos projetos por vez.`, color: '#f59e0b' })
    }

    // Finance
    if (income > 0) {
      if (rate >= 20) {
        list.push({ section: 'finance', type: 'success', icon: <TrendingUp size={16} />, title: `Poupança exemplar: ${rate}%`, body: 'Você está economizando acima de 20% da renda. Continue assim!', color: '#10b981' })
      } else {
        list.push({ section: 'finance', type: 'warning', icon: <TrendingDown size={16} />, title: `Poupança baixa: ${rate}%`, body: 'Tente reduzir gastos para poupar ao menos 20% da renda mensal.', color: '#f59e0b' })
      }
      if (expenses > income) {
        list.push({ section: 'finance', type: 'danger', icon: <AlertTriangle size={16} />, title: 'Gastos acima da renda', body: 'Seus gastos excedem sua receita este mês. Atenção urgente necessária.', color: '#ef4444' })
      }
    }

    // Habits
    if (weekHabitMinutes > 0) {
      list.push({ section: 'habits', type: 'info', icon: <Flame size={16} />, title: `${formatTime(weekHabitMinutes)} de hábitos esta semana`, body: weekHabitMinutes >= 300 ? 'Semana produtiva! Você está acima de 5h de prática.' : 'Continue mantendo a consistência diária.', color: weekHabitMinutes >= 300 ? '#10b981' : '#6366f1' })
    }

    // Physical
    if (weightDiff !== null) {
      const losing = weightDiff < -0.3
      const gaining = weightDiff > 0.3
      if (losing || gaining) {
        list.push({ section: 'physical', type: losing ? 'success' : 'info', icon: losing ? <TrendingDown size={16} /> : <TrendingUp size={16} />,
          title: `Peso ${losing ? 'reduzindo' : 'aumentando'}`,
          body: `Variação de ${Math.abs(weightDiff).toFixed(1)}kg nas últimas medições.`,
          color: losing ? '#10b981' : '#f59e0b' })
      }
    }

    return list
  }, [annualAvg, annualYear, todayTasks, todayPct, todayDone, activeProjects, income, rate, expenses, weekHabitMinutes, weightDiff, currentM, currentW])

  const sections = ['goals', 'daily', 'finance', 'habits', 'physical', 'projects']
  const sectionLabels: Record<string, string> = {
    goals:    'Metas & Planejamento',
    daily:    'Hoje',
    finance:  'Finanças',
    habits:   'Hábitos',
    physical: 'Físico',
    projects: 'Projetos',
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeInUp>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
            <RotateCcw size={20} className="text-violet-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-100">Revisão Automática</h2>
            <p className="text-slate-500 text-sm">Visão integrada de todas as áreas — {new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</p>
          </div>
        </div>
      </FadeInUp>

      {/* Scoreboard */}
      <FadeInUp delay={0.04}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={<Target size={17} />}        value={`${annualAvg}%`}         label="Metas Anuais"       color="#a78bfa" compact />
          <StatCard icon={<CheckCircle2 size={17} />}  value={`${todayPct}%`}          label="Tarefas de Hoje"    color="#f59e0b" compact />
          <StatCard icon={<Zap size={17} />}           value={formatTime(weekHabitMinutes)} label="Hábitos Semana" color="#10b981" compact />
          <StatCard icon={<TrendingUp size={17} />}    value={income > 0 ? `${rate}%` : '—'} label="Taxa Poupança" color={rate >= 20 ? '#10b981' : '#f59e0b'} compact />
        </div>
      </FadeInUp>

      {/* Goal hierarchy snapshot */}
      <FadeInUp delay={0.06}>
        <div className="card p-5">
          <SectionTitle label="Hierarquia de Metas" icon={<Target size={15} />} />
          <div className="space-y-3">
            {/* Annual */}
            <div>
              <div className="text-[10px] font-bold text-violet-400 uppercase tracking-wider mb-1.5">Anual ({YEAR})</div>
              {annualYear.length === 0 ? (
                <p className="text-xs text-slate-600 italic">Nenhuma meta anual</p>
              ) : annualYear.slice(0, 3).map((g) => (
                <div key={g.id} className="flex items-center gap-2 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="text-slate-300 font-semibold truncate">{g.title}</span>
                      <span className="text-violet-400 font-black tabular-nums ml-2">{g.progress}%</span>
                    </div>
                    <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${g.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quarterly */}
            {currentQ.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1.5">Q{QUARTER} ({['Jan-Mar','Abr-Jun','Jul-Set','Out-Dez'][QUARTER - 1]})</div>
                {currentQ.slice(0, 2).map((g) => (
                  <div key={g.id} className="flex items-center gap-2 mb-1.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs mb-0.5">
                        <span className="text-slate-300 font-semibold truncate">{g.title}</span>
                        <span className="text-indigo-400 font-black tabular-nums ml-2">{g.progress}%</span>
                      </div>
                      <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${g.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Monthly */}
            {currentM.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider mb-1.5">
                  {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][MONTH - 1]}
                </div>
                {currentM.slice(0, 2).map((g) => (
                  <div key={g.id} className="flex items-center gap-2 mb-1.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs mb-0.5">
                        <span className="text-slate-300 font-semibold truncate">{g.title}</span>
                        <span className="text-sky-400 font-black tabular-nums ml-2">{g.progress}%</span>
                      </div>
                      <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-sky-500" style={{ width: `${g.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Weekly */}
            {currentW.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1.5">Semana {WEEK}</div>
                {currentW.slice(0, 2).map((g) => (
                  <div key={g.id} className="flex items-center gap-2 mb-1.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs mb-0.5">
                        <span className="text-slate-300 font-semibold truncate">{g.title}</span>
                        <span className="text-emerald-400 font-black tabular-nums ml-2">{g.progress}%</span>
                      </div>
                      <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${g.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </FadeInUp>

      {/* Insights by section */}
      {sections.map((section) => {
        const sectionInsights = insights.filter((i) => i.section === section)
        if (!sectionInsights.length) return null
        return (
          <FadeInUp key={section} delay={0.08}>
            <div>
              <SectionTitle label={sectionLabels[section]} icon={<Target size={14} />} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sectionInsights.map((ins, i) => (
                  <InsightCard key={i} icon={ins.icon} title={ins.title} body={ins.body} color={ins.color} type={ins.type} />
                ))}
              </div>
            </div>
          </FadeInUp>
        )
      })}

      {insights.length === 0 && (
        <FadeInUp delay={0.08}>
          <div className="card p-8 text-center">
            <RotateCcw size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">Comece a preencher seus dados</p>
            <p className="text-slate-600 text-sm mt-1">A revisão automática aparece conforme você adiciona metas, tarefas e lançamentos financeiros.</p>
          </div>
        </FadeInUp>
      )}
    </div>
  )
}
