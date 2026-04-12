// ─────────────────────────────────────────────
//  Design Tokens — fonte única da verdade
// ─────────────────────────────────────────────

export const COLORS = {
  // Brand
  brand: {
    violet:      '#7c3aed',
    violetLight: '#a855f7',
    violetDark:  '#6d28d9',
    cyan:        '#22d3ee',
    cyanDark:    '#0891b2',
    emerald:     '#10b981',
    emeraldDark: '#059669',
  },

  // Habit colors
  habits: {
    reading:  '#6366f1',
    english:  '#10b981',
    hiit:     '#ef4444',
    ppci:     '#f59e0b',
    dopamine: '#8b5cf6',
    fasting:  '#06b6d4',
  } as Record<string, string>,

  // Dark theme surfaces
  dark: {
    bg:         '#080b14',
    bgDeep:     '#050710',
    surface1:   '#0d1117',
    surface2:   '#111827',
    surface3:   '#1e293b',
    border:     'rgba(255,255,255,0.08)',
    borderHover:'rgba(255,255,255,0.14)',
    text:       '#f1f5f9',
    textSub:    '#94a3b8',
    textMuted:  '#64748b',
  },

  // Light theme surfaces
  light: {
    bg:         '#f8fafc',
    bgDeep:     '#f1f5f9',
    surface1:   '#ffffff',
    surface2:   '#f8fafc',
    surface3:   '#f1f5f9',
    border:     'rgba(0,0,0,0.08)',
    borderHover:'rgba(0,0,0,0.14)',
    text:       '#0f172a',
    textSub:    '#475569',
    textMuted:  '#94a3b8',
  },

  // Semantic
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    danger:  '#ef4444',
    info:    '#22d3ee',
  },
} as const

export const RADIUS = {
  xs:   '6px',
  sm:   '8px',
  md:   '12px',
  lg:   '16px',
  xl:   '20px',
  '2xl':'24px',
  full: '9999px',
} as const

export const SPACING = {
  1:  '4px',
  2:  '8px',
  3:  '12px',
  4:  '16px',
  5:  '20px',
  6:  '24px',
  8:  '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const

export const SHADOWS = {
  card:      '0 1px 3px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)',
  cardHover: '0 2px 8px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
  buttonViolet: '0 4px 16px rgba(124,58,237,0.4)',
  buttonCyan:   '0 4px 16px rgba(34,211,238,0.3)',
  glow: (color: string, opacity = 0.4) => `0 0 24px ${color}${Math.round(opacity * 255).toString(16).padStart(2,'0')}`,
} as const

export const TYPOGRAPHY = {
  // Font sizes in rem
  '2xs': '0.625rem',
  xs:    '0.75rem',
  sm:    '0.875rem',
  base:  '1rem',
  lg:    '1.125rem',
  xl:    '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',

  // Font weights
  normal:    400,
  medium:    500,
  semibold:  600,
  bold:      700,
  extrabold: 800,
  black:     900,
} as const

export const ANIMATION = {
  duration: {
    fast:    150,
    normal:  250,
    slow:    400,
    slower:  600,
  },
  easing: {
    spring:     [0.34, 1.56, 0.64, 1] as const,
    smooth:     [0.4, 0, 0.2, 1]      as const,
    easeOut:    [0.16, 1, 0.3, 1]     as const,
    easeInOut:  [0.4, 0, 0.2, 1]      as const,
  },
} as const

// Heatmap intensity levels (0-4 like GitHub)
export const HEATMAP_LEVELS = [
  { min: 0,  max: 0,   class: 'bg-white/[0.04]',    label: 'Nenhuma sessão' },
  { min: 1,  max: 25,  class: 'bg-violet-500/25',    label: '1–25% de consistência' },
  { min: 26, max: 50,  class: 'bg-violet-500/45',    label: '26–50% de consistência' },
  { min: 51, max: 75,  class: 'bg-violet-500/65',    label: '51–75% de consistência' },
  { min: 76, max: 100, class: 'bg-violet-500/90',    label: '76–100% de consistência' },
] as const

export const SIDEBAR_WIDTH   = 240
export const NAVBAR_HEIGHT   = 64
export const MOBILE_NAV_H    = 56
