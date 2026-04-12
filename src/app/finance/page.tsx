import type { Metadata } from 'next'
import { FinanceView } from '@/components/finance/FinanceView'

export const metadata: Metadata = { title: 'Finanças' }

export default function FinancePage() {
  return <FinanceView />
}
