'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, CheckCircle2, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/helpers'
import { getTodayStr } from '@/lib/time'
import {
  useCalendarStore,
  selectCalendarEvents,
  selectCalendarHydrated,
} from '@/store/calendarStore'
import { useGoalsStore } from '@/store/goalsStore'
import {
  CALENDAR_EVENT_COLORS,
  CALENDAR_EVENT_LABELS,
  type CalendarEvent,
  type CalendarEventType,
} from '@/types/calendar'

interface MonthlyCalendarProps {
  year: number
  month: number
}

interface CalendarCell {
  date: string
  day: number
  inCurrentMonth: boolean
}

const WEEK_LABELS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM']

function buildMonthGrid(year: number, month: number): CalendarCell[] {
  const firstDay = new Date(Date.UTC(year, month - 1, 1))
  const firstDayIndex = (firstDay.getUTCDay() + 6) % 7
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const totalSlots = firstDayIndex + daysInMonth <= 35 ? 35 : 42
  const start = new Date(Date.UTC(year, month - 1, 1 - firstDayIndex))

  return Array.from({ length: totalSlots }, (_, index) => {
    const current = new Date(start)
    current.setUTCDate(start.getUTCDate() + index)
    return {
      date: current.toISOString().slice(0, 10),
      day: current.getUTCDate(),
      inCurrentMonth: current.getUTCMonth() === month - 1,
    }
  })
}

function emptyForm(date: string) {
  return {
    title: '',
    description: '',
    type: 'event' as CalendarEventType,
    date,
  }
}

