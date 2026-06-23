'use client'

import { useState } from 'react'
import {
  Settings,
  KeyRound,
  Brain,
  BookOpen,
  User,
  ChevronDown,
  ChevronUp,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/helpers'
import { useAuth } from '@/providers/AuthProvider'
import { AiSettings } from '@/components/profile/AiSettings'
import { BigFiveSection } from '@/components/profile/BigFiveSection'
import { PersonalRulesSection } from '@/components/profile/PersonalRulesSection'
import { FadeInUp } from '@/components/ui/Motion'

// ── Section component ──────────────────────────

function Section({
  id,
  open,
  onToggle,
  icon,
  title,
  subtitle,
  children,
}: {
  id: string
  open: boolean
  onToggle: (id: string) => void
  icon: React.ReactNode
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center gap-3 p-5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-100">{title}</p>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        {open
          ? <ChevronUp size={16} className="text-slate-500 flex-shrink-0" />
          : <ChevronDown size={16} className="text-slate-500 flex-shrink-0" />
        }
      </button>
      {open && (
        <div className="border-t border-white/[0.06] p-5">
          {children}
        </div>
      )}
    </div>
  )
}

// ── Main view ─────────────────────────────────

export function SettingsView() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState<Record<string, boolean>>({ ia: true })

  function toggle(id: string) {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Header */}
      <FadeInUp>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
            <Settings size={20} className="text-violet-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-100">Configurações</h2>
            <p className="text-slate-500 text-sm">Personalize seu HabitDB</p>
          </div>
        </div>
      </FadeInUp>

      {/* 1. Configurações de IA */}
      <FadeInUp delay={0.04}>
        <Section
          id="ia"
          open={!!open.ia}
          onToggle={toggle}
          icon={<KeyRound size={15} className="text-violet-400" />}
          title="Configurações de IA"
          subtitle="API keys e provider preferido para análises"
        >
          <AiSettings />
        </Section>
      </FadeInUp>

      {/* 2. Perfil de Personalidade */}
      <FadeInUp delay={0.06}>
        <Section
          id="bigfive"
          open={!!open.bigfive}
          onToggle={toggle}
          icon={<Brain size={15} className="text-violet-400" />}
          title="Perfil de Personalidade"
          subtitle="Big Five OCEAN — resultados e histórico trimestral"
        >
          <BigFiveSection />
        </Section>
      </FadeInUp>

      {/* 3. Regras Pessoais */}
      <FadeInUp delay={0.08}>
        <Section
          id="rules"
          open={!!open.rules}
          onToggle={toggle}
          icon={<BookOpen size={15} className="text-violet-400" />}
          title="Regras Pessoais"
          subtitle="Princípios e valores que guiam suas decisões"
        >
          <PersonalRulesSection />
        </Section>
      </FadeInUp>

      {/* 4. Conta e Segurança */}
      <FadeInUp delay={0.10}>
        <Section
          id="conta"
          open={!!open.conta}
          onToggle={toggle}
          icon={<User size={15} className="text-violet-400" />}
          title="Conta e Segurança"
          subtitle="Informações da sua conta e opções de sessão"
        >
          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
              <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-violet-300">
                  {(user?.displayName ?? user?.email ?? 'U')[0].toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-200 truncate">
                  {user?.displayName ?? 'Usuário'}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email ?? '—'}</p>
              </div>
            </div>

            {/* Sign out */}
            <button
              onClick={signOut}
              className={cn(
                'w-full flex items-center gap-2 px-4 py-3 rounded-xl',
                'text-sm font-semibold text-red-400',
                'bg-red-500/[0.06] border border-red-500/[0.15]',
                'hover:bg-red-500/[0.12] transition-colors',
              )}
            >
              <LogOut size={15} />
              Sair da conta
            </button>
          </div>
        </Section>
      </FadeInUp>
    </div>
  )
}
