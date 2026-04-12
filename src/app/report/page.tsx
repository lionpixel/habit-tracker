import type { Metadata } from 'next'
import { ReportView } from '@/components/report/ReportView'

export const metadata: Metadata = { title: 'Relatório' }

export default function ReportPage() {
  return <ReportView />
}