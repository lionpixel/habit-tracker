'use client'

import { useState }      from 'react'
import { useAppStore }   from '@/store/appStore'
import { formatDate }    from '@/lib/helpers'
import { FadeInUp }      from '@/components/ui/Motion'
import { calculateFastingProgress } from '@/lib/fastingUtils'
import { getTodayStr, addDaysToStr } from '@/lib/time'
import {
  CheckCircle2, Circle, Trophy, RotateCcw, Calendar,
  Flame, AlertTriangle, Zap,
} from 'lucide-react'
import type { FastingHabit } from '@/types/habit'

// ─────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────

type DayStatus = 'completed' | 'today' | 'future'

interface DayCell {
  dayIndex: number
  date:     string
  status:   DayStatus
  isToday:  boolean
}

// ─────────────────────────────────────────────
//  Passive cell builder — purely date-derived, no manual state
// ─────────────────────────────────────────────

function buildCells(habit: FastingHabit): DayCell[] {
  const totalDays    = habit.fastingDays ?? 40
  const startDateStr = habit.fastingStartDate
  const todayStr     = getTodayStr()
  const cells: DayCell[] = []

  for (let i = 0; i < totalDays; i++) {
    let date = ''
    if (startDateStr) {
      date = addDaysToStr(startDateStr, i)
    }
    const isToday = date !== '' && date === todayStr
    let status: DayStatus
    if (!date || date > todayStr)  status = 'future'
    else if (isToday)              status = 'today'
    else                           status = 'completed'

    cells.push({ dayIndex: i + 1, date, status, isToday })
  }
  return cells
}

// ─────────────────────────────────────────────
//  Day tile — read-only display
// ─────────────────────────────────────────────

function DayTile({ cell, color }: { cell: DayCell; color: string }) {
  const base: React.CSSProperties = {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    width:          '100%',
    aspectRatio:    '1',
    borderRadius:   '10px',
    fontSize:       '11px',
    fontWeight:     700,
    position:       'relative',
    userSelect:     'none',
    transition:     'all 0.15s',
  }

  if (cell.status === 'completed') {
    return (
      <div style={{ ...base, background: `${color}22`, border: `1px solid ${color}55`, color }}>
        <span>{cell.dayIndex}</span>
        <CheckCircle2
          size={9}
          style={{ color, position: 'absolute', bottom: 2, right: 2 }}
        />
      </div>
    )
  }

  if (cell.status === 'today') {
    return (
      <div style={{
        ...base,
        background:  `${color}20`,
        border:      `2px solid ${color}`,
        color,
        boxShadow:   `0 0 12px ${color}50`,
      }}>
        <span>{cell.dayIndex}</span>
        <Circle size={9} style={{ color, position: 'absolute', bottom: 2, right: 2 }} />
      </div>
    )
  }

  return (
    <div style={{
      ...base,
      background:  'rgba(255,255,255,0.02)',
      border:      '1px solid rgba(255,255,255,0.04)',
      color:       '#334155',
    }}>
      <span>{cell.dayIndex}</span>
    </div>
  )
}

// ─────────────────────────────────────────────
//  Confirm modal (reset / break)
// ─────────────────────────────────────────────

