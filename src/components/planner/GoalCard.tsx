// ─────────────────────────────────────────────
//  Component: GoalCard — universal card for any goal level
// ─────────────────────────────────────────────

'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import { ChevronDown, ChevronRight, Link2, Clock, Flag } from 'lucide-react'
import { cn } from '@/lib/helpers'
import {
  STATUS_LABELS, STATUS_COLORS,
  PRIORITY_LABELS, PRIORITY_COLORS,
  getDaysUntil,
} from '@/types/goals'
import type { BaseGoal, GoalLevel } from '@/types/goals'

function LucideIcon({ name, size = 16, style }: { name: string; size?: number; style?: React.CSSProperties }) {
  const Icon = (Icons as Record<string, unknown>)[name] as React.FC<{ size?: number; style?: React.CSSProperties }> | undefined
  if (!Icon) return <Icons.Target size={size} style={style} />
  return <Icon size={size} style={style} />
}

interface GoalCardProps {
  goal:         BaseGoal
  level:        GoalLevel
  parentTitle?: string    // name of parent goal
  childCount?:  number    // how many children
  childDone?:   number    // how many children done
  deadline?:    string    // YYYY-MM or YYYY-MM-DD
  onEdit?:      () => void
  onDelete?:    () => void
  onSetProgress?: (p: number) => void
  children?:    React.ReactNode   // expanded children
  compact?:     boolean
}

const LEVEL_LABELS: Record<GoalLevel, string> = {
  annual:    'Meta Anual',
  quarterly: 'Meta Trimestral',
  monthly:   'Meta Mensal',
  weekly:    'Meta Semanal',
  daily:     'Tarefa',
}

const LEVEL_COLORS: Record<GoalLevel, string> = {
  annual:    '#a78bfa',
  quarterly: '#6366f1',
  monthly:   '#0ea5e9',
  weekly:    '#10b981',
  daily:     '#f59e0b',
}

function DeadlinePill({ deadline }: { deadline: string }) {
  const days    = getDaysUntil(deadline)
  const overdue = days < 0
  const soon    = days <= 7 && days >= 0

  return (
    <div className={cn(
      'flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full',
      overdue ? 'bg-red-500/15 text-red-400'
        : soon  ? 'bg-amber-500/15 text-amber-400'
        : 'bg-white/[0.05] text-slate-500',
    )}>
      <Clock size={9} />
      {overdue
        ? `${Math.abs(days)}d atrasado`
        : days === 0 ? 'Hoje'
        : `${days}d`}
    </div>
  )
}

