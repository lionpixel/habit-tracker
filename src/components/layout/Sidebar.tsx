'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/helpers'
import {
  LayoutDashboard,
  CalendarDays,
  BarChart3,
  Target,
  Moon,
  Zap,
  FileText,
  Sparkles,
  ChevronRight,
  Activity,
  Layers,
  User,
  DollarSign,
  Calendar,
  Briefcase,
  RotateCcw,
  Star,
} from 'lucide-react'

const NAV_ITEMS = [
  {
    group: 'Hábitos',
    items: [
      { href: '/weekly',  label: 'Semanal',   icon: LayoutDashboard, color: '#7c3aed', description: 'Hábitos desta semana' },
      { href: '/monthly', label: 'Mensal',    icon: CalendarDays,    color: '#0891b2', description: 'Progresso do mês' },
      { href: '/yearly',  label: 'Anual',     icon: BarChart3,       color: '#059669', description: 'Resumo do ano' },
    ],
  },
  {
    group: 'Planejamento',
    items: [
      { href: '/planner',  label: 'Planner',   icon: Calendar,       color: '#6366f1', description: 'Anual · Trimestral · Diário' },
      { href: '/projects', label: 'Projetos',  icon: Briefcase,      color: '#0ea5e9', description: 'Controle de projetos' },
      { href: '/review',   label: 'Revisão',   icon: RotateCcw,      color: '#a78bfa', description: 'Revisões automáticas' },
    ],
  },
  {
    group: 'Ferramentas',
    items: [
      { href: '/metas',   label: 'Metas',     icon: Target,          color: '#d97706', description: 'Objetivos e metas' },
      { href: '/sleep',   label: 'Sono',      icon: Moon,            color: '#7c3aed', description: 'Controle de sono' },
      { href: '/focus',   label: 'Foco',      icon: Zap,             color: '#22d3ee', description: 'Sessões Pomodoro' },
    ],
  },
  {
    group: 'Pessoal',
    items: [
      { href: '/categories', label: 'Categorias', icon: Layers,      color: '#6366f1', description: 'Organizar hábitos' },
      { href: '/profile',    label: 'Perfil',      icon: User,        color: '#8b5cf6', description: 'Evolução física' },
      { href: '/finance',    label: 'Finanças',    icon: DollarSign,  color: '#10b981', description: 'Controle financeiro' },
      { href: '/dreams',     label: 'Sonhos',      icon: Star,        color: '#f59e0b', description: 'Quadro dos Sonhos 2026' },
    ],
  },
  {
    group: 'Análise',
    items: [
      { href: '/report',  label: 'Relatório', icon: FileText,        color: '#a855f7', description: 'Insights detalhados' },
    ],
  },
] as const

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full z-sidebar flex flex-col',
        'w-[var(--sidebar-w)] bg-[#090c16]',
        'border-r border-white/[0.05]',
        className,
      )}
    >
      {/* Logo area */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/[0.05] flex-shrink-0">
        <div className="relative w-8 h-8 flex-shrink-0">
          <div className="absolute inset-0 rounded-xl bg-violet-gradient opacity-90" />
          <div className="absolute inset-0 rounded-xl flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          {/* Glow */}
          <div className="absolute inset-0 rounded-xl bg-violet-500/30 blur-md -z-10 scale-125" />
        </div>
        <div>
          <div className="text-sm font-bold text-white tracking-tight">HabitDB</div>
          <div className="text-[10px] text-slate-500 font-medium">2026</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollable px-3 py-4 space-y-6">
        {NAV_ITEMS.map((group) => (
          <div key={group.group}>
            <div className="px-3 mb-2">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.12em]">
                {group.group}
              </span>
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.href)
                const Icon = item.icon

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'sidebar-item group w-full',
                        isActive && 'active',
                      )}
                    >
                      {/* Icon container */}
                      <div
                        className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                          'transition-all duration-200',
                          isActive
                            ? 'opacity-100'
                            : 'opacity-60 group-hover:opacity-90',
                        )}
                        style={{
                          background: isActive
                            ? `${item.color}22`
                            : 'rgba(255,255,255,0.05)',
                        }}
                      >
                        <Icon
                          className="w-3.5 h-3.5"
                          style={{ color: isActive ? item.color : '#94a3b8' }}
                          strokeWidth={2}
                        />
                      </div>

                      {/* Label */}
                      <span className="flex-1 text-sm">{item.label}</span>

                      {/* Active indicator */}
                      {isActive && (
                        <ChevronRight className="w-3 h-3 text-violet-400 opacity-60" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom: version badge */}
      <div className="px-4 py-4 border-t border-white/[0.05] flex-shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
          <Sparkles className="w-3 h-3 text-violet-400 flex-shrink-0" />
          <div>
            <div className="text-xs text-slate-400 font-medium">Formação científica</div>
            <div className="text-[10px] text-slate-600">Baseado em ciência comportamental</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
