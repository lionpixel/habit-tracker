// ─────────────────────────────────────────────
//  View: Projects
// ─────────────────────────────────────────────

'use client'

import { useState, useMemo, useEffect } from 'react'
import { Plus, Briefcase } from 'lucide-react'
import { useGoalsStore } from '@/store/goalsStore'
import { ProjectCard }     from './ProjectCard'
import { ProjectFormModal } from './ProjectFormModal'
import { FadeInUp, StaggerList, StaggerItem } from '@/components/ui/Motion'
import { StatCard } from '@/components/ui/StatCard'
import type { Project, GoalStatus } from '@/types/goals'
import { CheckCircle2, Clock, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/helpers'

type FilterStatus = 'all' | GoalStatus

export function ProjectsView() {
  const { projects, hydrated, hydrate } = useGoalsStore()
  const [formOpen,  setFormOpen]  = useState(false)
  const [editTarget,setEditTarget]= useState<Project | null>(null)
  const [filter,    setFilter]    = useState<FilterStatus>('all')

  useEffect(() => { if (!hydrated) hydrate() }, [hydrated, hydrate])

  const filtered = useMemo(() =>
    filter === 'all' ? projects : projects.filter((p) => p.status === filter),
    [projects, filter],
  )

  const done        = projects.filter((p) => p.status === 'done').length
  const inProgress  = projects.filter((p) => p.status === 'in_progress').length
  const notStarted  = projects.filter((p) => p.status === 'not_started').length
  const avgProgress = projects.length
    ? Math.round(projects.reduce((a, p) => a + p.progress, 0) / projects.length)
    : 0

  const FILTER_OPTIONS: { id: FilterStatus; label: string; count: number }[] = [
    { id: 'all',         label: 'Todos',        count: projects.length },
    { id: 'in_progress', label: 'Em Andamento',  count: inProgress },
    { id: 'not_started', label: 'Não iniciados', count: notStarted },
    { id: 'done',        label: 'Concluídos',    count: done },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeInUp>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
              <Briefcase size={20} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-100">Projetos</h2>
              <p className="text-slate-500 text-sm">Acompanhe suas iniciativas e entregas</p>
            </div>
          </div>
          <button type="button" onClick={() => { setEditTarget(null); setFormOpen(true) }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/15 text-indigo-300 text-sm font-semibold hover:bg-indigo-500/25 transition-colors">
            <Plus size={16} /> Novo Projeto
          </button>
        </div>
      </FadeInUp>

      {/* Stats */}
      <FadeInUp delay={0.04}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={<Briefcase size={17} />}    value={projects.length} label="Total"         color="#6366f1" compact />
          <StatCard icon={<Clock size={17} />}         value={inProgress}      label="Em Andamento"  color="#0ea5e9" compact />
          <StatCard icon={<CheckCircle2 size={17} />}  value={done}            label="Concluídos"    color="#10b981" compact />
          <StatCard icon={<TrendingUp size={17} />}    value={`${avgProgress}%`} label="Progresso"  color="#f59e0b" compact />
        </div>
      </FadeInUp>

      {/* Filters */}
      <FadeInUp delay={0.05}>
        <div className="flex gap-2 flex-wrap">
          {FILTER_OPTIONS.map(({ id, label, count }) => (
            <button key={id} type="button" onClick={() => setFilter(id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
                filter === id
                  ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40'
                  : 'bg-white/[0.05] text-slate-500 hover:text-slate-400',
              )}>
              {label}
              <span className={cn('text-[9px] font-black rounded-full px-1.5 py-0.5 tabular-nums min-w-[18px] text-center',
                filter === id ? 'bg-indigo-500/30 text-indigo-200' : 'bg-white/[0.08] text-slate-600')}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </FadeInUp>

      {/* Projects grid */}
      {filtered.length === 0 ? (
        <FadeInUp delay={0.06}>
          <div className="card p-10 text-center">
            <Briefcase size={36} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">
              {filter === 'all' ? 'Nenhum projeto cadastrado' : `Nenhum projeto ${filter === 'done' ? 'concluído' : 'neste status'}`}
            </p>
            {filter === 'all' && (
              <button type="button" onClick={() => setFormOpen(true)}
                className="mt-4 px-5 py-2 rounded-xl bg-indigo-500/15 text-indigo-300 text-sm font-bold hover:bg-indigo-500/25">
                Criar primeiro projeto
              </button>
            )}
          </div>
        </FadeInUp>
      ) : (
        <StaggerList className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((project) => (
            <StaggerItem key={project.id}>
              <ProjectCard
                project={project}
                onEdit={() => { setEditTarget(project); setFormOpen(true) }}
              />
            </StaggerItem>
          ))}
        </StaggerList>
      )}

      <ProjectFormModal
        open={formOpen}
        project={editTarget}
        onClose={() => { setFormOpen(false); setEditTarget(null) }}
      />
    </div>
  )
}
