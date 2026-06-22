'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

// ── Tipos ────────────────────────────────────

export interface UserProfile {
  id:          string
  email:       string
  displayName: string
  avatarUrl?:  string
  createdAt:   string
}

interface AuthContextValue {
  user:            UserProfile | null
  isLoading:       boolean
  isAuthenticated: boolean
  signOut:         () => Promise<void>
}

// ── Context ──────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
  user:            null,
  isLoading:       true,
  isAuthenticated: false,
  signOut:         async () => {},
})

// ── Helper ───────────────────────────────────

function toProfile(u: SupabaseUser): UserProfile {
  return {
    id:          u.id,
    email:       u.email ?? '',
    displayName: u.user_metadata?.full_name ?? u.email?.split('@')[0] ?? 'Usuário',
    avatarUrl:   u.user_metadata?.avatar_url,
    createdAt:   u.created_at,
  }
}

// ── Provider ─────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    // Sessão inicial
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ? toProfile(user) : null)
      setIsLoading(false)
    })

    // Listener para login / logout / refresh de token
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? toProfile(session.user) : null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: user !== null,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
