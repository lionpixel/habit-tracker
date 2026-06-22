// ─────────────────────────────────────────────
//  View: Sono
// ─────────────────────────────────────────────

'use client'

import { useState }    from 'react'
import { toast }       from 'sonner'
import { useSleep }    from '@/hooks/useSleep'
import { useProfileStore } from '@/store/profileStore'
import { useAppStore }     from '@/store/appStore'
import { useActiveHabitKeys } from '@/store/selectors'
import { Button }      from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { FadeInUp } from '@/components/ui/Motion'
import { cn }          from '@/lib/helpers'
import type { SleepHistoryBadge, SleepHistoryItem } from '@/types/sleep'
import {
  Moon, Clock, Zap, CalendarDays, AlarmClock,
  MonitorOff, BedDouble, CheckCircle2, TrendingUp, BarChart3,
  Brain, Loader2, Star,
} from 'lucide-react'
import { ScientificPillsRow } from '@/components/insights/ScientificPill'
import { BenchmarkBar } from '@/components/insights/BenchmarkBar'
import { SCIENTIFIC_FACTS, BENCHMARKS } from '@/lib/benchmarks'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, ReferenceLine,
  ResponsiveContainer, Legend,
} from 'recharts'

// ── Charts ────────────────────────────────────

function minutesToHHMM(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
}

