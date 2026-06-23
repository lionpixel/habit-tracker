'use client'

import { useEffect, useState } from 'react'
import {
  KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle,
  Loader2, RefreshCw, ChevronDown, ChevronUp, Trash2,
} from 'lucide-react'
import { useProfileStore } from '@/store/profileStore'
import { cn } from '@/lib/helpers'

// ── Types ─────────────────────────────────────

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
  name:        string
  hint:        string
  placeholder: string
  docsUrl:     string
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

// ── Provider row with inline expand ──────────

function ProviderRow({
  provider,
  meta,
  onRefresh,
}: {
  provider:  Provider
  meta:      KeyMeta | undefined
  onRefresh: () => void
}) {
  const info = PROVIDER_INFO[provider]
  const [expanded,       setExpanded]       = useState(false)
  const [apiKey,         setApiKey]         = useState('')
  const [label,          setLabel]          = useState('')
  const [showKey,        setShowKey]        = useState(false)
  const [saving,         setSaving]         = useState(false)
  const [removing,       setRemoving]       = useState(false)
  const [confirmDelete,  setConfirmDelete]  = useState(false)
  const [feedback,       setFeedback]       = useState<{ ok: boolean; msg: string } | null>(null)

  function openForm() {
    setExpanded(true)
    setApiKey('')
    setLabel(meta?.label ?? '')
    setFeedback(null)
    setConfirmDelete(false)
  }

  function closeForm() {
    setExpanded(false)
    setApiKey('')
    setFeedback(null)
    setConfirmDelete(false)
  }

  async function handleSave() {
    if (!apiKey.trim()) return
    setSaving(true)
    setFeedback(null)
    try {
      const res  = await fetch('/api/user-keys', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ provider, apiKey: apiKey.trim(), label: label.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFeedback({ ok: false, msg: data.message ?? 'Erro ao salvar.' })
      } else if (!data.valid) {
        setFeedback({ ok: false, msg: data.message ?? 'Key salva, mas não está funcionando.' })
        setTimeout(() => { onRefresh(); closeForm() }, 2000)
      } else {
        setFeedback({ ok: true, msg: data.message ?? 'Key válida e ativa.' })
        setTimeout(() => { onRefresh(); closeForm() }, 1200)
      }
    } catch {
      setFeedback({ ok: false, msg: 'Erro de conexão.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove() {
    setRemoving(true)
    try {
      await fetch('/api/user-keys', {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ provider }),
      })
      onRefresh()
      closeForm()
    } finally {
      setRemoving(false)
    }
  }

  const statusDot = meta
    ? meta.is_valid
      ? <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
      : <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
    : <span className="w-2 h-2 rounded-full border border-slate-600 flex-shrink-0" />

  return (
    <div className="border-b border-white/[0.06] last:border-0">
      {/* Row header */}
      <div className="flex items-center gap-3 py-3.5">
        {statusDot}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-200">{info.name}</span>
            {meta && (
              <span className="text-[10px] text-slate-600 font-mono">···{meta.key_hint}</span>
            )}
          </div>
          <p className="text-[11px] text-slate-600">{info.hint}</p>
        </div>
        <button
          onClick={expanded ? closeForm : openForm}
          className={cn(
            'flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0',
            expanded
              ? 'text-slate-400 bg-white/[0.05]'
              : meta
                ? 'text-slate-400 bg-white/[0.04] hover:bg-white/[0.07]'
                : 'text-violet-400 bg-violet-500/10 hover:bg-violet-500/15',
          )}
        >
          {expanded
            ? <><ChevronUp size={11} /> Fechar</>
            : meta
              ? <><ChevronDown size={11} /> Editar</>
              : <><ChevronDown size={11} /> Adicionar</>
          }
        </button>
      </div>

      {/* Inline expand form */}
      {expanded && (
        <div className="pb-4 space-y-3">
          {/* Docs hint */}
          <div className="px-3 py-2 bg-white/[0.03] rounded-xl">
            <p className="text-[11px] text-slate-600">
              Como obter: <span className="text-slate-500">{info.docsUrl}</span>
            </p>
          </div>

          {/* API key input */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
              Nova API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={info.placeholder}
                autoComplete="off"
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 pr-10 text-sm text-slate-100 placeholder-slate-700 outline-none focus:border-violet-500/40 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
              >
                {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          {/* Label */}
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

          <p className="text-[11px] text-slate-700">
            Criptografada com AES-256 antes de ser salva.
          </p>

          {/* Feedback */}
          {feedback && (
            <div className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl text-xs',
              feedback.ok
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400',
            )}>
              {feedback.ok
                ? <CheckCircle2 size={12} className="flex-shrink-0" />
                : <AlertCircle  size={12} className="flex-shrink-0" />
              }
              {feedback.msg}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={closeForm}
              className="px-3 py-2 rounded-xl bg-white/[0.04] text-slate-500 text-xs font-semibold hover:bg-white/[0.07] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !apiKey.trim()}
              className="flex-1 py-2 rounded-xl bg-violet-500 text-white text-xs font-bold hover:bg-violet-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {saving
                ? <><Loader2 size={11} className="animate-spin" /> Testando...</>
                : 'Testar e Salvar'
              }
            </button>
            {meta && (
              confirmDelete ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleRemove}
                    disabled={removing}
                    className="px-2.5 py-2 rounded-xl bg-red-500/15 text-red-400 text-xs font-bold hover:bg-red-500/25 transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    {removing ? <Loader2 size={10} className="animate-spin" /> : 'Remover'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-2.5 py-2 rounded-xl text-slate-600 text-xs hover:text-slate-400"
                  >
                    Não
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-2 rounded-xl text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Remover key"
                >
                  <Trash2 size={13} />
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────

export function AiSettings() {
  const profile       = useProfileStore((s) => s.profile)
  const updateProfile = useProfileStore((s) => s.updateProfile)

  const [keys,    setKeys]    = useState<KeyMeta[]>([])
  const [loading, setLoading] = useState(true)

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
            Suas keys são criptografadas e usadas em todas as análises
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
            meta={keys.find((k) => k.provider === p)}
            onRefresh={loadKeys}
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
    </div>
  )
}
