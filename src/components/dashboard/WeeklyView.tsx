'use client'

import { useAppStore }            from '@/store/appStore'
import { useHabits }              from '@/hooks/useHabits'
import { useHistoricalInsights }  from '@/hooks/useHistoricalInsights'
import { HabitCard }              from './HabitCard'
import { StatCard }               from '@/components/ui/StatCard'
import { WeeklyChart }            from '@/components/charts/WeeklyChart'
import { EvolutionChart }         from '@/components/charts/EvolutionChart'
import { MonthlyBarChart }        from '@/components/charts/MonthlyBarChart'
import { LifeScoreCard }          from './LifeScoreCard'
import { HeatmapSection }         from './HeatmapSection'
import { RiskAlerts }             from './RiskAlerts'
import { InsightCards }           from './InsightCards'
import { FadeInUp }               from '@/components/ui/Motion'
import { getWeekDates, formatDate, formatTime } from '@/lib/helpers'
import type { HabitKey }          from '@/types/habit'
import {
  ChevronLeft, ChevronRight,
  Timer, CheckSquare, Zap, Award,
  TrendingUp, TrendingDown, Target, CalendarCheck,
  Map, BarChart3, Trophy, AlertTriangle, Layers,
} from 'lucide-react'
import { cn } from '@/lib/helpers'

const HABIT_KEYS: HabitKey[] = ['reading', 'english', 'hiit', 'ppci', 'dopamine', 'fasting']

function SectionTitle({
  icon, title, subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle?: string
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-slate-400 flex-shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-bold text-slate-100 leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
    </div>
  )
}

// ── Banner Q1 2026 ────────────────────────────
function Q1Banner() {
  const { quarterSummary, habitRanking, hiitAlert } = useHistoricalInsights()
  const { bestMonthLabel, totalHours, momFebMar } = quarterSummary
  const topHabit = habitRanking[0]

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={14} className="text-violet-400" />
        <span className="text-xs font-bold text-violet-300 uppercase tracking-wider">
          Resumo Q1 2026
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total */}
        <div className="text-center p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
          <div className="text-lg font-black text-slate-100 tabular-nums">{totalHours}h</div>
          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Total acumulado</div>
        </div>
        {/* Melhor mês */}
        <div className="text-center p-2.5 rounded-xl bg-violet-500/[0.06] border border-violet-500/20">
          <div className="text-sm font-black text-violet-300">{bestMonthLabel}</div>
          <div className="text-[10px] text-violet-400/70 font-semibold mt-0.5">Melhor mês</div>
        </div>
        {/* Hábito dominante */}
        {topHabit && (
          <div className="text-center p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <div className="text-sm font-black" style={{ color: topHabit.color }}>
              {topHabit.name}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold mt-0.5">{topHabit.pct}% do total</div>
          </div>
        )}
        {/* HIIT alerta */}
        <div className={cn(
          'text-center p-2.5 rounded-xl border',
          hiitAlert.isCritical
            ? 'bg-red-500/[0.06] border-red-500/20'
            : 'bg-white/[0.03] border-white/[0.05]',
        )}>
          <div className={cn(
            'flex items-center justify-center gap-1 text-sm font-black',
            hiitAlert.isCritical ? 'text-red-400' : 'text-slate-200',
          )}>
            {hiitAlert.isCritical && <AlertTriangle size={12} />}
            HIIT {hiitAlert.dropPct}%
          </div>
          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">queda em Mar</div>
        </div>
      </div>
      {/* MoM trend */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.06]">
        {momFebMar < 0
          ? <TrendingDown size={12} className="text-red-400 flex-shrink-0" />
          : <TrendingUp   size={12} className="text-emerald-400 flex-shrink-0" />}
        <span className="text-[11px] text-slate-400">
          {momFebMar < 0
            ? `Queda de ${Math.abs(momFebMar)}% de Fevereiro para Março — retomada em Abril recomendada`
            : `Alta de +${momFebMar}% em relação ao mês anterior`}
        </span>
      </div>
    </div>
  )
}

