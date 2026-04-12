'use client'

// ─────────────────────────────────────────────
//  Motion wrappers — Framer Motion primitives
//  Centraliza todas as animações do app
// ─────────────────────────────────────────────

import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/helpers'

// ── Shared variants ──────────────────────────

export const VARIANTS = {
  fadeInUp: {
    hidden:  { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  } satisfies Variants,

  fadeIn: {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  } satisfies Variants,

  scaleIn: {
    hidden:  { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] } },
  } satisfies Variants,

  slideInRight: {
    hidden:  { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  } satisfies Variants,

  stagger: {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
  } satisfies Variants,
}

// ── FadeInUp wrapper ─────────────────────────

interface FadeInUpProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function FadeInUp({ children, delay = 0, className }: FadeInUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── StaggerList ──────────────────────────────
// Wraps a list so children animate in staggered

interface StaggerListProps {
  children: React.ReactNode
  className?: string
  delayStart?: number
}

export function StaggerList({ children, className, delayStart = 0 }: StaggerListProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden:  {},
        visible: { transition: { staggerChildren: 0.07, delayChildren: delayStart } },
      }}
    >
      {children}
    </motion.div>
  )
}

// Item to use inside StaggerList
export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={VARIANTS.fadeInUp}>
      {children}
    </motion.div>
  )
}

// ── AnimatedCard ─────────────────────────────
// Card with hover lift + tap scale

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  delay?: number
}

export function AnimatedCard({ children, className, onClick, delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className={cn('card', className)}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

// ── AnimatedNumber ───────────────────────────
// Animates a number counting up from 0

interface AnimatedNumberProps {
  value: number
  duration?: number
  decimals?: number
  suffix?: string
  prefix?: string
  className?: string
}

export function AnimatedNumber({
  value,
  duration = 1.2,
  decimals = 0,
  suffix = '',
  prefix = '',
  className,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0)
  const prevValue = useRef(0)
  const rafRef    = useRef<number>(0)

  useEffect(() => {
    const start     = prevValue.current
    const end       = value
    const startTime = performance.now()
    const durationMs = duration * 1000

    function step(now: number) {
      const elapsed  = now - startTime
      const progress = Math.min(elapsed / durationMs, 1)
      // ease-out expo
      const eased    = 1 - Math.pow(1 - progress, 3)
      setDisplay(start + (end - start) * eased)
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
      else prevValue.current = end
    }

    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, duration])

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toString()

  return (
    <span className={cn('tabular-nums', className)}>
      {prefix}{formatted}{suffix}
    </span>
  )
}

// ── PageTransition ───────────────────────────
// Wraps page content for route transitions

export function PageTransition({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── PresenceItem ─────────────────────────────
// AnimatePresence wrapper for conditional elements

export function PresenceItem({
  show,
  children,
  className,
}: {
  show: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
          animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
          exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── ProgressBarAnimated ──────────────────────
// Framer-animated progress bar

interface ProgressAnimatedProps {
  value: number
  color?: string
  gradient?: string
  height?: number
  glowing?: boolean
  className?: string
}

export function ProgressBarAnimated({
  value,
  color = '#7c3aed',
  gradient,
  height = 8,
  glowing = false,
  className,
}: ProgressAnimatedProps) {
  const clamped    = Math.min(100, Math.max(0, value))
  const isComplete = clamped >= 100
  const fill       = gradient ?? (isComplete
    ? 'linear-gradient(90deg, #059669, #10b981)'
    : `linear-gradient(90deg, ${color}, ${color}cc)`)

  return (
    <div
      className={cn('w-full rounded-full overflow-hidden', className)}
      style={{ height, background: 'rgba(255,255,255,0.06)' }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: fill,
          boxShadow: glowing || isComplete ? `0 0 8px ${isComplete ? '#10b981' : color}80` : undefined,
        }}
      />
    </div>
  )
}
