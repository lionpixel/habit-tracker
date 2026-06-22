'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BarChart3, Copy, Check, Loader2, RefreshCw } from 'lucide-react'
import { useHabits } from '@/hooks/useHabits'
import { useActiveHabitKeys } from '@/store/selectors'
import { useProfileStore } from '@/store/profileStore'
import { useFinanceStore, currentMonthKey } from '@/store/financeStore'
import { totalIncome, totalExpenses, totalSavings, savingsRate } from '@/types/finance'
import { cn } from '@/lib/helpers'

interface Props {
  open: boolean
  onClose: () => void
}

type Status = 'idle' | 'loading' | 'done' | 'error'

// ── Parse the 4-section report from GPT ──────

const WEEKLY_SECTIONS = [
  { key: 'diagnosis',  label: 'Diagnóstico Geral',       color: 'violet', num: '1' },
  { key: 'highlights', label: 'Destaques',                color: 'emerald', num: '2' },
  { key: 'alerts',     label: 'Alertas',                  color: 'amber', num: '3' },
  { key: 'focus',      label: 'Foco da Próxima Semana',   color: 'cyan', num: '4' },
] as const

function parseReport(text: string): Record<string, string> {
  const result: Record<string, string> = {}
  const pairs = [
    ['diagnosis',  /1\.\s*DIAGNÓSTICO[^\n]*/i],
    ['highlights', /2\.\s*DESTAQUES[^\n]*/i],
    ['alerts',     /3\.\s*ALERTAS[^\n]*/i],
    ['focus',      /4\.\s*FOCO[^\n]*/i],
  ] as const

  for (let i = 0; i < pairs.length; i++) {
    const [key, regex] = pairs[i]
    const match = text.search(regex)
    if (match === -1) continue
    const nextMatch = i < pairs.length - 1 ? text.search(pairs[i + 1][1]) : text.length
    const block = text.slice(match, nextMatch === -1 ? undefined : nextMatch)
    // remove the header line
    result[key] = block.replace(regex, '').trim()
  }
  return result
}

const SECTION_COLORS: Record<string, string> = {
  violet:  'border-violet-500/30 bg-violet-500/[0.04]',
  emerald: 'border-emerald-500/30 bg-emerald-500/[0.04]',
  amber:   'border-amber-500/30 bg-amber-500/[0.04]',
  cyan:    'border-cyan-500/30 bg-cyan-500/[0.04]',
}
const LABEL_COLORS: Record<string, string> = {
  violet:  'text-violet-300',
  emerald: 'text-emerald-300',
  amber:   'text-amber-300',
  cyan:    'text-cyan-300',
}

export function WeeklyReportModal({ open, onClose }: Props) {
  const [status, setStatus]   = useState<Status>('idle')
  const [report, setReport]   = useState('')
  const [copied, setCopied]   = useState(false)

  const { habits, currentWeek, currentYear, getWeekCount, getWeekProgress, getWeekMinutes } = useHabits()
  const HABIT_KEYS  = useActiveHabitKeys()
  const profile     = useProfileStore((s) => s.profile)
  const getMonth    = useFinanceStore((s) => s.getMonth)
  const month       = getMonth(currentMonthKey())

  const generate = useCallback(async () => {
    setStatus('loading')
    setReport('')

    const weekData = {
      week:  currentWeek,
      year:  currentYear,
      habits: HABIT_KEYS.map((key) => ({
        name:        habits[key].name,
        sessions:    getWeekCount(key),
        target:      habits[key].frequency,
        progressPct: getWeekProgress(key),
        totalMinutes: getWeekMinutes(key),
      })),
      body: {
        weight:     profile?.weight,
        bodyFat:    profile?.bodyFat,
        weightGoal: profile?.goalWeight,
      },
      finance: {
        income:         totalIncome(month),
        expenses:       totalExpenses(month),
        investments:    totalSavings(month),
        investmentRate: savingsRate(month),
      },
    }

    try {
      const res = await fetch('/api/openai/report/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekData }),
      })
      const data = await res.json()
      if (res.status === 429 || res.status === 503) {
        setReport(data.report ?? data.error)
        setStatus('error')
        return
      }
      setReport(data.report ?? '')
      setStatus('done')
    } catch {
      setReport('Erro de conexão. Verifique sua internet.')
      setStatus('error')
    }
  }, [currentWeek, currentYear, HABIT_KEYS, habits, getWeekCount, getWeekProgress, getWeekMinutes, profile, month])

  function copyToClipboard() {
    navigator.clipboard.writeText(report)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sections = status === 'done' ? parseReport(report) : {}

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="relative w-full sm:max-w-2xl max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#0f1117] border border-white/[0.08] shadow-2xl overflow-hidden"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/[0.06] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center">
                  <BarChart3 size={16} className="text-violet-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Relatório Semanal com IA</h3>
                  <p className="text-xs text-slate-500">Semana {currentWeek} · {currentYear} — GPT-4o</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {status === 'done' && (
                  <button
                    onClick={copyToClipboard}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                      copied
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/[0.06] text-slate-400 hover:text-slate-200 border border-white/[0.08]',
                    )}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Idle */}
              {status === 'idle' && (
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <BarChart3 size={28} className="text-violet-400" />
                  </div>
                  <div>
                    <p className="text-slate-200 font-semibold mb-1">Análise Completa da Semana</p>
                    <p className="text-slate-500 text-sm max-w-sm">
                      GPT-4o analisa hábitos, corpo, finanças e gera diagnóstico, destaques, alertas e foco.
                      Leva 5–10 segundos.
                    </p>
                  </div>
                  <button
                    onClick={generate}
                    className="px-5 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-bold transition-colors"
                  >
                    Gerar Relatório
                  </button>
                </div>
              )}

              {/* Loading */}
              {status === 'loading' && (
                <div className="flex flex-col items-center gap-4 py-10">
                  <Loader2 size={32} className="text-violet-400 animate-spin" />
                  <p className="text-slate-400 text-sm">Analisando dados da semana…</p>
                  <div className="w-full space-y-3">
                    {[80, 60, 70, 50].map((w, i) => (
                      <div key={i} className="h-3 rounded-full bg-white/[0.05] animate-pulse" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Done — parsed sections */}
              {status === 'done' && Object.keys(sections).length > 0 && (
                WEEKLY_SECTIONS.map(({ key, label, color }) => {
                  const content = sections[key]
                  if (!content) return null
                  return (
                    <div
                      key={key}
                      className={cn('rounded-xl border p-4', SECTION_COLORS[color])}
                    >
                      <p className={cn('text-xs font-bold uppercase tracking-widest mb-2', LABEL_COLORS[color])}>
                        {label}
                      </p>
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{content}</p>
                    </div>
                  )
                })
              )}

              {/* Done — raw fallback (parse failed) */}
              {status === 'done' && Object.keys(sections).length === 0 && (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{report}</p>
                </div>
              )}

              {/* Error */}
              {status === 'error' && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-4 text-sm text-red-300">
                  {report}
                </div>
              )}
            </div>

            {/* Footer */}
            {(status === 'done' || status === 'error') && (
              <div className="flex justify-center p-4 border-t border-white/[0.06] flex-shrink-0">
                <button
                  onClick={generate}
                  className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <RefreshCw size={12} />
                  Gerar nova análise
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
