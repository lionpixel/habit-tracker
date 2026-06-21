// ─────────────────────────────────────────────
//  Store: Goals — Annual/Quarterly/Monthly/Weekly/Daily + Projects
// ─────────────────────────────────────────────

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type {
  AnnualGoal, QuarterlyGoal, MonthlyGoal, WeeklyGoal, DailyTask,
  Project, ProjectMilestone, GoalsStore,
} from '@/types/goals'
import { computeProgressFromChildren, deriveStatus } from '@/types/goals'
import { safeParse } from '@/lib/helpers'
import { getWeekDaysBRT } from '@/lib/time'

const GOALS_KEY = 'hdb_goals'
const LEGACY_PLANNER_BOARD_KEY = 'hdb_planner_board'
const LEGACY_PLANNER_MIGRATION_KEY = 'hdb_planner_board_migrated_v1'

function uid(): string {
  return Math.random().toString(36).slice(2, 11)
}

function now(): string {
  return new Date().toISOString()
}

function load(fallback: GoalsStore): GoalsStore {
  if (typeof window === 'undefined') return fallback
  return safeParse<GoalsStore>(localStorage.getItem(GOALS_KEY), fallback)
}

function save(data: GoalsStore): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(GOALS_KEY, JSON.stringify(data))
}

const DEFAULT: GoalsStore = {
  annualGoals:    [],
  quarterlyGoals: [],
  monthlyGoals:   [],
  weeklyGoals:    [],
  dailyTasks:     [],
  projects:       [],
}

type LegacyPlannerDayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

interface LegacyPlannerTask {
  id: string
  text: string
  done: boolean
}

interface LegacyPlannerWeekData {
  monday: { habits: LegacyPlannerTask[]; tasks: LegacyPlannerTask[] }
  tuesday: { habits: LegacyPlannerTask[]; tasks: LegacyPlannerTask[] }
  wednesday: { habits: LegacyPlannerTask[]; tasks: LegacyPlannerTask[] }
  thursday: { habits: LegacyPlannerTask[]; tasks: LegacyPlannerTask[] }
  friday: { habits: LegacyPlannerTask[]; tasks: LegacyPlannerTask[] }
  saturday: { habits: LegacyPlannerTask[]; tasks: LegacyPlannerTask[] }
  sunday: { habits: LegacyPlannerTask[]; tasks: LegacyPlannerTask[] }
}

const LEGACY_DAY_INDEX: Record<LegacyPlannerDayKey, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
}

function migrateLegacyPlannerTasks(data: GoalsStore): GoalsStore {
  if (typeof window === 'undefined') return data
  if (localStorage.getItem(LEGACY_PLANNER_MIGRATION_KEY)) return data

  const legacy = safeParse<Record<string, LegacyPlannerWeekData>>(
    localStorage.getItem(LEGACY_PLANNER_BOARD_KEY),
    {},
  )

  let changed = false
  const nextTasks = [...data.dailyTasks]

  Object.entries(legacy).forEach(([weekKey, weekData]) => {
    const [yearStr, weekStr] = weekKey.split('-W')
    const year = Number(yearStr)
    const week = Number(weekStr)
    if (!year || !week) return

    const weekDates = getWeekDaysBRT(year, week)
    ;(Object.keys(LEGACY_DAY_INDEX) as LegacyPlannerDayKey[]).forEach((dayKey) => {
      const date = weekDates[LEGACY_DAY_INDEX[dayKey]]
      const legacyTasks = weekData[dayKey]?.tasks ?? []

      legacyTasks.forEach((task, index) => {
        const title = task.text.trim()
        if (!title) return

        const exists = nextTasks.some((current) => current.date === date && current.title === title)
        if (exists) return

        changed = true
        nextTasks.push({
          id: uid(),
          title,
          date,
          priority: 'medium',
          status: task.done ? 'done' : 'not_started',
          createdAt: now(),
          completedAt: task.done ? now() : undefined,
          source: 'manual',
          sortOrder: index,
        })
      })
    })
  })

  localStorage.setItem(LEGACY_PLANNER_MIGRATION_KEY, '1')
  return changed ? { ...data, dailyTasks: nextTasks } : data
}

