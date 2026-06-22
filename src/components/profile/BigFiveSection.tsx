'use client'

import { useState } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts'
import {
  Brain, Plus, ChevronDown, ChevronUp, Trash2, X,
  Loader2, ChevronRight, CheckCircle2, AlertCircle,
} from 'lucide-react'
import { useProfileStore } from '@/store/profileStore'
import { useAppStore } from '@/store/appStore'
import type { HabitBase } from '@/types/habit'
import { getBigFiveQuarter, shouldRemindBigFive } from '@/types/profile'
import type { BigFiveResult, BigFiveAnalysis, BigFiveSource } from '@/types/profile'
import { getTodayStr } from '@/lib/time'
import { cn } from '@/lib/helpers'

// ── Constants ─────────────────────────────────

const OCEAN_LABELS = {
  openness:          'Abertura',
  conscientiousness: 'Conscienciosidade',
  extraversion:      'Extroversão',
  agreeableness:     'Amabilidade',
  neuroticism:       'Neuroticismo',
} as const

const OCEAN_COLORS: Record<string, string> = {
  openness:          '#6366f1',
  conscientiousness: '#10b981',
  extraversion:      '#f59e0b',
  agreeableness:     '#06b6d4',
  neuroticism:       '#ef4444',
}

const SOURCE_LABELS: Record<BigFiveSource, string> = {
  '16personalities': '16Personalities',
  'ipip-120':        'IPIP-120',
  'bigfive-test':    'BigFive.Test',
  'manual':          'Manual (sliders)',
}

// ── Radar chart ───────────────────────────────

