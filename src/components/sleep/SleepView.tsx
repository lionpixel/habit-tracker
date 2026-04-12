// ─────────────────────────────────────────────
//  View: Sono
// ─────────────────────────────────────────────

'use client'

import { useState }    from 'react'
import { toast }       from 'sonner'
import { useSleep }    from '@/hooks/useSleep'
import { Button }      from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { FadeInUp } from '@/components/ui/Motion'
import { cn }          from '@/lib/helpers'
import type { SleepHistoryBadge } from '@/types/sleep'
import {
  Moon, Clock, Zap, CalendarDays, AlarmClock,
  MonitorOff, BedDouble, CheckCircle2,
} from 'lucide-react'

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
    config, todayEntry, plan, energyScore,
    adjustmentChain, history, registerWakeTime, setTargetWake,
  } = useSleep()

  const [wakeInput,   setWakeInput]   = useState(todayEntry?.wakeTime  ?? '06:00')
  const [sleepInput,  setSleepInput]  = useState(todayEntry?.sleepTime ?? '')
  const [targetInput, setTargetInput] = useState(config.targetWake)

  function handleRegister() {
    if (!wakeInput) { toast.error('Informe o horário de acordar.'); return }
    registerWakeTime(wakeInput, sleepInput || undefined)
    toast.success('Horários registrados!')
  }

  function handleSetTarget() {
    setTargetWake(targetInput)
    toast.success(`Meta: acordar às ${targetInput}`)
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

      {/* Day plan */}
      {plan && (
        <FadeInUp delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Desligar Telas', time: plan.shutdown, icon: MonitorOff, color: '#f59e0b' },
              { label: 'Dormir',         time: plan.bedtime,  icon: BedDouble,  color: '#8b5cf6' },
              { label: 'Acordar',        time: plan.nextWake, icon: AlarmClock, color: '#10b981' },
            ].map(({ label, time, icon: Icon, color }) => (
              <div key={label} className="card p-6 text-center">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: `${color}18` }}
                >
                  <Icon size={22} style={{ color }} />
                </div>
                <div className="text-4xl font-black tabular-nums" style={{ color }}>{time}</div>
                <div className="text-slate-400 text-sm mt-2">{label}</div>
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

      {/* History */}
      {history.length > 0 && (
        <FadeInUp delay={0.14}>
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center">
                <CalendarDays size={16} className="text-sky-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Últimos 7 dias</h3>
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
    </div>
  )
}
