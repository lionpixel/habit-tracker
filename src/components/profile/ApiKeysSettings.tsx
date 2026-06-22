'use client'

import { useEffect, useState } from 'react'
import {
  KeyRound, Plus, Trash2, X, Eye, EyeOff,
  CheckCircle2, AlertCircle, Loader2, RefreshCw,
} from 'lucide-react'
import { useProfileStore } from '@/store/profileStore'
import { cn } from '@/lib/helpers'

// ── Types ────────────────────────────────────

type Provider = 'openai' | 'anthropic' | 'gemini'
type PreferredProvider = Provider | 'auto'

interface KeyMeta {
  id:                 string
  provider:           Provider
  key_hint:           string
  label:              string | null
  is_valid:           boolean
  last_validated_at:  string | null
}

// ── Constants ─────────────────────────────────

const PROVIDER_INFO: Record<Provider, {
  name: string
  hint: string
  placeholder: string
  docsUrl: string
}> = {
  openai: {
    name:        'OpenAI',
    hint:        'GPT-4o · gpt-4o-mini',
    placeholder: 'sk-proj-...',
    docsUrl:     'platform.openai.com/api-keys',
  },
  anthropic: {
    name:        'Anthropic',
    hint:        'Claude Sonnet · Claude Haiku',
    placeholder: 'sk-ant-...',
    docsUrl:     'console.anthropic.com/settings/keys',
  },
  gemini: {
    name:        'Google Gemini',
    hint:        'Gemini 1.5 Flash · Pro',
    placeholder: 'AIza...',
    docsUrl:     'aistudio.google.com/apikey',
  },
}

const PREFERRED_OPTIONS: { value: PreferredProvider; label: string; desc: string }[] = [
  { value: 'auto',      label: 'Automático',       desc: 'Usa o primeiro disponível: Anthropic → OpenAI → Gemini' },
  { value: 'anthropic', label: 'Anthropic Claude',  desc: 'Melhor para análises profundas e raciocínio' },
  { value: 'openai',    label: 'OpenAI GPT-4o',     desc: 'Rápido e econômico, ótimo para insights rápidos' },
  { value: 'gemini',    label: 'Google Gemini',      desc: 'Janela de contexto longo, bom custo-benefício' },
]

// ── Add key modal ─────────────────────────────

