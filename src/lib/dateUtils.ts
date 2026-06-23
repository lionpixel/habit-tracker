// ─────────────────────────────────────────────
//  dateUtils — helpers de data no fuso BRT
//  Usa lib/time.ts internamente. Sem date-fns.
// ─────────────────────────────────────────────

import { TZ, getWeekDaysBRT, getBRTWeekNumber, getBRTYear, getTodayStr } from '@/lib/time'

// ── nowBRT ────────────────────────────────────

/** Retorna um Date cujos .getFullYear()/.getMonth()/.getDate() refletem BRT */
export function nowBRT(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: TZ }))
}

// ── Dias da semana ────────────────────────────

/** 7 Date objects BRT da semana atual (Seg → Dom) */
export function getWeekDays(weekStart?: Date): Date[] {
  const d   = weekStart ?? nowBRT()
  const year = d.getFullYear()
  const week = getBRTWeekNumber(new Date())  // ISO week number
  return getWeekDaysBRT(year, week).map(dateStr => {
    const [y, m, dy] = dateStr.split('-').map(Number)
    // T12:00:00Z garante que em BRT (UTC-3) fica no mesmo dia
    return new Date(Date.UTC(y, m - 1, dy, 12, 0, 0))
  })
}

/** 7 Date objects para (year, week) ISO */
export function getWeekDaysFor(year: number, week: number): Date[] {
  return getWeekDaysBRT(year, week).map(dateStr => {
    const [y, m, dy] = dateStr.split('-').map(Number)
    return new Date(Date.UTC(y, m - 1, dy, 12, 0, 0))
  })
}

// ── Day key / label ───────────────────────────

const DAY_KEYS = ['dom','seg','ter','qua','qui','sex','sab'] as const
export type DayKey = typeof DAY_KEYS[number]

/** Retorna 'seg'|'ter'|…|'dom' a partir de um Date BRT */
export function getDayKey(date: Date): DayKey {
  return DAY_KEYS[date.getDay()]
}

const DAY_SHORT: Record<number, string> = {
  0: 'Dom', 1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sáb',
}

/** 'Seg', 'Ter', … 'Dom' */
export function getDayShort(date: Date): string {
  return DAY_SHORT[date.getDay()] ?? '?'
}

const DAY_LONG: Record<number, string> = {
  0: 'domingo', 1: 'segunda-feira', 2: 'terça-feira', 3: 'quarta-feira',
  4: 'quinta-feira', 5: 'sexta-feira', 6: 'sábado',
}

/** 'segunda-feira', 'terça-feira', … */
export function getDayLabel(date: Date): string {
  return DAY_LONG[date.getDay()] ?? '?'
}

// ── isToday ───────────────────────────────────

/** Compara em BRT: mesmo ano/mês/dia que hoje */
export function isToday(date: Date): boolean {
  const today = nowBRT()
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth()    === today.getMonth()    &&
    date.getDate()     === today.getDate()
  )
}

/** Verifica se o string "YYYY-MM-DD" é hoje em BRT */
export function isTodayStr(dateStr: string): boolean {
  return dateStr === getTodayStr()
}

// ── Número da semana ──────────────────────────

export function getWeekNumber(date?: Date): number {
  return getBRTWeekNumber(date ?? new Date())
}

export function getWeekStart(year?: number, week?: number): Date {
  const y = year ?? getBRTYear()
  const w = week  ?? getBRTWeekNumber()
  const dateStr = getWeekDaysBRT(y, w)[0]
  const [dy, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(dy, m - 1, d, 12, 0, 0))
}

// ── formatDate ────────────────────────────────

const MONTH_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const MONTH_LONG  = ['janeiro','fevereiro','março','abril','maio','junho',
                     'julho','agosto','setembro','outubro','novembro','dezembro']

/**
 * Formata um Date usando tokens simples (sem date-fns):
 *   "dd/MM/yyyy"  → "22/06/2026"
 *   "MMMM yyyy"   → "junho 2026"
 *   "MMMM"        → "junho"
 *   "MMM yyyy"    → "Jun 2026"
 *   "EEEE"        → "segunda-feira"
 */
export function formatDateBRT(date: Date, fmt: string): string {
  const brt = nowBRT()
  // Use the date's own getFullYear/getMonth/getDate since date is already in BRT reference
  const d   = date.getDate()
  const m   = date.getMonth()
  const y   = date.getFullYear()

  return fmt
    .replace('EEEE',   getDayLabel(date))
    .replace('MMMM',   MONTH_LONG[m]  ?? '')
    .replace('MMM',    MONTH_SHORT[m] ?? '')
    .replace('yyyy',   String(y))
    .replace('MM',     String(m + 1).padStart(2, '0'))
    .replace('dd',     String(d).padStart(2, '0'))
    .replace('d',      String(d))

  void brt  // suppress unused warning
}
