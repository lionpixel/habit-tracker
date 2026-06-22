'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Activity, ArrowUpRight, Brain, CalendarDays, CheckCircle2,
  DollarSign, Dumbbell, Eye, Flame, Link2, Moon, Sparkles, TrendingUp,
} from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { useNow } from '@/hooks/useNow'
import { useHabits } from '@/hooks/useHabits'
import { useHistoricalInsights } from '@/hooks/useHistoricalInsights'
import { useActiveHabitKeys } from '@/store/selectors'
import { useDreamsStore } from '@/store/dreamsStore'
import { useProfileStore } from '@/store/profileStore'
import { useFinanceStore, currentMonthKey } from '@/store/financeStore'
import { buildSleepHistory } from '@/services/sleepService'
import { shouldRemindBigFive } from '@/types/profile'
import { totalIncome, savingsRate } from '@/types/finance'
import { addDaysToStr, diffInDays, getTodayStr, formatDisplayBRT } from '@/lib/time'
import { cn, formatDate, formatTime } from '@/lib/helpers'
import { FadeInUp } from '@/components/ui/Motion'
import { MiniSparkline } from '@/components/charts/MiniSparkline'
import { RadialProgressChart } from '@/components/charts/RadialProgressChart'
import { WeeklyHeatmapStrip } from '@/components/charts/WeeklyHeatmapStrip'
import { StatusBadge, type StatusBadgeKind } from '@/components/ui/StatusBadge'
import { DreamVisionMosaic } from '@/components/home/DreamVisionMosaic'
import { useAppStore } from '@/store/appStore'
import { getWeekDates } from '@/lib/helpers'
import { CHART_THEME, CHART_TOOLTIP_STYLE, CHART_AXIS_TICK, CHART_MARGIN } from '@/components/charts/chartTheme'

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value))
}

function statusFromPct(pct: number): StatusBadgeKind {
  if (pct >= 80) return 'positivo'
  if (pct >= 60) return 'alerta'
  if (pct >= 35) return 'alto'
  if (pct > 0) return 'critico'
  return 'neutro'
}

function statusFromValue(value: number | null | undefined, target: number): StatusBadgeKind {
  if (value === null || value === undefined) return 'neutro'
  const pct = target > 0 ? (value / target) * 100 : 0
  if (pct >= 80) return 'positivo'
  if (pct >= 60) return 'alerta'
  if (pct >= 35) return 'alto'
  return 'critico'
}

function getBRTHour(date: Date): number {
  const formatted = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    hour12: false,
  }).format(date)
  const hour = Number(formatted)
  return Number.isFinite(hour) ? hour : 12
}

function SectionTitle({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ReactNode
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 flex-shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-white leading-tight">{title}</h2>
          {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

function MetricCard({
  icon,
  title,
  value,
  subtitle,
  status,
  progress,
  sparkline,
  target,
  radialValue,
  radialLabel,
}: {
  icon: React.ReactNode
  title: string
  value: string
  subtitle: string
  status: StatusBadgeKind
  progress: number
  sparkline?: number[]
  target?: string
  radialValue?: number
  radialLabel?: string
}) {
  return (
    <div className="card p-4 relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-500/30">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-violet-500 via-violet-400/60 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-violet-300 flex-shrink-0">
              {icon}
            </div>
            <StatusBadge status={status}>{title}</StatusBadge>
          </div>
          <div className="text-2xl font-black text-white tabular-nums leading-none">{value}</div>
          <p className="text-xs text-white/60 mt-1">{subtitle}</p>
          {target && <p className="text-[10px] text-white/40 mt-1">{target}</p>}
        </div>
        {radialValue !== undefined && (
          <RadialProgressChart value={radialValue} color={status === 'positivo' ? CHART_THEME.emerald : CHART_THEME.brand} label={radialLabel} />
        )}
      </div>

      {sparkline && sparkline.length > 0 && (
        <div className="mt-4">
          <MiniSparkline data={sparkline} color={status === 'positivo' ? CHART_THEME.emerald : CHART_THEME.brand} />
        </div>
      )}

      <div className="mt-3 h-[3px] rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${clamp(progress)}%`,
            background: `linear-gradient(90deg, ${status === 'critico' ? CHART_THEME.red : CHART_THEME.brand}, ${status === 'positivo' ? CHART_THEME.emerald : CHART_THEME.brandLight})`,
          }}
        />
      </div>
    </div>
  )
}

function RiskCard({
  risk,
  lastSessionLabel,
  progress,
}: {
  risk: {
    habitKey: string
    habitName: string
    level: 'critical' | 'high' | 'medium'
    message: string
    suggestion: string
  }
  lastSessionLabel: string
  progress: number
}) {
  const statusMap: Record<typeof risk.level, StatusBadgeKind> = {
    critical: 'critico',
    high: 'alto',
    medium: 'alerta',
  }

  const borderMap: Record<typeof risk.level, string> = {
    critical: 'border-red-500',
    high: 'border-orange-500',
    medium: 'border-yellow-500',
  }

  return (
    <div className={cn('relative overflow-hidden rounded-2xl border bg-white/[0.04] p-4 transition-all duration-200 hover:-translate-y-0.5', borderMap[risk.level], 'border-l-[4px]')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3 mb-2">
            <div className={cn('w-2 h-12 rounded-full flex-shrink-0 mt-0.5', risk.level === 'critical' ? 'bg-red-500' : risk.level === 'high' ? 'bg-orange-500' : 'bg-yellow-500')} />
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-white leading-tight">{risk.habitName}</h3>
              <p className="text-xs text-white/60 mt-1">{risk.message}</p>
            </div>
          </div>
          <p className="text-xs text-white/40">{risk.suggestion}</p>
        </div>
        <StatusBadge status={statusMap[risk.level]}>{risk.level === 'critical' ? 'Crítico' : risk.level === 'high' ? 'Alto' : 'Alerta'}</StatusBadge>
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px] text-white/50">
        <span>{lastSessionLabel}</span>
        <span className="tabular-nums">{Math.round(progress)}% semana atual</span>
      </div>
      <div className="mt-2 h-[3px] rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${clamp(progress)}%`,
            background: risk.level === 'critical' ? CHART_THEME.red : risk.level === 'high' ? CHART_THEME.amber : CHART_THEME.brand,
          }}
        />
      </div>
    </div>
  )
}

