'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Bell, Flame, Menu, LogOut, User as UserIcon } from 'lucide-react'
import { cn } from '@/lib/helpers'
import { formatDisplayBRT, TZ } from '@/lib/time'
import { useAppStore } from '@/store/appStore'
import { useHabits } from '@/hooks/useHabits'
import { useActiveHabitKeys } from '@/store/selectors'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuth } from '@/providers/AuthProvider'

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/weekly':  { title: 'Dashboard Semanal',  subtitle: 'Acompanhe seus hábitos desta semana' },
  '/monthly': { title: 'Visão Mensal',       subtitle: 'Progresso acumulado do mês' },
  '/yearly':  { title: 'Panorama Anual',     subtitle: 'Sua evolução ao longo do ano' },
  '/metas':   { title: 'Metas & Objetivos',  subtitle: 'Configure e acompanhe suas metas' },
  '/sleep':   { title: 'Controle de Sono',   subtitle: 'Monitore sua qualidade de sono' },
  '/focus':   { title: 'Modo Foco',          subtitle: 'Sessões Pomodoro e deep work' },
  '/report':  { title: 'Relatório Geral',    subtitle: 'Insights detalhados do seu progresso' },
}

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname()
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const [avatarOpen, setAvatarOpen] = useState(false)
  useAppStore()
  const { getWeekProgress } = useHabits()
  const { user, signOut } = useAuth()

  const pageInfo = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1]
    ?? { title: 'HabitDB', subtitle: '' }

  useEffect(() => {
    function tick() {
      const now = new Date()
      setTime(formatDisplayBRT(now).time)
      setDate(new Intl.DateTimeFormat('pt-BR', {
        timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short',
      }).format(now))
    }
    tick()
    const id = setInterval(tick, 10_000)
    return () => clearInterval(id)
  }, [])

  const activeHabitKeys = useActiveHabitKeys()
  const onFire = activeHabitKeys.filter((k) => getWeekProgress(k) >= 80).length

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 z-nav flex items-center gap-4 px-6',
        'border-b border-white/[0.05]',
        'glass',
      )}
      style={{ left: 'var(--sidebar-w)' }}
    >
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className={cn(
          'lg:hidden w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
          'text-slate-400 hover:text-slate-200',
          'bg-white/[0.04] hover:bg-white/[0.08]',
          'border border-white/[0.06] transition-all duration-200',
        )}
        aria-label="Abrir menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-bold text-slate-100 truncate leading-tight">
          {pageInfo.title}
        </h1>
        <p className="hidden sm:block text-xs text-slate-500 truncate">{pageInfo.subtitle}</p>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* On-fire badge */}
        {onFire > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Flame className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">{onFire} em chamas</span>
          </div>
        )}

        {/* Clock */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-bold text-slate-200 tabular-nums leading-tight">{time}</span>
          <span className="text-[10px] text-slate-500 capitalize">{date}</span>
        </div>

        {/* Theme toggle */}
        <ThemeToggle size="sm" />

        {/* Notification bell */}
        <button
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center',
            'text-slate-500 hover:text-slate-300',
            'bg-white/[0.04] hover:bg-white/[0.08]',
            'border border-white/[0.06] hover:border-white/[0.1]',
            'transition-all duration-200',
          )}
          title="Notificações"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* Avatar + dropdown */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setAvatarOpen((o) => !o)}
            className="relative w-9 h-9 rounded-xl overflow-hidden cursor-pointer group focus:outline-none"
            title={user?.displayName ?? 'Usuário'}
          >
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
            ) : (
              <>
                <div className="absolute inset-0 bg-violet-gradient opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                  {user?.displayName?.[0]?.toUpperCase() ?? 'H'}
                </div>
              </>
            )}
          </button>

          {avatarOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-[80]" onClick={() => setAvatarOpen(false)} />
              {/* Dropdown */}
              <div className="absolute right-0 top-11 z-[90] w-56 rounded-2xl bg-[#0f1117] border border-white/[0.08] shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* User info */}
                <div className="px-3 py-2.5 mb-1 border-b border-white/[0.06]">
                  <p className="text-sm font-semibold text-slate-100 truncate">
                    {user?.displayName ?? 'Usuário'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>

                <a
                  href="/profile"
                  onClick={() => setAvatarOpen(false)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-slate-300
                             hover:bg-white/[0.06] hover:text-slate-100 transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                  Meu Perfil
                </a>

                <button
                  onClick={() => { setAvatarOpen(false); signOut() }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-red-400
                             hover:bg-red-500/[0.08] hover:text-red-300 transition-colors mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
