// ─────────────────────────────────────────────
//  View: Relatório
// ─────────────────────────────────────────────

'use client'

import { useState }   from 'react'
import { toast }      from 'sonner'
import { useHabits }  from '@/hooks/useHabits'
import { useAppStore } from '@/store/appStore'
import { Button }     from '@/components/ui/Button'
import { StatCard }   from '@/components/ui/StatCard'
import { HabitIcon }  from '@/lib/habitIcons'
import { FadeInUp, StaggerList, StaggerItem } from '@/components/ui/Motion'
import { formatTime, formatDate, getWeekDates, formatMonthYear } from '@/lib/helpers'
import { HABIT_COLORS } from '@/lib/constants'
import {
  FileText, Download, CalendarDays, CalendarRange, User,
} from 'lucide-react'
import type { HabitKey } from '@/types/habit'

const HABIT_KEYS: HabitKey[] = ['reading', 'english', 'hiit', 'ppci', 'dopamine', 'fasting']

type ReportType = 'weekly' | 'monthly'

export function ReportView() {
  useAppStore()
  const { habits, currentWeek, currentYear, currentMonth, getWeekMinutes, getMonthMinutes } = useHabits()

  const [rptType,  setRptType]  = useState<ReportType>('weekly')
  const [userName, setUserName] = useState('')
  const [loading,  setLoading]  = useState(false)

  const previewData = HABIT_KEYS.map((key) => ({
    key,
    habit:   habits[key],
    minutes: rptType === 'weekly' ? getWeekMinutes(key) : getMonthMinutes(key),
    color:   HABIT_COLORS[key],
  }))

  const total = previewData.reduce((acc, d) => acc + d.minutes, 0)

  async function generateReport() {
    setLoading(true)
    try {
      const period = rptType === 'weekly'
        ? (() => {
            const { start, end } = getWeekDates(currentYear, currentWeek)
            return `Semana ${currentWeek} (${formatDate(start)}–${formatDate(end)})`
          })()
        : formatMonthYear(currentYear, currentMonth)

      const html = buildReportHtml(userName || 'Usuário', period, previewData, total)
      const blob = new Blob([html], { type: 'text/html' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url
      a.download = `habitdb-relatorio-${period.replace(/\s/g, '-')}.html`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Relatório gerado!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <FadeInUp>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
            <FileText size={20} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-100">Gerador de Relatórios</h2>
            <p className="text-slate-500 text-sm">Exportar dados em HTML</p>
          </div>
        </div>
      </FadeInUp>

      {/* Config card */}
      <FadeInUp delay={0.05}>
        <div className="card p-6 space-y-5">

          {/* Report type selector */}
          <div>
            <label className="text-xs text-slate-400 block mb-2 uppercase tracking-wider">Período</label>
            <div className="flex gap-2">
              {([
                { type: 'weekly',  label: 'Semanal', icon: CalendarDays },
                { type: 'monthly', label: 'Mensal',  icon: CalendarRange },
              ] as { type: ReportType; label: string; icon: React.ElementType }[]).map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => setRptType(type)}
                  className={[
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                    rptType === type
                      ? 'bg-indigo-600 text-white shadow-button-violet'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10',
                  ].join(' ')}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* User name */}
          <div>
            <label className="text-xs text-slate-400 block mb-1.5 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <User size={12} />
                Seu nome (opcional)
              </span>
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Ex: João"
              className="input w-full max-w-xs"
            />
          </div>

          <Button variant="primary" onClick={generateReport} loading={loading}>
            <Download size={16} className="mr-2" />
            Gerar Relatório HTML
          </Button>
        </div>
      </FadeInUp>

      {/* Preview */}
      <FadeInUp delay={0.1}>
        <div>
          <h3 className="text-lg font-bold text-slate-100 mb-4">
            Prévia —{' '}
            <span className="text-slate-400 font-medium">
              {rptType === 'weekly'
                ? `Semana ${currentWeek}`
                : formatMonthYear(currentYear, currentMonth)}
            </span>
          </h3>

          <StaggerList className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {previewData.map(({ key, habit, minutes, color }) => (
              <StaggerItem key={key}>
                <StatCard
                  icon={<HabitIcon id={habit.icon} size={16} style={{ color }} />}
                  value={formatTime(minutes)}
                  label={habit.name}
                  color={color}
                  compact
                />
              </StaggerItem>
            ))}
          </StaggerList>

          <div className="card p-4 mt-4 text-center">
            <span className="text-slate-400 text-sm">Total: </span>
            <span className="text-indigo-400 font-black text-xl tabular-nums">{formatTime(total)}</span>
          </div>
        </div>
      </FadeInUp>
    </div>
  )
}

// ── HTML report generator ─────────────────────

function buildReportHtml(
  name: string,
  period: string,
  data: { habit: { name: string; color: string }; minutes: number }[],
  total: number,
): string {
  const rows = data.map((d) => `
    <tr>
      <td style="padding:12px 16px;">${d.habit.name}</td>
      <td style="padding:12px 16px; color:${d.habit.color}; font-weight:700;">${formatTime(d.minutes)}</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>HabitDB Relatório — ${period}</title>
<style>
  body { font-family: 'Segoe UI', sans-serif; background: #020617; color: #f8fafc; padding: 32px; }
  h1 { background: linear-gradient(90deg, #6366f1, #8b5cf6, #10b981); -webkit-background-clip: text; color: transparent; }
  table { border-collapse: collapse; width: 100%; max-width: 480px; }
  tr:nth-child(even) { background: rgba(255,255,255,0.04); }
  td { border-bottom: 1px solid rgba(255,255,255,0.07); }
  .total { color: #6366f1; font-size: 1.5rem; font-weight: 900; }
</style>
</head>
<body>
<h1>HabitDB 2026</h1>
<p style="color:#94a3b8;">Relatório de ${name} — ${period}</p>
<br>
<table>${rows}</table>
<br>
<p>Total: <span class="total">${formatTime(total)}</span></p>
<p style="color:#475569; font-size:0.75rem; margin-top:32px;">Gerado por HabitDB em ${new Date().toLocaleDateString('pt-BR')}</p>
</body>
</html>`
}
