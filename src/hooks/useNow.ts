'use client'

// ─────────────────────────────────────────────
//  Hook: useNow
//  Fornece um Date reativo que atualiza automaticamente.
//  Força re-render de cálculos baseados em tempo real.
// ─────────────────────────────────────────────

import { useState, useEffect } from 'react'

/**
 * @param intervalMs Intervalo de atualização em ms (padrão 60s)
 * @returns Date atual atualizado automaticamente
 */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
