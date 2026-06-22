// ─────────────────────────────────────────────
//  Component: Profile Overview / Edit form
// ─────────────────────────────────────────────

'use client'

import { useState, useEffect } from 'react'
import { User, Edit2, Check, X } from 'lucide-react'
import { useProfileStore } from '@/store/profileStore'
import { ACTIVITY_LABELS, GOAL_LABELS, normalizeHeightCm } from '@/types/profile'
import type { PhysicalProfile, Sex, ActivityLevel, PhysicalGoal } from '@/types/profile'
import { cn } from '@/lib/helpers'

const SEX_OPTIONS: { id: Sex; label: string }[] = [
  { id: 'male',   label: 'Masculino' },
  { id: 'female', label: 'Feminino'  },
  { id: 'other',  label: 'Outro'     },
]

export function ProfileOverview() {
  const { profile, updateProfile } = useProfileStore()
  const [editing, setEditing] = useState(false)

  const [name,   setName]   = useState(profile.name   ?? '')
  const [age,    setAge]    = useState(profile.age    != null ? String(profile.age)    : '')
  const [sex,    setSex]    = useState<Sex | ''>(profile.sex ?? '')
  const [height, setHeight] = useState(profile.height != null ? String(profile.height) : '')
  const [activity, setActivity] = useState<ActivityLevel | ''>(profile.activityLevel ?? '')
  const [goal,   setGoal]   = useState<PhysicalGoal | ''>(profile.goal ?? '')

  // Goal targets
  const [gWeight,  setGWeight]  = useState(profile.goalWeight  != null ? String(profile.goalWeight)  : '')
  const [gBodyFat, setGBodyFat] = useState(profile.goalBodyFat != null ? String(profile.goalBodyFat) : '')
  const [gLean,    setGLean]    = useState(profile.goalLeanMass!= null ? String(profile.goalLeanMass) : '')
  const [gWaist,   setGWaist]   = useState(profile.goalWaist   != null ? String(profile.goalWaist)   : '')

  useEffect(() => {
    if (!editing) {
      setName(  profile.name   ?? '')
      setAge(   profile.age    != null ? String(profile.age)    : '')
      setSex(   profile.sex    ?? '')
      setHeight(profile.height != null ? String(profile.height) : '')
      setActivity(profile.activityLevel ?? '')
      setGoal(  profile.goal   ?? '')
      setGWeight( profile.goalWeight   != null ? String(profile.goalWeight)   : '')
      setGBodyFat(profile.goalBodyFat  != null ? String(profile.goalBodyFat)  : '')
      setGLean(   profile.goalLeanMass != null ? String(profile.goalLeanMass) : '')
      setGWaist(  profile.goalWaist    != null ? String(profile.goalWaist)    : '')
    }
  }, [profile, editing])

  function handleSave() {
    const patch: Partial<PhysicalProfile> = {}
    if (name)     patch.name           = name.trim()
    if (age)      patch.age            = Number(age)
    if (sex)      patch.sex            = sex
    if (height)   patch.height         = normalizeHeightCm(Number(height))
    if (activity) patch.activityLevel  = activity
    if (goal)     patch.goal           = goal
    if (gWeight)  patch.goalWeight     = Number(gWeight)
    if (gBodyFat) patch.goalBodyFat    = Number(gBodyFat)
    if (gLean)    patch.goalLeanMass   = Number(gLean)
    if (gWaist)   patch.goalWaist      = Number(gWaist)
    updateProfile(patch)
    setEditing(false)
  }

  const displayName = profile.name ?? 'Perfil'
  const subtitle    = [
    profile.age    ? `${profile.age} anos` : null,
    profile.sex    ? SEX_OPTIONS.find((s) => s.id === profile.sex)?.label : null,
    profile.height ? `${profile.height}cm` : null,
  ].filter(Boolean).join(' · ')

  return (
    <div className="card p-6 overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-indigo-400 to-transparent" />
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center border border-white/[0.08]">
            <User size={26} className="text-violet-400" />
          </div>
          <div>
            <h3 className="font-black text-slate-100 text-lg">{displayName}</h3>
            {subtitle && <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>}
            {profile.activityLevel && (
              <p className="text-slate-600 text-[11px] mt-0.5">{ACTIVITY_LABELS[profile.activityLevel]}</p>
            )}
            {profile.goal && (
              <p className="text-violet-400 text-[11px] mt-0.5 font-semibold">{GOAL_LABELS[profile.goal]}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center transition-colors text-sm',
            editing
              ? 'bg-red-500/15 text-red-400 hover:bg-red-500/20'
              : 'bg-white/[0.05] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200',
          )}
        >
          {editing ? <X size={16} /> : <Edit2 size={15} />}
        </button>
      </div>

      {editing && (
        <div className="space-y-4 border-t border-white/[0.06] pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Nome</Label>
              <Input value={name} onChange={setName} placeholder="Seu nome" />
            </div>
            <div>
              <Label>Idade</Label>
              <Input type="number" value={age} onChange={setAge} placeholder="ex: 28" />
            </div>
            <div>
              <Label>Altura (cm)</Label>
              <Input type="number" value={height} onChange={setHeight} placeholder="ex: 185 (em cm)" />
            </div>
          </div>

          {/* Sex */}
          <div>
            <Label>Sexo</Label>
            <div className="flex gap-2 mt-1">
              {SEX_OPTIONS.map(({ id, label }) => (
                <button
                  key={id} type="button"
                  onClick={() => setSex(id)}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-xs font-semibold transition-all',
                    sex === id
                      ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/40'
                      : 'bg-white/[0.05] text-slate-500 hover:text-slate-400',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Activity level */}
          <div>
            <Label>Nível de Atividade</Label>
            <select
              className="w-full mt-1 bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-violet-500"
              value={activity}
              onChange={(e) => setActivity(e.target.value as ActivityLevel)}
            >
              <option value="">Selecionar...</option>
              {Object.entries(ACTIVITY_LABELS).map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
          </div>

          {/* Goal */}
          <div>
            <Label>Objetivo</Label>
            <select
              className="w-full mt-1 bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-violet-500"
              value={goal}
              onChange={(e) => setGoal(e.target.value as PhysicalGoal)}
            >
              <option value="">Selecionar...</option>
              {Object.entries(GOAL_LABELS).map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
          </div>

          {/* Goal targets */}
          <div>
            <Label>Metas (opcional)</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <MiniField label="Peso alvo (kg)"    value={gWeight}  onChange={setGWeight}  />
              <MiniField label="% Gordura alvo"    value={gBodyFat} onChange={setGBodyFat} />
              <MiniField label="Massa Magra (kg)"  value={gLean}    onChange={setGLean}    />
              <MiniField label="Cintura alvo (cm)" value={gWaist}   onChange={setGWaist}   />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setEditing(false)} className="flex-1 py-2.5 rounded-xl bg-white/[0.05] text-slate-400 text-sm font-semibold hover:bg-white/[0.08]">
              Cancelar
            </button>
            <button type="button" onClick={handleSave}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90"
            >
              <Check size={15} /> Salvar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">{children}</label>
}

function Input({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <input
      type={type} step="any" min={0}
      className="w-full mt-1 bg-white/[0.06] rounded-lg px-3 py-2.5 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-violet-500"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

function MiniField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="text-[10px] text-slate-600 mb-1">{label}</div>
      <input
        type="number" step="any" min={0}
        className="w-full bg-white/[0.05] rounded-lg px-2.5 py-2 text-slate-300 text-xs border border-white/[0.06] focus:outline-none focus:ring-1 focus:ring-violet-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
