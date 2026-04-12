import { cn } from '@/lib/helpers'

interface StatCardProps {
  icon?: React.ReactNode
  value: string | number
  label: string
  meta?: string
  color?: string
  trend?: { value: number; label: string }
  className?: string
  compact?: boolean
}

export function StatCard({
  icon,
  value,
  label,
  meta,
  color = '#7c3aed',
  trend,
  compact = false,
  className,
}: StatCardProps) {
  const isPositive = (trend?.value ?? 0) >= 0

  return (
    <div
      className={cn(
        'card card-hover-lift relative overflow-hidden',
        compact ? 'p-4' : 'p-5',
        className,
      )}
      style={{ '--stat-color': `${color}22` } as React.CSSProperties}
    >
      {/* Top color accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-card"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}80, transparent)` }}
      />

      {/* Background radial glow */}
      <div
        className="absolute top-0 right-0 w-28 h-28 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color}18, transparent 70%)`,
          transform: 'translate(30%, -30%)',
        }}
      />

      <div className={cn('relative flex items-start gap-3', compact ? '' : 'gap-4')}>
        {/* Icon */}
        {icon && (
          <div
            className={cn(
              'rounded-xl flex items-center justify-center flex-shrink-0',
              compact ? 'w-8 h-8 text-base' : 'w-10 h-10 text-xl',
            )}
            style={{ background: `${color}18` }}
          >
            {icon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Value */}
          <div
            className={cn(
              'font-black leading-none tabular-nums',
              compact ? 'text-2xl' : 'text-3xl',
            )}
            style={{
              background: `linear-gradient(135deg, #f1f5f9, ${color})`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {value}
          </div>

          {/* Label */}
          <div className={cn(
            'text-slate-500 font-medium uppercase tracking-wider mt-1',
            compact ? 'text-[10px]' : 'text-xs',
          )}>
            {label}
          </div>

          {/* Meta */}
          {meta && (
            <div className="text-slate-600 text-[11px] mt-0.5">{meta}</div>
          )}
        </div>
      </div>

      {/* Trend indicator */}
      {trend && (
        <div className={cn(
          'absolute bottom-3 right-3 flex items-center gap-1 text-[10px] font-bold',
          isPositive ? 'text-emerald-400' : 'text-red-400',
        )}>
          <span>{isPositive ? '↑' : '↓'}</span>
          <span>{Math.abs(trend.value)}%</span>
        </div>
      )}
    </div>
  )
}
