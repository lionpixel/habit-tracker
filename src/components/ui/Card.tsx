import { cn } from '@/lib/helpers'

interface CardProps {
  children: React.ReactNode
  className?: string
  active?: boolean
  hoverable?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  as?: React.ElementType
}

const PADDING = {
  none: '',
  sm:   'p-4',
  md:   'p-5',
  lg:   'p-6',
}

export function Card({
  children,
  className,
  active = false,
  hoverable = false,
  padding = 'md',
  as: Tag = 'div',
}: CardProps) {
  return (
    <Tag
      className={cn(
        'card',
        active && 'card-active',
        hoverable && 'card-hover-lift',
        PADDING[padding],
        className,
      )}
    >
      {children}
    </Tag>
  )
}

/* Section header within a card */
export function CardHeader({
  title,
  subtitle,
  action,
  icon,
  className,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  icon?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-5', className)}>
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center flex-shrink-0 text-base">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-100 leading-tight truncate">{title}</h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
