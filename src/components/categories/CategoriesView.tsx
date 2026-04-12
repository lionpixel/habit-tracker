// ─────────────────────────────────────────────
//  View: Categories
// ─────────────────────────────────────────────

'use client'

import { useState, useEffect, useMemo } from 'react'
import { Layers, Plus, X, Check } from 'lucide-react'
import { useCategoryStore } from '@/store/categoryStore'
import { useAppStore }      from '@/store/appStore'
import { CategoryCard }     from './CategoryCard'
import { CategoryStatsOverview } from './CategoryStats'
import { CategoryFilters, type CategoryFilter } from './CategoryFilters'
import { CategoryDetailsModal } from './CategoryDetailsModal'
import { CategoryInsights, generateInsights } from './CategoryInsights'
import { FadeInUp, StaggerList, StaggerItem } from '@/components/ui/Motion'
import { AnimatePresence, motion } from 'framer-motion'
import type { HabitCategory, CategoryStats } from '@/types/category'
import { getMonthKey } from '@/lib/helpers'
import { useHabits } from '@/hooks/useHabits'

// ── Build stats from habit data ───────────────

function buildStatsMap(
  categories: HabitCategory[],
  habits: ReturnType<typeof useHabits>['habits'],
  currentYear: number,
  currentMonth: number,
): Record<string, CategoryStats> {
  const map: Record<string, CategoryStats> = {}
  const mKey = getMonthKey(currentYear, currentMonth)

  categories.forEach((cat) => {
    const keys = cat.habitKeys
    if (!keys.length) {
      map[cat.id] = {
        categoryId:      cat.id,
        totalMinutes:    0,
        weekMinutes:     0,
        monthMinutes:    0,
        consistency:     0,
        streak:          0,
        riskLevel:       'high',
        score:           0,
        habitsCompleted: 0,
        habitsTotal:     0,
      }
      return
    }

    let totalMinutes = 0
    let monthMinutes = 0
    let weekMinutes  = 0
    let habitsCompleted = 0

    keys.forEach((k) => {
      const h = habits[k as keyof typeof habits]
      if (!h) return
      totalMinutes  += h.totalYear ?? 0
      monthMinutes  += h.monthlyTotals?.[mKey] ?? 0
      // week minutes: sum counts for current week
      const weekCounts = Object.entries(h.counts ?? {})
        .filter(([key]) => key.startsWith(`${currentYear}-W`))
      const weekMin = weekCounts
        .filter(([key]) => key.includes(`W${String(currentYear).slice(-2)}`))
        .reduce((a, [, v]) => a + (typeof v === 'number' ? v : 0), 0)
      weekMinutes += weekMin

      // Completion heuristic: any count in current month
      if ((h.monthlyTotals?.[mKey] ?? 0) > 0) habitsCompleted++
    })

    const consistency = keys.length > 0
      ? Math.round((habitsCompleted / keys.length) * 100)
      : 0

    const streak = keys.reduce((max, k) => {
      const h = habits[k as keyof typeof habits]
      return Math.max(max, (h as { streak?: number })?.streak ?? 0)
    }, 0)

    const riskLevel: CategoryStats['riskLevel'] =
      consistency >= 70 ? 'low' : consistency >= 40 ? 'medium' : 'high'

    const score = Math.round(
      consistency * 0.5 + Math.min(100, (monthMinutes / 600) * 100) * 0.3 + Math.min(100, streak * 3) * 0.2,
    )

    map[cat.id] = {
      categoryId: cat.id,
      totalMinutes,
      weekMinutes,
      monthMinutes,
      consistency,
      streak,
      riskLevel,
      score,
      habitsCompleted,
      habitsTotal: keys.length,
    }
  })

  return map
}

// ── New category modal ────────────────────────

const ICON_OPTIONS = [
  'Heart','Moon','Dumbbell','Apple','BookOpen','GraduationCap',
  'Briefcase','Zap','Sparkles','TrendingUp','Users','Brain',
  'Target','Smile','Home','Star','Music','Camera','Coffee','Leaf',
]
const COLOR_OPTIONS = [
  '#ef4444','#f97316','#f59e0b','#10b981','#06b6d4','#3b82f6',
  '#8b5cf6','#ec4899','#6366f1','#14b8a6','#a78bfa','#34d399',
]

import * as Icons from 'lucide-react'
function LucideIcon({ name, size = 16, style }: { name: string; size?: number; style?: React.CSSProperties }) {
  const Icon = (Icons as Record<string, unknown>)[name] as React.FC<{ size?: number; style?: React.CSSProperties }> | undefined
  if (!Icon) return null
  return <Icon size={size} style={style} />
}

function NewCategoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addCategory } = useCategoryStore()
  const [name, setName]       = useState('')
  const [desc, setDesc]       = useState('')
  const [icon, setIcon]       = useState(ICON_OPTIONS[0])
  const [color, setColor]     = useState(COLOR_OPTIONS[0])

  function handleSave() {
    if (!name.trim()) return
    addCategory({
      id:          name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now(),
      name:        name.trim(),
      description: desc.trim(),
      icon,
      color,
      isDefault:   false,
      habitKeys:   [],
    })
    setName(''); setDesc(''); setIcon(ICON_OPTIONS[0]); setColor(COLOR_OPTIONS[0])
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            <div className="glass w-full max-w-md rounded-2xl border border-white/[0.08] shadow-modal pointer-events-auto overflow-hidden">
              <div className="h-[3px]" style={{ background: `linear-gradient(90deg, ${color}, ${color}60, transparent)` }} />
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-100">Nova Categoria</h3>
                  <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-slate-400 hover:text-slate-200">
                    <X size={15} />
                  </button>
                </div>
                <input
                  className="w-full bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Nome da categoria"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  className="w-full bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Descrição (opcional)"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
                {/* Icon row */}
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Ícone</div>
                  <div className="flex flex-wrap gap-1.5">
                    {ICON_OPTIONS.slice(0, 12).map((ic) => (
                      <button key={ic} type="button" onClick={() => setIcon(ic)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={icon === ic ? { background: `${color}20` } : { background: 'rgba(255,255,255,0.05)' }}
                      >
                        <LucideIcon name={ic} size={15} style={{ color: icon === ic ? color : '#64748b' }} />
                      </button>
                    ))}
                  </div>
                </div>
                {/* Color row */}
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Cor</div>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((col) => (
                      <button key={col} type="button" onClick={() => setColor(col)}
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                        style={{ backgroundColor: col }}
                      >
                        {color === col && <Check size={11} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/[0.05] text-slate-400 text-sm font-semibold hover:bg-white/[0.08]">
                    Cancelar
                  </button>
                  <button type="button" onClick={handleSave} disabled={!name.trim()}
                    className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-40"
                    style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}
                  >
                    Criar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── CategoriesView ────────────────────────────

export function CategoriesView() {
  const { categories, hydrated, hydrate } = useCategoryStore()
  const { habits, currentYear } = useHabits()
  const currentMonth = useAppStore((s) => s.data.currentMonth)

  useEffect(() => { if (!hydrated) hydrate() }, [hydrated, hydrate])

  const [filter, setFilter]       = useState<CategoryFilter>('all')
  const [selected, setSelected]   = useState<HabitCategory | null>(null)
  const [newOpen, setNewOpen]     = useState(false)

  const statsMap = useMemo(
    () => buildStatsMap(categories, habits, currentYear, currentMonth),
    [categories, habits, currentYear, currentMonth],
  )

  const insights = useMemo(
    () => generateInsights(categories.filter((c) => !c.archived), statsMap),
    [categories, statsMap],
  )

  const filtered = useMemo(() => {
    return categories.filter((c) => {
      const stats = statsMap[c.id]
      switch (filter) {
        case 'active':   return !c.archived
        case 'at_risk':  return !c.archived && stats?.riskLevel === 'high'
        case 'archived': return !!c.archived
        default:         return true
      }
    })
  }, [categories, statsMap, filter])

  const counts = useMemo(() => ({
    all:      categories.length,
    active:   categories.filter((c) => !c.archived).length,
    at_risk:  categories.filter((c) => !c.archived && statsMap[c.id]?.riskLevel === 'high').length,
    archived: categories.filter((c) => !!c.archived).length,
  }), [categories, statsMap])

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeInUp>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
              <Layers size={20} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-100">Categorias</h2>
              <p className="text-slate-500 text-sm">Organize e acompanhe seus hábitos</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setNewOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 text-sm font-semibold hover:bg-indigo-500/30 transition-colors"
          >
            <Plus size={16} />
            Nova
          </button>
        </div>
      </FadeInUp>

      {/* Stats overview */}
      <FadeInUp delay={0.05}>
        <CategoryStatsOverview categories={categories} statsMap={statsMap} />
      </FadeInUp>

      {/* Insights */}
      {insights.length > 0 && (
        <FadeInUp delay={0.08}>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Insights</div>
            <CategoryInsights insights={insights} />
          </div>
        </FadeInUp>
      )}

      {/* Filters + grid */}
      <FadeInUp delay={0.1}>
        <CategoryFilters value={filter} onChange={setFilter} counts={counts} />
      </FadeInUp>

      <StaggerList className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((cat) => (
          <StaggerItem key={cat.id}>
            <CategoryCard
              category={cat}
              stats={statsMap[cat.id]}
              selected={selected?.id === cat.id}
              onClick={() => setSelected(cat)}
            />
          </StaggerItem>
        ))}
      </StaggerList>

      {/* Modals */}
      <CategoryDetailsModal
        open={!!selected}
        category={selected}
        stats={selected ? statsMap[selected.id] : undefined}
        onClose={() => setSelected(null)}
      />
      <NewCategoryModal open={newOpen} onClose={() => setNewOpen(false)} />
    </div>
  )
}
