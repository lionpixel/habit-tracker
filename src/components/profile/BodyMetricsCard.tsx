// ─────────────────────────────────────────────
//  Component: Body Metrics Card
// ─────────────────────────────────────────────

'use client'

import { Scale, Percent, Ruler, Activity } from 'lucide-react'
import { imcCategory } from '@/types/profile'
import type { PhysicalProfile } from '@/types/profile'

interface BodyMetricsCardProps {
  profile: PhysicalProfile
}

interface MetricItemProps {
  icon:    React.ReactNode
  label:   string
  value:   string | number | undefined
  unit?:   string
  color:   string
  sub?:    string
}

function MetricItem({ icon, label, value, unit, color, sub }: MetricItemProps) {
  const hasValue = value !== undefined && value !== null && value !== ''
  return (
    <div className="card p-4 flex items-start gap-3 overflow-hidden relative">
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}60, transparent)` }}
      />
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}1a` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{label}</div>
        {hasValue ? (
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-black text-slate-100 tabular-nums">{value}</span>
            {unit && <span className="text-xs text-slate-500 font-semibold">{unit}</span>}
          </div>
        ) : (
          <div className="text-xs text-slate-600 italic mt-0.5">—</div>
        )}
        {sub && <div className="text-[10px] mt-0.5" style={{ color }}>{sub}</div>}
      </div>
    </div>
  )
}

export function BodyMetricsCard({ profile }: BodyMetricsCardProps) {
  const imcInfo = profile.imc ? imcCategory(profile.imc) : null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <MetricItem
        icon={<Scale size={17} />}
        label="Peso"
        value={profile.weight != null ? profile.weight.toFixed(1) : undefined}
        unit="kg"
        color="#6366f1"
      />
      <MetricItem
        icon={<Percent size={17} />}
        label="% Gordura"
        value={profile.bodyFat != null ? profile.bodyFat.toFixed(1) : undefined}
        unit="%"
        color="#ef4444"
      />
      <MetricItem
        icon={<Activity size={17} />}
        label="IMC"
        value={profile.imc != null ? profile.imc.toFixed(1) : undefined}
        color={imcInfo?.color ?? '#64748b'}
        sub={imcInfo?.label}
      />
      <MetricItem
        icon={<Ruler size={17} />}
        label="Cintura"
        value={profile.waist}
        unit="cm"
        color="#10b981"
      />
      <MetricItem
        icon={<Activity size={17} />}
        label="Massa Magra"
        value={profile.leanMass != null ? profile.leanMass.toFixed(1) : undefined}
        unit="kg"
        color="#22d3ee"
      />
      <MetricItem
        icon={<Scale size={17} />}
        label="Massa Gorda"
        value={profile.fatMass != null ? profile.fatMass.toFixed(1) : undefined}
        unit="kg"
        color="#f97316"
      />
      <MetricItem
        icon={<Ruler size={17} />}
        label="Altura"
        value={profile.height}
        unit="cm"
        color="#8b5cf6"
      />
      <MetricItem
        icon={<Activity size={17} />}
        label="Idade"
        value={profile.age}
        unit="anos"
        color="#a78bfa"
      />
    </div>
  )
}
