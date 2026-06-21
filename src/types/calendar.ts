// ─────────────────────────────────────────────
//  Types: Monthly Calendar
// ─────────────────────────────────────────────

export type CalendarEventType = 'goal' | 'task' | 'event'

export interface CalendarEvent {
  id:          string
  date:        string    // YYYY-MM-DD
  title:       string
  description?: string
  type:        CalendarEventType
  linkedGoalId?: string
  linkedTaskId?: string
  createdAt:   string
  updatedAt?:  string
}

export interface CalendarStoreData {
  events: CalendarEvent[]
}

export const CALENDAR_EVENT_COLORS: Record<CalendarEventType, string> = {
  goal:  '#8b5cf6',
  task:  '#3b82f6',
  event: '#10b981',
}

export const CALENDAR_EVENT_LABELS: Record<CalendarEventType, string> = {
  goal:  'Meta',
  task:  'Tarefa',
  event: 'Evento',
}
