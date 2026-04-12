'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useAppStore } from '@/store/appStore'
import { exportDataAsJson } from '@/services/storageService'
import { Download, Check } from 'lucide-react'
import { cn } from '@/lib/helpers'

export function ExportButton() {
  const { data, createBackup: doBackup } = useAppStore()
  const [success, setSuccess] = useState(false)

  function handleExport() {
    exportDataAsJson(data)
    doBackup()
    setSuccess(true)
    toast.success('Dados exportados!', { description: 'Backup criado automaticamente' })
    setTimeout(() => setSuccess(false), 2000)
  }

  return (
    <button
      onClick={handleExport}
      title="Exportar dados"
      aria-label="Exportar dados como JSON"
      className={cn(
        'fixed bottom-24 right-5 lg:bottom-6 lg:right-6 z-50',
        'w-12 h-12 rounded-2xl',
        'flex items-center justify-center',
        'transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500',
        'active:scale-90',
        success
          ? 'bg-emerald-500 shadow-[0_8px_24px_rgba(16,185,129,0.5)]'
          : 'bg-violet-gradient shadow-[0_8px_24px_rgba(124,58,237,0.4)] hover:shadow-[0_12px_32px_rgba(124,58,237,0.5)] hover:-translate-y-1',
      )}
    >
      {success
        ? <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
        : <Download className="w-4.5 h-4.5 text-white" />}
    </button>
  )
}
