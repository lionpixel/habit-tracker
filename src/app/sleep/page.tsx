import type { Metadata } from 'next'
import { SleepView } from '@/components/sleep/SleepView'

export const metadata: Metadata = { title: 'Sono' }

export default function SleepPage() {
  return <SleepView />
}