import type { Metadata } from 'next'
import { MonthlyView } from '@/components/dashboard/MonthlyView'

export const metadata: Metadata = { title: 'Mensal' }

export default function MonthlyPage() {
  return <MonthlyView />
}