export function WeeklyView() {
  useAppStore()
  const {
    habits, currentWeek, currentYear,
    getWeekMinutes, getWeekCount, getWeekProgress,
  } = useHabits()

  const { start, end } = getWeekDates(currentYear, currentWeek)
  const dateRange = `${formatDate(start)} – ${formatDate(end)}`

  const totalMinutes   = HABIT_KEYS.reduce((acc, k) => acc + getWeekMinutes(k), 0)
  const totalSessions  = HABIT_KEYS.reduce((acc, k) => acc + getWeekCount(k), 0)
  const avgConsistency = Math.round(
    HABIT_KEYS.reduce((acc, k) => acc + getWeekProgress(k), 0) / HABIT_KEYS.length,
  )
  const habitsOnTrack  = HABIT_KEYS.filter((k) => getWeekProgress(k) >= 80).length
  const maxSessions    = HABIT_KEYS.reduce((acc, k) => acc + habits[k].frequency, 0)

  function navigate(dir: 'prev' | 'next') {
    const store = useAppStore.getState()
    let w = store.data.currentWeek + (dir === 'next' ? 1 : -1)
    let y = store.data.currentYear
    if (w < 1)  { w = 52; y -= 1 }
    if (w > 52) { w = 1;  y += 1 }
    useAppStore.setState({ data: { ...store.data, currentWeek: w, currentYear: y } })
  }

  return (
    <div className="space-y-8 pb-24 lg:pb-8">

      {/* ── Week navigator ── */}
      <FadeInUp delay={0}>
        <div className="card p-4 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('prev')}
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center',
              'bg-white/[0.05] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200',
              'border border-white/[0.06] hover:border-white/[0.1]',
              'transition-all duration-200 active:scale-90',
            )}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <div className="text-sm font-bold text-slate-100">
              Semana <span className="text-gradient-brand">{currentWeek}</span>
            </div>
            <div className="text-xs text-slate-500">{dateRange} · {currentYear}</div>
          </div>
          <button
            onClick={() => navigate('next')}
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center',
              'bg-white/[0.05] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200',
              'border border-white/[0.06] hover:border-white/[0.1]',
              'transition-all duration-200 active:scale-90',
            )}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </FadeInUp>

      {/* ── Hero stats ── */}
      <FadeInUp delay={0.05}>
        <SectionTitle
          icon={<TrendingUp className="w-4 h-4" />}
          title="Visão Geral"
          subtitle="Resumo de performance desta semana"
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Timer className="w-5 h-5 text-violet-400" />}
            value={formatTime(totalMinutes)}
            label="Tempo total"
            meta={`${totalSessions}/${maxSessions} sessões`}
            color="#7c3aed"
          />
          <StatCard
            icon={<CheckSquare className="w-5 h-5 text-emerald-400" />}
            value={totalSessions}
            label="Sessões"
            meta={`de ${maxSessions} possíveis`}
            color="#10b981"
          />
          <StatCard
            icon={<Zap className="w-5 h-5 text-amber-400" />}
            value={`${avgConsistency}%`}
            label="Consistência"
            meta="média geral"
            color="#f59e0b"
          />
          <StatCard
            icon={<Award className="w-5 h-5 text-cyan-400" />}
            value={`${habitsOnTrack}/${HABIT_KEYS.length}`}
            label="No caminho"
            meta="≥80% da meta"
            color="#22d3ee"
          />
        </div>
      </FadeInUp>

      {/* ── Habit cards ── */}
      <FadeInUp delay={0.1}>
        <SectionTitle
          icon={<Target className="w-4 h-4" />}
          title="Seus Hábitos"
          subtitle="Clique em + para registrar uma sessão"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {HABIT_KEYS.map((key, i) => (
            <HabitCard key={key} habitKey={key} index={i} />
          ))}
        </div>
      </FadeInUp>

      {/* ── Q1 Banner ── */}
      <FadeInUp delay={0.12}>
        <Q1Banner />
      </FadeInUp>

      {/* ── Vida Score ── */}
      <FadeInUp delay={0.14}>
        <SectionTitle
          icon={<Layers className="w-4 h-4" />}
          title="Vida Score"
          subtitle="Pontuação integrada — hábitos, metas, finanças, físico, sono e foco"
        />
        <LifeScoreCard />
      </FadeInUp>

      {/* ── Charts row ── */}
      <FadeInUp delay={0.15}>
        <SectionTitle
          icon={<BarChart3 className="w-4 h-4" />}
          title="Gráficos"
          subtitle="Progresso semanal, evolução e comparativo Q1"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <WeeklyChart />
          <EvolutionChart />
        </div>
      </FadeInUp>

      {/* ── Monthly Q1 chart ── */}
      <FadeInUp delay={0.18}>
        <SectionTitle
          icon={<TrendingUp className="w-4 h-4" />}
          title="Evolução Mensal — Q1 2026"
          subtitle="Minutos acumulados por hábito em Janeiro, Fevereiro e Março"
        />
        <MonthlyBarChart />
      </FadeInUp>

      {/* ── Heatmap ── */}
      <FadeInUp delay={0.2}>
        <SectionTitle
          icon={<Map className="w-4 h-4" />}
          title="Heatmap Anual"
          subtitle="Consistência semana a semana — passe o mouse para detalhes"
        />
        <HeatmapSection />
      </FadeInUp>

      {/* ── Risk + Insights ── */}
      <FadeInUp delay={0.25}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section>
            <SectionTitle
              icon={<CalendarCheck className="w-4 h-4" />}
              title="Análise de Risco"
              subtitle="Hábitos que precisam de atenção"
            />
            <RiskAlerts />
          </section>
          <section>
            <SectionTitle
              icon={<Zap className="w-4 h-4" />}
              title="Insights"
              subtitle="Análise automática do seu progresso"
            />
            <InsightCards />
          </section>
        </div>
      </FadeInUp>

    </div>
  )
}
