import type { Metadata } from 'next'
import { YearlyView } from '@/components/dashboard/YearlyView'

export const metadata: Metadata = { title: 'Anual' }

export default function YearlyPage() {
  return <YearlyView />
}