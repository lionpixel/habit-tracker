import { cn } from '@/lib/helpers'

interface ProgressBarProps {
  value: number          // 0-100
  color?: string         // hex
  gradient?: string      // CSS gradient string
  height?: 'xs' | 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
  glowing?: boolean
  className?: string
}

const HEIGHTS = {
  xs: 'h-0.5',
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}

export function ProgressBar({
  value,
  color = '#7c3aed',
  gradient,
  height = 'md',
  showLabel = false,
  animated = true,
  glowing = false,
  className,
}: ProgressBarProps) {
  const clamped    = Math.min(100, Math.max(0, value))
  const isComplete = clamped >= 100

  const fill = gradient
    ?? (isComplete
        ? 'linear-gradient(90deg, #10b981, #34d399)'
        : `linear-gradient(90deg, ${color}, ${color}cc)`)

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'w-full rounded-full overflow-hidden',
          HEIGHTS[height],
        )}
        style={{ background: 'rgba(255,255,255,0.06)' }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            'h-full rounded-full',
            animated ? 'transition-all duration-700 ease-out' : '',
          )}
          style={{
            width: `${clamped}%`,
            background: fill,
            boxShadow: glowing || isComplete
              ? `0 0 8px ${isComplete ? '#10b981' : color}80`
              : undefined,
          }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-slate-500 mt-1 block text-right tabular-nums">
          {clamped}%
        </span>
      )}
    </div>
  )
}
