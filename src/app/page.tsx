// ─────────────────────────────────────────────
//  Página principal — redireciona para /weekly
// ─────────────────────────────────────────────

import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/weekly')
}