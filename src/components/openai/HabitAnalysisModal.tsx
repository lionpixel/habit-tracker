'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, Loader2, RefreshCw } from 'lucide-react'
import { useHabits } from '@/hooks/useHabits'
import { useAppStore } from '@/store/appStore'
import { SCIENTIFIC_FACTS } from '@/lib/benchmarks'
import { getWeekKey } from '@/lib/helpers'
import type { HabitKey } from '@/types/habit'
import { cn } from '@/lib/helpers'

interface Props {
  habitKey: HabitKey
  open: boolean
  onClose: () => void
}

type Status = 'idle' | 'loading' | 'done' | 'error'

const HABIT_SECTIONS = [
  { key: 'pattern',    label: 'Padrão Identificado',  color: 'violet' },
  { key: 'comparison', label: 'Comparação',            color: 'blue' },
  { key: 'recommend',  label: 'Recomendação',          color: 'emerald' },
] as const

function parseAnalysis(text: string): Record<string, string> {
  const result: Record<string, string> = {}
  const pairs = [
    ['pattern',    /1\.\s*PADRÃO[^\n]*/i],
    ['comparison', /2\.\s*COMPARAÇÃO[^\n]*/i],
    ['recommend',  /3\.\s*RECOMENDAÇÃO[^\n]*/i],
  ] as const

  for (let i = 0; i < pairs.length; i++) {
    const [key, regex] = pairs[i]
    const match = text.search(regex)
    if (match === -1) continue
    const nextMatch = i < pairs.length - 1 ? text.search(pairs[i + 1][1]) : text.length
    const block = text.slice(match, nextMatch === -1 ? undefined : nextMatch)
    result[key] = block.replace(regex, '').trim()
  }
  return result
}

const SECTION_COLORS: Record<string, string> = {
  violet:  'border-violet-500/30 bg-violet-500/[0.04]',
  blue:    'border-blue-500/30 bg-blue-500/[0.04]',
  emerald: 'border-emerald-500/30 bg-emerald-500/[0.04]',
}
const LABEL_COLORS: Record<string, string> = {
  violet:  'text-violet-300',
  blue:    'text-blue-300',
  emerald: 'text-emerald-300',
}

export function HabitAnalysisModal({ habitKey, open, onClose }: Props) {
  const [status,   setStatus]   = useState<Status>('idle')
  const [analysis, setAnalysis] = useState('')

  const { habits, currentWeek, currentYear } = useHabits()
  const allData = useAppStore((s) => s.data)
  const habit   = habits[habitKey]

  const generate = useCallback(async () => {
    setStatus('loading')
    setAnalysis('')

    // Build last 8 weeks history from counts map
    const history = Array.from({ length: 8 }, (_, i) => {
      const offset = 8 - i
      let w = currentWeek - offset
      let y = currentYear
      while (w < 1) { w += 52; y -= 1 }
      const wKey    = getWeekKey(y, w)
      const sessions = allData.habits[habitKey]?.counts?.[wKey] ?? 0
      return { week: w, year: y, sessions, totalMinutes: sessions * habit.target }
    })

    const facts = (SCIENTIFIC_FACTS[habitKey] ?? []).map((f) => f.stat)

    try {
      const res = await fetch('/api/openai/report/habit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habit: {
            name:           habit.name,
            weeklyTarget:   habit.frequency,
            sessionMinutes: habit.target,
            unit:           habit.unit,
            scientificFacts: facts,
          },
          history,
        }),
      })

      const data = await res.json()
      if (res.status === 429 || res.status === 503) {
        setAnalysis(data.analysis ?? data.error)
        setStatus('error')
        return
      }
      setAnalysis(data.analysis ?? '')
      setStatus('done')
    } catch {
      setAnalysis('Erro de conexão. Verifique sua internet.')
      setStatus('error')
    }
  }, [habitKey, habit, currentWeek, currentYear, allData])

  const sections = status === 'done' ? parseAnalysis(analysis) : {}

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            className="relative w-full sm:max-w-xl max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#0f1117] border border-white/[0.08] shadow-2xl overflow-hidden"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/[0.06] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `${habit.color}18` }}
                >
                  <TrendingUp size={16} style={{ color: habit.color }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Análise — {habit.name}</h3>
                  <p className="text-xs text-slate-500">Últimas 8 semanas · GPT-4o</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Idle */}
              {status === 'idle' && (
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: `${habit.color}14`, border: `1px solid ${habit.color}30` }}
                  >
                    <TrendingUp size={28} style={{ color: habit.color }} />
                  </div>
                  <div>
                    <p className="text-slate-200 font-semibold mb-1">Análise Profunda do Hábito</p>
                    <p className="text-slate-500 text-sm max-w-sm">
                      GPT-4o analisa as últimas 8 semanas e gera padrão, comparação com médias e recomendação específica.
                    </p>
                  </div>
                  <button
                    onClick={generate}
                    className="px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
                    style={{ background: `linear-gradient(135deg, ${habit.color}, ${habit.color}cc)` }}
                  >
                    Analisar Hábito
                  </button>
                </div>
              )}

              {/* Loading */}
              {status === 'loading' && (
                <div className="flex flex-col items-center gap-4 py-10">
                  <Loader2 size={32} className="animate-spin" style={{ color: habit.color }} />
                  <p className="text-slate-400 text-sm">Analisando histórico de {habit.name}…</p>
                  <div className="w-full space-y-3">
                    {[70, 85, 55].map((w, i) => (
                      <div key={i} className="h-3 rounded-full bg-white/[0.05] animate-pulse" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Done — parsed */}
              {status === 'done' && Object.keys(sections).length > 0 && (
                HABIT_SECTIONS.map(({ key, label, color }) => {
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

              {/* Done — raw fallback */}
              {status === 'done' && Object.keys(sections).length === 0 && (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{analysis}</p>
                </div>
              )}

              {/* Error */}
              {status === 'error' && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-4 text-sm text-red-300">
                  {analysis}
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
