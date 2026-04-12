import type { Metadata } from 'next'
import { DreamBoardView } from '@/components/dreams/DreamBoardView'

export const metadata: Metadata = {
  title: 'Quadro dos Sonhos 2026',
  description: 'Visualize e acompanhe seus maiores sonhos e metas de vida.',
}

export default function DreamsPage() {
  return <DreamBoardView />
}
