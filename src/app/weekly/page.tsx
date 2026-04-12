import type { Metadata } from 'next'
import { WeeklyView } from '@/components/dashboard/WeeklyView'

export const metadata: Metadata = { title: 'Semanal' }

export default function WeeklyPage() {
  return <WeeklyView />
}