// ── Store interface ───────────────────────────

interface GoalsStoreState extends GoalsStore {
  hydrated: boolean
  hydrate:  () => void

  // ── Annual goals ──────────────────────────
  addAnnualGoal:    (g: Omit<AnnualGoal, 'id' | 'createdAt' | 'quarterlyGoalIds'>) => string
  updateAnnualGoal: (id: string, patch: Partial<AnnualGoal>) => void
  deleteAnnualGoal: (id: string) => void
  setAnnualProgress:(id: string, progress: number) => void

  // ── Quarterly goals ───────────────────────
  addQuarterlyGoal:    (g: Omit<QuarterlyGoal, 'id' | 'createdAt' | 'monthlyGoalIds'>) => string
  updateQuarterlyGoal: (id: string, patch: Partial<QuarterlyGoal>) => void
  deleteQuarterlyGoal: (id: string) => void
  linkQuarterlyToAnnual:(qId: string, aId: string) => void

  // ── Monthly goals ─────────────────────────
  addMonthlyGoal:    (g: Omit<MonthlyGoal, 'id' | 'createdAt' | 'weeklyGoalIds'>) => string
  updateMonthlyGoal: (id: string, patch: Partial<MonthlyGoal>) => void
  deleteMonthlyGoal: (id: string) => void
  linkMonthlyToQuarterly:(mId: string, qId: string) => void

  // ── Weekly goals ──────────────────────────
  addWeeklyGoal:    (g: Omit<WeeklyGoal, 'id' | 'createdAt' | 'taskIds'>) => string
  updateWeeklyGoal: (id: string, patch: Partial<WeeklyGoal>) => void
  deleteWeeklyGoal: (id: string) => void
  linkWeeklyToMonthly:(wId: string, mId: string) => void

  // ── Daily tasks ───────────────────────────
  addDailyTask:        (t: Omit<DailyTask, 'id' | 'createdAt'>) => string
  updateDailyTask:     (id: string, patch: Partial<DailyTask>) => void
  completeDailyTask:   (id: string) => void
  uncompleteDailyTask: (id: string) => void
  deleteDailyTask:     (id: string) => void
  linkTaskToWeekly:    (tId: string, wId: string) => void

  // ── Projects ──────────────────────────────
  addProject:    (p: Omit<Project, 'id' | 'createdAt' | 'milestones'>) => string
  updateProject: (id: string, patch: Partial<Project>) => void
  deleteProject: (id: string) => void
  addMilestone:  (projectId: string, m: Omit<ProjectMilestone, 'id'>) => void
  toggleMilestone:(projectId: string, milestoneId: string) => void
  deleteMilestone:(projectId: string, milestoneId: string) => void
  setProjectProgress:(id: string, progress: number) => void

  // ── Computed selectors ────────────────────
  getQuarterlyForAnnual: (annualId: string)  => QuarterlyGoal[]
  getMonthlyForQuarterly:(qId: string)        => MonthlyGoal[]
  getWeeklyForMonthly:   (mId: string)        => WeeklyGoal[]
  getTasksForWeekly:     (wId: string)        => DailyTask[]
  getTasksForDate:       (date: string)       => DailyTask[]
  getTasksForWeek:       (year: number, week: number) => DailyTask[]
}

// ── Bubble-up progress helper ─────────────────
// After modifying tasks/weekly/monthly, recompute parent progress

