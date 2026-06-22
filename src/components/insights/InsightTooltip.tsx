'use client'

// ─────────────────────────────────────────────
//  InsightTooltip — Tooltip que chama Claude API ao hover
//  Mostra motivação contextualizada por métrica
// ─────────────────────────────────────────────

import { useState, useCallback, useRef, useEffect } from 'react'
import { cn } from '@/lib/helpers'
import type { MetricContext } from '@/lib/insightsEngine'
import { generateInsight } from '@/lib/insightsEngine'
import { Sparkles, X, Brain, CheckCircle, AlertTriangle, BarChart2, DollarSign, Moon, Zap } from 'lucide-react'

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  neurociencia: <Brain       size={12} />,
  beneficio:    <CheckCircle size={12} />,
  abandono:     <AlertTriangle size={12} />,
  comparacao:   <BarChart2   size={12} />,
  financeiro:   <DollarSign  size={12} />,
  sono:         <Moon        size={12} />,
  corpo:        <Zap         size={12} />,
}

type TooltipState = 'idle' | 'loading' | 'loaded' | 'error'
type Position = 'top' | 'bottom' | 'auto'

interface InsightTooltipProps {
  ctx: MetricContext
  children: React.ReactNode
  position?: Position
  className?: string
  triggerMode?: 'hover' | 'click'
}

export function InsightTooltip({
  ctx,
  children,
  position = 'auto',
  className,
  triggerMode = 'hover',
}: InsightTooltipProps) {
  const [state, setState] = useState<TooltipState>('idle')
  const [text, setText] = useState<string>('')
  const [visible, setVisible] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resolvedPos: 'top' | 'bottom' = (() => {
    if (position !== 'auto') return position
    if (typeof window === 'undefined') return 'bottom'
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) return 'bottom'
    return rect.top > window.innerHeight / 2 ? 'top' : 'bottom'
  })()

  const show = useCallback(async () => {
    setVisible(true)
    if (state === 'loaded') return
    setState('loading')
    const result = await generateInsight(ctx)
    if (result.includes('Configure') || result.includes('Erro') || result.includes('indisponível')) {
      setState('error')
    } else {
      setState('loaded')
    }
    setText(result)
  }, [ctx, state])

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setVisible(false), 200)
  }, [])

  const keepOpen = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const hoverProps = triggerMode === 'hover'
    ? { onMouseEnter: show, onMouseLeave: hide }
    : { onClick: () => (visible ? setVisible(false) : show()) }

  return (
    <div ref={wrapRef} className={cn('relative inline-block', className)} {...hoverProps}>
      {children}

      {visible && (
        <div
          className={cn(
            'absolute z-50 w-[300px] max-w-[calc(100vw-2rem)]',
            'bg-[#0d1117] border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/60',
            'pointer-events-auto',
            resolvedPos === 'bottom' ? 'top-full mt-2 left-0' : 'bottom-full mb-2 left-0',
          )}
          onMouseEnter={keepOpen}
          onMouseLeave={hide}
        >
          {/* Arrow */}
          <div className={cn(
            'absolute w-2.5 h-2.5 bg-[#0d1117] border-white/[0.1] rotate-45',
            resolvedPos === 'bottom'
              ? 'top-[-5px] left-4 border-t border-l'
              : 'bottom-[-5px] left-4 border-b border-r',
          )} />

          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={12} className="text-violet-400" />
                <span className="text-[11px] font-bold text-violet-300 uppercase tracking-wider">
                  {ctx.metricName}
                </span>
                <span className="text-[11px] font-black text-slate-100 tabular-nums">
                  {ctx.currentValue} {ctx.unit}
                </span>
              </div>
              <button
                onClick={() => setVisible(false)}
                className="text-slate-600 hover:text-slate-400 transition-colors"
              >
                <X size={12} />
              </button>
            </div>

            {/* Scientific fact */}
            {ctx.triggeredFact && (
              <div className="mb-3 text-[11px] text-slate-500 italic border-l-2 border-violet-500/30 pl-2">
                <span className="mr-1 inline-flex">{CATEGORY_ICON[ctx.triggeredFact.category] ?? <BarChart2 size={12} />}</span>
                {ctx.triggeredFact.stat}
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-white/[0.06] mb-3" />

            {/* Insight content */}
            {state === 'loading' && (
              <div className="space-y-2">
                <div className="h-3 bg-white/[0.06] rounded-full animate-pulse w-full" />
                <div className="h-3 bg-white/[0.06] rounded-full animate-pulse w-4/5" />
                <div className="h-3 bg-white/[0.06] rounded-full animate-pulse w-3/5" />
              </div>
            )}

            {(state === 'loaded' || state === 'error') && (
              <p className={cn(
                'text-[12px] leading-relaxed',
                state === 'error' ? 'text-slate-500 italic' : 'text-slate-200',
              )}>
                {text}
              </p>
            )}

            {/* Source */}
            {ctx.triggeredFact && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[10px] text-slate-600">
                  {ctx.triggeredFact.source}
                </span>
                <span className={cn(
                  'text-[9px] px-1.5 py-0.5 rounded-full font-semibold uppercase',
                  ctx.triggeredFact.category === 'beneficio' && 'bg-emerald-500/15 text-emerald-400',
                  ctx.triggeredFact.category === 'abandono' && 'bg-red-500/15 text-red-400',
                  ctx.triggeredFact.category === 'neurociencia' && 'bg-violet-500/15 text-violet-400',
                  ctx.triggeredFact.category === 'comparacao' && 'bg-blue-500/15 text-blue-400',
                  ctx.triggeredFact.category === 'financeiro' && 'bg-amber-500/15 text-amber-400',
                  !['beneficio','abandono','neurociencia','comparacao','financeiro'].includes(ctx.triggeredFact.category) && 'bg-slate-500/15 text-slate-400',
                )}>
                  {ctx.triggeredFact.category}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
