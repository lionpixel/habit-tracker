'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Activity, CheckCircle } from 'lucide-react'

export default function SignupPage() {
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)
  const supabase = createSupabaseClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres')
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080b14] px-4">
        <div className="text-center p-8 max-w-sm">
          <div className="mb-4 flex justify-center">
            <CheckCircle size={48} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-100 mb-2">Conta criada!</h2>
          <p className="text-slate-500 text-sm mb-6">
            Verifique seu email para confirmar o cadastro antes de entrar.
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-violet-600 hover:bg-violet-500
                       rounded-xl text-white font-semibold text-sm transition-all"
          >
            Ir para o login
          </a>
        </div>
      </div>
    )
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
          <p className="text-slate-500 text-sm mt-1">Crie sua conta</p>
        </div>

        <div className="rounded-2xl bg-[#0f1117] border border-white/[0.08] p-8">
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-slate-400 text-sm block mb-1.5">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Seu nome"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08]
                           text-slate-100 placeholder-slate-600
                           focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.07]
                           transition-all text-sm min-h-[44px]"
              />
            </div>

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
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08]
                           text-slate-100 placeholder-slate-600
                           focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.07]
                           transition-all text-sm min-h-[44px]"
              />
            </div>

            <div>
              <label className="text-slate-400 text-sm block mb-1.5">Confirmar senha</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Repita a senha"
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
              {loading ? 'Criando conta…' : 'Criar conta'}
            </button>
          </form>

          <p className="mt-6 text-center text-slate-600 text-sm">
            Já tem conta?{' '}
            <a href="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
              Entrar
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
