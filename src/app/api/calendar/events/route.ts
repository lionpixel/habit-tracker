import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { Session } from 'next-auth'

type CalendarSession = Session & { accessToken?: string; error?: string }

export async function GET() {
  const session = await auth() as CalendarSession | null

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
  }
  if (session.error === 'RefreshAccessTokenError') {
    return NextResponse.json({ error: 'token_expired' }, { status: 401 })
  }

  const now      = new Date()
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dayEnd   = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 23, 59, 59)

  const params = new URLSearchParams({
    timeMin:       dayStart.toISOString(),
    timeMax:       dayEnd.toISOString(),
    singleEvents:  'true',
    orderBy:       'startTime',
    maxResults:    '50',
  })

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${session.accessToken}` } },
  )

  if (!res.ok) {
    const body = await res.text()
    return NextResponse.json({ error: 'google_api_error', detail: body }, { status: res.status })
  }

  const data = await res.json()
  return NextResponse.json(data.items ?? [])
}
