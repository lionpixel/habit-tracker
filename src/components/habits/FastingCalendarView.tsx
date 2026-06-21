'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, Circle, Flame, RotateCcw, Shield, Trophy } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { formatDate } from '@/lib/helpers'
import { addDaysToStr, getTodayStr } from '@/lib/time'
import { calculateFastingProgress, calcFastingYearTotal } from '@/lib/fastingUtils'
import type { FastingHabit } from '@/types/habit'

type DayStatus = 'past' | 'today' | 'future'

interface FastingChallengeProps {
  onEdit?: () => void
}

interface DayCell {
  dayIndex: number
  date: string
  status: DayStatus
}

function buildCells(habit: FastingHabit): DayCell[] {
  const totalDays = habit.fastingDays ?? 40
  const today = getTodayStr()
  const start = habit.fastingStartDate

  return Array.from({ length: totalDays }, (_, index) => {
    const date = start ? addDaysToStr(start, index) : ''
    let status: DayStatus = 'future'

    if (date && date < today) status = 'past'
    if (date && date === today) status = 'today'

    return {
      dayIndex: index + 1,
      date,
      status,
    }
  })
}

function ConfirmModal({
  title,
  body,
  confirmLabel,
  confirmClassName,
  onConfirm,
  onClose,
}: {
  title: string
  body: string
  confirmLabel: string
  confirmClassName: string
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-3xl border border-white/[0.1] bg-[#0d1117] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.65)]">
        <h4 className="text-lg font-black text-slate-100">{title}</h4>
        <p className="mt-2 text-sm text-slate-500">{body}</p>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onConfirm} className={confirmClassName}>
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-white/[0.06] py-2.5 text-sm font-bold text-slate-400"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export function FastingCalendarView({ onEdit }: FastingChallengeProps) {
  const { data, startFasting, resetFasting, breakFasting } = useAppStore()
  const habit = data.habits.fasting
  const [expanded, setExpanded] = useState(false)
  const [confirm, setConfirm] = useState<'break' | 'newCycle' | null>(null)

  const progress = useMemo(() => calculateFastingProgress(habit), [habit])
  const yearTotal = useMemo(() => calcFastingYearTotal(habit), [habit])
  const cells = useMemo(() => buildCells(habit), [habit])

  const rows = useMemo(() => {
    const chunks: DayCell[][] = []
    for (let index = 0; index < cells.length; index += 7) {
      chunks.push(cells.slice(index, index + 7))
    }
    return chunks
  }, [cells])

  const {
    totalDays,
    progressDays,
    pct,
    daysLeft,
    endDate,
    hasStarted,
    isComplete,
  } = progress

  const color = habit.color
  const periodLabel = habit.fastingStartDate && endDate
    ? `${formatDate(new Date(habit.fastingStartDate))} → ${formatDate(endDate)}`
    : 'Ainda não iniciado'

  return (
    <>
      <div className="card overflow-hidden p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ background: `${color}18`, boxShadow: `0 0 0 1px ${color}25` }}
            >
              <Shield size={20} style={{ color }} />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.26em] text-slate-500">Desafio</div>
              <h3 className="text-lg font-black text-slate-100">{habit.name}</h3>
              <p className="text-sm text-slate-500">{periodLabel}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-300 transition-colors hover:bg-white/[0.07]"
          >
            {expanded ? 'Ocultar' : 'Expandir'}
            <ChevronDown size={14} className={expanded ? 'rotate-180' : ''} />
          </button>
        </div>

        {!hasStarted ? (
          <div className="mt-5 rounded-3xl border border-white/[0.06] bg-white/[0.03] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-slate-100">Resumo do desafio</div>
                <p className="mt-1 text-sm text-slate-500">{totalDays} dias de disciplina automática.</p>
              </div>
              <button
                type="button"
                onClick={startFasting}
                className="rounded-xl px-4 py-2 text-sm font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
              >
                Iniciar agora
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Período</div>
              <div className="mt-2 text-sm font-bold text-slate-100">{periodLabel}</div>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Progresso</div>
              <div className="mt-2 text-2xl font-black tabular-nums" style={{ color }}>{pct}%</div>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Dias restantes</div>
              <div className="mt-2 text-2xl font-black tabular-nums text-slate-100">{Math.max(0, daysLeft)}</div>
            </div>

            <div
              className="rounded-2xl border p-4"
              style={{ background: `${color}08`, borderColor: `${color}18` }}
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Resumo</div>
              <div className="mt-2 text-sm font-bold" style={{ color }}>
                {isComplete ? 'Desafio concluído' : `Faltam ${Math.max(0, daysLeft)} dias`}
              </div>
            </div>
          </div>
        )}

        {hasStarted && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-slate-500">Progresso automático</span>
              <span className="font-black tabular-nums" style={{ color }}>{pct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.04]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: isComplete
                    ? 'linear-gradient(90deg, #059669, #10b981, #34d399)'
                    : `linear-gradient(90deg, ${color}, ${color}cc)`,
                }}
              />
            </div>
          </div>
        )}

        {expanded && hasStarted && (
          <div className="mt-5 space-y-4">
            <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-100">Linha do desafio</div>
                  <p className="text-xs text-slate-500">Passado completo, hoje ativo, futuro bloqueado.</p>
                </div>
                <div className="text-xs text-slate-500">
                  Dia atual: <span className="font-black" style={{ color }}>{progressDays}</span>
                </div>
              </div>

              <div className="space-y-2">
                {rows.map((row, index) => (
                  <div key={`row-${index}`} className="grid grid-cols-[40px_repeat(7,minmax(0,1fr))] gap-2">
                    <div className="flex items-center text-[10px] font-bold uppercase tracking-[0.22em] text-slate-600">
                      S{index + 1}
                    </div>

                    {row.map((cell) => (
                      <div
                        key={cell.dayIndex}
                        className="relative flex aspect-square items-center justify-center rounded-xl text-[11px] font-black tabular-nums"
                        style={{
                          background: cell.status === 'past'
                            ? `${color}20`
                            : cell.status === 'today'
                              ? `${color}20`
                              : 'rgba(255,255,255,0.03)',
                          border: cell.status === 'today'
                            ? `2px solid ${color}`
                            : `1px solid ${cell.status === 'past' ? `${color}35` : 'rgba(255,255,255,0.05)'}`,
                          color: cell.status === 'future' ? '#475569' : color,
                          boxShadow: cell.status === 'today' ? `0 0 14px ${color}35` : undefined,
                        }}
                      >
                        {cell.status === 'today' && (
                          <Circle size={9} className="absolute text-current" />
                        )}
                        {cell.dayIndex}
                      </div>
                    ))}

                    {row.length < 7 && Array.from({ length: 7 - row.length }).map((_, filler) => (
                      <div key={`pad-${index}-${filler}`} />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Disciplina anual</div>
                <div className="mt-2 text-2xl font-black tabular-nums text-slate-100">{yearTotal}</div>
                <p className="mt-1 text-xs text-slate-500">dias acumulados no ano</p>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Maior sequência</div>
                <div className="mt-2 text-2xl font-black tabular-nums text-slate-100">
                  {Math.max(progressDays, habit.longestStreak ?? 0)}
                </div>
                <p className="mt-1 text-xs text-slate-500">melhor ciclo registrado</p>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Histórico</div>
                <div className="mt-2 text-2xl font-black tabular-nums text-slate-100">
                  {habit.fastingHistory?.length ?? 0}
                </div>
                <p className="mt-1 text-xs text-slate-500">ciclos salvos</p>
              </div>
            </div>

            {(habit.fastingHistory?.length ?? 0) > 0 && (
              <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Trophy size={14} className="text-amber-400" />
                  <div className="text-sm font-bold text-slate-100">Últimos ciclos</div>
                </div>
                <div className="space-y-2">
                  {habit.fastingHistory!.slice(-3).reverse().map((entry, index) => (
                    <div
                      key={`${entry.startedAt}-${entry.endedAt}-${index}`}
                      className="flex items-center justify-between rounded-2xl border border-white/[0.05] bg-white/[0.03] px-4 py-3"
                    >
                      <div>
                        <div className="text-sm font-bold text-slate-200">
                          {formatDate(new Date(entry.startedAt))} → {formatDate(new Date(entry.endedAt))}
                        </div>
                        <div className="text-xs text-slate-500">
                          {entry.completed ? 'Concluído' : 'Interrompido'} · {entry.progressDays} dias
                        </div>
                      </div>
                      <span
                        className="rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          background: entry.completed ? 'rgba(16,185,129,0.14)' : 'rgba(239,68,68,0.14)',
                          color: entry.completed ? '#34d399' : '#f87171',
                        }}
                      >
                        {entry.reason}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-300 transition-colors hover:bg-white/[0.07]"
            >
              Configurar desafio
            </button>
          )}

          {!hasStarted && (
            <button
              type="button"
              onClick={startFasting}
              className="rounded-xl px-3 py-2 text-xs font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
            >
              Iniciar desafio
            </button>
          )}

          {hasStarted && !isComplete && (
            <button
              type="button"
              onClick={() => setConfirm('break')}
              className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300 transition-colors hover:bg-red-500/15"
            >
              Quebrei o desafio
            </button>
          )}

          {hasStarted && (
            <button
              type="button"
              onClick={() => setConfirm('newCycle')}
              className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-300 transition-colors hover:bg-white/[0.07]"
            >
              <span className="inline-flex items-center gap-1.5">
                <RotateCcw size={12} />
                Novo ciclo
              </span>
            </button>
          )}

          {hasStarted && !isComplete && (
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-500">
              <Flame size={12} className="text-slate-400" />
              {`Faltam ${Math.max(0, daysLeft)} dias`}
            </div>
          )}
        </div>
      </div>

      {confirm === 'break' && (
        <ConfirmModal
          title="Quebrou o desafio?"
          body={`O ciclo atual será salvo no histórico com ${progressDays} dias e reiniciado a partir de hoje.`}
          confirmLabel="Sim, reiniciar"
          confirmClassName="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-500"
          onConfirm={() => {
            breakFasting()
            setConfirm(null)
          }}
          onClose={() => setConfirm(null)}
        />
      )}

      {confirm === 'newCycle' && (
        <ConfirmModal
          title="Iniciar novo ciclo?"
          body={`O progresso atual (${progressDays}/${totalDays} dias) será encerrado e um novo ciclo começa hoje.`}
          confirmLabel="Começar novo ciclo"
          confirmClassName="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white transition-colors hover:bg-violet-500"
          onConfirm={() => {
            resetFasting()
            setConfirm(null)
          }}
          onClose={() => setConfirm(null)}
        />
      )}
    </>
  )
}
