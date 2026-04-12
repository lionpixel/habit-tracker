'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/helpers'

// Keep easingFn in a ref so animation only restarts when value/duration changes

interface AnimatedCounterProps {
  value: number
  duration?: number        // seconds
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
  easingFn?: (t: number) => number
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export function AnimatedCounter({
  value,
  duration = 1.2,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
  easingFn = easeOutCubic,
}: AnimatedCounterProps) {
  const [displayed, setDisplayed] = useState(0)
  const prevValueRef = useRef(0)
  const rafRef       = useRef<number>(0)
  const easingRef    = useRef(easingFn)
  useEffect(() => { easingRef.current = easingFn })

  useEffect(() => {
    const from  = prevValueRef.current
    const to    = value
    const start = performance.now()
    const durationMs = duration * 1000

    cancelAnimationFrame(rafRef.current)

    function step(now: number) {
      const elapsed  = now - start
      const progress = Math.min(elapsed / durationMs, 1)
      const eased    = easingRef.current(progress)
      setDisplayed(from + (to - from) * eased)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        prevValueRef.current = to
      }
    }

    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, duration])

  const formatted = decimals > 0
    ? displayed.toFixed(decimals)
    : Math.round(displayed).toLocaleString('pt-BR')

  return (
    <span className={cn('tabular-nums', className)}>
      {prefix}{formatted}{suffix}
    </span>
  )
}