function bubbleProgress(draft: GoalsStore): GoalsStore {
  // 1. Weekly ← tasks
  const updated = { ...draft }
  updated.weeklyGoals = draft.weeklyGoals.map((wg) => {
    if (!wg.taskIds.length) return wg
    const tasks = draft.dailyTasks.filter((t) => wg.taskIds.includes(t.id))
    if (!tasks.length) return wg
    const progress = computeProgressFromChildren(
      tasks.map((t) => (t.status === 'done' ? 100 : t.status === 'cancelled' ? 100 : 0)),
    )
    return { ...wg, progress, status: deriveStatus(progress, wg.status === 'cancelled' ? 'cancelled' : undefined) }
  })

  // 2. Monthly ← weekly
  updated.monthlyGoals = draft.monthlyGoals.map((mg) => {
    if (!mg.weeklyGoalIds.length) return mg
    const weeklys = updated.weeklyGoals.filter((w) => mg.weeklyGoalIds.includes(w.id))
    if (!weeklys.length) return mg
    const progress = computeProgressFromChildren(weeklys.map((w) => w.progress))
    return { ...mg, progress, status: deriveStatus(progress, mg.status === 'cancelled' ? 'cancelled' : undefined) }
  })

  // 3. Quarterly ← monthly
  updated.quarterlyGoals = draft.quarterlyGoals.map((qg) => {
    if (!qg.monthlyGoalIds.length) return qg
    const monthlys = updated.monthlyGoals.filter((m) => qg.monthlyGoalIds.includes(m.id))
    if (!monthlys.length) return qg
    const progress = computeProgressFromChildren(monthlys.map((m) => m.progress))
    return { ...qg, progress, status: deriveStatus(progress, qg.status === 'cancelled' ? 'cancelled' : undefined) }
  })

  // 4. Annual ← quarterly
  updated.annualGoals = draft.annualGoals.map((ag) => {
    if (!ag.quarterlyGoalIds.length) return ag
    const quarterlys = updated.quarterlyGoals.filter((q) => ag.quarterlyGoalIds.includes(q.id))
    if (!quarterlys.length) return ag
    const progress = computeProgressFromChildren(quarterlys.map((q) => q.progress))
    return { ...ag, progress, status: deriveStatus(progress, ag.status === 'cancelled' ? 'cancelled' : undefined) }
  })

  return updated
}

// ── Store ────────────────────────────────────

