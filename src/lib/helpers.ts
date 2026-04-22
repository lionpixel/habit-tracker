// ─────────────────────────────────────────────
//  Helpers: Datas, Tempo, Formatação
// ─────────────────────────────────────────────

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { MONTH_NAMES } from './constants'
import {
  getTodayStr,
  getBRTWeekNumber,
  getWeekDatesBRT,
  formatDateBRT,
} from './time'

// ── Tailwind merge utility ──────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Datas — todos os cálculos usam BRT (America/Sao_Paulo) ──

/** "YYYY-MM-DD" de hoje no fuso de Brasília */
export function todayStr(): string {
  return getTodayStr()
}

/** Número da semana ISO (1–53) no fuso de Brasília */
export function getWeekNumber(date?: Date): number {
  return getBRTWeekNumber(date)
}

/** Chave de semana: "2026-W03" */
export function getWeekKey(year: number, week: number): string {
  return `${year}-W${String(week).padStart(2, '0')}`
}

/** Chave de mês: "2026-03" */
export function getMonthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

/** {start, end} da semana ISO (UTC-safe) */
export function getWeekDates(year: number, week: number): { start: Date; end: Date } {
  return getWeekDatesBRT(year, week)
}

/** "DD/MM" em BRT */
export function formatDate(date: Date): string {
  return formatDateBRT(date)
}

/** "Mês YYYY" em português */
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