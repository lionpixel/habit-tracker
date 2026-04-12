import { cn } from '@/lib/helpers'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  size = 'md',
  className,
}: EmptyStateProps) {
  const sizes = {
    sm: 'py-8 gap-3',
    md: 'py-12 gap-4',
    lg: 'py-16 gap-5',
  }

  const iconSizes = {
    sm: 'w-10 h-10 text-2xl',
    md: 'w-14 h-14 text-3xl',
    lg: 'w-18 h-18 text-4xl',
  }

  return (
    <div className={cn('flex flex-col items-center text-center', sizes[size], className)}>
      {icon && (
        <div
          className={cn(
            'rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center',
            iconSizes[size],
          )}
        >
          {icon}
        </div>
      )}
      <div className="space-y-1.5">
        <h4 className="text-sm font-semibold text-slate-300">{title}</h4>
        {description && (
          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
