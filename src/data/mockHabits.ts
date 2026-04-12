// ─────────────────────────────────────────────
//  Dados iniciais dos hábitos (estado padrão)
// ─────────────────────────────────────────────
// Ícones: identificadores Lucide (sem emojis)
// Durações: leitura = 25 min, demais = 50 min

import type { HabitsMap } from '@/types/habit'
import { getWeekNumber, getWeekKey, getMonthKey } from '@/lib/helpers'
import { APP_YEAR } from '@/lib/constants'

const now  = new Date()
const week = getWeekNumber(now)
const wKey = getWeekKey(APP_YEAR, week)
const mKey = getMonthKey(APP_YEAR, now.getMonth() + 1)

export const DEFAULT_HABITS: HabitsMap = {
  reading: {
    name:          'Leitura',
    icon:          'BookOpen',
    color:         '#6366f1',
    target:        25,        // 10 páginas ≈ 25 min
    unit:          'min',
    frequency:     6,
    description:   'Leitura diária — 10 páginas de livros, artigos e documentação',
    counts:        { [wKey]: 0 },
    monthlyTotals: { [mKey]: 0 },
    totalYear:     0,
    goalFreq:      6,
    goalDuration:  25,
  },

  english: {
    name:             'Inglês',
    icon:             'Languages',
    color:            '#10b981',
    target:           50,
    unit:             'min',
    frequency:        6,
    description:      'Estudo de inglês: vocabulary, grammar, speaking, listening, séries',
    counts:           { [wKey]: 0 },
    seriesCounts:     { [wKey]: 0 },
    carryoverMinutes: 2520,
    monthlyTotals:    { [mKey]: 0 },
    totalYear:        0,
    goalFreq:         6,
    goalDuration:     50,
  },

  hiit: {
    name:          'HIIT',
    icon:          'Dumbbell',
    color:         '#ef4444',
    target:        50,
    unit:          'min',
    frequency:     4,
    description:   'Treino intervalado de alta intensidade',
    counts:        { [wKey]: 0 },
    monthlyTotals: { [mKey]: 0 },
    totalYear:     0,
    goalFreq:      4,
    goalDuration:  50,
  },

  ppci: {
    name:          'PPCI',
    icon:          'Code2',
    color:         '#f59e0b',
    target:        50,
    unit:          'min',
    frequency:     5,
    description:   'Programação pessoal, projetos e crescimento intelectual',
    counts:        { [wKey]: 0 },
    monthlyTotals: { [mKey]: 0 },
    totalYear:     0,
    goalFreq:      5,
    goalDuration:  50,
  },

  dopamine: {
    name:          'Detox',
    icon:          'Brain',
    color:         '#8b5cf6',
    target:        50,
    unit:          'min',
    frequency:     5,
    description:   'Detox de dopamina: meditação, reflexão e descanso mental',
    counts:        { [wKey]: 0 },
    monthlyTotals: { [mKey]: 0 },
    totalYear:     0,
    goalFreq:      5,
    goalDuration:  50,
  },

  fasting: {
    name:             'Sem Açúcar',
    icon:             'Apple',
    color:            '#06b6d4',
    target:           50,
    unit:             'dias',
    frequency:        7,
    description:      'Desafio de 40 dias sem açúcar refinado',
    counts:           { [wKey]: 0 },
    monthlyTotals:    { [mKey]: 0 },
    totalYear:        0,
    currentStreak:    0,
    completedCycles:  0,
    lastUpdate:       '',
    lastReset:        '',
    isSpecial:        true,
    goalFreq:         7,
    goalDuration:     50,
  },
}
