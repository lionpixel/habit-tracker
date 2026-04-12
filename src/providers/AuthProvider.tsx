'use client'

// ─────────────────────────────────────────────
//  Auth Provider — preparado para NextAuth / Supabase
//  Atualmente serve o perfil local do authService.
//  Quando ativar NextAuth: envolva com <SessionProvider>
//  Quando ativar Supabase: use supabase.auth.onAuthStateChange()
// ─────────────────────────────────────────────

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { authService, type UserProfile } from '@/services/authService'

interface AuthContextValue {
  user:          UserProfile | null
  isLoading:     boolean
  isAuthenticated: boolean
  signOut:       () => Promise<void>
  refreshUser:   () => void
}

const AuthContext = createContext<AuthContextValue>({
  user:            null,
  isLoading:       true,
  isAuthenticated: false,
  signOut:         async () => {},
  refreshUser:     () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  function refreshUser() {
    const profile = authService.getProfile()
    setUser(profile)
    setIsLoading(false)
  }

  useEffect(() => {
    refreshUser()
  }, [])

  async function signOut() {
    await authService.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: user !== null,
      signOut,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
