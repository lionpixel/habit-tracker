// ─────────────────────────────────────────────
//  Componente: Header
// ─────────────────────────────────────────────

'use client'


export function Header() {
  const now  = new Date()
  const day  = now.toLocaleDateString('pt-BR', { weekday: 'long' })
  const date = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  return (
    <header className="relative text-center mb-8 p-8 card overflow-hidden">
      {/* Shimmer overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent animate-shimmer pointer-events-none"
        aria-hidden="true"
      />

      <h1 className="relative z-10 text-5xl font-black tracking-tight text-gradient mb-2">
        HabitDB 2026
      </h1>

      <p className="relative z-10 text-slate-400 text-base max-w-2xl mx-auto mb-3">
        Sistema Científico de Formação de Hábitos — baseado em ciência comportamental
      </p>

      <p className="relative z-10 text-sky-400 text-sm font-semibold capitalize">
        {day}, {date} · {time}
      </p>
    </header>
  )
}