// ─────────────────────────────────────────────
//  Utilitário central de tempo — America/Sao_Paulo (BRT/BRST)
//
//  NUNCA use new Date() diretamente em componentes.
//  Importe daqui para garantir fuso correto em qualquer timezone do device.
// ─────────────────────────────────────────────

export const TZ = 'America/Sao_Paulo'

// ── Internal: date parts in BRT ───────────────

interface BRTParts {
  year:   number
  month:  number   // 1–12
  day:    number   // 1–31
  hour:   number   // 0–23
  minute: number
  second: number
}

function getBRTParts(d: Date = new Date()): BRTParts {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year:     'numeric',
    month:    '2-digit',
    day:      '2-digit',
    hour:     '2-digit',
    minute:   '2-digit',
    second:   '2-digit',
    hour12:   false,
  })
  const p = Object.fromEntries(
    fmt.formatToParts(d).map(({ type, value }) => [type, value]),
  )
  return {
    year:   parseInt(p.year),
    month:  parseInt(p.month),
    day:    parseInt(p.day),
    hour:   parseInt(p.hour === '24' ? '0' : p.hour),  // midnight edge-case
    minute: parseInt(p.minute),
    second: parseInt(p.second),
  }
}

// ── Exported date accessors ───────────────────

/** Hoje como "YYYY-MM-DD" no fuso de Brasília */
export function getTodayStr(d?: Date): string {
  const { year, month, day } = getBRTParts(d)
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function getBRTYear(d?: Date): number  { return getBRTParts(d).year  }
export function getBRTMonth(d?: Date): number { return getBRTParts(d).month }
export function getBRTDay(d?: Date): number   { return getBRTParts(d).day   }

// ── ISO week number (começa segunda-feira) ────

export function getBRTWeekNumber(d?: Date): number {
  const { year, month, day } = getBRTParts(d)
  const utc    = new Date(Date.UTC(year, month - 1, day))
  const dayNum = utc.getUTCDay() || 7        // Sunday → 7
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1))
  return Math.ceil(((utc.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
}

// ── Week dates ────────────────────────────────

/** {start, end} da semana ISO para o par (year, week) */
export function getWeekDatesBRT(year: number, week: number): { start: Date; end: Date } {
  const jan4   = new Date(Date.UTC(year, 0, 4))
  const dayNum = jan4.getUTCDay() || 7
  const start  = new Date(jan4)
  start.setUTCDate(jan4.getUTCDate() - dayNum + 1 + (week - 1) * 7)
  const end = new Date(start)
  end.setUTCDate(start.getUTCDate() + 6)
  return { start, end }
}

/** Array de 7 strings "YYYY-MM-DD" (Seg → Dom) da semana ISO */
export function getWeekDaysBRT(year: number, week: number): string[] {
  const { start } = getWeekDatesBRT(year, week)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setUTCDate(start.getUTCDate() + i)
    return getTodayStr(d)
  })
}

/** Converte "YYYY-MM-DD" em ano + semana ISO */
export function getWeekInfoFromDateStr(dateStr: string): { year: number; week: number } {
  const [year, month, day] = dateStr.split('-').map(Number)
  const utc    = new Date(Date.UTC(year, month - 1, day))
  const dayNum = utc.getUTCDay() || 7
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNum)
  const isoYear = utc.getUTCFullYear()
  const yearStart = new Date(Date.UTC(isoYear, 0, 1))
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
  return { year: isoYear, week }
}

/** Dia da semana de "YYYY-MM-DD" no padrão JS: 0=Dom ... 6=Sáb */
export function getDayOfWeekFromDateStr(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}

/** Número de dias em "YYYY-MM" */
export function daysInMonthFromStr(dateStr: string): number {
  const [year, month] = dateStr.split('-').map(Number)
  return daysInMonthBRT(year, month)
}

// ── Date arithmetic (string-based, timezone-safe) ─

/** Diferença em dias completos entre duas strings "YYYY-MM-DD" */
export function diffInDays(from: string, to: string): number {
  const [y1, m1, d1] = from.split('-').map(Number)
  const [y2, m2, d2] = to.split('-').map(Number)
  return Math.round(
    (Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000,
  )
}

/** Adiciona N dias a "YYYY-MM-DD" e retorna nova string */
export function addDaysToStr(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}

// ── Display formatting (BRT) ───────────────────

/** "DD/MM" em BRT */
export function formatDateBRT(d: Date): string {
  const { day, month } = getBRTParts(d)
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`
}

/** "HH:MM" em BRT */
export function getTimeBRT(d?: Date): string {
  const { hour, minute } = getBRTParts(d)
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

/** Formata para exibição pt-BR com timezone BRT */
export function formatDisplayBRT(d: Date = new Date()): {
  weekday: string
  date:    string
  time:    string
} {
  const weekday = new Intl.DateTimeFormat('pt-BR', {
    timeZone: TZ,
    weekday:  'long',
  }).format(d)
  const { year, month, day, hour, minute } = getBRTParts(d)
  return {
    weekday,
    date: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`,
    time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
  }
}

/** Dias no mês no calendário BRT */
export function daysInMonthBRT(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}