export function GoalCard({
  goal,
  level,
  parentTitle,
  childCount,
  childDone,
  deadline,
  onEdit,
  onDelete: _onDelete,
  onSetProgress,
  children,
  compact = false,
}: GoalCardProps) {
  const [expanded, setExpanded] = useState(false)

  const statusColor   = STATUS_COLORS[goal.status]
  const priorityColor = PRIORITY_COLORS[goal.priority]
  const levelColor    = goal.color ?? LEVEL_COLORS[level]
  const hasChildren   = (childCount ?? 0) > 0

  const progressWidth = Math.min(100, Math.max(0, goal.progress))

  return (
    <div
      className={cn(
        'card overflow-hidden transition-all duration-200',
        goal.status === 'cancelled' && 'opacity-50',
        compact ? '' : 'hover:border-white/[0.14]',
      )}
    >
      {/* Top gradient accent */}
      <div
        className="h-[2px]"
        style={{ background: `linear-gradient(90deg, ${levelColor}, ${levelColor}60, transparent)` }}
      />

      <div className={cn('p-4', compact && 'p-3')}>
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={cn(
              'rounded-xl flex items-center justify-center flex-shrink-0',
              compact ? 'w-8 h-8' : 'w-10 h-10',
            )}
            style={{ background: `${levelColor}18` }}
          >
            <LucideIcon name={goal.icon ?? 'Target'} size={compact ? 15 : 18} style={{ color: levelColor }} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Level badge + parent link */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                style={{ background: `${levelColor}18`, color: levelColor }}
              >
                {LEVEL_LABELS[level]}
              </span>
              {parentTitle && (
                <div className="flex items-center gap-1 text-[10px] text-slate-600">
                  <Link2 size={9} />
                  <span className="truncate max-w-[120px]">{parentTitle}</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h3 className={cn(
              'font-bold text-slate-100 leading-tight',
              compact ? 'text-sm' : 'text-base',
              goal.status === 'done' && 'line-through opacity-60',
            )}>
              {goal.title}
            </h3>

            {/* Description */}
            {!compact && goal.description && (
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{goal.description}</p>
            )}

            {/* Target value */}
            {goal.targetValue !== undefined && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500">
                  {goal.currentValue !== undefined
                    ? `${goal.targetUnit ?? ''}${goal.currentValue.toLocaleString('pt-BR')} / `
                    : ''}
                  <span className="font-bold text-slate-300">
                    {goal.targetUnit ?? ''}{goal.targetValue.toLocaleString('pt-BR')}
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {deadline && <DeadlinePill deadline={deadline} />}
            {hasChildren && (
              <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors"
              >
                {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-500 hover:text-slate-200 transition-colors"
              >
                <Icons.Edit2 size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              {/* Status badge */}
              <span
                className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                style={{ background: `${statusColor}18`, color: statusColor }}
              >
                {STATUS_LABELS[goal.status]}
              </span>
              {/* Priority */}
              <div className="flex items-center gap-0.5" style={{ color: priorityColor }}>
                <Flag size={9} />
                <span className="text-[9px] font-bold">{PRIORITY_LABELS[goal.priority]}</span>
              </div>
              {/* Category */}
              {goal.category && (
                <span className="text-[9px] text-slate-600 font-medium">{goal.category}</span>
              )}
            </div>
            <span className="text-xs font-black tabular-nums" style={{ color: levelColor }}>
              {goal.progress}%
            </span>
          </div>
          <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progressWidth}%`,
                backgroundColor: goal.status === 'done' ? '#10b981' : levelColor,
              }}
            />
          </div>
        </div>

        {/* Children count row */}
        {hasChildren && (
          <div className="flex items-center justify-between mt-2 text-[10px] text-slate-600">
            <span>{childDone ?? 0} / {childCount} concluídos</span>
            {onSetProgress && (
              <button
                type="button"
                onClick={() => onSetProgress(goal.progress === 100 ? 0 : 100)}
                className="text-slate-600 hover:text-emerald-400 transition-colors font-semibold"
              >
                {goal.progress === 100 ? 'Reabrir' : 'Marcar como concluído'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Expanded children */}
      {expanded && children && (
        <div className="border-t border-white/[0.04] bg-white/[0.01] px-4 pb-4 pt-3 space-y-2">
          {children}
        </div>
      )}
    </div>
  )
}

// ── Compact task row (for daily tasks in weekly view) ──

interface TaskRowProps {
  title:      string
  status:     'not_started' | 'in_progress' | 'done' | 'cancelled'
  priority:   'critical' | 'high' | 'medium' | 'low'
  dueTime?:   string
  onComplete: () => void
  onEdit?:    () => void
  onDelete?:  () => void
}

export function TaskRow({ title, status, priority, dueTime, onComplete, onEdit, onDelete }: TaskRowProps) {
  const done = status === 'done'
  return (
    <div className={cn(
      'flex items-center gap-3 p-2.5 rounded-xl transition-all group',
      done ? 'bg-white/[0.02] opacity-60' : 'bg-white/[0.03] hover:bg-white/[0.06]',
    )}>
      {/* Checkbox */}
      <button
        type="button"
        onClick={onComplete}
        className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
          done
            ? 'border-emerald-500 bg-emerald-500/20'
            : 'border-white/20 hover:border-emerald-500/60',
        )}
        style={!done ? { borderColor: PRIORITY_COLORS[priority] + '60' } : undefined}
      >
        {done && <Icons.Check size={10} className="text-emerald-400" />}
      </button>

      <div className="flex-1 min-w-0">
        <span className={cn('text-sm font-medium text-slate-300', done && 'line-through text-slate-600')}>
          {title}
        </span>
        {dueTime && (
          <span className="ml-2 text-[10px] text-slate-600">{dueTime}</span>
        )}
      </div>

      {/* Priority dot */}
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: PRIORITY_COLORS[priority] }} />

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button type="button" onClick={onEdit} className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:text-slate-300">
            <Icons.Edit2 size={11} />
          </button>
        )}
        {onDelete && (
          <button type="button" onClick={onDelete} className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:text-red-400">
            <Icons.Trash2 size={11} />
          </button>
        )}
      </div>
    </div>
  )
}
