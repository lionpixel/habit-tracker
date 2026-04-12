import { forwardRef } from 'react'
import { cn } from '@/lib/helpers'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'cyan' | 'subtle'
type Size    = 'xs' | 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
  iconRight?: React.ReactNode
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-violet-gradient text-white shadow-button-violet ' +
    'hover:opacity-90 hover:shadow-[0_6px_20px_rgba(124,58,237,0.5)]',
  secondary:
    'bg-emerald-gradient text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)] ' +
    'hover:opacity-90',
  cyan:
    'bg-cyan-gradient text-white shadow-button-cyan ' +
    'hover:opacity-90',
  danger:
    'bg-red-500/10 border border-red-500/25 text-red-400 ' +
    'hover:bg-red-500/18 hover:border-red-500/40',
  ghost:
    'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]',
  outline:
    'border border-white/10 text-slate-300 bg-transparent ' +
    'hover:bg-white/[0.05] hover:border-white/[0.16] hover:text-slate-200',
  subtle:
    'bg-white/[0.05] text-slate-300 border border-white/[0.06] ' +
    'hover:bg-white/[0.08] hover:text-slate-200 hover:border-white/[0.1]',
}

const SIZES: Record<Size, string> = {
  xs: 'px-2.5 py-1.5 text-xs rounded-lg gap-1.5',
  sm: 'px-3 py-2 text-xs rounded-xl gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-5 py-3 text-sm rounded-xl gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, iconRight, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70',
          'active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',
          'select-none',
          VARIANTS[variant],
          SIZES[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
        ) : icon ? (
          <span className="flex-shrink-0">{icon}</span>
        ) : null}
        {children}
        {iconRight && !loading && (
          <span className="flex-shrink-0">{iconRight}</span>
        )}
      </button>
    )
  },
)
Button.displayName = 'Button'