export const useGoalsStore = create<GoalsStoreState>()(
  subscribeWithSelector((set, get) => {

    function persist(data: GoalsStore) {
      save(data)
      const bubbled = bubbleProgress(data)
      save(bubbled)
      set(bubbled)
    }

    function getState(): GoalsStore {
      const s = get()
      return {
        annualGoals:    s.annualGoals,
        quarterlyGoals: s.quarterlyGoals,
        monthlyGoals:   s.monthlyGoals,
        weeklyGoals:    s.weeklyGoals,
        dailyTasks:     s.dailyTasks,
        projects:       s.projects,
      }
    }

    return {
      ...DEFAULT,
      hydrated: false,

      hydrate() {
        const data = migrateLegacyPlannerTasks(load(DEFAULT))
        const bubbled = bubbleProgress(data)
        save(bubbled)
        set({ ...bubbled, hydrated: true })
      },

      // ── Annual ────────────────────────────

      addAnnualGoal(g) {
        const id = uid()
        const goal: AnnualGoal = { ...g, id, createdAt: now(), quarterlyGoalIds: [], progress: 0, status: 'not_started' }
        const s = getState()
        persist({ ...s, annualGoals: [...s.annualGoals, goal] })
        return id
      },

      updateAnnualGoal(id, patch) {
        const s = getState()
        persist({ ...s, annualGoals: s.annualGoals.map((g) => g.id === id ? { ...g, ...patch, updatedAt: now() } : g) })
      },

      deleteAnnualGoal(id) {
        const s = getState()
        // Also unlink from quarterly
        const updated = {
          ...s,
          annualGoals:    s.annualGoals.filter((g) => g.id !== id),
          quarterlyGoals: s.quarterlyGoals.map((q) => q.annualGoalId === id ? { ...q, annualGoalId: undefined } : q),
        }
        persist(updated)
      },

      setAnnualProgress(id, progress) {
        get().updateAnnualGoal(id, { progress, status: deriveStatus(progress) })
      },

      // ── Quarterly ─────────────────────────

      addQuarterlyGoal(g) {
        const id = uid()
        const goal: QuarterlyGoal = { ...g, id, createdAt: now(), monthlyGoalIds: [], progress: 0, status: 'not_started' }
        const s = getState()
        let annualGoals = s.annualGoals
        if (g.annualGoalId) {
          annualGoals = annualGoals.map((ag) =>
            ag.id === g.annualGoalId
              ? { ...ag, quarterlyGoalIds: [...ag.quarterlyGoalIds, id] }
              : ag,
          )
        }
        persist({ ...s, quarterlyGoals: [...s.quarterlyGoals, goal], annualGoals })
        return id
      },

      updateQuarterlyGoal(id, patch) {
        const s = getState()
        persist({ ...s, quarterlyGoals: s.quarterlyGoals.map((g) => g.id === id ? { ...g, ...patch, updatedAt: now() } : g) })
      },

      deleteQuarterlyGoal(id) {
        const s = getState()
        persist({
          ...s,
          quarterlyGoals: s.quarterlyGoals.filter((g) => g.id !== id),
          annualGoals:    s.annualGoals.map((ag) => ({ ...ag, quarterlyGoalIds: ag.quarterlyGoalIds.filter((q) => q !== id) })),
          monthlyGoals:   s.monthlyGoals.map((m) => m.quarterlyGoalId === id ? { ...m, quarterlyGoalId: undefined } : m),
        })
      },

      linkQuarterlyToAnnual(qId, aId) {
        const s = getState()
        persist({
          ...s,
          quarterlyGoals: s.quarterlyGoals.map((q) => q.id === qId ? { ...q, annualGoalId: aId } : q),
          annualGoals:    s.annualGoals.map((ag) =>
            ag.id === aId && !ag.quarterlyGoalIds.includes(qId)
              ? { ...ag, quarterlyGoalIds: [...ag.quarterlyGoalIds, qId] }
              : ag,
          ),
        })
      },

      // ── Monthly ───────────────────────────

      addMonthlyGoal(g) {
        const id = uid()
        const goal: MonthlyGoal = { ...g, id, createdAt: now(), weeklyGoalIds: [], progress: 0, status: 'not_started' }
        const s = getState()
        let quarterlyGoals = s.quarterlyGoals
        if (g.quarterlyGoalId) {
          quarterlyGoals = quarterlyGoals.map((qg) =>
            qg.id === g.quarterlyGoalId
              ? { ...qg, monthlyGoalIds: [...qg.monthlyGoalIds, id] }
              : qg,
          )
        }
        persist({ ...s, monthlyGoals: [...s.monthlyGoals, goal], quarterlyGoals })
        return id
      },

      updateMonthlyGoal(id, patch) {
        const s = getState()
        persist({ ...s, monthlyGoals: s.monthlyGoals.map((g) => g.id === id ? { ...g, ...patch, updatedAt: now() } : g) })
      },

      deleteMonthlyGoal(id) {
        const s = getState()
        persist({
          ...s,
          monthlyGoals:   s.monthlyGoals.filter((g) => g.id !== id),
          quarterlyGoals: s.quarterlyGoals.map((qg) => ({ ...qg, monthlyGoalIds: qg.monthlyGoalIds.filter((m) => m !== id) })),
          weeklyGoals:    s.weeklyGoals.map((wg) => wg.monthlyGoalId === id ? { ...wg, monthlyGoalId: undefined } : wg),
        })
      },

      linkMonthlyToQuarterly(mId, qId) {
        const s = getState()
        persist({
          ...s,
          monthlyGoals:   s.monthlyGoals.map((m) => m.id === mId ? { ...m, quarterlyGoalId: qId } : m),
          quarterlyGoals: s.quarterlyGoals.map((qg) =>
            qg.id === qId && !qg.monthlyGoalIds.includes(mId)
              ? { ...qg, monthlyGoalIds: [...qg.monthlyGoalIds, mId] }
              : qg,
          ),
        })
      },

      // ── Weekly ────────────────────────────

      addWeeklyGoal(g) {
        const id = uid()
        const goal: WeeklyGoal = { ...g, id, createdAt: now(), taskIds: [], progress: 0, status: 'not_started' }
        const s = getState()
        let monthlyGoals = s.monthlyGoals
        if (g.monthlyGoalId) {
          monthlyGoals = monthlyGoals.map((mg) =>
            mg.id === g.monthlyGoalId
              ? { ...mg, weeklyGoalIds: [...mg.weeklyGoalIds, id] }
              : mg,
          )
        }
        persist({ ...s, weeklyGoals: [...s.weeklyGoals, goal], monthlyGoals })
        return id
      },

      updateWeeklyGoal(id, patch) {
        const s = getState()
        persist({ ...s, weeklyGoals: s.weeklyGoals.map((g) => g.id === id ? { ...g, ...patch, updatedAt: now() } : g) })
      },

      deleteWeeklyGoal(id) {
        const s = getState()
        persist({
          ...s,
          weeklyGoals:  s.weeklyGoals.filter((g) => g.id !== id),
          monthlyGoals: s.monthlyGoals.map((mg) => ({ ...mg, weeklyGoalIds: mg.weeklyGoalIds.filter((w) => w !== id) })),
          dailyTasks:   s.dailyTasks.map((t) => t.weeklyGoalId === id ? { ...t, weeklyGoalId: undefined } : t),
        })
      },

      linkWeeklyToMonthly(wId, mId) {
        const s = getState()
        persist({
          ...s,
          weeklyGoals:  s.weeklyGoals.map((w) => w.id === wId ? { ...w, monthlyGoalId: mId } : w),
          monthlyGoals: s.monthlyGoals.map((mg) =>
            mg.id === mId && !mg.weeklyGoalIds.includes(wId)
              ? { ...mg, weeklyGoalIds: [...mg.weeklyGoalIds, wId] }
              : mg,
          ),
        })
      },

      // ── Daily tasks ───────────────────────

      addDailyTask(t) {
        const id = uid()
        const task: DailyTask = { ...t, id, createdAt: now(), status: t.status ?? 'not_started' }
        const s = getState()
        let weeklyGoals = s.weeklyGoals
        if (t.weeklyGoalId) {
          weeklyGoals = weeklyGoals.map((wg) =>
            wg.id === t.weeklyGoalId
              ? { ...wg, taskIds: [...wg.taskIds, id] }
              : wg,
          )
        }
        persist({ ...s, dailyTasks: [...s.dailyTasks, task], weeklyGoals })
        return id
      },

      updateDailyTask(id, patch) {
        const s = getState()
        persist({ ...s, dailyTasks: s.dailyTasks.map((t) => t.id === id ? { ...t, ...patch } : t) })
      },

      completeDailyTask(id) {
        const s = getState()
        persist({
          ...s,
          dailyTasks: s.dailyTasks.map((t) =>
            t.id === id ? { ...t, status: 'done', completedAt: now() } : t,
          ),
        })
      },

      uncompleteDailyTask(id) {
        const s = getState()
        persist({
          ...s,
          dailyTasks: s.dailyTasks.map((t) =>
            t.id === id ? { ...t, status: 'not_started', completedAt: undefined } : t,
          ),
        })
      },

      deleteDailyTask(id) {
        const s = getState()
        const task = s.dailyTasks.find((t) => t.id === id)
        persist({
          ...s,
          dailyTasks:  s.dailyTasks.filter((t) => t.id !== id),
          weeklyGoals: task?.weeklyGoalId
            ? s.weeklyGoals.map((wg) =>
                wg.id === task.weeklyGoalId
                  ? { ...wg, taskIds: wg.taskIds.filter((tid) => tid !== id) }
                  : wg,
              )
            : s.weeklyGoals,
        })
      },

      linkTaskToWeekly(tId, wId) {
        const s = getState()
        persist({
          ...s,
          dailyTasks:  s.dailyTasks.map((t) => t.id === tId ? { ...t, weeklyGoalId: wId } : t),
          weeklyGoals: s.weeklyGoals.map((wg) =>
            wg.id === wId && !wg.taskIds.includes(tId)
              ? { ...wg, taskIds: [...wg.taskIds, tId] }
              : wg,
          ),
        })
      },

      // ── Projects ──────────────────────────

      addProject(p) {
        const id = uid()
        const project: Project = { ...p, id, createdAt: now(), milestones: [], progress: p.progress ?? 0, status: p.status ?? 'not_started' }
        const s = getState()
        persist({ ...s, projects: [...s.projects, project] })
        return id
      },

      updateProject(id, patch) {
        const s = getState()
        persist({ ...s, projects: s.projects.map((p) => p.id === id ? { ...p, ...patch, updatedAt: now() } : p) })
      },

      deleteProject(id) {
        const s = getState()
        persist({ ...s, projects: s.projects.filter((p) => p.id !== id) })
      },

      addMilestone(projectId, m) {
        const id = uid()
        const milestone: ProjectMilestone = { ...m, id }
        const s = getState()
        persist({
          ...s,
          projects: s.projects.map((p) =>
            p.id === projectId ? { ...p, milestones: [...p.milestones, milestone] } : p,
          ),
        })
      },

      toggleMilestone(projectId, milestoneId) {
        const s = getState()
        const projects = s.projects.map((p) => {
          if (p.id !== projectId) return p
          const milestones = p.milestones.map((m) =>
            m.id === milestoneId
              ? { ...m, completed: !m.completed, completedAt: !m.completed ? now() : undefined }
              : m,
          )
          const done = milestones.filter((m) => m.completed).length
          const progress = milestones.length ? Math.round((done / milestones.length) * 100) : p.progress
          return { ...p, milestones, progress, status: deriveStatus(progress, p.status === 'cancelled' ? 'cancelled' : undefined) }
        })
        persist({ ...s, projects })
      },

      deleteMilestone(projectId, milestoneId) {
        const s = getState()
        persist({
          ...s,
          projects: s.projects.map((p) =>
            p.id === projectId
              ? { ...p, milestones: p.milestones.filter((m) => m.id !== milestoneId) }
              : p,
          ),
        })
      },

      setProjectProgress(id, progress) {
        get().updateProject(id, { progress, status: deriveStatus(progress) })
      },

      // ── Selectors ─────────────────────────

      getQuarterlyForAnnual(annualId) {
        const ag = get().annualGoals.find((a) => a.id === annualId)
        if (!ag) return []
        return get().quarterlyGoals.filter((q) => ag.quarterlyGoalIds.includes(q.id))
      },

      getMonthlyForQuarterly(qId) {
        const qg = get().quarterlyGoals.find((q) => q.id === qId)
        if (!qg) return []
        return get().monthlyGoals.filter((m) => qg.monthlyGoalIds.includes(m.id))
      },

      getWeeklyForMonthly(mId) {
        const mg = get().monthlyGoals.find((m) => m.id === mId)
        if (!mg) return []
        return get().weeklyGoals.filter((w) => mg.weeklyGoalIds.includes(w.id))
      },

      getTasksForWeekly(wId) {
        const wg = get().weeklyGoals.find((w) => w.id === wId)
        if (!wg) return []
        return get().dailyTasks.filter((t) => wg.taskIds.includes(t.id))
      },

      getTasksForDate(date) {
        return get().dailyTasks.filter((t) => t.date === date)
      },

      getTasksForWeek(year, week) {
        return get().dailyTasks.filter((t) => {
          const wg = get().weeklyGoals.find((w) => w.taskIds.includes(t.id))
          return wg?.year === year && wg?.week === week
        })
      },
    }
  }),
)
