// ─────────────────────────────────────────────
//  Motion variants — Framer Motion config
//  Fonte única de verdade para animações
// ─────────────────────────────────────────────

import type { Variants, Transition, TargetAndTransition } from 'framer-motion'

// ── Shared transitions ───────────────────────

export const spring: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
}

export const springBouncy: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 20,
}

export const easeOutExpo: Transition = {
  duration: 0.4,
  ease: [0.16, 1, 0.3, 1],
}

export const easeSmooth: Transition = {
  duration: 0.25,
  ease: [0.4, 0, 0.2, 1],
}

// ── Variants ─────────────────────────────────

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
}

export const fadeInUp: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0,  transition: easeOutExpo },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

export const fadeInDown: Variants = {
  hidden:  { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0,   transition: easeOutExpo },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.2 } },
}

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] } },
  exit:    { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
}

export const slideInLeft: Variants = {
  hidden:  { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: easeOutExpo },
  exit:    { opacity: 0, x: -16, transition: { duration: 0.2 } },
}

export const slideInRight: Variants = {
  hidden:  { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: easeOutExpo },
  exit:    { opacity: 0, x: 16, transition: { duration: 0.2 } },
}

export const staggerContainer: Variants = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren:   0.05,
    },
  },
}

export const staggerFast: Variants = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren:   0.02,
    },
  },
}

export const cardHover = {
  rest:  { y: 0,  boxShadow: '0 1px 3px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.25)' },
  hover: { y: -3, boxShadow: '0 4px 12px rgba(0,0,0,0.5), 0 20px 60px rgba(0,0,0,0.4)', transition: { duration: 0.2 } },
}

export const popIn: Variants = {
  hidden:  { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale:   1,
    transition: { type: 'spring', stiffness: 500, damping: 20 },
  },
}

export const sidebarItem: Variants = {
  hidden:  { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: easeOutExpo },
}

// ── Page transition preset ───────────────────

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.2 } },
}

// ── Utility: delay offset ────────────────────

export const withDelay = (variants: Variants, delay: number): Variants => ({
  ...variants,
  visible: {
    ...(typeof variants.visible === 'object' ? variants.visible : {}),
    transition: {
      ...((typeof variants.visible === 'object' && 'transition' in variants.visible)
        ? (variants.visible as TargetAndTransition).transition
        : {}),
      delay,
    },
  },
})
