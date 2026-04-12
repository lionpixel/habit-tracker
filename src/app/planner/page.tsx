import type { Metadata } from 'next'
import { PlannerView } from '@/components/planner/PlannerView'

export const metadata: Metadata = { title: 'Planejamento' }

export default function PlannerPage() {
  return <PlannerView />
}
