'use client'

// ─────────────────────────────────────────────
//  Hook: useMonthlyBarData
//
//  Constrói dinamicamente os dados do gráfico de barras mensais
//  a partir do appStore (habit.monthlyTotals).
//
//  Regras:
//   - Inclui QUALQUER mês onde ao menos um hábito ativo tem total > 0
//   - Q1 2026 vem de monthlyTotals (pré-populado em DEFAULT_HABITS)
//   - Meses atuais recebem o valor calculado ao vivo por recalcMonthlyTotals
//   - Hábito novo aparece apenas a partir do mês em que foi criado
//   - Hábito com isSpecial (fasting) é excluído das barras
// ─────────────────────────────────────────────

import { useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import { useActiveHabitKeys } from '@/store/selectors'
import { MONTH_NAMES } from '@/lib/constants'

export interface MonthBarPoint {
  month:    string   // label PT-BR, ex: "Janeiro"
  monthKey: string   // YYYY-MM, para ordenação
  total:    number
  [habitKey: string]: string | number
}

export interface HabitBar {
  key:   string
  label: string
  color: string
}

function monthLabel(mk: string): string {
  const month = parseInt(mk.split('-')[1], 10)
  return MONTH_NAMES[month - 1] ?? mk
}

export function useMonthlyBarData() {
  const habits     = useAppStore((s) => s.data.habits)
  const activeKeys = useActiveHabitKeys()

  const bars = useMemo<HabitBar[]>(() =>
    activeKeys
      .filter((k) => !(habits[k] as { isSpecial?: boolean }).isSpecial)
      .map((k) => ({ key: k, label: habits[k].name, color: habits[k].color })),
    [habits, activeKeys],
  )

  const data = useMemo<MonthBarPoint[]>(() => {
    // Collect every month key that has any activity
    const monthSet = new Set<string>()
    for (const { key } of bars) {
      const totals = habits[key]?.monthlyTotals ?? {}
      for (const [mk, v] of Object.entries(totals)) {
        if (v > 0) monthSet.add(mk)
      }
    }

    const sortedMonths = [...monthSet].sort()
    if (sortedMonths.length === 0) return []

    return sortedMonths.map((mk) => {
      const point: MonthBarPoint = { month: monthLabel(mk), monthKey: mk, total: 0 }
      let total = 0
      for (const { key } of bars) {
        const v = habits[key]?.monthlyTotals?.[mk] ?? 0
        point[key] = v
        total += v
      }
      point.total = total
      return point
    })
  }, [habits, bars])

  // MoM between the two most recent months with data
  const momLastTwo = useMemo(() => {
    if (data.length < 2) return null
    const last = data[data.length - 1]
    const prev = data[data.length - 2]
    if (!prev.total) return null
    return Math.round(((last.total - prev.total) / prev.total) * 100)
  }, [data])

  // Best month (highest total)
  const bestMonth = useMemo(() => {
    if (!data.length) return null
    return data.reduce((b, d) => d.total > b.total ? d : b, data[0])
  }, [data])

  return { bars, data, momLastTwo, bestMonth }
}
