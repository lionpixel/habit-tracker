import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

async function refreshAccessToken(token: Record<string, unknown>) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: token.refreshToken as string,
      grant_type:    'refresh_token',
    }),
  })
  const data = await res.json()
  if (!res.ok) throw data
  return {
    ...token,
    accessToken: data.access_token as string,
    expiresAt:   Math.floor(Date.now() / 1000) + (data.expires_in as number),
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      authorization: {
        params: {
          scope:       'openid email profile https://www.googleapis.com/auth/calendar.readonly',
          access_type: 'offline',
          prompt:      'consent',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // First sign-in — persist tokens
      if (account) {
        return {
          ...token,
          accessToken:  account.access_token,
          refreshToken: account.refresh_token,
          expiresAt:    account.expires_at,
        }
      }
      // Token still valid
      if (Date.now() < (token.expiresAt as number) * 1000) return token
      // Expired — try refresh
      try {
        return await refreshAccessToken(token as Record<string, unknown>)
      } catch {
        return { ...token, error: 'RefreshAccessTokenError' }
      }
    },
    async session({ session, token }) {
      const s = session as typeof session & { accessToken?: string; error?: string }
      s.accessToken = token.accessToken as string | undefined
      s.error       = token.error as string | undefined
      return s
    },
  },
})
