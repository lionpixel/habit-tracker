import { cn } from '@/lib/helpers'

interface SkeletonProps {
  className?: string
  rounded?: 'sm' | 'md' | 'lg' | 'full'
}

export function Skeleton({ className, rounded = 'md' }: SkeletonProps) {
  const radius = {
    sm:   'rounded',
    md:   'rounded-lg',
    lg:   'rounded-2xl',
    full: 'rounded-full',
  }[rounded]

  return (
    <div
      className={cn(
        'skeleton',
        radius,
        className,
      )}
    />
  )
}

export function HabitCardSkeleton() {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 flex-shrink-0" rounded="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="w-7 h-7" rounded="lg" />
      </div>
      <div className="text-center space-y-2 py-2">
        <Skeleton className="h-10 w-20 mx-auto" rounded="lg" />
        <Skeleton className="h-3 w-24 mx-auto" />
      </div>
      <Skeleton className="h-2 w-full" rounded="full" />
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-12" rounded="lg" />
        <Skeleton className="h-12" rounded="lg" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-9" rounded="lg" />
        <Skeleton className="h-9" rounded="lg" />
      </div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 flex-shrink-0" rounded="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
    </div>
  )
}
