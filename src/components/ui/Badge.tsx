import { cn } from '@/lib/helpers'

type BadgeVariant = 'violet' | 'cyan' | 'emerald' | 'amber' | 'red' | 'slate' | 'ghost'
  | 'default' | 'success' | 'warning' | 'danger' | 'info' | 'P1' | 'P2' | 'P3'
type BadgeSize    = 'sm' | 'md'

interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  children: React.ReactNode
  icon?: React.ReactNode
  dot?: boolean
  className?: string
}

const VARIANTS: Record<BadgeVariant, string> = {
  violet:  'bg-violet-500/12 text-violet-300 border border-violet-500/20',
  cyan:    'bg-cyan-500/12 text-cyan-300 border border-cyan-500/20',
  emerald: 'bg-emerald-500/12 text-emerald-300 border border-emerald-500/20',
  amber:   'bg-amber-500/12 text-amber-300 border border-amber-500/20',
  red:     'bg-red-500/12 text-red-300 border border-red-500/20',
  slate:   'bg-white/6 text-slate-400 border border-white/8',
  ghost:   'bg-transparent text-slate-400 border border-white/6',
  // legacy aliases
  default: 'bg-white/6 text-slate-300 border border-white/8',
  success: 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/20',
  warning: 'bg-amber-500/12 text-amber-400 border border-amber-500/20',
  danger:  'bg-red-500/12 text-red-400 border border-red-500/20',
  info:    'bg-cyan-500/12 text-cyan-400 border border-cyan-500/20',
  P1:      'bg-red-500/12 text-red-300 border border-red-500/20',
  P2:      'bg-amber-500/12 text-amber-300 border border-amber-500/20',
  P3:      'bg-emerald-500/12 text-emerald-300 border border-emerald-500/20',
}

const DOT_COLORS: Record<BadgeVariant, string> = {
  violet: 'bg-violet-400', cyan: 'bg-cyan-400', emerald: 'bg-emerald-400',
  amber: 'bg-amber-400',   red: 'bg-red-400',   slate: 'bg-slate-400',
  ghost: 'bg-slate-500',   default: 'bg-slate-400', success: 'bg-emerald-400',
  warning: 'bg-amber-400', danger: 'bg-red-400', info: 'bg-cyan-400',
  P1: 'bg-red-400', P2: 'bg-amber-400', P3: 'bg-emerald-400',
}

const SIZES: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[10px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
}

export function Badge({
  variant = 'slate',
  size = 'md',
  children,
  icon,
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-md',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', DOT_COLORS[variant])} />
      )}
      {icon && <span className="flex-shrink-0 leading-none">{icon}</span>}
      {children}
    </span>
  )
}
