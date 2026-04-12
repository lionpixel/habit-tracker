'use client'

// ─────────────────────────────────────────────
//  Hook: useAuth
//
//  Re-exports the AuthContext value from AuthProvider.
//  This file exists as a convenience import so consumers
//  can do `import { useAuth } from '@/hooks/useAuth'`
//  instead of importing directly from the provider.
//
//  When integrating NextAuth:
//    Replace the body with: return useSession()
//  When integrating Supabase:
//    Replace the body with: return useSupabaseUser()
// ─────────────────────────────────────────────

export { useAuth } from '@/providers/AuthProvider'
