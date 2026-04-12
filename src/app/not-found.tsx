// ─────────────────────────────────────────────
//  404 — Página não encontrada
// ─────────────────────────────────────────────

import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '404 — Página não encontrada' }

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-violet-500/15 flex items-center justify-center mb-6">
        <span className="text-4xl font-black text-violet-400">4</span>
        <span className="text-4xl font-black text-indigo-400">0</span>
        <span className="text-4xl font-black text-violet-400">4</span>
      </div>
      <h1 className="text-2xl font-black text-slate-100 mb-2">Página não encontrada</h1>
      <p className="text-slate-500 text-sm mb-8 max-w-sm">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link
        href="/weekly"
        className="px-6 py-3 rounded-xl bg-violet-500/20 text-violet-300 font-semibold text-sm hover:bg-violet-500/30 transition-colors"
      >
        Voltar ao início
      </Link>
    </div>
  )
}
