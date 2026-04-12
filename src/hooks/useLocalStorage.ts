// ─────────────────────────────────────────────
//  Hook: useLocalStorage
// ─────────────────────────────────────────────
// Hook genérico para ler/escrever no localStorage com SSR safety.

'use client'

import { useState, useEffect, useCallback } from 'react'
import { safeParse } from '@/lib/helpers'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // Hidrata no cliente
  useEffect(() => {
    const item = localStorage.getItem(key)
    if (item !== null) {
      setStoredValue(safeParse<T>(item, initialValue))
    }
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value
        localStorage.setItem(key, JSON.stringify(next))
        return next
      })
    },
    [key],
  )

  const removeValue = useCallback(() => {
    localStorage.removeItem(key)
    setStoredValue(initialValue)
  }, [key, initialValue])

  return [storedValue, setValue, removeValue] as const
}