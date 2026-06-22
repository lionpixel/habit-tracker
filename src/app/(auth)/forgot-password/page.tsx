'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Activity } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createSupabaseClient()

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    })
    // sempre mostra sucesso (evita enumeração de emails)
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080b14] px-4">
        <div className="text-center p-8 max-w-sm">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-xl font-black text-slate-100 mb-2">Email enviado</h2>
          <p className="text-slate-500 text-sm mb-6">
            Se esse email estiver cadastrado, você receberá um link para redefinir sua senha.
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-violet-600 hover:bg-violet-500
                       rounded-xl text-white font-semibold text-sm transition-all"
          >
            Voltar ao login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080b14] px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-100">Recuperar senha</h1>
          <p className="text-slate-500 text-sm mt-1">
            Enviaremos um link para redefinir sua senha.
          </p>
        </div>

        <div className="rounded-2xl bg-[#0f1117] border border-white/[0.08] p-8">
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="text-slate-400 text-sm block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="seu@email.com"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08]
                           text-slate-100 placeholder-slate-600
                           focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.07]
                           transition-all text-sm min-h-[44px]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500
                         text-white font-semibold text-sm transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-lg shadow-violet-500/20 min-h-[44px]"
            >
              {loading ? 'Enviando…' : 'Enviar link'}
            </button>
          </form>

          <a
            href="/login"
            className="mt-4 block text-center text-slate-500 text-sm hover:text-slate-300 transition-colors"
          >
            Voltar ao login
          </a>
        </div>
      </div>
    </div>
  )
}