function WakeTimeChart({ history, targetWake }: { history: SleepHistoryItem[]; targetWake: string }) {
  const targetMin = history.length > 0
    ? parseInt(targetWake.split(':')[0]) * 60 + parseInt(targetWake.split(':')[1])
    : 0
  const data = history.map((h) => ({
    date:    h.date.slice(5),
    realizado: h.wakeMinutes,
    meta:    targetMin,
  }))
  if (!data.length) return null
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 9 }}
          axisLine={false} tickLine={false}
          tickFormatter={minutesToHHMM}
          domain={['dataMin - 60', 'dataMax + 60']}
        />
        <Tooltip
          formatter={(v: number) => minutesToHHMM(v)}
          contentStyle={{ background: 'rgba(13,17,23,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 11 }}
        />
        <Legend wrapperStyle={{ fontSize: '10px', color: '#64748b', paddingTop: 8 }} />
        <Line type="monotone" dataKey="realizado" name="Acordei" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="meta" name="Meta" stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

function SleepDurationChart({ history }: { history: SleepHistoryItem[] }) {
  const IDEAL = 7.5 * 60 // 450 min
  const data = history
    .filter((h) => h.durationMin !== undefined)
    .map((h) => ({ date: h.date.slice(5), duração: h.durationMin }))
  if (!data.length) return null
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -8, bottom: 0 }} barCategoryGap="35%">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 9 }}
          axisLine={false} tickLine={false}
          tickFormatter={(v) => `${Math.floor(v/60)}h`}
        />
        <Tooltip
          formatter={(v: number) => minutesToHHMM(v)}
          contentStyle={{ background: 'rgba(13,17,23,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 11 }}
        />
        <ReferenceLine y={IDEAL} stroke="#10b981" strokeDasharray="5 3" label={{ value: '7h30', fill: '#10b981', fontSize: 9, position: 'insideTopRight' }} />
        <Bar dataKey="duração" name="Duração" fill="#6366f1" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

const BADGE_STYLES: Record<SleepHistoryBadge, string> = {
  ok:   'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  near: 'bg-amber-500/20  text-amber-400  border border-amber-500/30',
  off:  'bg-red-500/20    text-red-400    border border-red-500/30',
}
const BADGE_LABELS: Record<SleepHistoryBadge, string> = {
  ok: 'No horário', near: 'Próximo', off: 'Fora',
}

export function SleepView() {
  const {
    config, todayEntry, plan, sleepRules, energyScore,
    adjustmentChain, history, registerWakeTime, setTargetWake,
  } = useSleep()
  const bigFiveHistory = useProfileStore((s) => s.bigFiveHistory)
  const habits         = useAppStore((s) => s.data.habits)
  const activeKeys     = useActiveHabitKeys()

  const [wakeInput,    setWakeInput]    = useState(todayEntry?.wakeTime  ?? '06:00')
  const [sleepInput,   setSleepInput]   = useState(todayEntry?.sleepTime ?? '')
  const [targetInput,  setTargetInput]  = useState(config.targetWake)
  const [quality,      setQuality]      = useState<1|2|3|4|5|undefined>(todayEntry?.quality)
  const [notes,        setNotes]        = useState(todayEntry?.notes ?? '')

  const [aiAnalysis,   setAiAnalysis]   = useState<Record<string,string> | null>(null)
  const [aiLoading,    setAiLoading]    = useState(false)

  function handleRegister() {
    if (!wakeInput) { toast.error('Informe o horário de acordar.'); return }
    registerWakeTime(wakeInput, sleepInput || undefined, quality, notes)
    toast.success('Horários registrados!')
  }

  function handleSetTarget() {
    setTargetWake(targetInput)
    toast.success(`Meta: acordar às ${targetInput}`)
  }

  async function handleSleepAnalysis() {
    if (!history.length) { toast.error('Registre ao menos uma noite de sono antes de analisar.'); return }
    setAiLoading(true)
    setAiAnalysis(null)
    try {
      const habitsSummary = activeKeys
        .map((k) => `${habits[k].name}`)
        .join(', ')
      const res = await fetch('/api/openai/sleep-analysis', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          sleepHistory:  history.slice(0, 30),
          targetWake:    config.targetWake,
          bigFive:       bigFiveHistory[0] ?? null,
          habitsSummary: habitsSummary || undefined,
        }),
      })
      const data = await res.json()
      if (data.analysis) setAiAnalysis(data.analysis)
      else toast.error(data.error ?? 'Erro ao gerar análise.')
    } catch {
      toast.error('Erro de conexão.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <FadeInUp>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center">
            <Moon size={20} className="text-sky-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-100">Módulo de Sono</h2>
            <p className="text-slate-500 text-sm">Rastreamento de horários e energia</p>
          </div>
        </div>
      </FadeInUp>

      {/* Registration card */}
      <FadeInUp delay={0.05}>
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center">
              <Clock size={16} className="text-sky-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Registrar Hoje</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Acordei às</label>
              <input
                type="time"
                value={wakeInput}
                onChange={(e) => setWakeInput(e.target.value)}
                className="input w-full text-lg font-bold"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Dormi às (opcional)</label>
              <input
                type="time"
                value={sleepInput}
                onChange={(e) => setSleepInput(e.target.value)}
                className="input w-full text-lg font-bold"
              />
            </div>
            <div className="flex items-end">
              <Button variant="primary" className="w-full" onClick={handleRegister}>
                <CheckCircle2 size={16} className="mr-2" />
                Registrar
              </Button>
            </div>
          </div>

          {/* Qualidade + notas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-slate-400 block mb-2">Qualidade do sono</label>
              <div className="flex gap-2">
                {([1,2,3,4,5] as const).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setQuality((prev) => prev === n ? undefined : n)}
                    className={cn(
                      'flex items-center justify-center w-9 h-9 rounded-xl border text-sm font-bold transition-all',
                      quality !== undefined && n <= quality
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-white/[0.04] border-white/[0.08] text-slate-600 hover:border-white/20',
                    )}
                  >
                    <Star size={14} className={quality !== undefined && n <= quality ? 'fill-amber-400 text-amber-400' : ''} />
                  </button>
                ))}
                {quality !== undefined && (
                  <span className="text-[11px] text-slate-500 self-center ml-1">
                    {['','Péssimo','Ruim','Médio','Bom','Ótimo'][quality]}
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Notas (opcional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: acordei 2x durante a noite"
                className="input w-full text-sm"
              />
            </div>
          </div>

          {/* Target wake time */}
          <div className="flex items-center gap-3 pt-3 border-t border-white/5">
            <AlarmClock size={15} className="text-slate-500" />
            <input
              type="time"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              className="input w-auto text-sm"
            />
            <Button variant="outline" size="sm" onClick={handleSetTarget}>
              Definir meta de acordar
            </Button>
          </div>
        </div>
      </FadeInUp>

      {/* Day plan — 5 regras de sono */}
      {plan && (
        <FadeInUp delay={0.1}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'Desligar Telas', sublabel: 'Hoje',   time: plan.screenOff,   icon: MonitorOff, color: '#f59e0b' },
              { label: 'Dormir',         sublabel: 'Hoje',   time: plan.bedtime,     icon: BedDouble,  color: '#8b5cf6' },
              { label: 'Acordar',        sublabel: 'Amanhã', time: plan.nextWake,    icon: AlarmClock, color: '#10b981' },
              { label: 'Dormir',         sublabel: 'Amanhã', time: plan.nextBedtime, icon: BedDouble,  color: '#6366f1' },
              {
                label: sleepRules?.onGoal ? 'Na meta!' : `${sleepRules?.daysToGoal ?? 0} dias`,
                sublabel: 'Para regularizar',
                time: config.targetWake,
                icon: AlarmClock,
                color: sleepRules?.onGoal ? '#10b981' : '#06b6d4',
              },
            ].map(({ label, sublabel, time, icon: Icon, color }) => (
              <div key={`${label}-${sublabel}`} className="card p-4 text-center">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                  style={{ backgroundColor: `${color}18` }}
                >
                  <Icon size={18} style={{ color }} />
                </div>
                <div className="text-2xl font-black tabular-nums leading-none" style={{ color }}>{time}</div>
                <div className="text-slate-100 text-xs font-semibold mt-1.5">{label}</div>
                <div className="text-slate-600 text-[10px] mt-0.5">{sublabel}</div>
              </div>
            ))}
          </div>
        </FadeInUp>
      )}

      {/* Energy score */}
      {energyScore && (
        <FadeInUp delay={0.12}>
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                <Zap size={16} className="text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Score de Energia</h3>
            </div>
            <div className="flex items-center gap-6">
              {/* Ring */}
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg viewBox="0 0 88 88" className="w-24 h-24 -rotate-90">
                  <circle cx="44" cy="44" r="38" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                  <circle
                    cx="44" cy="44" r="38" fill="none"
                    stroke="#10b981" strokeWidth="8"
                    strokeDasharray={`${(energyScore.total / 100) * 239} 239`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black text-emerald-400 tabular-nums">{energyScore.total}</span>
                </div>
              </div>

              {/* Factors */}
              <div className="flex-1 space-y-3">
                {[
                  { label: 'Duração',      value: energyScore.duration,    max: 40, color: '#6366f1' },
                  { label: 'Consistência', value: energyScore.consistency, max: 30, color: '#10b981' },
                  { label: 'Regularidade', value: energyScore.regularity,  max: 30, color: '#8b5cf6' },
                ].map(({ label, value, max, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">{label}</span>
                      <span style={{ color }} className="font-semibold tabular-nums">{value}/{max}</span>
                    </div>
                    <ProgressBar value={(value / max) * 100} color={color} height="sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeInUp>
      )}

      {/* Sleep benchmarks + scientific facts */}
      {history.length > 0 && (() => {
        const withDur = history.filter((h) => (h.durationMin ?? 0) > 0)
        const avgHours = withDur.length
          ? Math.round(withDur.reduce((s, h) => s + (h.durationMin ?? 0), 0) / withDur.length / 60 * 10) / 10
          : undefined
        return (
          <FadeInUp delay={0.125}>
            <div className="card p-5 space-y-5">
              <ScientificPillsRow
                facts={SCIENTIFIC_FACTS.sleep}
                max={3}
                ctx={{
                  module: 'sono',
                  metricName: 'Sono',
                  metricKey: 'sleep',
                  currentValue: avgHours ?? 0,
                  unit: 'h',
                }}
              />
              {avgHours !== undefined && (
                <BenchmarkBar
                  label="Horas dormidas (média 7d)"
                  userValue={avgHours}
                  unit="h"
                  national={BENCHMARKS.sleep.hoursPerNight.national}
                  global={BENCHMARKS.sleep.hoursPerNight.global}
                  recommended={BENCHMARKS.sleep.hoursPerNight.recommended}
                  top10={BENCHMARKS.sleep.hoursPerNight.top10}
                  worst25={BENCHMARKS.sleep.hoursPerNight.worst25}
                  higherIsBetter
                />
              )}
            </div>
          </FadeInUp>
        )
      })()}

      {/* Charts */}
      {history.length > 1 && (
        <FadeInUp delay={0.13}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-sky-500/15 flex items-center justify-center">
                  <TrendingUp size={14} className="text-sky-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-100">Horário de Acordar</h3>
              </div>
              <WakeTimeChart history={history} targetWake={config.targetWake} />
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                  <BarChart3 size={14} className="text-indigo-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-100">Duração do Sono</h3>
              </div>
              <SleepDurationChart history={history} />
            </div>
          </div>
        </FadeInUp>
      )}

      {/* History */}
      {history.length > 0 && (
        <FadeInUp delay={0.14}>
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center">
                <CalendarDays size={16} className="text-sky-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Histórico</h3>
            </div>
            <div className="space-y-2">
              {history.map((item) => (
                <div key={item.date} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-slate-400 text-sm w-24">{item.date}</span>
                  <span className="font-bold text-slate-100 tabular-nums">{item.wakeTime}</span>
                  {item.sleepTime
                    ? <span className="text-slate-500 text-xs">dormiu {item.sleepTime}</span>
                    : <span className="text-slate-600 text-xs">—</span>
                  }
                  <span className={cn('text-xs px-2 py-1 rounded-lg font-semibold', BADGE_STYLES[item.badge])}>
                    {BADGE_LABELS[item.badge]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </FadeInUp>
      )}

      {/* Adjustment chain */}
      {adjustmentChain.length > 0 && (
        <FadeInUp delay={0.16}>
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                <AlarmClock size={16} className="text-violet-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Plano de Ajuste Gradual</h3>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {adjustmentChain.map((step) => {
                const colors = {
                  done:   'bg-emerald-500 text-white',
                  today:  'bg-sky-500 text-white ring-2 ring-sky-300',
                  future: 'bg-white/10 text-slate-300',
                  target: 'bg-violet-600 text-white',
                }
                return (
                  <div key={step.date} className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold tabular-nums',
                        colors[step.status],
                      )}
                    >
                      {step.wakeTime}
                    </div>
                    <span className="text-slate-500 text-[10px]">{step.date.slice(5)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </FadeInUp>
      )}

      {/* IA de análise do sono */}
      {history.length > 0 && (
        <FadeInUp delay={0.35}>
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                  <Brain size={15} className="text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100">Análise IA do Sono</p>
                  <p className="text-[11px] text-slate-500">Conecta padrões com hábitos e personalidade</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSleepAnalysis}
                disabled={aiLoading}
                className="flex-shrink-0"
              >
                {aiLoading
                  ? <><Loader2 size={12} className="animate-spin mr-1.5" />Analisando...</>
                  : <><Brain size={12} className="mr-1.5" />{aiAnalysis ? 'Reanalisar' : 'Analisar meu sono'}</>
                }
              </Button>
            </div>

            {aiAnalysis && (
              <div className="space-y-4">
                {[
                  { key: 'padrao',             label: 'Padrão identificado',      color: 'sky' },
                  { key: 'impacto_aprendizado', label: 'Impacto no aprendizado',  color: 'violet' },
                  { key: 'conexao_exercicio',   label: 'Conexão com exercício',   color: 'emerald' },
                  { key: 'plano_regulacao',     label: 'Plano de regulação (7d)', color: 'amber' },
                ].map(({ key, label, color }) => aiAnalysis[key] ? (
                  <div key={key} className={cn(
                    'p-3 rounded-xl border-l-2',
                    color === 'sky'     && 'bg-sky-500/5 border-sky-500/40',
                    color === 'violet'  && 'bg-violet-500/5 border-violet-500/40',
                    color === 'emerald' && 'bg-emerald-500/5 border-emerald-500/40',
                    color === 'amber'   && 'bg-amber-500/5 border-amber-500/40',
                  )}>
                    <p className={cn(
                      'text-[10px] font-bold uppercase tracking-wider mb-1',
                      color === 'sky'     && 'text-sky-400',
                      color === 'violet'  && 'text-violet-400',
                      color === 'emerald' && 'text-emerald-400',
                      color === 'amber'   && 'text-amber-400',
                    )}>{label}</p>
                    <p className="text-[12px] text-slate-300 leading-relaxed">{aiAnalysis[key]}</p>
                  </div>
                ) : null)}
              </div>
            )}

            {aiLoading && !aiAnalysis && (
              <div className="space-y-2 mt-2">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="h-14 rounded-xl bg-white/[0.04] animate-pulse" />
                ))}
              </div>
            )}
          </div>
        </FadeInUp>
      )}
    </div>
  )
}
