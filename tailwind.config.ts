import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ── Color Tokens ─────────────────────────────
      colors: {
        // Brand palette
        brand: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        // Accent colors
        violet: {
          neon: '#a855f7',
          glow: '#7c3aed',
        },
        cyan: {
          neon: '#22d3ee',
          glow: '#0891b2',
        },
        emerald: {
          neon: '#10b981',
          glow: '#059669',
        },
        // Surface colors
        surface: {
          50:  'rgba(255,255,255,0.08)',
          100: 'rgba(255,255,255,0.06)',
          200: 'rgba(255,255,255,0.04)',
          300: 'rgba(255,255,255,0.02)',
          border: 'rgba(255,255,255,0.08)',
          'border-hover': 'rgba(255,255,255,0.16)',
        },
        // Background layers
        bg: {
          base:    '#080b14',
          deep:    '#050710',
          card:    '#0d1117',
          'card-hover': '#111827',
          sidebar: '#090c16',
          nav:     'rgba(8,11,20,0.85)',
        },
        // Text hierarchy
        text: {
          primary:   '#f1f5f9',
          secondary: '#94a3b8',
          tertiary:  '#64748b',
          muted:     '#475569',
          inverse:   '#0f172a',
        },
        // Semantic colors
        success: '#10b981',
        warning: '#f59e0b',
        danger:  '#ef4444',
        info:    '#0ea5e9',
      },

      // ── Background Images ─────────────────────────
      backgroundImage: {
        // App backgrounds
        'app-base': 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(120,40,200,0.15), transparent), linear-gradient(180deg, #080b14 0%, #050710 100%)',
        'sidebar-bg': 'linear-gradient(180deg, #090c16 0%, #070a12 100%)',

        // Gradient fills
        'brand-gradient':   'linear-gradient(135deg, #7c3aed, #a855f7, #22d3ee)',
        'violet-gradient':  'linear-gradient(135deg, #6d28d9, #a855f7)',
        'cyan-gradient':    'linear-gradient(135deg, #0891b2, #22d3ee)',
        'emerald-gradient': 'linear-gradient(135deg, #059669, #10b981)',
        'amber-gradient':   'linear-gradient(135deg, #d97706, #f59e0b)',
        'red-gradient':     'linear-gradient(135deg, #dc2626, #ef4444)',
        'indigo-gradient':  'linear-gradient(135deg, #4f46e5, #6366f1)',

        // Card surfaces
        'card-glass':  'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        'card-active': 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(168,85,247,0.06) 100%)',

        // Shimmer
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
      },

      // ── Box Shadow ────────────────────────────────
      boxShadow: {
        'card':        '0 1px 3px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card-hover':  '0 2px 8px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        'card-glow-violet': '0 0 0 1px rgba(124,58,237,0.3), 0 8px 32px rgba(124,58,237,0.15)',
        'card-glow-cyan':   '0 0 0 1px rgba(34,211,238,0.3), 0 8px 32px rgba(34,211,238,0.12)',
        'card-glow-emerald':'0 0 0 1px rgba(16,185,129,0.3), 0 8px 32px rgba(16,185,129,0.12)',
        'button-violet':    '0 4px 16px rgba(124,58,237,0.4), 0 1px 3px rgba(0,0,0,0.3)',
        'button-cyan':      '0 4px 16px rgba(34,211,238,0.3), 0 1px 3px rgba(0,0,0,0.3)',
        'sidebar':      '1px 0 0 rgba(255,255,255,0.04)',
        'nav':          '0 1px 0 rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.4)',
        'glow-sm':      '0 0 12px rgba(124,58,237,0.5)',
        'glow-md':      '0 0 24px rgba(124,58,237,0.4)',
        'inner-border': 'inset 0 1px 0 rgba(255,255,255,0.08)',
      },

      // ── Border Radius ─────────────────────────────
      borderRadius: {
        'xs':   '6px',
        'card': '16px',
        'card-lg': '20px',
        'pill': '9999px',
      },

      // ── Typography ────────────────────────────────
      fontFamily: {
        sans:    ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-cal)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      letterSpacing: {
        'tighter-plus': '-0.04em',
      },

      // ── Spacing ───────────────────────────────────
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '72': '18rem',
        '80': '20rem',
        '88': '22rem',
        '240': '60rem',
      },

      // ── Transitions ───────────────────────────────
      transitionTimingFunction: {
        'spring':      'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth':      'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-in':   'cubic-bezier(0.6, -0.28, 0.74, 0.05)',
        'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        '50':  '50ms',
        '350': '350ms',
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },

      // ── Animations ────────────────────────────────
      animation: {
        // Entry
        'fade-in':         'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in-up':      'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in-down':    'fadeInDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-right':  'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-left':   'slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in':        'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'pop-in':          'popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        // Continuous
        'shimmer':         'shimmer 2.5s infinite',
        'pulse-glow':      'pulseGlow 2.5s ease-in-out infinite',
        'float':           'float 3s ease-in-out infinite',
        'spin-slow':       'spin 4s linear infinite',
        'bounce-soft':     'bounceSoft 1s ease-in-out infinite',
        // Progress
        'progress-fill':   'progressFill 1s cubic-bezier(0.16, 1, 0.3, 1) both',
        // Alert
        'pulse-alert':     'pulseAlert 2s ease-in-out infinite',
        // Skeleton
        'skeleton':        'skeleton 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%':   { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        popIn: {
          '0%':   { opacity: '0', transform: 'scale(0.7)' },
          '80%':  { transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%':      { opacity: '0.8', filter: 'brightness(1.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
        progressFill: {
          '0%':   { width: '0%' },
        },
        pulseAlert: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        skeleton: {
          '0%':   { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
        },
      },

      // ── Backdrop Blur ─────────────────────────────
      backdropBlur: {
        'xs': '4px',
        'nav': '20px',
      },

      // ── Z-index ───────────────────────────────────
      zIndex: {
        'sidebar': '40',
        'nav':     '50',
        'modal':   '60',
        'toast':   '70',
      },
    },
  },
  plugins: [],
}

export default config