function AddKeyModal({
  provider,
  onClose,
  onSaved,
}: {
  provider: Provider
  onClose:  () => void
  onSaved:  () => void
}) {
  const info = PROVIDER_INFO[provider]
  const [apiKey,   setApiKey]   = useState('')
  const [label,    setLabel]    = useState('')
  const [visible,  setVisible]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState<{ ok: boolean; msg: string } | null>(null)

  async function handleSave() {
    if (!apiKey.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res  = await fetch('/api/user-keys', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ provider, apiKey: apiKey.trim(), label: label.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setResult({ ok: false, msg: data.message ?? 'Erro ao salvar.' })
      } else if (!data.valid) {
        setResult({ ok: false, msg: data.message ?? 'Key salva, mas não está funcionando.' })
        setTimeout(onSaved, 2000)
      } else {
        setResult({ ok: true, msg: data.message ?? 'Key válida e ativa.' })
        setTimeout(onSaved, 1200)
      }
    } catch {
      setResult({ ok: false, msg: 'Erro de conexão.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#0d1117] border border-white/[0.08] rounded-2xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound size={15} className="text-violet-400" />
            <span className="text-sm font-bold text-slate-100">
              Adicionar key {info.name}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-400">
            <X size={16} />
          </button>
        </div>

        {/* How to get */}
        <div className="px-3 py-2 bg-white/[0.04] rounded-xl">
          <p className="text-[11px] text-slate-500">
            Como obter: <span className="text-slate-400">{info.docsUrl}</span>
          </p>
        </div>

        {/* API key input */}
        <div>
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
            API Key
          </label>
          <div className="relative">
            <input
              type={visible ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={info.placeholder}
              autoComplete="off"
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 pr-10 text-sm text-slate-100 placeholder-slate-700 outline-none focus:border-violet-500/40 font-mono"
            />
            <button
              type="button"
              onClick={() => setVisible(!visible)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
            >
              {visible ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* Label (optional) */}
        <div>
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
            Apelido (opcional)
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex: Minha key pessoal"
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-700 outline-none focus:border-violet-500/40"
          />
        </div>

        {/* Security note */}
        <p className="text-[11px] text-slate-600 leading-relaxed">
          A key é criptografada com AES-256 antes de ser salva. Nem nós conseguimos ver o valor real.
        </p>

        {/* Result feedback */}
        {result && (
          <div className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl text-xs',
            result.ok
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-red-500/10 text-red-400',
          )}>
            {result.ok
              ? <CheckCircle2 size={13} className="flex-shrink-0" />
              : <AlertCircle  size={13} className="flex-shrink-0" />
            }
            {result.msg}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white/[0.05] text-slate-400 text-xs font-semibold hover:bg-white/[0.08] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !apiKey.trim()}
            className="flex-1 py-2.5 rounded-xl bg-violet-500 text-white text-xs font-bold hover:bg-violet-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading
              ? <><Loader2 size={12} className="animate-spin" /> Testando conexão...</>
              : 'Testar e Salvar'
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Provider row ──────────────────────────────

function ProviderRow({
  provider,
  meta,
  onAdd,
  onRemove,
}: {
  provider: Provider
  meta:     KeyMeta | undefined
  onAdd:    () => void
  onRemove: () => void
}) {
  const info = PROVIDER_INFO[provider]
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [removing, setRemoving] = useState(false)

  async function handleRemove() {
    setRemoving(true)
    try {
      await fetch('/api/user-keys', {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ provider }),
      })
      onRemove()
    } finally {
      setRemoving(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div className="flex items-start justify-between gap-3 py-4 border-b border-white/[0.06] last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold text-slate-200">{info.name}</span>
          {meta ? (
            <span className={cn(
              'text-[10px] font-bold px-1.5 py-0.5 rounded',
              meta.is_valid
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-red-500/15 text-red-400',
            )}>
              {meta.is_valid ? '● Ativa' : '● Inválida'}
            </span>
          ) : (
            <span className="text-[10px] text-slate-600">○ Não configurada</span>
          )}
        </div>

        <p className="text-[11px] text-slate-600">{info.hint}</p>

        {meta && (
          <p className="text-[11px] text-slate-600 mt-0.5 font-mono">
            ···{meta.key_hint}
            {meta.label && <span className="font-sans ml-1">· {meta.label}</span>}
            {meta.last_validated_at && (
              <span className="ml-1">
                · validada em {new Date(meta.last_validated_at).toLocaleDateString('pt-BR')}
              </span>
            )}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
        {meta ? (
          confirmDelete ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500">Remover?</span>
              <button
                onClick={handleRemove}
                disabled={removing}
                className="text-[10px] font-bold text-red-400 hover:text-red-300 px-2 py-1 rounded-lg bg-red-500/10 transition-colors disabled:opacity-50"
              >
                {removing ? <Loader2 size={10} className="animate-spin" /> : 'Sim'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-[10px] text-slate-500 hover:text-slate-300 px-2 py-1"
              >
                Não
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-slate-600 hover:text-red-400 transition-colors p-1"
              title="Remover key"
            >
              <Trash2 size={13} />
            </button>
          )
        ) : (
          <button
            onClick={onAdd}
            className="flex items-center gap-1 text-[11px] font-semibold text-violet-400 hover:text-violet-300 transition-colors px-2 py-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/15"
          >
            <Plus size={11} /> Adicionar
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────

export function ApiKeysSettings() {
  const profile = useProfileStore((s) => s.profile)
  const updateProfile = useProfileStore((s) => s.updateProfile)

  const [keys,      setKeys]      = useState<KeyMeta[]>([])
  const [loading,   setLoading]   = useState(true)
  const [addModal,  setAddModal]  = useState<Provider | null>(null)

  async function loadKeys() {
    setLoading(true)
    try {
      const res  = await fetch('/api/user-keys')
      const data = await res.json()
      if (Array.isArray(data)) setKeys(data)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadKeys() }, [])

  function getMeta(provider: Provider): KeyMeta | undefined {
    return keys.find((k) => k.provider === provider)
  }

  const preferred = profile.preferredAiProvider ?? 'auto'

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
          <KeyRound size={14} className="text-violet-400" />
        </div>
        <div className="flex-1">
          <span className="text-sm font-bold text-slate-100">Configurações de IA</span>
          <p className="text-[11px] text-slate-500">
            Suas keys são criptografadas e usadas para todas as análises do app
          </p>
        </div>
        <button
          onClick={loadKeys}
          disabled={loading}
          className="text-slate-600 hover:text-slate-400 transition-colors p-1"
          title="Recarregar"
        >
          <RefreshCw size={13} className={cn(loading && 'animate-spin')} />
        </button>
      </div>

      {/* Provider rows */}
      <div className="card px-4 mb-4">
        {(['openai', 'anthropic', 'gemini'] as Provider[]).map((p) => (
          <ProviderRow
            key={p}
            provider={p}
            meta={getMeta(p)}
            onAdd={() => setAddModal(p)}
            onRemove={loadKeys}
          />
        ))}
      </div>

      {/* Preferred provider */}
      <div className="card p-4">
        <p className="text-xs font-semibold text-slate-400 mb-3">Provider preferido para análises</p>
        <div className="space-y-2">
          {PREFERRED_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateProfile({ preferredAiProvider: opt.value })}
              className={cn(
                'w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-colors',
                preferred === opt.value
                  ? 'bg-violet-500/10 border-violet-500/30'
                  : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05]',
              )}
            >
              <span className={cn(
                'w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-colors',
                preferred === opt.value
                  ? 'border-violet-400 bg-violet-400'
                  : 'border-slate-600',
              )} />
              <div>
                <p className={cn(
                  'text-xs font-semibold',
                  preferred === opt.value ? 'text-violet-300' : 'text-slate-300',
                )}>
                  {opt.label}
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {addModal && (
        <AddKeyModal
          provider={addModal}
          onClose={() => setAddModal(null)}
          onSaved={() => { setAddModal(null); loadKeys() }}
        />
      )}
    </div>
  )
}

// ── Source badge (FASE 7) — usado nos cards de insight ───

export function AiSourceBadge({ source }: { source?: string }) {
  if (!source) return null
  return (
    <span className="text-[10px] text-white/20 select-none">
      {source === 'user' ? 'Sua key' : 'Key padrão do app'}
    </span>
  )
}
