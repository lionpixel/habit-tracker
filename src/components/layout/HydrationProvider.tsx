// ─────────────────────────────────────────────
//  Provider: Hidratação do store no cliente
// ─────────────────────────────────────────────
// Necessário para SSR: o store é hidratado apenas no cliente
// após a montagem do componente.

'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import { Header } from './Header'
import { TabNav } from './TabNav'
import { RestoreBanner } from './RestoreBanner'
import { ExportButton } from './ExportButton'

export function HydrationProvider({ children }: { children: React.ReactNode }) {
  const { hydrate, hydrated } = useAppStore()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  if (!hydrated) {
    // Skeleton de carregamento
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-4xl">⚗️</div>
          <p className="text-slate-400 text-sm">Carregando HabitDB...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-[1800px] mx-auto px-4 py-5">
      <Header />
      <RestoreBanner />
      <TabNav />
      <main className="animate-fade-in">
        {children}
      </main>
      <ExportButton />
    </div>
  )
}