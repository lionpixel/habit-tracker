'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useAppStore } from '@/store/appStore'
import { cn } from '@/lib/helpers'
import { RotateCcw, X, HardDrive } from 'lucide-react'

export function RestoreBanner() {
  const { backups, restore } = useAppStore()
  const [dismissed, setDismissed] = useState(false)

  if (backups.length === 0 || dismissed) return null

  const latestKey = backups[0]
  const dateStr   = latestKey.replace('habits_backup_', '')

  function handleRestore() {
    if (!confirm(`Restaurar backup de ${dateStr}? Os dados atuais serão substituídos.`)) return
    restore(latestKey)
    toast.success('Backup restaurado com sucesso!')
    setDismissed(true)
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 flex-wrap mb-6 px-4 py-3',
        'bg-amber-500/8 border border-amber-500/20 rounded-2xl',
        'animate-fade-in-down',
      )}
      role="alert"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
          <HardDrive className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <p className="text-amber-300 font-semibold text-xs">Backup disponível</p>
          <p className="text-slate-500 text-xs">Encontramos um backup de {dateStr}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleRestore}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold',
            'bg-amber-500/12 hover:bg-amber-500/20 border border-amber-500/20',
            'text-amber-300 transition-all duration-200',
          )}
        >
          <RotateCcw className="w-3 h-3" />
          Restaurar
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-400 hover:bg-white/[0.05] transition-all"
          aria-label="Dispensar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
