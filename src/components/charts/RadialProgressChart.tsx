'use client'

interface RadialProgressChartProps {
  value:  number   // 0–100
  size?:  number
  color?: string
  label?: string
}

export function RadialProgressChart({
  value, size = 80, color = '#7c3aed', label,
}: RadialProgressChartProps) {
  const strokeWidth = size * 0.12
  const radius      = (size - strokeWidth * 2) / 2
  const circ        = 2 * Math.PI * radius
  const pct         = Math.max(0, Math.min(100, value))
  const dash        = circ * (pct / 100)
  const gap         = circ - dash
  const center      = size / 2

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {/* Track */}
        <circle
          cx={center} cy={center} r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={center} cy={center} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${gap}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.7s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-black text-slate-100 tabular-nums leading-none">
          {Math.round(pct)}%
        </span>
        {label && (
          <span className="text-[9px] text-slate-500 font-medium mt-0.5 leading-none">{label}</span>
        )}
      </div>
    </div>
  )
}
