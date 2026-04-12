// ─────────────────────────────────────────────
//  Helpers: Datas, Tempo, Formatação
// ─────────────────────────────────────────────

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { MONTH_NAMES } from './constants'

// ── Tailwind merge utility ──────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Datas ───────────────────────────────────

/** Retorna "YYYY-MM-DD" para hoje */
export function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

/** Número da semana ISO (1-53) */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

/** Chave de semana: "2026-W03" */
export function getWeekKey(year: number, week: number): string {
  return `${year}-W${String(week).padStart(2, '0')}`
}

/** Chave de mês: "2026-03" */
export function getMonthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

/** Retorna {start, end} da semana ISO */
export function getWeekDates(year: number, week: number): { start: Date; end: Date } {
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = (jan4.getDay() + 6) % 7
  const weekStart = new Date(jan4)
  weekStart.setDate(jan4.getDate() - dayOfWeek + (week - 1) * 7)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  return { start: weekStart, end: weekEnd }
}

/** Formata data como "DD/MM" */
export function formatDate(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`
}

/** Formata data como "Mês YYYY" em português */
export function formatMonthYear(year: number, month: number): string {
  return `${MONTH_NAMES[month - 1]} ${year}`
}

// ── Tempo ────────────────────────────────────

/**
 * Converte minutos em string legível.
 * - unit 'auto'  → "Xh Ymin" ou "Xmin"
 * - unit 'days'  → "X dias"
 */
export function formatTime(minutes: number, unit: 'auto' | 'days' = 'auto'): string {
  if (unit === 'days') return `${minutes} dias`
  if (minutes < 60)   return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

/** Converte "HH:MM" em total de minutos */
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

/** Converte total de minutos em "HH:MM" */
export function minutesToTime(total: number): string {
  const h = Math.floor(total / 60) % 24
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Adiciona minutos a uma string "HH:MM", com wrap 24h */
export function addMinutes(timeStr: string, minutes: number): string {
  return minutesToTime(timeToMinutes(timeStr) + minutes)
}

/** Subtrai minutos de uma string "HH:MM", com wrap 24h */
export function subtractMinutes(timeStr: string, minutes: number): string {
  const total = ((timeToMinutes(timeStr) - minutes) % 1440 + 1440) % 1440
  return minutesToTime(total)
}

// ── Números ──────────────────────────────────

/** Arredonda para N casas decimais */
export function round(n: number, decimals = 1): number {
  const factor = 10 ** decimals
  return Math.round(n * factor) / factor
}

/** Clamp: garante que n está entre min e max */
export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

/** Porcentagem com clamp 0-100 */
export function pct(done: number, total: number): number {
  if (total === 0) return 0
  return clamp(Math.round((done / total) * 100), 0, 100)
}

// ── Storage ──────────────────────────────────

/** Parse JSON seguro — retorna fallback em caso de erro */
export function safeParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

// ── IDs ──────────────────────────────────────

/** Gera ID baseado em timestamp + random */
export function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}