// ─────────────────────────────────────────────
//  Component: Weekly Check-in Modal
// ─────────────────────────────────────────────

'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, CheckCircle2 } from 'lucide-react'
import { useProfileStore } from '@/store/profileStore'
import { todayStr } from '@/lib/helpers'
import type { BodyCheckIn } from '@/types/profile'

interface WeeklyCheckinModalProps {
  open:    boolean
  onClose: () => void
}

export function WeeklyCheckinModal({ open, onClose }: WeeklyCheckinModalProps) {
  const { saveCheckIn, profile, history } = useProfileStore()

  const today   = todayStr()
  const existing = history.find((e) => e.date === today)

  const [weight,   setWeight]   = useState('')
  const [bodyFat,  setBodyFat]  = useState('')
  const [waist,    setWaist]    = useState('')
  const [calories, setCalories] = useState('')
  const [water,    setWater]    = useState('')
  const [notes,    setNotes]    = useState('')
  const [saved,    setSaved]    = useState(false)

  useEffect(() => {
    if (open) {
      setWeight(  existing?.weight   != null ? String(existing.weight)   : profile.weight   != null ? String(profile.weight)   : '')
      setBodyFat( existing?.bodyFat  != null ? String(existing.bodyFat)  : profile.bodyFat  != null ? String(profile.bodyFat)  : '')
      setWaist(   existing?.waist    != null ? String(existing.waist)    : profile.waist    != null ? String(profile.waist)    : '')
      setCalories(existing?.calories != null ? String(existing.calories) : '')
      setWater(   existing?.water    != null ? String(existing.water)    : '')
      setNotes(   existing?.notes    ?? '')
      setSaved(false)
    }
  }, [open, existing, profile])

  function handleSave() {
    const entry: Partial<BodyCheckIn> & { date: string } = { date: today }
    if (weight)   entry.weight   = Number(weight)
    if (bodyFat)  entry.bodyFat  = Number(bodyFat)
    if (waist)    entry.waist    = Number(waist)
    if (calories) entry.calories = Number(calories)
    if (water)    entry.water    = Number(water)
    if (notes)    entry.notes    = notes

    saveCheckIn(entry)
    setSaved(true)
    setTimeout(onClose, 900)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            <div className="glass w-full max-w-md rounded-2xl border border-white/[0.08] shadow-modal pointer-events-auto overflow-hidden">
              <div className="h-[3px] bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent" />
              <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-100">Check-in de Hoje</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{today}</p>
                </div>
                <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-slate-400 hover:text-slate-200">
                  <X size={15} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {saved ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-3 text-emerald-400">
                    <CheckCircle2 size={40} />
                    <span className="font-bold text-lg">Check-in salvo!</span>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Peso (kg)"     value={weight}   onChange={setWeight}   placeholder="ex: 75.5" type="number" />
                      <Field label="% Gordura"     value={bodyFat}  onChange={setBodyFat}  placeholder="ex: 18.0" type="number" />
                      <Field label="Cintura (cm)"  value={waist}    onChange={setWaist}    placeholder="ex: 82"   type="number" />
                      <Field label="Calorias"      value={calories} onChange={setCalories} placeholder="ex: 2200" type="number" />
                      <Field label="Água (litros)" value={water}    onChange={setWater}    placeholder="ex: 2.5"  type="number" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Notas</label>
                      <textarea
                        rows={2}
                        className="w-full bg-white/[0.06] rounded-lg px-3 py-2 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                        placeholder="Como foi seu dia?"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-3 pt-1">
                      <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/[0.05] text-slate-400 text-sm font-semibold hover:bg-white/[0.08]">
                        Cancelar
                      </button>
                      <button type="button" onClick={handleSave}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-sm font-bold hover:bg-emerald-500/30 transition-colors"
                      >
                        Salvar Check-in
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function Field({
  label, value, onChange, placeholder, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">{label}</label>
      <input
        type={type}
        min={0}
        step="any"
        className="w-full bg-white/[0.06] rounded-lg px-3 py-2 text-slate-200 text-sm border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-emerald-500"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
