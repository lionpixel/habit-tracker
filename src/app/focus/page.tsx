import type { Metadata } from 'next'
import { FocusView } from '@/components/focus/FocusView'

export const metadata: Metadata = { title: 'Foco' }

export default function FocusPage() {
  return <FocusView />
}