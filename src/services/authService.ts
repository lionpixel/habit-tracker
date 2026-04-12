// ─────────────────────────────────────────────
//  Auth Service — preparado para NextAuth / Supabase
//  Atualmente: mock local. Substituir pelos
//  providers reais quando o backend estiver pronto.
// ─────────────────────────────────────────────

export interface UserProfile {
  id:          string
  email:       string
  displayName: string
  avatarUrl?:  string
  createdAt:   string
}

const PROFILE_KEY = 'habitdb-user-profile'

// ── Local mock ───────────────────────────────

function getLocalProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveLocalProfile(profile: UserProfile) {
  if (typeof window === 'undefined') return
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

// ── Public API ───────────────────────────────

export const authService = {
  /**
   * Returns current user profile from localStorage.
   * Replace with: await supabase.auth.getUser()
   */
  getProfile(): UserProfile | null {
    return getLocalProfile()
  },

  /**
   * Sign in with email + password.
   * Replace with: await supabase.auth.signInWithPassword({ email, password })
   */
  async signIn(_email: string, _password: string): Promise<UserProfile> {
    // TODO: replace with real auth
    const profile: UserProfile = {
      id:          'local-user-001',
      email:       _email,
      displayName: _email.split('@')[0],
      createdAt:   new Date().toISOString(),
    }
    saveLocalProfile(profile)
    return profile
  },

  /**
   * Sign up with email + password.
   * Replace with: await supabase.auth.signUp({ email, password })
   */
  async signUp(email: string, password: string, displayName: string): Promise<UserProfile> {
    const profile: UserProfile = {
      id:          `local-${Date.now()}`,
      email,
      displayName,
      createdAt:   new Date().toISOString(),
    }
    saveLocalProfile(profile)
    return profile
  },

  /**
   * Sign out.
   * Replace with: await supabase.auth.signOut()
   */
  async signOut(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PROFILE_KEY)
    }
  },

  /**
   * Check if user is authenticated.
   */
  isAuthenticated(): boolean {
    return getLocalProfile() !== null
  },
}
