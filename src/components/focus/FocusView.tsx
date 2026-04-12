// ─────────────────────────────────────────────
//  View: Foco / Pomodoro
// ─────────────────────────────────────────────

'use client'

import { useState }    from 'react'
import { toast }       from 'sonner'
import { useFocus }    from '@/hooks/useFocus'
import { StatCard }    from '@/components/ui/StatCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button }      from '@/components/ui/Button'
import { Badge }       from '@/components/ui/Badge'
import { FadeInUp } from '@/components/ui/Motion'
import { cn, formatTime }  from '@/lib/helpers'
import type { TaskPriority } from '@/types/focus'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import type { TooltipProps } from 'recharts'
import {
  Sun, CalendarDays, Flame, Brain,
  Plus, ClipboardList, Timer,
  Trash2,
} from 'lucide-react'

function FocusTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 border border-white/10 shadow-card text-sm">
      <p className="text-slate-400 text-xs">{payload[0].payload.dia}</p>
      <p className="font-bold text-indigo-400">{formatTime(payload[0].value as number)}</p>
    </div>
  )
}

export function FocusView() {
  const {
    metrics, monthlyData, recentSessions, todayData,
    goalHours, monthProgress,
    handleAddTask, handleRemoveTask, handleTogglePomo, setGoalHours,
  } = useFocus()

  const [taskName,   setTaskName]   = useState('')
  const [priority,   setPriority]   = useState<TaskPriority>('P1')
  const [goalInput,  setGoalInput]  = useState(String(goalHours))

  function submitTask() {
    if (!taskName.trim()) { toast.error('Digite o nome da tarefa.'); return }
    const ok = handleAddTask(taskName, priority)
    if (!ok) { toast.warning(`Limite de tarefas ${priority} atingido!`); return }
    setTaskName('')
    toast.success('Tarefa adicionada!')
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <FadeInUp>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
            <Brain size={20} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-100">Módulo de Foco</h2>
            <p className="text-slate-500 text-sm">Sessões Pomodoro e Deep Work</p>
          </div>
        </div>
      </FadeInUp>

      {/* Hero: meta mensal */}
      <FadeInUp delay={0.05}>
        <div className="card p-6">
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Foco no Mês</div>
              <div className="text-5xl font-black text-indigo-400 tabular-nums">
                {Math.round(metrics.month / 60)}h
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-slate-100 tabular-nums">{monthProgress}%</div>
              <div className="text-slate-400 text-xs">da meta</div>
            </div>
          </div>
          <ProgressBar
            value={monthProgress}
            color={monthProgress >= 100 ? '#10b981' : '#6366f1'}
            height="lg"
            className="mb-4"
          />
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              className="input w-24 text-sm"
              min={1}
              max={200}
            />
            <span className="text-slate-400 text-sm">horas/mês de meta</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setGoalHours(Number(goalInput)); toast.success('Meta atualizada!') }}
            >
              Salvar
            </Button>
          </div>
        </div>
      </FadeInUp>

      {/* Quick stats */}
      <FadeInUp delay={0.1}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Sun size={18} />}         value={formatTime(metrics.today)} label="Hoje"           color="#6366f1" />
          <StatCard icon={<CalendarDays size={18} />} value={formatTime(metrics.week)}  label="Esta Semana"   color="#10b981" />
          <StatCard icon={<Flame size={18} />}        value={`${metrics.streak}d`}       label="Streak"        color="#ef4444" />
          <StatCard icon={<Brain size={18} />}        value={metrics.deepWorkDays}        label="Deep Work Days" color="#8b5cf6" />
        </div>
      </FadeInUp>

      {/* Daily bar chart */}
      <FadeInUp delay={0.12}>
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
              <Timer size={16} className="text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Foco diário no mês</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={monthlyData.labels.map((d, i) => ({ dia: d, min: monthlyData.values[i] }))}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="dia"
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}m`}
              />
              <Tooltip content={<FocusTooltip />} />
              <Bar dataKey="min" radius={[4, 4, 0, 0]} fill="#6366f1" fillOpacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </FadeInUp>

      {/* Add task */}
      <FadeInUp delay={0.14}>
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <Plus size={16} className="text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Adicionar Tarefa</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitTask()}
              placeholder="Nome da tarefa..."
              className="input flex-1 min-w-48"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="input w-auto"
            >
              <option value="P1">P1 — Alta</option>
              <option value="P2">P2 — Média</option>
              <option value="P3">P3 — Baixa</option>
            </select>
            <Button variant="danger" onClick={submitTask}>
              Adicionar
            </Button>
          </div>
        </div>
      </FadeInUp>

      {/* Task list */}
      {todayData.tasks.length > 0 && (
        <FadeInUp delay={0.16}>
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center">
                <ClipboardList size={16} className="text-sky-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Tarefas de Hoje</h3>
            </div>
            <div className="space-y-3">
              {todayData.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/8 transition-all border border-white/5"
                >
                  <Badge variant={task.priority}>{task.priority}</Badge>
                  <span className="flex-1 text-slate-200 text-sm truncate">{task.name}</span>

                  {/* Pomodoro dots */}
                  <div className="flex gap-1.5">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handleTogglePomo(task.id, i)}
                        className={cn(
                          'w-3.5 h-3.5 rounded-full border transition-all hover:scale-110',
                          i < task.pomodoros
                            ? 'bg-red-500 border-red-400 shadow-[0_0_6px_#ef4444]'
                            : 'bg-transparent border-white/20 hover:border-red-400',
                        )}
                      />
                    ))}
                  </div>

                  <span className="text-slate-400 text-xs min-w-12 text-right tabular-nums">
                    {formatTime(task.pomodoros * 25)}
                  </span>

                  <button
                    onClick={() => handleRemoveTask(task.id)}
                    className="w-7 h-7 rounded-lg text-red-400 hover:bg-red-400/10 flex items-center justify-center transition-all hover:scale-105"
                    title="Remover tarefa"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </FadeInUp>
      )}

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <FadeInUp delay={0.18}>
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                <Timer size={16} className="text-violet-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Sessões Recentes</h3>
            </div>
            <div className="space-y-2">
              {recentSessions.slice(0, 10).map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 bg-white/5 rounded-lg">
                  <Badge variant={s.priority}>{s.priority}</Badge>
                  <span className="flex-1 text-slate-300 text-sm truncate">{s.taskName}</span>
                  <span className="text-slate-500 text-xs">{s.date}</span>
                  <span className="text-indigo-400 font-semibold text-sm min-w-16 text-right tabular-nums">
                    {formatTime(s.minutes)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </FadeInUp>
      )}
    </div>
  )
}