function InsightRankCard({
  rank,
  name,
  totalMin,
  pct,
  description,
  status,
}: {
  rank: number
  name: string
  totalMin: number
  pct: number
  description: string
  status: StatusBadgeKind
}) {
  const priority = rank <= 1 ? 'alto' : rank <= 3 ? 'alerta' : 'neutro'

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <StatusBadge status={priority}>{rank === 1 ? 'Alta prioridade' : rank === 2 ? 'Média prioridade' : 'Prioridade baixa'}</StatusBadge>
            <StatusBadge status={status}>{status === 'positivo' ? 'Positivo' : status === 'alto' ? 'Alto' : 'Neutro'}</StatusBadge>
          </div>
          <h3 className="text-sm font-semibold text-white leading-tight">{name}</h3>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-black text-white tabular-nums">{formatTime(totalMin)}</div>
          <div className="text-[10px] text-white/40">{pct}% do total</div>
        </div>
      </div>
      <p className="text-xs text-white/60">{description}</p>
      <div className="mt-4 h-[3px] rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full bg-violet-500 transition-all duration-700" style={{ width: `${clamp(pct)}%` }} />
      </div>
    </div>
  )
}

export function HomeView() {
  const now = useNow(10_000)
  const { user } = useAuth()
  const { data, sleepData } = useAppStore()
  const { habits, currentWeek, currentYear } = data
  const {
    getWeekProgress,
    getWeekCount,
    risks,
  } = useHabits()
  const activeHabitKeys = useActiveHabitKeys()
  const { habitRanking, hiitAlert } = useHistoricalInsights()
  const monthKey = currentMonthKey()
  const getMonth = useFinanceStore((s) => s.getMonth)
  const financeMonth = getMonth(monthKey)
  const profile        = useProfileStore((s) => s.profile)
  const bigFiveHistory = useProfileStore((s) => s.bigFiveHistory)
  const { dreams } = useDreamsStore()

  const display = formatDisplayBRT(now)
  const hour = getBRTHour(now)
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const firstName = user?.displayName?.split(' ')?.[0] ?? ''
  const todayStr = getTodayStr(now)
  const todayLabel = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now)

  const { start, end } = getWeekDates(currentYear, currentWeek)
  const weekRange = `${formatDate(start)} - ${formatDate(end)}`

  const totalSessions = activeHabitKeys.reduce((sum, key) => sum + getWeekCount(key), 0)
  const maxSessions = activeHabitKeys.reduce((sum, key) => sum + habits[key].frequency, 0)
  const consistency = maxSessions > 0 ? Math.round((totalSessions / maxSessions) * 100) : 0
  const habitsOnTrack = activeHabitKeys.filter((key) => getWeekProgress(key) >= 80).length
  const completedHabits = activeHabitKeys.filter((key) => getWeekCount(key) >= habits[key].frequency).length
  const todayShort = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'short' }).format(now).slice(0, 3)

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDaysToStr(todayStr, index - 6)),
    [todayStr],
  )

  const completionTrend = useMemo(
    () => weekDates.map((date) => {
      const done = activeHabitKeys.filter((key) => (habits[key].dailyLog?.[date] ?? 0) > 0).length
      return {
        label: new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: 'America/Sao_Paulo' }).format(new Date(`${date}T12:00:00Z`)).slice(0, 3),
        value: activeHabitKeys.length > 0 ? Math.round((done / activeHabitKeys.length) * 100) : 0,
      }
    }),
    [activeHabitKeys, habits, weekDates],
  )

  const fullTrend = useMemo(() => {
    const dates = Array.from({ length: 14 }, (_, index) => addDaysToStr(todayStr, index - 13))
    return dates.map((date, index) => {
      const done = activeHabitKeys.filter((key) => (habits[key].dailyLog?.[date] ?? 0) > 0).length
      return {
        date,
        label: index % 2 === 0 ? `${date.slice(5, 7)}/${date.slice(8, 10)}` : '',
        value: activeHabitKeys.length > 0 ? Math.round((done / activeHabitKeys.length) * 100) : 0,
      }
    })
  }, [activeHabitKeys, habits, todayStr])

  const sleepHistory = useMemo(
    () => buildSleepHistory(sleepData.log, sleepData.config.targetWake, 7),
    [sleepData],
  )

  const sleepAvgHours = useMemo(() => {
    const withDuration = sleepHistory.filter((item) => (item.durationMin ?? 0) > 0)
    if (!withDuration.length) return null
    return Math.round((withDuration.reduce((sum, item) => sum + (item.durationMin ?? 0), 0) / withDuration.length / 60) * 10) / 10
  }, [sleepHistory])

  const sleepSparkline = useMemo(
    () => sleepHistory.map((item) => Math.round(((item.durationMin ?? 0) / 60) * 10) / 10),
    [sleepHistory],
  )

  const currentBodyFat = profile.bodyFat ?? null
  const goalBodyFat = profile.goalBodyFat ?? null
  const bodyProgress = currentBodyFat && goalBodyFat ? clamp((goalBodyFat / currentBodyFat) * 100) : 0
  const bodyMetric = currentBodyFat
    ? `${currentBodyFat}% gordura`
    : profile.imc
      ? `IMC ${profile.imc.toFixed(1)}`
      : 'Sem dados'

  const invRate = financeMonth ? savingsRate(financeMonth) : 0
  const bodyStatus = currentBodyFat && goalBodyFat ? statusFromValue(goalBodyFat, currentBodyFat) : 'neutro'
  const financeStatus = financeMonth && totalIncome(financeMonth) > 0
    ? statusFromValue(invRate, 20)
    : 'neutro'

  const onTrackPct = activeHabitKeys.length > 0 ? Math.round((habitsOnTrack / activeHabitKeys.length) * 100) : 0
  const dreamsWithImages = dreams.filter((dream) => dream.imageUrl && dream.status !== 'achieved').slice(0, 5)

  function getLastSessionLabel(habitKey: string) {
    const habit = habits[habitKey]
    const dates = Object.entries(habit.dailyLog ?? {})
      .filter(([, value]) => value > 0)
      .map(([date]) => date)
      .sort((a, b) => b.localeCompare(a))
    if (dates.length === 0) return 'Nenhuma sessão registrada'
    const days = diffInDays(dates[0], todayStr)
    return days === 0 ? 'Última sessão hoje' : `Última sessão: há ${days} dias`
  }

  const riskCards = risks.slice(0, 4)

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <FadeInUp>
        <section className="card p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.08),transparent_32%)]" />
          <div className="relative flex flex-col gap-5">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <StatusBadge status={statusFromPct(consistency)}>{greeting}</StatusBadge>
                  <span className="text-white/40 text-xs">{display.time}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {firstName ? `${firstName},` : 'Bem-vindo,'} seu painel principal está pronto.
                </h1>
                <p className="text-sm text-white/60 mt-2">
                  {todayLabel} · Semana {currentWeek} · {weekRange}
                </p>
              </div>
              <div className="flex items-center gap-3 self-start lg:self-auto">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">Consistência</div>
                  <div className="text-3xl font-black text-white tabular-nums">{consistency}%</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">Ritmo</div>
                  <div className="text-3xl font-black text-white tabular-nums">{habitsOnTrack}/{activeHabitKeys.length}</div>
                </div>
              </div>
            </div>

            <WeeklyHeatmapStrip
              data={Object.fromEntries(
                completionTrend.map((day, i) => {
                  const keys = ['seg','ter','qua','qui','sex','sab','dom']
                  return [keys[i] ?? `d${i}`, day.value]
                })
              )}
            />
          </div>
        </section>
      </FadeInUp>

      <FadeInUp delay={0.05}>
        <section>
          <SectionTitle
            icon={<ArrowUpRight className="w-4 h-4" />}
            title="Atalhos rápidos"
            subtitle="Acesso direto ao painel detalhado"
          />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/weekly" className="card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-500/30 group">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarDays className="w-4 h-4 text-violet-400" />
                    <h3 className="text-sm font-semibold text-white">Semana Atual</h3>
                  </div>
                  <p className="text-xs text-white/60">{weekRange} · {totalSessions}/{maxSessions} sessões</p>
                </div>
                <MiniSparkline data={completionTrend.map((day) => day.value)} color={CHART_THEME.brand} className="w-20" />
              </div>
              <div className="mt-4 h-[3px] rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-violet-500 transition-all duration-700" style={{ width: `${consistency}%` }} />
              </div>
            </Link>

            <Link href="/weekly" className="card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-500/30 group">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-white">Hábitos</h3>
                  </div>
                  <p className="text-xs text-white/60">{activeHabitKeys.length} ativos · {completedHabits} completos</p>
                </div>
                <MiniSparkline data={completionTrend.map((day) => day.value)} color={CHART_THEME.emerald} className="w-20" />
              </div>
              <div className="mt-4 h-[3px] rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${onTrackPct}%` }} />
              </div>
            </Link>
          </div>
        </section>
      </FadeInUp>

      <FadeInUp delay={0.08}>
        <section>
          <SectionTitle
            icon={<Brain className="w-4 h-4" />}
            title="Diagnóstico integrado"
            subtitle="Visão cruzada dos módulos mais importantes"
          />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard
              icon={<Activity className="w-4 h-4" />}
              title="Hábitos"
              value={`${consistency}%`}
              subtitle={`${completedHabits}/${activeHabitKeys.length} concluídos hoje`}
              status={statusFromPct(consistency)}
              progress={consistency}
              sparkline={completionTrend.map((day) => day.value)}
            />

            <MetricCard
              icon={<Moon className="w-4 h-4" />}
              title="Sono"
              value={sleepAvgHours !== null ? `${sleepAvgHours}h` : '—'}
              subtitle={`Meta: ${sleepData.config.targetWake}`}
              status={sleepAvgHours !== null ? statusFromValue(sleepAvgHours, 7.5) : 'neutro'}
              progress={sleepAvgHours !== null ? clamp((sleepAvgHours / 7.5) * 100) : 0}
              sparkline={sleepSparkline}
            />

            <MetricCard
              icon={<Dumbbell className="w-4 h-4" />}
              title="Corpo"
              value={bodyMetric}
              subtitle={goalBodyFat ? `Meta: ${goalBodyFat}%` : 'Meta corporal não definida'}
              status={bodyStatus}
              progress={bodyProgress}
              radialValue={bodyProgress}
              radialLabel="meta"
            />

            <MetricCard
              icon={<DollarSign className="w-4 h-4" />}
              title="Finanças"
              value={totalIncome(financeMonth) > 0 ? `${invRate}%` : '—'}
              subtitle={totalIncome(financeMonth) > 0 ? `Meta: 20%` : 'Sem fluxo de renda configurado'}
              status={financeStatus}
              progress={totalIncome(financeMonth) > 0 ? clamp((invRate / 20) * 100) : 0}
              radialValue={totalIncome(financeMonth) > 0 ? clamp((invRate / 20) * 100) : 0}
              radialLabel="meta"
            />
          </div>
        </section>
      </FadeInUp>

      <FadeInUp delay={0.1}>
        <section className="card p-5">
          <SectionTitle
            icon={<TrendingUp className="w-4 h-4" />}
            title="Tendência 14 dias"
            subtitle="Evolução diária da consistência dos hábitos"
          />
          <div className="mt-5">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={fullTrend} margin={CHART_MARGIN}>
                <defs>
                  <linearGradient id="home-trend-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_THEME.brand} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={CHART_THEME.brand} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
                <XAxis dataKey="label" tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} dy={6} />
                <YAxis domain={[0, 100]} tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  labelStyle={{ color: CHART_THEME.text, fontSize: 12, fontWeight: 700 }}
                  itemStyle={{ color: CHART_THEME.text }}
                  formatter={(value: number) => [`${value}%`, 'Consistência']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={CHART_THEME.brand}
                  strokeWidth={2.5}
                  fill="url(#home-trend-fill)"
                  dot={false}
                  activeDot={{ r: 4, fill: CHART_THEME.brandLight, strokeWidth: 0 }}
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </FadeInUp>

      <FadeInUp delay={0.14}>
        <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4">
          <div className="space-y-4">
            <SectionTitle
              icon={<Flame className="w-4 h-4" />}
              title="Análise de risco"
              subtitle="Hábitos que pedem uma intervenção imediata"
            />
            {riskCards.length > 0 ? (
              <div className="grid gap-4">
                {riskCards.map((risk) => (
                  <RiskCard
                    key={risk.habitKey}
                    risk={risk}
                    lastSessionLabel={getLastSessionLabel(risk.habitKey)}
                    progress={getWeekProgress(risk.habitKey)}
                  />
                ))}
              </div>
            ) : (
              <div className="card p-5 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="mt-3 text-sm font-semibold text-white">Nenhum hábito em risco no momento</p>
                <p className="text-xs text-white/40 mt-1">A consistência atual está protegendo o sistema.</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <SectionTitle
              icon={<Sparkles className="w-4 h-4" />}
              title="Insights"
              subtitle="Ranking do trimestre e sinais de performance"
            />
            <div className="grid gap-4">
              {habitRanking.slice(0, 3).map((habit, index) => (
                <InsightRankCard
                  key={habit.key}
                  rank={index + 1}
                  name={`${habit.name} é seu hábito dominante`}
                  totalMin={habit.q1Min}
                  pct={habit.pct}
                  description={`Hábito mais consistente do trimestre · ${habit.formattedTotal} em 3 meses`}
                  status={index === 0 ? 'positivo' : 'neutro'}
                />
              ))}
            </div>
            {hiitAlert && (
              <div className="card p-4 border border-red-500/20 bg-red-500/[0.04]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">HIIT em queda severa</p>
                    <p className="text-xs text-white/60 mt-1">Fev: {formatTime(hiitAlert.febMin)} → Mar: {formatTime(hiitAlert.marMin)}</p>
                  </div>
                  <StatusBadge status="critico">{hiitAlert.isCritical ? 'Crítico' : 'Alerta'}</StatusBadge>
                </div>
                <div className="mt-4 h-[3px] rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-red-500" style={{ width: `${clamp(100 - hiitAlert.dropPct)}%` }} />
                </div>
              </div>
            )}
          </div>
        </section>
      </FadeInUp>

      {/* Big Five quarterly reminder */}
      {shouldRemindBigFive(bigFiveHistory) && bigFiveHistory.length === 0 && (
        <FadeInUp delay={0.175}>
          <div className="card p-4 border border-violet-500/20 bg-violet-500/[0.04] flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0">
              <Brain size={14} className="text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-100">Conheça seu perfil Big Five</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Registre seu resultado de personalidade OCEAN para receber insights personalizados ao seu perfil.
              </p>
            </div>
          </div>
        </FadeInUp>
      )}

      {shouldRemindBigFive(bigFiveHistory) && bigFiveHistory.length > 0 && (
        <FadeInUp delay={0.175}>
          <div className="card p-4 border border-amber-500/20 bg-amber-500/[0.04] flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
              <Brain size={14} className="text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-100">Refaça o Big Five</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Já se passaram mais de 75 dias desde o último teste. Acompanhe sua evolução trimestral no Perfil.
              </p>
            </div>
          </div>
        </FadeInUp>
      )}

      <FadeInUp delay={0.18}>
        <section>
          <SectionTitle
            icon={<Eye className="w-4 h-4" />}
            title="Quadro dos sonhos"
            subtitle="Visão compacta dos objetivos ativos"
          />
          <div className="mt-4">
            {dreamsWithImages.length > 0 ? (
              <div className="grid grid-cols-5 gap-2">
                {dreamsWithImages.map((dream) => (
                  <Link
                    key={dream.id}
                    href="/dreams"
                    className="group relative h-24 overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-500/30"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={dream.imageUrl}
                      alt={dream.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                    <div className="absolute inset-0 flex items-end justify-between gap-2 p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <span className="text-[10px] font-semibold text-white line-clamp-2">{dream.title}</span>
                      <Link2 className="w-3.5 h-3.5 text-white/80 flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <DreamVisionMosaic />
            )}
          </div>
        </section>
      </FadeInUp>
    </div>
  )
}
