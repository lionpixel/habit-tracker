// ─────────────────────────────────────────────
//  Componente: Navegação por abas
// ─────────────────────────────────────────────

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/helpers'

const TABS = [
  { href: '/weekly',  label: '📅 Semanal'   },
  { href: '/monthly', label: '📆 Mensal'    },
  { href: '/yearly',  label: '📊 Anual'     },
  { href: '/metas',   label: '🎯 Metas'     },
  { href: '/sleep',   label: '😴 Sono'      },
  { href: '/focus',   label: '🎯 Foco'      },
  { href: '/report',  label: '📄 Relatório' },
] as const

export function TabNav() {
  const pathname = usePathname()

  return (
    <nav
      className="flex flex-wrap gap-2 mb-8 p-1 bg-white/5 rounded-2xl border border-white/10"
      role="tablist"
      aria-label="Navegação principal"
    >
      {TABS.map(({ href, label }) => {
        const isActive = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            role="tab"
            aria-selected={isActive}
            className={cn(
              'flex-1 min-w-[100px] text-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500',
              isActive
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
            )}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}