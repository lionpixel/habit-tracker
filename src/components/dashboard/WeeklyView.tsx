'use client'

import { useAppStore }            from '@/store/appStore'
import { useHabits }              from '@/hooks/useHabits'
import { useHistoricalInsights }  from '@/hooks/useHistoricalInsights'
import { useAuth }                from '@/providers/AuthProvider'
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
import { WeeklyHeatmapStrip }     from '@/components/charts/WeeklyHeatmapStrip'
import { getWeekDates, formatDate, formatTime } from '@/lib/helpers'
import { getBRTWeekNumber, getBRTYear, getWeekDaysBRT, getTodayStr } from '@/lib/time'
import { useActiveHabitKeys }     from '@/store/selectors'
import { NewHabitModal }          from '@/components/habits/NewHabitModal'
import { useState, useMemo }      from 'react'
import {
  ChevronLeft, ChevronRight,
  Timer, CheckSquare, Zap, Award,
  TrendingUp, TrendingDown, Target, CalendarCheck,
  Map, BarChart3, Trophy, AlertTriangle, Layers, Plus, Sparkles,
  CalendarDays,
} from 'lucide-react'
import { cn } from '@/lib/helpers'
import { DreamVisionMosaic }  from '@/components/home/DreamVisionMosaic'
import { InsightsDashboard }  from '@/components/insights/InsightsDashboard'
import { WeeklyReportModal }  from '@/components/openai/WeeklyReportModal'

function getBRTHour(): number {
  try {
    const s = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo', hour: 'numeric', hour12: false,
    }).format(new Date())
    const n = parseInt(s)
    return isNaN(n) ? 12 : n
  } catch { return 12 }
}

function GreetingHeader({ name, avgConsistency }: { name: string; avgConsistency: number }) {
  const hour     = getBRTHour()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const firstName = name.split(' ')[0]

  const todayLabel = useMemo(() => {
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      weekday: 'long', day: 'numeric', month: 'long',
    }).format(new Date())
  }, [])

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-black text-slate-100 leading-tight">
          {greeting}{firstName ? `, ${firstName}` : ''}
        </h1>
        <p className="text-sm text-slate-500 mt-1 capitalize">{todayLabel}</p>
      </div>
      {avgConsistency > 0 && (
        <div className="flex items-center gap-2.5 bg-violet-500/[0.08] border border-violet-500/20 rounded-2xl px-4 py-2.5 self-start sm:self-auto">
          <div className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <div className="text-lg font-black text-violet-300 tabular-nums leading-none">{avgConsistency}%</div>
            <div className="text-[10px] text-violet-400/70 font-semibold mt-0.5">Consistência hoje</div>
          </div>
        </div>
      )}
    </div>
  )
}

