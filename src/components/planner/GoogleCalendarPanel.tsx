'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { FadeInUp } from '@/components/ui/Motion'
import { cn } from '@/lib/helpers'
import {
  CalendarDays, LogIn, LogOut, Clock, MapPin,
  Loader2, CalendarX, RefreshCw,
} from 'lucide-react'

// ── Types ─────────────────────────────────────

interface CalendarEvent {
  id:      string
  summary: string
  location?: string
  start: { dateTime?: string; date?: string }
  end:   { dateTime?: string; date?: string }
}

// ── Helpers ───────────────────────────────────

const TZ = 'America/Sao_Paulo'

function formatEventTime(event: CalendarEvent): string {
  const startRaw = event.start.dateTime ?? event.start.date
  const endRaw   = event.end.dateTime   ?? event.end.date
  if (!startRaw) return ''

  // All-day event (date only, no time)
  if (!event.start.dateTime) return 'Dia inteiro'

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat('pt-BR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(new Date(iso))

  return endRaw ? `${fmt(startRaw)} – ${fmt(endRaw)}` : fmt(startRaw)
}

function formatEventDay(event: CalendarEvent): string {
  const raw = event.start.dateTime ?? event.start.date
  if (!raw) return ''
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short',
  }).format(new Date(raw))
}

function groupByDay(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>()
  for (const ev of events) {
    const key = formatEventDay(ev)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(ev)
  }
  return map
}

function isToday(event: CalendarEvent): boolean {
  const raw = event.start.dateTime ?? event.start.date
  if (!raw) return false
  const evDate  = new Date(new Date(raw).toLocaleString('en-US', { timeZone: TZ }))
  const nowDate = new Date(new Date().toLocaleString('en-US', { timeZone: TZ }))
  return (
    evDate.getFullYear() === nowDate.getFullYear() &&
    evDate.getMonth()    === nowDate.getMonth()    &&
    evDate.getDate()     === nowDate.getDate()
  )
}

// ── Sub-components ────────────────────────────

function ConnectCard() {
  const [loading, setLoading] = useState(false)

  return (
    <FadeInUp>
      <div className="card p-5 flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <CalendarDays className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-200">Google Agenda</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Conecte para ver seus compromissos dos próximos 7 dias
          </p>
        </div>
        <button
          onClick={async () => {
            setLoading(true)
            await signIn('google')
          }}
          disabled={loading}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
            'bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 hover:text-indigo-200',
            'border border-indigo-500/25 hover:border-indigo-500/40',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <LogIn className="w-4 h-4" />
          }
          Conectar Google Agenda
        </button>
      </div>
    </FadeInUp>
  )
}

function EventRow({ event }: { event: CalendarEvent }) {
  const today     = isToday(event)
  const timeLabel = formatEventTime(event)

  return (
    <div className={cn(
      'flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all',
      today
        ? 'bg-indigo-500/[0.07] border border-indigo-500/15'
        : 'hover:bg-white/[0.03]',
    )}>
      {/* Time badge */}
      <div className="shrink-0 mt-0.5 min-w-[56px] text-right">
        <span className={cn(
          'text-[11px] font-semibold tabular-nums',
          today ? 'text-indigo-400' : 'text-slate-500',
        )}>
          {timeLabel}
        </span>
      </div>

      {/* Dot */}
      <div className={cn(
        'mt-1.5 w-1.5 h-1.5 rounded-full shrink-0',
        today ? 'bg-indigo-400' : 'bg-slate-600',
      )} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-xs font-semibold leading-snug truncate',
          today ? 'text-slate-100' : 'text-slate-300',
        )}>
          {event.summary ?? '(sem título)'}
        </p>
        {event.location && (
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-slate-600 shrink-0" />
            <span className="text-[11px] text-slate-600 truncate">{event.location}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────

export function GoogleCalendarPanel() {
  const { data: session, status } = useSession()
  const [events,  setEvents]  = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const isSignedIn = status === 'authenticated'

  async function fetchEvents() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/calendar/events')
      if (res.status === 401) {
        // Session expired — treated as signed out for UI purposes
        setError('session_expired')
        return
      }
      if (!res.ok) throw new Error('Erro ao buscar eventos')
      const data: CalendarEvent[] = await res.json()
      setEvents(data)
    } catch {
      setError('fetch_failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isSignedIn) fetchEvents()
  }, [isSignedIn])

  // Not signed in
  if (status === 'loading') return null
  if (!isSignedIn) return <ConnectCard />

  const grouped = groupByDay(events)

  return (
    <FadeInUp>
      <div className="card p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-bold text-slate-200">Google Agenda</span>
            <span className="text-[11px] text-slate-600 font-medium">próximos 7 dias</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Refresh */}
            <button
              onClick={fetchEvents}
              disabled={loading}
              title="Atualizar"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-all disabled:opacity-40"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
            </button>

            {/* Disconnect */}
            <button
              onClick={() => signOut({ redirect: false })}
              title="Desconectar Google"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all"
            >
              <LogOut className="w-3 h-3" />
              Desconectar
            </button>
          </div>
        </div>

        {/* Signed-in as */}
        {session?.user?.email && (
          <p className="text-[11px] text-slate-600 -mt-1 pl-0.5">{session.user.email}</p>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-6 text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Buscando compromissos…</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center gap-2 py-5 text-slate-500">
            <CalendarX className="w-8 h-8 opacity-30" />
            <p className="text-xs text-center">
              {error === 'session_expired'
                ? 'Sessão expirada. '
                : 'Não foi possível carregar os eventos. '}
              <button onClick={fetchEvents} className="text-indigo-400 hover:underline">Tentar novamente</button>
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && events.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-5 text-slate-600">
            <CalendarDays className="w-8 h-8 opacity-20" />
            <p className="text-xs">Nenhum compromisso nos próximos 7 dias</p>
          </div>
        )}

        {/* Events grouped by day */}
        {!loading && !error && grouped.size > 0 && (
          <div className="space-y-3">
            {Array.from(grouped.entries()).map(([day, dayEvents]) => {
              const anyToday = dayEvents.some(isToday)
              return (
                <div key={day}>
                  <div className="flex items-center gap-2 px-1 mb-1.5">
                    <Clock className="w-3 h-3 text-slate-600" />
                    <span className={cn(
                      'text-[11px] font-bold uppercase tracking-wider capitalize',
                      anyToday ? 'text-indigo-400' : 'text-slate-600',
                    )}>
                      {day}{anyToday && ' · Hoje'}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.map((ev) => <EventRow key={ev.id} event={ev} />)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </FadeInUp>
  )
}
