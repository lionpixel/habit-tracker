// ─────────────────────────────────────────────
//  Page: Categories
// ─────────────────────────────────────────────

import type { Metadata } from 'next'
import { CategoriesView } from '@/components/categories/CategoriesView'

export const metadata: Metadata = { title: 'Categorias' }

export default function CategoriesPage() {
  return <CategoriesView />
}