function SectionTitle({
  icon, title, subtitle, className,
}: {
  icon: React.ReactNode
  title: string
  subtitle?: string
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-3 mb-5', className)}>
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
        {hiitAlert && (
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
        )}
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
  const { user: authUser } = useAuth()
  const HABIT_KEYS     = useActiveHabitKeys()
  const [newHabitOpen,    setNewHabitOpen]    = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const todayWeek      = getBRTWeekNumber()
  const todayYear      = getBRTYear()
  const isCurrentWeek  = currentWeek === todayWeek && currentYear === todayYear

  const { start, end } = getWeekDates(currentYear, currentWeek)
  const dateRange = `${formatDate(start)} – ${formatDate(end)}`

  const totalMinutes   = HABIT_KEYS.reduce((acc, k) => acc + getWeekMinutes(k), 0)
  const totalSessions  = HABIT_KEYS.reduce((acc, k) => acc + getWeekCount(k), 0)
  const avgConsistency = HABIT_KEYS.length > 0
    ? Math.round(HABIT_KEYS.reduce((acc, k) => acc + getWeekProgress(k), 0) / HABIT_KEYS.length)
    : 0
  const habitsOnTrack  = HABIT_KEYS.filter((k) => getWeekProgress(k) >= 80).length
  const maxSessions    = HABIT_KEYS.reduce((acc, k) => acc + habits[k].frequency, 0)

  // Dados do heatmap semanal por dia
  const weekDayHeatmap = useMemo(() => {
    const dates     = getWeekDaysBRT(currentYear, currentWeek)
    const todayDate = getTodayStr()
    const labels    = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
    return dates.map((date, i) => {
      const done = HABIT_KEYS.filter((k) => (habits[k].dailyLog?.[date] ?? 0) > 0).length
      return {
        label:   labels[i],
        pct:     HABIT_KEYS.length > 0 ? (done / HABIT_KEYS.length) * 100 : 0,
        isToday: date === todayDate,
      }
    })
  }, [currentYear, currentWeek, habits, HABIT_KEYS])

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

      {/* ── Greeting header ── */}
      <FadeInUp delay={0}>
        <GreetingHeader
          name={authUser?.displayName ?? ''}
          avgConsistency={isCurrentWeek ? avgConsistency : 0}
        />
      </FadeInUp>

      {/* ── Atalhos rápidos ── */}
      {isCurrentWeek && (
        <div className="grid grid-cols-2 gap-3">
          {/* Semana */}
          <div className="flex flex-col gap-0 p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] hover:border-violet-500/30 hover:-translate-y-0.5 transition-all overflow-hidden">
            <div className="flex items-center gap-3 mb-3">
              <CalendarDays className="w-5 h-5 text-violet-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-100 leading-tight">Semana Atual</p>
                <p className="text-xs text-slate-500 mt-0.5">{avgConsistency}% concluído</p>
              </div>
            </div>
            {/* Micro progress bar */}
            <div className="h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${avgConsistency}%`, background: '#7c3aed' }}
              />
            </div>
          </div>

          {/* Hábitos */}
          <div className="flex flex-col gap-0 p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] hover:border-emerald-500/30 hover:-translate-y-0.5 transition-all overflow-hidden">
            <div className="flex items-center gap-3 mb-3">
              <CheckSquare className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-100 leading-tight">Hábitos</p>
                <p className="text-xs text-slate-500 mt-0.5">{habitsOnTrack}/{HABIT_KEYS.length} no ritmo</p>
              </div>
            </div>
            {/* Micro progress bar */}
            <div className="h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${HABIT_KEYS.length > 0 ? (habitsOnTrack / HABIT_KEYS.length) * 100 : 0}%`,
                  background: '#10b981',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Week navigator ── */}
      <FadeInUp delay={0}>
        <div className="card p-4 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate('prev')}
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
              'bg-white/[0.05] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200',
              'border border-white/[0.06] hover:border-white/[0.1]',
              'transition-all duration-200 active:scale-90',
            )}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
            <div className="text-sm font-bold text-slate-100">
              Semana <span className="text-gradient-brand">{currentWeek}</span>
            </div>
            <div className="text-xs text-slate-500">{dateRange} · {currentYear}</div>
            {!isCurrentWeek && (
              <button
                onClick={() => useAppStore.setState({
                  data: { ...useAppStore.getState().data, currentWeek: todayWeek, currentYear: todayYear },
                })}
                className="mt-0.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 hover:text-violet-300 border border-violet-500/20 transition-all"
              >
                Hoje
              </button>
            )}
          </div>

          <button
            onClick={() => navigate('next')}
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
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

        {/* Heatmap semanal */}
        <div className="mt-4 card p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-slate-400 mb-0.5">Dias da semana</p>
            <p className="text-[10px] text-slate-600">Completude diária de hábitos</p>
          </div>
          <WeeklyHeatmapStrip days={weekDayHeatmap} />
        </div>
      </FadeInUp>

      {/* ── Habit cards ── */}
      <FadeInUp delay={0.1}>
        <div className="flex items-center justify-between mb-5">
          <SectionTitle
            icon={<Target className="w-4 h-4" />}
            title="Seus Hábitos"
            subtitle="Clique em + para registrar uma sessão"
            className="mb-0"
          />
          <button
            onClick={() => setNewHabitOpen(true)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold',
              'bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 hover:text-violet-200',
              'border border-violet-500/20 hover:border-violet-500/30',
              'transition-all duration-200 active:scale-95 flex-shrink-0',
            )}
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Hábito
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {HABIT_KEYS.map((key, i) => (
            <HabitCard key={key} habitKey={key} index={i} />
          ))}
        </div>
      </FadeInUp>

      <NewHabitModal open={newHabitOpen} onClose={() => setNewHabitOpen(false)} />

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

      {/* ── Diagnóstico Integrado ── */}
      <FadeInUp delay={0.26}>
        <div className="flex items-center justify-between mb-5">
          <SectionTitle
            icon={<Sparkles className="w-4 h-4" />}
            title="Diagnóstico Integrado"
            subtitle="Análise cruzada de todos os módulos via IA"
            className="mb-0"
          />
          <button
            onClick={() => setReportModalOpen(true)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0',
              'bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 hover:text-violet-200',
              'border border-violet-500/20 hover:border-violet-500/30 transition-all duration-200 active:scale-95',
            )}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Relatório da Semana
          </button>
        </div>
        <InsightsDashboard />
        <WeeklyReportModal open={reportModalOpen} onClose={() => setReportModalOpen(false)} />
      </FadeInUp>

      {/* ── Vision Board ── */}
      <FadeInUp delay={0.30}>
        <SectionTitle
          icon={<Sparkles className="w-4 h-4" />}
          title="Quadro dos Sonhos"
          subtitle="O que você está construindo — mantenha vivo na memória"
        />
        <DreamVisionMosaic />
      </FadeInUp>

    </div>
  )
}
