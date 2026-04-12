// ─────────────────────────────────────────────
//  User Service — preparado para backend real
//  Replace implementations with API calls when
//  connecting Supabase / Prisma
// ─────────────────────────────────────────────

import type { UserProfile } from './authService'

export interface UpdateProfilePayload {
  displayName?: string
  avatarUrl?:   string
}

export const userService = {
  /**
   * Fetch the current user profile.
   * Replace with: apiClient.get<UserProfile>('/api/me')
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    if (typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem('habitdb-user-profile')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  /**
   * Update user display name or avatar.
   * Replace with: apiClient.patch('/api/me', payload)
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<UserProfile | null> {
    const current = await userService.getCurrentUser()
    if (!current) return null
    const updated: UserProfile = { ...current, ...payload }
    if (typeof window !== 'undefined') {
      localStorage.setItem('habitdb-user-profile', JSON.stringify(updated))
    }
    return updated
  },

  /**
   * Delete user account.
   * Replace with: apiClient.delete('/api/me')
   */
  async deleteAccount(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('habitdb-user-profile')
    }
  },
}
