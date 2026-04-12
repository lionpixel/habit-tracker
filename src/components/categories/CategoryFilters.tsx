// ─────────────────────────────────────────────
//  Component: Category Filters
// ─────────────────────────────────────────────

'use client'

import { cn } from '@/lib/helpers'

export type CategoryFilter = 'all' | 'active' | 'at_risk' | 'archived'

interface CategoryFiltersProps {
  value:    CategoryFilter
  onChange: (f: CategoryFilter) => void
  counts:   Record<CategoryFilter, number>
}

const FILTERS: { id: CategoryFilter; label: string }[] = [
  { id: 'all',      label: 'Todos'     },
  { id: 'active',   label: 'Ativos'    },
  { id: 'at_risk',  label: 'Em Risco'  },
  { id: 'archived', label: 'Arquivados'},
]

export function CategoryFilters({ value, onChange, counts }: CategoryFiltersProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {FILTERS.map(({ id, label }) => {
        const active = value === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200',
              active
                ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40'
                : 'bg-white/[0.05] text-slate-500 hover:bg-white/[0.08] hover:text-slate-400',
            )}
          >
            {label}
            <span
              className={cn(
                'text-[9px] font-black rounded-full px-1.5 py-0.5 tabular-nums min-w-[18px] text-center',
                active ? 'bg-indigo-500/30 text-indigo-200' : 'bg-white/[0.08] text-slate-600',
              )}
            >
              {counts[id]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
