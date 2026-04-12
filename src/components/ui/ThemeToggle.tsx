'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/helpers'

interface ThemeToggleProps {
  className?: string
  size?: 'sm' | 'md'
}

export function ThemeToggle({ className, size = 'md' }: ThemeToggleProps) {
  const { theme, toggle } = useTheme()

  const dim = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9'
  const iconDim = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'

  return (
    <button
      onClick={toggle}
      title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      className={cn(
        dim,
        'rounded-xl flex items-center justify-center',
        'bg-white/[0.05] hover:bg-white/[0.09]',
        'border border-white/[0.07] hover:border-white/[0.12]',
        'text-slate-400 hover:text-slate-200',
        'transition-all duration-200 active:scale-90',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60',
        className,
      )}
    >
      {theme === 'dark'
        ? <Sun className={cn(iconDim, 'text-amber-400')} strokeWidth={2} />
        : <Moon className={cn(iconDim, 'text-violet-400')} strokeWidth={2} />}
    </button>
  )
}
