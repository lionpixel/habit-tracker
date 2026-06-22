'use client'

interface DayData {
  label: string   // 'Seg', 'Ter', etc.
  pct:   number   // 0–100
  isToday?: boolean
}

interface WeeklyHeatmapStripProps {
  days: DayData[]
}

function cellColor(pct: number): string {
  if (pct === 0) return 'rgba(255,255,255,0.06)'
  if (pct < 30)  return 'rgba(124,58,237,0.2)'
  if (pct < 60)  return 'rgba(124,58,237,0.4)'
  if (pct < 90)  return 'rgba(124,58,237,0.65)'
  return '#7c3aed'
}

export function WeeklyHeatmapStrip({ days }: WeeklyHeatmapStripProps) {
  return (
    <div className="flex gap-1.5 items-end">
      {days.map((day, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div
            className="w-8 h-8 rounded-lg transition-all duration-500 relative"
            style={{ background: cellColor(day.pct) }}
            title={`${day.label}: ${Math.round(day.pct)}%`}
          >
            {day.isToday && (
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-violet-400 ring-2 ring-[#080b14]" />
            )}
          </div>
          <span className="text-[9px] text-slate-600 font-medium">{day.label}</span>
        </div>
      ))}
    </div>
  )
}
