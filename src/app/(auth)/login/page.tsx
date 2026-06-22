'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Activity } from 'lucide-react'

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const router   = useRouter()
  const supabase = createSupabaseClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Email ou senha incorretos'
          : error.message,
      )
      setLoading(false)
      return
    }

    router.push('/weekly')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080b14] px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-100">HabitDB</h1>
          <p className="text-slate-500 text-sm mt-1">Entre na sua conta</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-[#0f1117] border border-white/[0.08] p-8">
          <form onSubmit={handleLogin} className="space-y-4">
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

            <div>
              <label className="text-slate-400 text-sm block mb-1.5">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08]
                           text-slate-100 placeholder-slate-600
                           focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.07]
                           transition-all text-sm min-h-[44px]"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center rounded-xl bg-red-500/[0.08] border border-red-500/20 px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500
                         text-white font-semibold text-sm transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-lg shadow-violet-500/20 min-h-[44px] mt-2"
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 space-y-3 text-center">
            <a
              href="/forgot-password"
              className="text-slate-500 text-sm hover:text-slate-300 transition-colors block"
            >
              Esqueci minha senha
            </a>
            <p className="text-slate-600 text-sm">
              Não tem conta?{' '}
              <a href="/signup" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                Criar conta grátis
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
