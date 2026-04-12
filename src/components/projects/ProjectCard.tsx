// ─────────────────────────────────────────────
//  Component: Project Card
// ─────────────────────────────────────────────

'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { ChevronDown, ChevronRight, Flag } from 'lucide-react'
import { cn } from '@/lib/helpers'
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from '@/types/goals'
import type { Project } from '@/types/goals'
import { useGoalsStore } from '@/store/goalsStore'

function LucideIcon({ name, size = 16, style }: { name: string; size?: number; style?: React.CSSProperties }) {
  const Icon = (Icons as Record<string, unknown>)[name] as React.FC<{ size?: number; style?: React.CSSProperties }> | undefined
  if (!Icon) return <Icons.Briefcase size={size} style={style} />
  return <Icon size={size} style={style} />
}

interface ProjectCardProps {
  project: Project
  onEdit?: () => void
}

export function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const { toggleMilestone, deleteMilestone } = useGoalsStore()
  const [expanded, setExpanded] = useState(false)

  const color         = project.color ?? '#6366f1'
  const statusColor   = STATUS_COLORS[project.status]
  const priorityColor = PRIORITY_COLORS[project.priority]
  const milestoneDone = project.milestones.filter((m) => m.completed).length
  const milestoneTotal = project.milestones.length

  return (
    <div className={cn('card overflow-hidden transition-all duration-200 hover:border-white/[0.14]',
      project.status === 'cancelled' && 'opacity-50')}>
      {/* Top accent */}
      <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${color}, ${color}60, transparent)` }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
            <LucideIcon name={project.icon ?? 'Briefcase'} size={18} style={{ color }} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-100 leading-tight">{project.name}</h3>
            {project.description && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{project.description}</p>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {project.milestones.length > 0 && (
              <button type="button" onClick={() => setExpanded((e) => !e)}
                className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center text-slate-500 hover:text-slate-300">
                {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </button>
            )}
            {onEdit && (
              <button type="button" onClick={onEdit}
                className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-500 hover:text-slate-200">
                <Icons.Edit2 size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
            style={{ background: `${statusColor}18`, color: statusColor }}>
            {STATUS_LABELS[project.status]}
          </span>
          <div className="flex items-center gap-0.5" style={{ color: priorityColor }}>
            <Flag size={9} />
            <span className="text-[9px] font-bold">{PRIORITY_LABELS[project.priority]}</span>
          </div>
          {project.category && <span className="text-[10px] text-slate-600">{project.category}</span>}
          {project.deadline && (
            <span className="text-[10px] text-slate-600">
              <Icons.Clock size={9} className="inline mr-0.5" />
              {project.deadline}
            </span>
          )}
        </div>

        {/* Progress */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-600">
              {milestoneTotal > 0
                ? `${milestoneDone}/${milestoneTotal} marcos`
                : 'Progresso manual'}
            </span>
            <span className="text-xs font-black tabular-nums" style={{ color }}>{project.progress}%</span>
          </div>
          <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${project.progress}%`, backgroundColor: project.status === 'done' ? '#10b981' : color }} />
          </div>
        </div>
      </div>

      {/* Milestones */}
      {expanded && project.milestones.length > 0 && (
        <div className="border-t border-white/[0.04] px-4 pb-4 pt-3 space-y-1.5">
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">Marcos</div>
          {project.milestones.map((m) => (
            <div key={m.id} className="flex items-center gap-2.5 group">
              <button type="button" onClick={() => toggleMilestone(project.id, m.id)}
                className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                style={m.completed
                  ? { borderColor: '#10b981', background: '#10b98120' }
                  : { borderColor: color + '40' }
                }>
                {m.completed && <Icons.Check size={10} className="text-emerald-400" />}
              </button>
              <span className={cn('flex-1 text-xs text-slate-300', m.completed && 'line-through text-slate-600')}>
                {m.title}
              </span>
              {m.deadline && (
                <span className="text-[10px] text-slate-600 tabular-nums">{m.deadline}</span>
              )}
              <button type="button" onClick={() => deleteMilestone(project.id, m.id)}
                className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center text-slate-700 hover:text-red-400 transition-all">
                <Icons.X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
