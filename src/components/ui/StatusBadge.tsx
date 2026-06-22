'use client'

export type BadgeStatus = 'critico' | 'alto' | 'alerta' | 'positivo' | 'neutro'

const COLORS: Record<BadgeStatus, string> = {
  critico:  'bg-red-500/20    text-red-400    border-red-500/30',
  alto:     'bg-orange-500/20 text-orange-400 border-orange-500/30',
  alerta:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  positivo: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  neutro:   'bg-white/10      text-white/60   border-white/20',
}

const LABELS: Record<BadgeStatus, string> = {
  critico:  'Crítico',
  alto:     'Alto',
  alerta:   'Alerta',
  positivo: 'Positivo',
  neutro:   'Neutro',
}

interface StatusBadgeProps {
  status: BadgeStatus
  label?: string
  className?: string
}

export function StatusBadge({ status, label, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border
        ${COLORS[status]} ${className}`}
    >
      {label ?? LABELS[status]}
    </span>
  )
}