function ConfirmModal({
  title, body, confirmLabel, confirmClass, onConfirm, onClose,
}: {
  title:        string
  body:         string
  confirmLabel: string
  confirmClass: string
  onConfirm:    () => void
  onClose:      () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#0d1117] border border-white/10 rounded-2xl p-6 shadow-xl">
        <RotateCcw size={22} className="text-violet-400 mb-3" />
        <h3 className="text-base font-bold text-slate-100 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 mb-4">{body}</p>
        <div className="flex gap-2">
          <button type="button" onClick={onConfirm} className={confirmClass}>
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-slate-400 text-sm font-bold"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  Main
// ─────────────────────────────────────────────

export function FastingCalendarView() {
  const { data, resetFasting } = useAppStore()
  const fasting  = data.habits.fasting
  const color    = fasting.color
  const progress = calculateFastingProgress(fasting)

  const { totalDays, progressDays, pct, daysLeft, isComplete, endDate } = progress

  const cells      = buildCells(fasting)
  const todayCell  = cells.find((c) => c.isToday)

  const [modal, setModal] = useState<'newCycle' | 'broke' | null>(null)

  // Chunk into rows of 7
  const rows: DayCell[][] = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))

  const startLabel = fasting.fastingStartDate
    ? formatDate(new Date(fasting.fastingStartDate))
    : 'Não iniciado'
  const endLabel = endDate ? formatDate(endDate) : '—'

  return (
    <FadeInUp>
      <div className="card p-5 space-y-5">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}18` }}
            >
              <Calendar size={18} style={{ color }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Calendário do Desafio</h3>
              <p className="text-xs text-slate-500">{startLabel} → {endLabel}</p>
            </div>
          </div>

          {fasting.fastingStartDate && (
            <button
              type="button"
              onClick={() => setModal(isComplete ? 'newCycle' : 'newCycle')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all"
            >
              <RotateCcw size={11} />
              Novo ciclo
            </button>
          )}
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Concluídos', value: progressDays,          col: color      },
            { label: 'Restantes',  value: daysLeft,               col: '#64748b'  },
            { label: 'Ciclos',     value: fasting.completedCycles, col: '#f59e0b' },
            { label: 'Progresso',  value: `${pct}%`,              col: pct >= 80 ? '#10b981' : '#6366f1' },
          ].map(({ label, value, col }) => (
            <div key={label} className="text-center p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <div className="text-sm font-black tabular-nums" style={{ color: col }}>{value}</div>
              <div className="text-[9px] text-slate-600 font-semibold mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* ── Animated progress bar ── */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500 flex items-center gap-1">
              <Zap size={10} className="text-slate-600" />
              Progresso automático baseado em dias corridos
            </span>
            <span className="font-black tabular-nums" style={{ color: isComplete ? '#10b981' : color }}>
              {pct}%
            </span>
          </div>
          <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width:      `${pct}%`,
                background: isComplete
                  ? 'linear-gradient(90deg, #059669, #10b981, #34d399)'
                  : `linear-gradient(90deg, ${color}cc, ${color})`,
                transition: 'width 0.8s cubic-bezier(.4,0,.2,1)',
                boxShadow:  isComplete ? '0 0 8px #10b98140' : `0 0 8px ${color}40`,
              }}
            />
          </div>
        </div>

        {/* ── Countdown ── */}
        {fasting.fastingStartDate && !isComplete && daysLeft > 0 && (
          <div
            className="flex items-center justify-between px-4 py-3 rounded-xl border"
            style={{ background: `${color}08`, borderColor: `${color}20` }}
          >
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Contagem regressiva</p>
              <p className="text-2xl font-black tabular-nums leading-tight" style={{ color }}>
                Faltam {daysLeft} dias
              </p>
            </div>
            <Flame size={28} style={{ color, opacity: 0.7 }} />
          </div>
        )}

        {/* ── Day grid ── */}
        <div>
          {/* Column labels */}
          <div className="grid grid-cols-7 gap-1 mb-1.5 px-0.5">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="text-center text-[9px] text-slate-700 font-semibold">
                {`S${i + 1}`}
              </div>
            ))}
          </div>

          <div className="space-y-1">
            {rows.map((row, ri) => (
              <div key={ri} className="grid grid-cols-7 gap-1">
                {row.map((cell) => (
                  <DayTile key={cell.dayIndex} cell={cell} color={color} />
                ))}
                {row.length < 7 && Array.from({ length: 7 - row.length }).map((_, pi) => (
                  <div key={`pad-${pi}`} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Today marker ── */}
        {todayCell && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <Circle size={13} style={{ color }} className="flex-shrink-0" />
            <p className="text-xs text-slate-400">
              Hoje é o <strong className="text-slate-200">Dia {todayCell.dayIndex}</strong>
              {' '}— atualizado automaticamente todo dia
            </p>
          </div>
        )}

        {/* ── Legend ── */}
        <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-1 border-t border-white/[0.05]">
          {[
            { col: color,     label: 'Concluído' },
            { col: color,     label: 'Hoje', ring: true },
            { col: '#1e293b', label: 'Futuro' },
          ].map(({ col, label, ring }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-md"
                style={{
                  background:  `${col}22`,
                  border:      ring ? `2px solid ${col}` : `1px solid ${col}55`,
                }}
              />
              {label}
            </div>
          ))}
          <span className="ml-auto text-slate-700">100% automático</span>
        </div>

        {/* ── Completion banner ── */}
        {isComplete && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <Trophy size={18} className="text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-400">Desafio concluído!</p>
              <p className="text-[11px] text-emerald-500/70">Clique em &ldquo;Novo ciclo&rdquo; para começar o próximo</p>
            </div>
          </div>
        )}

        {/* ── "Quebrei o desafio" — optional manual reset ── */}
        {fasting.fastingStartDate && !isComplete && (
          <button
            type="button"
            onClick={() => setModal('broke')}
            className="w-full py-2 rounded-xl bg-white/[0.03] hover:bg-red-500/10 border border-white/[0.05] hover:border-red-500/20 text-slate-600 hover:text-red-400 text-[11px] font-semibold transition-all"
          >
            Quebrei o desafio — reiniciar
          </button>
        )}

        {/* ── No start warning ── */}
        {!fasting.fastingStartDate && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle size={14} className="text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-400">
              Clique em &ldquo;Iniciar desafio&rdquo; no card acima para começar.
            </p>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {modal === 'newCycle' && (
        <ConfirmModal
          title="Iniciar novo ciclo?"
          body={`O ciclo atual (${progressDays}/${totalDays} dias) será ${isComplete ? 'salvo como concluído' : 'encerrado'} e um novo desafio de ${totalDays} dias começa hoje.`}
          confirmLabel="Confirmar"
          confirmClass="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold transition-colors"
          onConfirm={() => { resetFasting(); setModal(null) }}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'broke' && (
        <ConfirmModal
          title="Quebrou o desafio?"
          body={`Isso vai reiniciar o contador. Seu progresso de ${progressDays} dias será perdido e um novo desafio começa hoje.`}
          confirmLabel="Sim, reiniciar"
          confirmClass="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors"
          onConfirm={() => { resetFasting(); setModal(null) }}
          onClose={() => setModal(null)}
        />
      )}
    </FadeInUp>
  )
}
