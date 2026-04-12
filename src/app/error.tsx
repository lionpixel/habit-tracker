// ─────────────────────────────────────────────
//  Error Boundary — captura erros em runtime
// ─────────────────────────────────────────────

'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorProps {
  error:  Error & { digest?: string }
  reset:  () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to an error reporting service when integrated
    console.error('[HabitDB Error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-red-500/15 flex items-center justify-center mb-5">
        <AlertTriangle size={28} className="text-red-400" />
      </div>
      <h2 className="text-xl font-black text-slate-100 mb-2">Algo deu errado</h2>
      <p className="text-slate-500 text-sm mb-2 max-w-sm">
        Ocorreu um erro inesperado. Tente novamente ou recarregue a página.
      </p>
      {error.digest && (
        <p className="text-slate-700 text-xs mb-6 font-mono">ID: {error.digest}</p>
      )}
      <button
        type="button"
        onClick={reset}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-500/20 text-violet-300 font-semibold text-sm hover:bg-violet-500/30 transition-colors"
      >
        <RefreshCw size={15} />
        Tentar novamente
      </button>
    </div>
  )
}
