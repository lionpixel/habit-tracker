'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { ExportButton } from './ExportButton'
import { RestoreBanner } from './RestoreBanner'
import { Activity } from 'lucide-react'

function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080b14]">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/08 rounded-full blur-[80px]" />
      </div>

      <div className="relative flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-2xl bg-violet-gradient opacity-90 animate-pulse-glow" />
          <div className="absolute inset-0 rounded-2xl flex items-center justify-center">
            <Activity className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-violet-500/30 blur-xl scale-150 -z-10" />
        </div>

        {/* Wordmark */}
        <div className="text-center">
          <div className="text-2xl font-bold text-gradient-brand tracking-tight">HabitDB</div>
          <div className="text-sm text-slate-500 mt-1">Carregando seu perfil...</div>
        </div>

        {/* Loading bar */}
        <div className="w-48 h-0.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full w-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full animate-shimmer" />
        </div>

        {/* Skeleton cards */}
        <div className="flex gap-3 mt-2">
          {[40, 56, 40].map((w, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full skeleton"
              style={{ width: `${w}px`, animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { hydrate, hydrated } = useAppStore()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  if (!hydrated) {
    return <LoadingScreen />
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — desktop only */}
      <Sidebar className="hidden lg:flex" />

      {/* Main content area */}
      <div
        className="flex-1 flex flex-col min-h-screen"
        style={{ marginLeft: 'var(--sidebar-w)' }}
      >
        {/* Top navbar */}
        <Navbar />

        {/* Page content */}
        <main
          className="flex-1 px-4 lg:px-6 py-6 lg:py-8 animate-fade-in max-w-[1600px] w-full mx-auto"
          style={{ marginTop: '4rem' }}
        >
          <RestoreBanner />
          {children}
        </main>

        {/* FAB export */}
        <ExportButton />
        {/* Mobile bottom nav */}
        <MobileNav />
      </div>
    </div>
  )
}

/* ── Mobile bottom nav ── */
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/helpers'
import { LayoutDashboard, Calendar, Briefcase, DollarSign, Star } from 'lucide-react'

const MOBILE_TABS = [
  { href: '/weekly',   icon: LayoutDashboard, label: 'Hábitos' },
  { href: '/planner',  icon: Calendar,        label: 'Planner' },
  { href: '/projects', icon: Briefcase,       label: 'Projetos'},
  { href: '/finance',  icon: DollarSign,      label: 'Finanças'},
  { href: '/dreams',   icon: Star,            label: 'Sonhos'  },
] as const

function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-nav glass border-t border-white/[0.05]">
      <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
        {MOBILE_TABS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200',
                isActive
                  ? 'text-violet-400'
                  : 'text-slate-500 hover:text-slate-300',
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200',
                  isActive ? 'bg-violet-500/15' : '',
                )}
              >
                <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-semibold">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
