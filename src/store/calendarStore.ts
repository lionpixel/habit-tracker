// ─────────────────────────────────────────────
//  Store: Calendar
// ─────────────────────────────────────────────

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { CalendarEvent, CalendarStoreData, CalendarEventType } from '@/types/calendar'
import { safeParse } from '@/lib/helpers'
import { useGoalsStore } from '@/store/goalsStore'

const CALENDAR_KEY = 'hdb_calendar'

function uid(): string {
  return Math.random().toString(36).slice(2, 11)
}

function now(): string {
  return new Date().toISOString()
}

function loadCalendar(fallback: CalendarStoreData): CalendarStoreData {
  if (typeof window === 'undefined') return fallback
  return safeParse<CalendarStoreData>(localStorage.getItem(CALENDAR_KEY), fallback)
}

function saveCalendar(data: CalendarStoreData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CALENDAR_KEY, JSON.stringify(data))
}

const DEFAULT_CALENDAR_DATA: CalendarStoreData = {
  events: [],
}

function createLinkedEntity(
  eventId: string,
  type: CalendarEventType,
  title: string,
  description: string | undefined,
  date: string,
): { linkedGoalId?: string; linkedTaskId?: string } {
  const goalsStore = useGoalsStore.getState()

  if (type === 'task') {
    const linkedTaskId = goalsStore.addDailyTask({
      title,
      description,
      date,
      priority: 'medium',
      status: 'not_started',
      source: 'calendar',
      calendarEventId: eventId,
      sortOrder: Date.now(),
    })
    return { linkedTaskId }
  }

  if (type === 'goal') {
    const [year, month] = date.split('-').map(Number)
    const linkedGoalId = goalsStore.addMonthlyGoal({
      title,
      description,
      year,
      month,
      priority: 'medium',
      status: 'not_started',
      progress: 0,
      calendarEventId: eventId,
    })
    return { linkedGoalId }
  }

  return {}
}

function cleanupLinkedEntity(event: CalendarEvent): void {
  const goalsStore = useGoalsStore.getState()

  if (event.linkedTaskId) {
    const task = goalsStore.dailyTasks.find((item) => item.id === event.linkedTaskId)
    if (task?.calendarEventId === event.id) {
      goalsStore.deleteDailyTask(event.linkedTaskId)
    }
  }

  if (event.linkedGoalId) {
    const goal = goalsStore.monthlyGoals.find((item) => item.id === event.linkedGoalId)
    if (goal?.calendarEventId === event.id) {
      goalsStore.deleteMonthlyGoal(event.linkedGoalId)
    }
  }
}

function syncLinkedEntity(event: CalendarEvent): CalendarEvent {
  const goalsStore = useGoalsStore.getState()

  if (event.type === 'task') {
    const taskExists = event.linkedTaskId
      ? goalsStore.dailyTasks.some((item) => item.id === event.linkedTaskId)
      : false
    if (!event.linkedTaskId || !taskExists) {
      return { ...event, ...createLinkedEntity(event.id, event.type, event.title, event.description, event.date) }
    }
    goalsStore.updateDailyTask(event.linkedTaskId, {
      title: event.title,
      description: event.description,
      date: event.date,
      source: 'calendar',
      calendarEventId: event.id,
    })
    return event
  }

  if (event.type === 'goal') {
    const goalExists = event.linkedGoalId
      ? goalsStore.monthlyGoals.some((item) => item.id === event.linkedGoalId)
      : false
    if (!event.linkedGoalId || !goalExists) {
      return { ...event, ...createLinkedEntity(event.id, event.type, event.title, event.description, event.date) }
    }
    const [, month] = event.date.split('-').map(Number)
    const year = Number(event.date.slice(0, 4))
    goalsStore.updateMonthlyGoal(event.linkedGoalId, {
      title: event.title,
      description: event.description,
      year,
      month,
      calendarEventId: event.id,
    })
    return event
  }

  return event
}

interface CalendarStoreState extends CalendarStoreData {
  hydrated: boolean
  hydrate: () => void
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt' | 'linkedGoalId' | 'linkedTaskId'>) => string
  updateEvent: (id: string, patch: Partial<Omit<CalendarEvent, 'id' | 'createdAt'>>) => void
  deleteEvent: (id: string) => void
  getEventsForDate: (date: string) => CalendarEvent[]
  getEventsForMonth: (year: number, month: number) => CalendarEvent[]
}

export const selectCalendarEvents = (s: CalendarStoreState) => s.events
export const selectCalendarHydrated = (s: CalendarStoreState) => s.hydrated

export const useCalendarStore = create<CalendarStoreState>()(
  subscribeWithSelector((set, get) => ({
    ...DEFAULT_CALENDAR_DATA,
    hydrated: false,

    hydrate() {
      const data = loadCalendar(DEFAULT_CALENDAR_DATA)
      set({ ...data, hydrated: true })
    },

    addEvent(input) {
      const id = uid()
      const base: CalendarEvent = {
        ...input,
        id,
        createdAt: now(),
      }
      const linked = createLinkedEntity(id, base.type, base.title, base.description, base.date)
      const event = { ...base, ...linked }
      const events = [...get().events, event].sort((a, b) => a.date.localeCompare(b.date))
      saveCalendar({ events })
      set({ events })
      return id
    },

    updateEvent(id, patch) {
      const current = get().events.find((event) => event.id === id)
      if (!current) return

      const next: CalendarEvent = {
        ...current,
        ...patch,
        updatedAt: now(),
      }

      if (current.type !== next.type) {
        cleanupLinkedEntity(current)
        next.linkedGoalId = undefined
        next.linkedTaskId = undefined
        Object.assign(next, createLinkedEntity(next.id, next.type, next.title, next.description, next.date))
      } else {
        Object.assign(next, syncLinkedEntity(next))
      }

      const events = get().events
        .map((event) => (event.id === id ? next : event))
        .sort((a, b) => a.date.localeCompare(b.date))

      saveCalendar({ events })
      set({ events })
    },

    deleteEvent(id) {
      const current = get().events.find((event) => event.id === id)
      if (!current) return
      cleanupLinkedEntity(current)
      const events = get().events.filter((event) => event.id !== id)
      saveCalendar({ events })
      set({ events })
    },

    getEventsForDate(date) {
      return get().events.filter((event) => event.date === date)
    },

    getEventsForMonth(year, month) {
      const prefix = `${year}-${String(month).padStart(2, '0')}`
      return get().events.filter((event) => event.date.startsWith(prefix))
    },
  })),
)