export function MonthlyCalendar({ year, month }: MonthlyCalendarProps) {
  const hydrated = useCalendarStore(selectCalendarHydrated)
  const hydrate = useCalendarStore((state) => state.hydrate)
  const events = useCalendarStore(selectCalendarEvents)
  const addEvent = useCalendarStore((state) => state.addEvent)
  const updateEvent = useCalendarStore((state) => state.updateEvent)
  const deleteEvent = useCalendarStore((state) => state.deleteEvent)
  const { dailyTasks, monthlyGoals } = useGoalsStore()

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [form, setForm] = useState(emptyForm(`${year}-${String(month).padStart(2, '0')}-01`))

  useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrated, hydrate])

  const todayStr = getTodayStr()
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`
  const defaultNewDate = todayStr.startsWith(monthPrefix)
    ? todayStr
    : `${monthPrefix}-01`
  const cells = useMemo(() => buildMonthGrid(year, month), [year, month])

  const monthEvents = useMemo(
    () => events.filter((event) => event.date.startsWith(monthPrefix)),
    [events, monthPrefix],
  )

  const eventsByDate = useMemo(() => {
    return monthEvents.reduce((acc, event) => {
      acc[event.date] = [...(acc[event.date] ?? []), event]
      return acc
    }, {} as Record<string, CalendarEvent[]>)
  }, [monthEvents])

  const taskStatus = useMemo(() => {
    return dailyTasks.reduce((acc, task) => {
      acc[task.id] = task.status
      return acc
    }, {} as Record<string, string>)
  }, [dailyTasks])

  const goalProgress = useMemo(() => {
    return monthlyGoals.reduce((acc, goal) => {
      acc[goal.id] = goal.progress
      return acc
    }, {} as Record<string, number>)
  }, [monthlyGoals])

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] ?? []) : []

  function openDay(date: string) {
    setSelectedDate(date)
    setEditingEvent(null)
    setForm(emptyForm(date))
  }

  function startEditing(event: CalendarEvent) {
    setEditingEvent(event)
    setForm({
      title: event.title,
      description: event.description ?? '',
      type: event.type,
      date: event.date,
    })
  }

  function closeModal() {
    setSelectedDate(null)
    setEditingEvent(null)
  }

  function submitForm() {
    const title = form.title.trim()
    if (!title) return

    const payload = {
      title,
      description: form.description.trim() || undefined,
      type: form.type,
      date: form.date,
    }

    if (editingEvent) {
      updateEvent(editingEvent.id, payload)
    } else {
      addEvent(payload)
    }

    setEditingEvent(null)
    setForm(emptyForm(form.date))
  }

  function removeEditingEvent() {
    if (!editingEvent) return
    deleteEvent(editingEvent.id)
    setEditingEvent(null)
    setForm(emptyForm(selectedDate ?? form.date))
  }

  return (
    <>
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <CalendarDays size={18} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-100">Calendário Mensal</h3>
              <p className="text-sm text-slate-500">Macrovisão estratégica do mês</p>
            </div>
          </div>
          <Button
            variant="subtle"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => openDay(defaultNewDate)}
          >
            Novo item
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {WEEK_LABELS.map((label) => (
            <div key={label} className="px-2 text-[10px] font-bold tracking-[0.24em] text-slate-600">
              {label}
            </div>
          ))}

          {cells.map((cell) => {
            const cellEvents = eventsByDate[cell.date] ?? []
            const hiddenCount = Math.max(0, cellEvents.length - 3)
            const isToday = cell.date === todayStr

            return (
              <button
                key={cell.date}
                type="button"
                onClick={() => openDay(cell.date)}
                className={cn(
                  'min-h-[120px] rounded-2xl border p-2.5 text-left transition-all',
                  'hover:border-white/[0.18] hover:bg-white/[0.04]',
                  cell.inCurrentMonth ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white/[0.01] border-white/[0.04] opacity-45',
                  isToday && 'border-emerald-500/35 bg-emerald-500/[0.05]',
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    'text-sm font-black tabular-nums',
                    cell.inCurrentMonth ? 'text-slate-100' : 'text-slate-600',
                    isToday && 'text-emerald-400',
                  )}>
                    {cell.day}
                  </span>
                  {cellEvents.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-500">
                      {cellEvents.length}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  {cellEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-1.5 rounded-xl px-2 py-1 text-[10px] font-semibold"
                      style={{
                        background: `${CALENDAR_EVENT_COLORS[event.type]}18`,
                        color: CALENDAR_EVENT_COLORS[event.type],
                        boxShadow: `inset 0 0 0 1px ${CALENDAR_EVENT_COLORS[event.type]}22`,
                      }}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: CALENDAR_EVENT_COLORS[event.type] }}
                      />
                      <span className="truncate">{event.title}</span>
                      {event.type === 'task' && event.linkedTaskId && taskStatus[event.linkedTaskId] === 'done' && (
                        <CheckCircle2 size={10} className="ml-auto flex-shrink-0" />
                      )}
                      {event.type === 'goal' && event.linkedGoalId && (
                        <span className="ml-auto flex-shrink-0 text-[9px] font-black">
                          {goalProgress[event.linkedGoalId] ?? 0}%
                        </span>
                      )}
                    </div>
                  ))}

                  {hiddenCount > 0 && (
                    <div className="px-2 text-[10px] font-semibold text-slate-500">
                      +{hiddenCount} item{hiddenCount > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={closeModal} />

          <div className="relative w-full max-w-2xl rounded-3xl border border-white/[0.1] bg-[#0d1117] shadow-[0_32px_80px_rgba(0,0,0,0.65)]">
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] p-5">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Dia selecionado</div>
                <h4 className="mt-1 text-xl font-black text-slate-100">{selectedDate}</h4>
                <p className="text-sm text-slate-500">Adicione itens estratégicos e conecte com o fluxo operacional.</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl bg-white/[0.05] p-2 text-slate-400 transition-colors hover:bg-white/[0.08] hover:text-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid gap-6 p-5 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Itens do dia</div>
                {selectedEvents.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/[0.1] px-4 py-6 text-sm text-slate-500">
                    Nenhum item cadastrado para este dia.
                  </div>
                ) : (
                  selectedEvents.map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => startEditing(event)}
                      className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-left transition-colors hover:bg-white/[0.05]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ background: CALENDAR_EVENT_COLORS[event.type] }}
                          />
                          <span className="text-sm font-bold text-slate-100">{event.title}</span>
                        </div>
                        <span
                          className="rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
                          style={{
                            background: `${CALENDAR_EVENT_COLORS[event.type]}18`,
                            color: CALENDAR_EVENT_COLORS[event.type],
                          }}
                        >
                          {CALENDAR_EVENT_LABELS[event.type]}
                        </span>
                      </div>

                      {event.description && (
                        <p className="mt-2 text-sm text-slate-400">{event.description}</p>
                      )}

                      <div className="mt-3 text-[11px] text-slate-500">
                        {event.type === 'task' && event.linkedTaskId && (
                          <span>Status: {taskStatus[event.linkedTaskId] === 'done' ? 'concluída no planner' : 'ativa no planner'}</span>
                        )}
                        {event.type === 'goal' && event.linkedGoalId && (
                          <span>Meta conectada: {goalProgress[event.linkedGoalId] ?? 0}% do mês</span>
                        )}
                        {event.type === 'event' && (
                          <span>Evento estratégico sem execução operacional vinculada</span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="space-y-4 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
                    {editingEvent ? 'Editar item' : 'Novo item'}
                  </div>
                  <h5 className="mt-1 text-base font-black text-slate-100">
                    {editingEvent ? editingEvent.title : 'Adicionar ao calendário'}
                  </h5>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-400">Título</label>
                    <input
                      value={form.title}
                      onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                      className="w-full rounded-2xl border border-white/[0.08] bg-[#0b1220] px-4 py-3 text-sm text-slate-100 outline-none transition-colors focus:border-emerald-500/40"
                      placeholder="Ex.: Revisão do plano do mês"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-400">Descrição</label>
                    <textarea
                      value={form.description}
                      onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                      rows={4}
                      className="w-full rounded-2xl border border-white/[0.08] bg-[#0b1220] px-4 py-3 text-sm text-slate-100 outline-none transition-colors focus:border-emerald-500/40"
                      placeholder="Contexto, objetivo ou observações..."
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-400">Tipo</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['goal', 'task', 'event'] as CalendarEventType[]).map((type) => {
                        const active = form.type === type
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setForm((current) => ({ ...current, type }))}
                            className={cn(
                              'rounded-2xl border px-3 py-2 text-xs font-bold transition-all',
                              active ? 'text-white' : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-slate-200',
                            )}
                            style={active ? {
                              background: `${CALENDAR_EVENT_COLORS[type]}25`,
                              borderColor: `${CALENDAR_EVENT_COLORS[type]}55`,
                              color: CALENDAR_EVENT_COLORS[type],
                            } : undefined}
                          >
                            {CALENDAR_EVENT_LABELS[type]}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-[#0b1220] px-4 py-3 text-xs text-slate-500">
                  {form.type === 'task' && 'Vai criar uma tarefa diária visível no planner semanal e diário.'}
                  {form.type === 'goal' && 'Vai criar uma meta mensal conectada ao planejamento do mês.'}
                  {form.type === 'event' && 'Vai permanecer como compromisso estratégico no calendário.'}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Plus size={14} />}
                    onClick={submitForm}
                  >
                    {editingEvent ? 'Salvar' : 'Adicionar'}
                  </Button>

                  {editingEvent && (
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<Trash2 size={14} />}
                      onClick={removeEditingEvent}
                    >
                      Excluir
                    </Button>
                  )}

                  {editingEvent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingEvent(null)
                        setForm(emptyForm(selectedDate))
                      }}
                    >
                      Novo
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
