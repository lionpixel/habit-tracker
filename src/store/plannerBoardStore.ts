// ─────────────────────────────────────────────
//  Store: Planner Board — lightweight weekly board with localStorage
// ─────────────────────────────────────────────

import { create } from 'zustand'
import { genId, safeParse } from '@/lib/helpers'

export type DayKey      = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
export type SectionKey  = 'habits' | 'tasks'

export interface BoardTask {
  id:   string
  text: string
  done: boolean
}

export type DayData  = { habits: BoardTask[]; tasks: BoardTask[] }
export type WeekData = Record<DayKey, DayData>

const ALL_DAYS: DayKey[] = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']

export function emptyWeek(): WeekData {
  return ALL_DAYS.reduce((acc, d) => {
    acc[d] = { habits: [], tasks: [] }
    return acc
  }, {} as WeekData)
}

const BOARD_KEY = 'hdb_planner_board'

interface BoardStore {
  weeks:    Record<string, WeekData>
  hydrated: boolean
  hydrate:  () => void
  getWeek:  (key: string) => WeekData
  addTask:       (weekKey: string, day: DayKey, section: SectionKey, text: string) => string
  updateTask:    (weekKey: string, day: DayKey, section: SectionKey, id: string, text: string) => void
  toggleTask:    (weekKey: string, day: DayKey, section: SectionKey, id: string) => void
  deleteTask:    (weekKey: string, day: DayKey, section: SectionKey, id: string) => void
  duplicateTask: (weekKey: string, day: DayKey, section: SectionKey, id: string) => void
  moveTask:      (weekKey: string, fromDay: DayKey, fromSection: SectionKey, fromIdx: number, toDay: DayKey, toSection: SectionKey, toIdx: number) => void
}

function persist(weeks: Record<string, WeekData>) {
  if (typeof window !== 'undefined') localStorage.setItem(BOARD_KEY, JSON.stringify(weeks))
}

function mutDay(
  s: { weeks: Record<string, WeekData> },
  weekKey: string,
  day: DayKey,
  fn: (d: DayData) => DayData,
): { weeks: Record<string, WeekData> } {
  const weeks   = { ...s.weeks }
  const week    = { ...(weeks[weekKey] ?? emptyWeek()) }
  week[day]     = fn({ ...week[day] })
  weeks[weekKey] = week
  persist(weeks)
  return { weeks }
}

export const usePlannerBoardStore = create<BoardStore>()((set, get) => ({
  weeks:    {},
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return
    const saved = safeParse<Record<string, WeekData>>(
      typeof window !== 'undefined' ? localStorage.getItem(BOARD_KEY) : null,
      {},
    )
    set({ weeks: saved, hydrated: true })
  },

  getWeek: (key) => get().weeks[key] ?? emptyWeek(),

  addTask: (weekKey, day, section, text) => {
    const id = genId()
    set(s => mutDay(s, weekKey, day, d => ({ ...d, [section]: [...d[section], { id, text, done: false }] })))
    return id
  },

  updateTask: (weekKey, day, section, id, text) =>
    set(s => mutDay(s, weekKey, day, d => ({ ...d, [section]: d[section].map(t => t.id === id ? { ...t, text } : t) }))),

  toggleTask: (weekKey, day, section, id) =>
    set(s => mutDay(s, weekKey, day, d => ({ ...d, [section]: d[section].map(t => t.id === id ? { ...t, done: !t.done } : t) }))),

  deleteTask: (weekKey, day, section, id) =>
    set(s => mutDay(s, weekKey, day, d => ({ ...d, [section]: d[section].filter(t => t.id !== id) }))),

  duplicateTask: (weekKey, day, section, id) =>
    set(s => mutDay(s, weekKey, day, d => {
      const arr = [...d[section]]
      const idx = arr.findIndex(t => t.id === id)
      if (idx === -1) return d
      arr.splice(idx + 1, 0, { ...arr[idx], id: genId() })
      return { ...d, [section]: arr }
    })),

  moveTask: (weekKey, fromDay, fromSection, fromIdx, toDay, toSection, toIdx) =>
    set(s => {
      const weeks = { ...s.weeks }
      const week  = { ...(weeks[weekKey] ?? emptyWeek()) }
      const fromArr = [...week[fromDay][fromSection]]
      const [task]  = fromArr.splice(fromIdx, 1)
      if (!task) return s

      if (fromDay === toDay && fromSection === toSection) {
        const adj = toIdx > fromIdx ? toIdx - 1 : toIdx
        fromArr.splice(Math.max(0, adj), 0, task)
        week[fromDay] = { ...week[fromDay], [fromSection]: fromArr }
      } else {
        const toArr = [...week[toDay][toSection]]
        toArr.splice(Math.min(toIdx, toArr.length), 0, task)
        week[fromDay] = { ...week[fromDay], [fromSection]: fromArr }
        week[toDay]   = { ...week[toDay],   [toSection]:   toArr   }
      }
      weeks[weekKey] = week
      persist(weeks)
      return { weeks }
    }),
}))
