import type { Metadata } from 'next'
import { MetasView } from '@/components/metas/MetasView'

export const metadata: Metadata = { title: 'Metas' }

export default function MetasPage() {
  return <MetasView />
}