function BigFiveRadar({ result, prev }: { result: BigFiveResult; prev?: BigFiveResult }) {
  const data = Object.entries(OCEAN_LABELS).map(([key, label]) => ({
    trait:    label,
    value:    result[key as keyof BigFiveResult] as number,
    previous: prev ? prev[key as keyof BigFiveResult] as number : undefined,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="rgba(255,255,255,0.07)" />
        <PolarAngleAxis
          dataKey="trait"
          tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'inherit' }}
        />
        <Tooltip
          contentStyle={{
            background: '#0d1117',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: '#94a3b8' }}
          itemStyle={{ color: '#e2e8f0' }}
          formatter={(v: number, name: string) => [`${v}`, name === 'value' ? 'Atual' : 'Anterior']}
        />
        {prev && (
          <Radar
            name="previous"
            dataKey="previous"
            stroke="rgba(148,163,184,0.3)"
            fill="rgba(148,163,184,0.05)"
            strokeDasharray="4 4"
          />
        )}
        <Radar
          name="value"
          dataKey="value"
          stroke="#6366f1"
          fill="rgba(99,102,241,0.15)"
          strokeWidth={1.5}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}

// ── Score bars ────────────────────────────────

function ScoreBar({ trait, value }: { trait: string; value: number }) {
  const color = OCEAN_COLORS[trait] ?? '#6366f1'
  const label = OCEAN_LABELS[trait as keyof typeof OCEAN_LABELS] ?? trait

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-semibold text-slate-400">{label}</span>
        <span className="text-[11px] font-bold tabular-nums" style={{ color }}>{value}</span>
      </div>
      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

// ── Analysis accordion ────────────────────────

function AnalysisAccordion({ analysis }: { analysis: BigFiveAnalysis }) {
  const [open, setOpen] = useState<string | null>(null)

  const sections = [
    {
      key: 'profile',
      label: 'Perfil de Personalidade',
      content: <p className="text-xs text-slate-300 leading-relaxed">{analysis.personalityProfile}</p>,
    },
    {
      key: 'strengths',
      label: 'Forças derivadas dos traços',
      content: (
        <ul className="space-y-1.5">
          {analysis.strengthsFromTraits.map((s, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 size={12} className="text-emerald-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-slate-300">{s}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: 'challenges',
      label: 'Desafios a trabalhar',
      content: (
        <ul className="space-y-1.5">
          {analysis.challengesFromTraits.map((c, i) => (
            <li key={i} className="flex items-start gap-2">
              <AlertCircle size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-slate-300">{c}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: 'habits',
      label: 'Compatibilidade com hábitos',
      content: (
        <div className="space-y-2">
          {analysis.habitCompatibility.length === 0 ? (
            <p className="text-xs text-slate-500">Nenhum hábito ativo na época da análise.</p>
          ) : (
            analysis.habitCompatibility.map((h, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5',
                  h.compatibility === 'alta'  && 'bg-emerald-500/15 text-emerald-400',
                  h.compatibility === 'media' && 'bg-amber-500/15 text-amber-400',
                  h.compatibility === 'baixa' && 'bg-red-500/15 text-red-400',
                )}>
                  {h.compatibility.toUpperCase()}
                </span>
                <div>
                  <span className="text-xs font-semibold text-slate-200">{h.habitName} </span>
                  <span className="text-xs text-slate-400">— {h.explanation}</span>
                </div>
              </div>
            ))
          )}
        </div>
      ),
    },
    {
      key: 'mood',
      label: 'Padrões de humor e energia',
      content: <p className="text-xs text-slate-300 leading-relaxed">{analysis.moodPatterns}</p>,
    },
    {
      key: 'consistency',
      label: 'Previsão de consistência',
      content: <p className="text-xs text-slate-300 leading-relaxed">{analysis.consistencyPrediction}</p>,
    },
    {
      key: 'insights',
      label: 'Insights acionáveis',
      content: (
        <ul className="space-y-1.5">
          {analysis.actionableInsights.map((s, i) => (
            <li key={i} className="flex items-start gap-2">
              <ChevronRight size={12} className="text-violet-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-slate-300">{s}</span>
            </li>
          ))}
        </ul>
      ),
    },
    ...(analysis.quarterComparison
      ? [{
          key: 'comparison',
          label: 'Comparação com trimestre anterior',
          content: <p className="text-xs text-slate-300 leading-relaxed">{analysis.quarterComparison}</p>,
        }]
      : []),
  ]

  return (
    <div className="space-y-1 mt-4">
      {sections.map((s) => (
        <div key={s.key} className="border border-white/[0.06] rounded-xl overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-4 py-3 text-left"
            onClick={() => setOpen(open === s.key ? null : s.key)}
          >
            <span className="text-xs font-semibold text-slate-300">{s.label}</span>
            {open === s.key
              ? <ChevronUp size={13} className="text-slate-500 flex-shrink-0" />
              : <ChevronDown size={13} className="text-slate-500 flex-shrink-0" />
            }
          </button>
          {open === s.key && (
            <div className="px-4 pb-4">{s.content}</div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Entry card ────────────────────────────────

function ResultCard({
  result,
  prev,
  onDelete,
}: {
  result: BigFiveResult
  prev?: BigFiveResult
  onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const store = useProfileStore()

  async function generateAnalysis() {
    setAnalyzing(true)
    try {
      const { habits } = useAppStore.getState().data
      const allHabits = (Object.values(habits) as HabitBase[])
        .filter((h) => !h.archived)
        .map((h) => h.name)

      const res = await fetch('/api/openai/bigfive-analyze', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ current: result, previous: prev ?? null, habitNames: allHabits }),
      })

      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      store.updateBigFiveAnalysis(result.id, data.analysis as BigFiveAnalysis)
    } catch (e) {
      console.error('[BigFive] analyze error:', e)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-slate-100">{result.quarter}</p>
          <p className="text-[11px] text-slate-500">{result.date} · {SOURCE_LABELS[result.source]}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            {expanded ? 'Recolher' : 'Expandir'}
          </button>
          <button onClick={onDelete} className="text-slate-600 hover:text-red-400 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {Object.keys(OCEAN_LABELS).map((k) => (
          <ScoreBar key={k} trait={k} value={result[k as keyof BigFiveResult] as number} />
        ))}
      </div>

      {expanded && (
        <>
          <BigFiveRadar result={result} prev={prev} />

          {result.aiAnalysis ? (
            <AnalysisAccordion analysis={result.aiAnalysis} />
          ) : (
            <button
              onClick={generateAnalysis}
              disabled={analyzing}
              className="mt-4 w-full py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold hover:bg-violet-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {analyzing
                ? <><Loader2 size={13} className="animate-spin" /> Gerando análise...</>
                : <><Brain size={13} /> Gerar análise com IA</>
              }
            </button>
          )}
        </>
      )}
    </div>
  )
}

// ── Registration modal ────────────────────────

type ModalStep = 'source' | 'paste' | 'sliders' | 'saving'

const DEFAULT_SCORES = {
  openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50,
}

function RegistrationModal({ onClose, prev }: { onClose: () => void; prev?: BigFiveResult }) {
  const store = useProfileStore()
  const [step, setStep]     = useState<ModalStep>('source')
  const [source, setSource] = useState<BigFiveSource>('16personalities')
  const [rawText, setRaw]   = useState('')
  const [scores, setScores] = useState(DEFAULT_SCORES)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  async function handleParsePaste() {
    if (!rawText.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/openai/bigfive-parse', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ rawText, source }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Erro ao extrair escores')
      setScores({
        openness:          data.openness,
        conscientiousness: data.conscientiousness,
        extraversion:      data.extraversion,
        agreeableness:     data.agreeableness,
        neuroticism:       data.neuroticism,
      })
      setStep('sliders')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  function handleSave() {
    const id = store.addBigFiveResult({
      date:              getTodayStr(),
      quarter:           getBigFiveQuarter(),
      source,
      rawResultText:     rawText || undefined,
      ...scores,
    })
    onClose()
    return id
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0d1117] border border-white/[0.08] rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain size={16} className="text-violet-400" />
            <span className="text-sm font-bold text-slate-100">Registrar Big Five</span>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-400">
            <X size={16} />
          </button>
        </div>

        {/* Step: source */}
        {step === 'source' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">De qual plataforma é o resultado?</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(SOURCE_LABELS) as [BigFiveSource, string][]).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setSource(k)}
                  className={cn(
                    'px-3 py-2.5 rounded-xl text-xs font-semibold border transition-colors',
                    source === k
                      ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                      : 'bg-white/[0.04] border-white/[0.06] text-slate-400 hover:bg-white/[0.06]',
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setStep(source === 'manual' ? 'sliders' : 'paste')}
                className="flex-1 py-2.5 rounded-xl bg-violet-500 text-white text-xs font-bold hover:bg-violet-400 transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step: paste */}
        {step === 'paste' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Cole o texto do seu resultado de {SOURCE_LABELS[source]}. A IA vai extrair os escores automaticamente.
            </p>
            <textarea
              autoFocus
              value={rawText}
              onChange={(e) => setRaw(e.target.value)}
              rows={8}
              placeholder="Cole aqui o resultado completo do teste..."
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-violet-500/40 resize-none"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => setStep('source')}
                className="px-4 py-2.5 rounded-xl bg-white/[0.05] text-slate-400 text-xs font-semibold hover:bg-white/[0.08] transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleParsePaste}
                disabled={loading || !rawText.trim()}
                className="flex-1 py-2.5 rounded-xl bg-violet-500 text-white text-xs font-bold hover:bg-violet-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading
                  ? <><Loader2 size={12} className="animate-spin" /> Extraindo escores...</>
                  : 'Extrair escores com IA'
                }
              </button>
            </div>
            <button
              onClick={() => { setStep('sliders') }}
              className="w-full text-xs text-slate-600 hover:text-slate-400 transition-colors"
            >
              Ou inserir escores manualmente →
            </button>
          </div>
        )}

        {/* Step: sliders */}
        {step === 'sliders' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              {source !== 'manual' ? 'Revise e ajuste os escores extraídos.' : 'Insira os escores do seu teste (0–100).'}
            </p>
            <div className="space-y-3">
              {(Object.entries(OCEAN_LABELS) as [keyof typeof DEFAULT_SCORES, string][]).map(([k, label]) => (
                <div key={k}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">{label}</span>
                    <span className="text-xs font-bold tabular-nums" style={{ color: OCEAN_COLORS[k] }}>
                      {scores[k]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={scores[k]}
                    onChange={(e) => setScores((s) => ({ ...s, [k]: Number(e.target.value) }))}
                    className="w-full accent-violet-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setStep(source === 'manual' ? 'source' : 'paste')}
                className="px-4 py-2.5 rounded-xl bg-white/[0.05] text-slate-400 text-xs font-semibold hover:bg-white/[0.08] transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl bg-violet-500 text-white text-xs font-bold hover:bg-violet-400 transition-colors"
              >
                Salvar resultado
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Quarter tabs ──────────────────────────────

function getQuarterLabel(q: string): string {
  const [year, qPart] = q.split('-')
  const qMap: Record<string, string> = { Q1: 'Jan–Mar', Q2: 'Abr–Jun', Q3: 'Jul–Set', Q4: 'Out–Dez' }
  return `${qMap[qPart] ?? qPart} ${year}`
}

// ── Main export ───────────────────────────────

export function BigFiveSection() {
  const store   = useProfileStore()
  const history = store.bigFiveHistory
  const [modal, setModal]         = useState(false)
  const [activeQuarter, setActive] = useState<string | null>(null)

  const quarters = [...new Set(history.map((r) => r.quarter))].sort().reverse()
  const currentQ  = activeQuarter ?? quarters[0]
  const qResults  = currentQ ? history.filter((r) => r.quarter === currentQ) : history
  const latest    = qResults[0]
  const prevAll   = currentQ
    ? history.filter((r) => r.quarter !== currentQ)
    : history.slice(1)
  const prevEntry = prevAll[0]
  const needsRemind = shouldRemindBigFive(history)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
            <Brain size={14} className="text-violet-400" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-100">Big Five</span>
            <span className="text-xs text-slate-500 ml-2">OCEAN · personalidade</span>
          </div>
        </div>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
        >
          <Plus size={13} />
          Registrar
        </button>
      </div>

      {/* Reminder banner */}
      {needsRemind && history.length > 0 && (
        <div className="mb-4 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2">
          <AlertCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300">
            Já faz mais de 75 dias desde o último teste. Refaça para acompanhar sua evolução trimestral.
          </p>
        </div>
      )}

      {history.length === 0 ? (
        <button
          onClick={() => setModal(true)}
          className="w-full border border-dashed border-white/[0.08] rounded-xl p-6 text-center text-slate-600 hover:border-violet-500/30 hover:text-slate-500 transition-colors"
        >
          <Brain size={20} className="mx-auto mb-2 opacity-40" />
          <p className="text-xs">Registre seu primeiro resultado Big Five</p>
          <p className="text-[11px] text-slate-700 mt-0.5">16Personalities, IPIP-120, BigFive.Test ou manual</p>
        </button>
      ) : (
        <>
          {/* Quarter tabs */}
          {quarters.length > 1 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {quarters.map((q) => (
                <button
                  key={q}
                  onClick={() => setActive(q)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors',
                    currentQ === q
                      ? 'bg-violet-500/20 text-violet-300'
                      : 'bg-white/[0.04] text-slate-500 hover:bg-white/[0.06]',
                  )}
                >
                  {getQuarterLabel(q)}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-3">
            {qResults.map((r) => (
              <ResultCard
                key={r.id}
                result={r}
                prev={prevEntry}
                onDelete={() => store.deleteBigFiveResult(r.id)}
              />
            ))}
          </div>
        </>
      )}

      {modal && (
        <RegistrationModal
          onClose={() => setModal(false)}
          prev={history[0]}
        />
      )}
    </div>
  )
}
