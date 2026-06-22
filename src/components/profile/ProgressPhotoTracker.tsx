'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { cn } from '@/lib/helpers'
import { useProfileStore } from '@/store/profileStore'
import { getBRTWeekNumber, getBRTYear, getWeekDaysBRT, getTodayStr } from '@/lib/time'
import {
  Camera, Plus, X, ChevronLeft, ChevronRight, Upload,
  Trash2, GitCompare, Scale, TrendingDown, Calendar,
} from 'lucide-react'

interface ProgressPhoto {
  id:           string
  image_url:    string | null
  storage_path: string
  date:         string
  week:         number
  month:        number
  year:         number
  day_of_week:  string
  weight?:      number
  body_fat?:    number
  notes?:       string
  created_at:   string
}

type Tab = 'week' | 'month' | 'timeline'

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTH_NAMES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

// ── Upload Modal ──────────────────────────────
function UploadModal({
  initialDate,
  defaultWeight,
  defaultBodyFat,
  onClose,
  onSuccess,
}: {
  initialDate:   string
  defaultWeight?: number
  defaultBodyFat?: number
  onClose:   () => void
  onSuccess: (photo: ProgressPhoto) => void
}) {
  const [file,     setFile]     = useState<File | null>(null)
  const [preview,  setPreview]  = useState<string | null>(null)
  const [date,     setDate]     = useState(initialDate)
  const [notes,    setNotes]    = useState('')
  const [weight,   setWeight]   = useState(defaultWeight?.toString() ?? '')
  const [bodyFat,  setBodyFat]  = useState(defaultBodyFat?.toString() ?? '')
  const [loading,  setLoading]  = useState(false)
  const [progress, setProgress] = useState(0)
  const [error,    setError]    = useState<string | null>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function pickFile(f: File) {
    if (f.size > 10 * 1024 * 1024) { setError('Arquivo muito grande (máx 10MB)'); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setError(null)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) pickFile(f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) { setError('Selecione uma foto.'); return }
    setLoading(true)
    setProgress(20)
    try {
      const fd = new FormData()
      fd.append('file',    file)
      fd.append('date',    date)
      fd.append('notes',   notes)
      if (weight)  fd.append('weight',  weight)
      if (bodyFat) fd.append('bodyFat', bodyFat)
      setProgress(50)
      const res = await fetch('/api/progress-photos', { method: 'POST', body: fd })
      setProgress(90)
      if (!res.ok) {
        const { error: msg } = await res.json()
        setError(msg ?? 'Erro ao salvar.')
        return
      }
      const photo = await res.json()
      setProgress(100)
      onSuccess(photo)
      onClose()
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0d1117] border border-white/[0.1] rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Camera size={16} className="text-violet-400" />
            <span className="font-bold text-slate-100 text-sm">Registrar Progresso</span>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Drop zone */}
          {!preview ? (
            <div
              ref={dropRef}
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
              className={cn(
                'border-2 border-dashed border-white/[0.12] rounded-xl p-8',
                'flex flex-col items-center justify-center gap-3 cursor-pointer',
                'hover:border-violet-500/40 hover:bg-violet-500/[0.03] transition-all',
              )}
            >
              <Upload size={28} className="text-slate-600" />
              <p className="text-sm text-slate-400 font-medium">Arraste a foto aqui</p>
              <p className="text-xs text-slate-600">JPG, PNG ou HEIC · máx 10MB</p>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f) }}
              />
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
              <button
                type="button"
                onClick={() => { setFile(null); setPreview(null) }}
                className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Date */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Data do registro
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
            />
          </div>

          {/* Weight + BodyFat row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="ex: 84.0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                Gordura (%)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="ex: 26.0"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/50"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Notas (opcional)
            </label>
            <input
              type="text"
              placeholder="ex: início da dieta cetogênica"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/50"
            />
          </div>

          {/* Progress bar during upload */}
          {loading && progress > 0 && (
            <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-violet-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white/[0.04] text-slate-400 hover:text-slate-200 hover:bg-white/[0.07] border border-white/[0.06] transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {loading ? 'Salvando…' : 'Salvar foto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Lightbox ─────────────────────────────────
function Lightbox({
  photo,
  onClose,
  onDelete,
}: {
  photo:    ProgressPhoto
  onClose:  () => void
  onDelete: (id: string, storagePath: string) => void
}) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Excluir esta foto?')) return
    setDeleting(true)
    await onDelete(photo.id, photo.storage_path)
    onClose()
  }

  const dateLabel = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
    .format(new Date(photo.date + 'T12:00:00'))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full bg-[#0d1117] rounded-2xl overflow-hidden border border-white/[0.1]"
        onClick={(e) => e.stopPropagation()}
      >
        {photo.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.image_url} alt={photo.date} className="w-full object-contain max-h-[60vh]" />
        )}
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-slate-100 capitalize">{dateLabel}</p>
              <div className="flex items-center gap-3 mt-1">
                {photo.weight  && <span className="text-xs text-slate-400"><Scale size={10} className="inline mr-1" />{photo.weight}kg</span>}
                {photo.body_fat && <span className="text-xs text-slate-400"><TrendingDown size={10} className="inline mr-1" />{photo.body_fat}% gordura</span>}
              </div>
              {photo.notes && <p className="text-xs text-slate-500 mt-1 italic">{'"'}{photo.notes}{'"'}</p>}
            </div>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              <Trash2 size={12} />
              {deleting ? 'Excluindo…' : 'Excluir'}
            </button>
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}

// ── Photo Thumbnail ───────────────────────────
function PhotoThumb({
  photo,
  size = 80,
  onClick,
  selected,
}: {
  photo:    ProgressPhoto
  size?:    number
  onClick?: () => void
  selected?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative rounded-xl overflow-hidden bg-white/[0.04] border transition-all group',
        selected ? 'border-violet-500/60 ring-2 ring-violet-500/30' : 'border-white/[0.08] hover:border-white/[0.2]',
      )}
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      {photo.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo.image_url} alt={photo.date} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Camera size={16} className="text-slate-700" />
        </div>
      )}
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end pb-1.5 gap-0.5">
        <span className="text-[9px] text-white font-semibold leading-none">
          {new Date(photo.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
        </span>
        {photo.weight && <span className="text-[9px] text-white/80 leading-none">{photo.weight}kg</span>}
      </div>
    </button>
  )
}

// ── Week Tab ──────────────────────────────────
function WeekTab({
  photos,
  navWeek,
  navYear,
  onSelect,
  onUpload,
}: {
  photos:   ProgressPhoto[]
  navWeek:  number
  navYear:  number
  onSelect: (p: ProgressPhoto) => void
  onUpload: (date: string) => void
}) {
  const dates = getWeekDaysBRT(navYear, navWeek)
  const today = getTodayStr()

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {dates.map((date, i) => {
        const photo   = photos.find((p) => p.date === date)
        const isToday = date === today
        const isPast  = date <= today

        return (
          <div key={date} className="flex flex-col items-center gap-1.5">
            <span className="text-[9px] text-slate-600 font-semibold">{DAY_LABELS[i]}</span>
            {photo ? (
              <PhotoThumb photo={photo} size={64} onClick={() => onSelect(photo)} />
            ) : (
              <button
                onClick={() => isPast && onUpload(date)}
                disabled={!isPast}
                className={cn(
                  'w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center transition-all',
                  isToday ? 'border-violet-500/50 ring-2 ring-violet-500/20' : 'border-white/[0.1]',
                  isPast ? 'hover:border-violet-500/30 hover:bg-violet-500/[0.04] cursor-pointer' : 'opacity-30 cursor-not-allowed',
                )}
              >
                {isPast && <Camera size={14} className="text-slate-700 group-hover:text-violet-400" />}
              </button>
            )}
            {isToday && <span className="text-[8px] text-violet-400 font-bold">hoje</span>}
          </div>
        )
      })}
    </div>
  )
}

// ── Month Tab ─────────────────────────────────
function MonthTab({
  photos,
  navMonth,
  navYear,
  onSelect,
}: {
  photos:   ProgressPhoto[]
  navMonth: number
  navYear:  number
  onSelect: (p: ProgressPhoto) => void
}) {
  const monthPhotos = photos.filter((p) => p.month === navMonth && p.year === navYear)

  // Agrupar por semana
  const byWeek = useMemo(() => {
    const map = new Map<number, ProgressPhoto[]>()
    for (const p of monthPhotos) {
      if (!map.has(p.week)) map.set(p.week, [])
      map.get(p.week)!.push(p)
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0])
  }, [monthPhotos])

  if (byWeek.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Camera size={32} className="text-slate-700" />
        <p className="text-sm text-slate-600">Nenhuma foto neste mês</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {byWeek.map(([week, weekPhotos]) => (
        <div key={week}>
          <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider mb-2">
            Semana {week}
          </p>
          <div className="flex gap-2 flex-wrap">
            {weekPhotos.map((p) => (
              <PhotoThumb key={p.id} photo={p} size={80} onClick={() => onSelect(p)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Timeline Tab ──────────────────────────────
function TimelineTab({
  photos,
  compareMode,
  comparePhotos,
  onSelect,
  onCompareToggle,
}: {
  photos:         ProgressPhoto[]
  compareMode:    boolean
  comparePhotos:  [ProgressPhoto | null, ProgressPhoto | null]
  onSelect:       (p: ProgressPhoto) => void
  onCompareToggle: (p: ProgressPhoto) => void
}) {
  // Agrupar por mês/ano
  const byMonth = useMemo(() => {
    const map = new Map<string, ProgressPhoto[]>()
    for (const p of photos) {
      const key = `${p.year}-${String(p.month).padStart(2, '0')}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(p)
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  }, [photos])

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Calendar size={32} className="text-slate-700" />
        <p className="text-sm text-slate-600">Nenhuma foto registrada ainda</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {byMonth.map(([key, monthPhotos]) => {
        const [yr, mo] = key.split('-')
        return (
          <div key={key}>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">
              {MONTH_NAMES[parseInt(mo) - 1]} {yr}
            </p>
            <div className="border-l-2 border-white/[0.08] pl-4 space-y-4">
              {monthPhotos.map((p) => {
                const dayLabel = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', weekday: 'short' })
                  .format(new Date(p.date + 'T12:00:00'))
                const isSelectedForCompare = comparePhotos[0]?.id === p.id || comparePhotos[1]?.id === p.id

                return (
                  <div key={p.id} className="flex gap-4 items-start">
                    {/* Foto */}
                    <div className="relative">
                      <PhotoThumb
                        photo={p}
                        size={120}
                        onClick={() => compareMode ? onCompareToggle(p) : onSelect(p)}
                        selected={isSelectedForCompare}
                      />
                      {/* Marker na timeline */}
                      <div className="absolute -left-6 top-4 w-3 h-3 rounded-full bg-violet-500/60 ring-2 ring-[#080b14]" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="text-sm font-bold text-slate-100 capitalize">{dayLabel}</p>
                      <div className="flex flex-wrap gap-3 mt-1.5">
                        {p.weight   && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Scale size={10} className="text-slate-600" />{p.weight}kg
                          </span>
                        )}
                        {p.body_fat && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <TrendingDown size={10} className="text-slate-600" />{p.body_fat}%
                          </span>
                        )}
                      </div>
                      {p.notes && (
                        <p className="text-xs text-slate-600 mt-1 italic">{'"'}{p.notes}{'"'}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Compare View ──────────────────────────────
function CompareView({
  photos,
  onClose,
}: {
  photos: [ProgressPhoto | null, ProgressPhoto | null]
  onClose: () => void
}) {
  const [a, b] = photos
  if (!a || !b) return null

  const weightDiff  = a.weight  && b.weight  ? a.weight  - b.weight  : null
  const bodyFatDiff = a.body_fat && b.body_fat ? a.body_fat - b.body_fat : null

  const dateA = new Date(a.date + 'T12:00:00')
  const dateB = new Date(b.date + 'T12:00:00')
  const daysDiff = Math.abs(Math.round((dateA.getTime() - dateB.getTime()) / 86400000))

  function fmtDate(d: Date) {
    return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  function fmtDiff(val: number | null, unit: string) {
    if (val === null) return null
    const sign = val > 0 ? '+' : ''
    return `${sign}${val.toFixed(1)}${unit}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#0d1117] border border-white/[0.1] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <GitCompare size={16} className="text-violet-400" />
            <span className="font-bold text-slate-100 text-sm">Comparativo</span>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          {/* Side by side */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            {[a, b].map((p, i) => (
              <div key={i} className="text-center">
                {p.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt={p.date} className="w-full h-48 object-cover rounded-xl mb-3" />
                )}
                <p className="text-sm font-bold text-slate-100">
                  {fmtDate(new Date(p.date + 'T12:00:00'))}
                </p>
                {p.weight  && <p className="text-xs text-slate-400 mt-0.5">{p.weight}kg</p>}
                {p.body_fat && <p className="text-xs text-slate-400">{p.body_fat}% gordura</p>}
              </div>
            ))}
          </div>

          {/* Diff */}
          <div className="border-t border-white/[0.06] pt-4">
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="text-center">
                <p className="text-xs text-slate-600">Intervalo</p>
                <p className="text-sm font-bold text-slate-200">{daysDiff} dias</p>
              </div>
              {weightDiff !== null && (
                <div className="text-center">
                  <p className="text-xs text-slate-600">Peso</p>
                  <p className={cn(
                    'text-sm font-bold',
                    weightDiff < 0 ? 'text-emerald-400' : weightDiff > 0 ? 'text-red-400' : 'text-slate-200',
                  )}>
                    {fmtDiff(weightDiff, 'kg')}
                  </p>
                </div>
              )}
              {bodyFatDiff !== null && (
                <div className="text-center">
                  <p className="text-xs text-slate-600">Gordura</p>
                  <p className={cn(
                    'text-sm font-bold',
                    bodyFatDiff < 0 ? 'text-emerald-400' : bodyFatDiff > 0 ? 'text-red-400' : 'text-slate-200',
                  )}>
                    {fmtDiff(bodyFatDiff, '%')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── ProgressPhotoTracker — componente principal ──
export function ProgressPhotoTracker() {
  const profile = useProfileStore((s) => s.profile)

  const [photos,      setPhotos]      = useState<ProgressPhoto[]>([])
  const [loading,     setLoading]     = useState(true)
  const [tab,         setTab]         = useState<Tab>('week')
  const [navWeek,     setNavWeek]     = useState(getBRTWeekNumber())
  const [navYear,     setNavYear]     = useState(getBRTYear())
  const [navMonth,    setNavMonth]    = useState(new Date().getMonth() + 1)
  const [navMonthYr,  setNavMonthYr]  = useState(new Date().getFullYear())
  const [selected,    setSelected]    = useState<ProgressPhoto | null>(null)
  const [uploadOpen,  setUploadOpen]  = useState(false)
  const [uploadDate,  setUploadDate]  = useState(getTodayStr())
  const [compareMode, setCompareMode] = useState(false)
  const [comparePair, setComparePair] = useState<[ProgressPhoto | null, ProgressPhoto | null]>([null, null])
  const [showCompare, setShowCompare] = useState(false)

  const fetchPhotos = useCallback(async () => {
    try {
      const res = await fetch('/api/progress-photos')
      if (res.ok) setPhotos(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPhotos() }, [fetchPhotos])

  function handlePhotoAdded(photo: ProgressPhoto) {
    setPhotos((prev) => [photo, ...prev])
  }

  async function handleDelete(id: string, storagePath: string) {
    await fetch('/api/progress-photos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, storagePath }),
    })
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  function handleOpenUpload(date?: string) {
    setUploadDate(date ?? getTodayStr())
    setUploadOpen(true)
  }

  function handleCompareToggle(p: ProgressPhoto) {
    setComparePair((prev) => {
      if (prev[0]?.id === p.id) return [null, prev[1]]
      if (prev[1]?.id === p.id) return [prev[0], null]
      if (!prev[0]) return [p, prev[1]]
      if (!prev[1]) return [prev[0], p]
      return [p, null]
    })
  }

  function navigateWeek(dir: -1 | 1) {
    let w = navWeek + dir
    let y = navYear
    if (w < 1)  { w = 52; y -= 1 }
    if (w > 52) { w = 1;  y += 1 }
    setNavWeek(w); setNavYear(y)
  }

  function navigateMonth(dir: -1 | 1) {
    let m = navMonth + dir
    let y = navMonthYr
    if (m < 1)  { m = 12; y -= 1 }
    if (m > 12) { m = 1;  y += 1 }
    setNavMonth(m); setNavMonthYr(y)
  }

  const canCompare = comparePair[0] !== null && comparePair[1] !== null

  const TABS: { key: Tab; label: string }[] = [
    { key: 'week',     label: 'Semana'         },
    { key: 'month',    label: 'Mês'            },
    { key: 'timeline', label: 'Linha do Tempo' },
  ]

  return (
    <>
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
              <Camera size={15} className="text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Progresso Visual</h3>
              <p className="text-[11px] text-slate-500">{photos.length} {photos.length === 1 ? 'foto registrada' : 'fotos registradas'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {tab === 'timeline' && (
              <button
                onClick={() => setCompareMode((v) => !v)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
                  compareMode
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                    : 'bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:text-slate-200',
                )}
              >
                <GitCompare size={12} />
                Comparar
              </button>
            )}
            {compareMode && canCompare && (
              <button
                onClick={() => setShowCompare(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/25 transition-all"
              >
                Ver comparativo
              </button>
            )}
            <button
              onClick={() => handleOpenUpload()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/20 hover:bg-violet-500/25 transition-all active:scale-95"
            >
              <Plus size={13} />
              Adicionar foto
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.06]">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'flex-1 py-2.5 text-xs font-bold transition-all',
                tab === key
                  ? 'text-violet-300 border-b-2 border-violet-500'
                  : 'text-slate-600 hover:text-slate-400',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Navigation row */}
        {(tab === 'week' || tab === 'month') && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04]">
            <button
              onClick={() => tab === 'week' ? navigateWeek(-1) : navigateMonth(-1)}
              className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-semibold text-slate-400">
              {tab === 'week'
                ? `Semana ${navWeek} · ${navYear}`
                : `${MONTH_NAMES[navMonth - 1]} ${navMonthYr}`}
            </span>
            <button
              onClick={() => tab === 'week' ? navigateWeek(1) : navigateMonth(1)}
              className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-5">
          {loading ? (
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="w-full aspect-square rounded-xl bg-white/[0.04] animate-pulse" />
              ))}
            </div>
          ) : tab === 'week' ? (
            <WeekTab
              photos={photos}
              navWeek={navWeek}
              navYear={navYear}
              onSelect={setSelected}
              onUpload={handleOpenUpload}
            />
          ) : tab === 'month' ? (
            <MonthTab
              photos={photos}
              navMonth={navMonth}
              navYear={navMonthYr}
              onSelect={setSelected}
            />
          ) : (
            <TimelineTab
              photos={photos}
              compareMode={compareMode}
              comparePhotos={comparePair}
              onSelect={setSelected}
              onCompareToggle={handleCompareToggle}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {uploadOpen && (
        <UploadModal
          initialDate={uploadDate}
          defaultWeight={profile.weight ?? undefined}
          defaultBodyFat={profile.bodyFat ?? undefined}
          onClose={() => setUploadOpen(false)}
          onSuccess={handlePhotoAdded}
        />
      )}
      {selected && (
        <Lightbox
          photo={selected}
          onClose={() => setSelected(null)}
          onDelete={async (id, sp) => { await handleDelete(id, sp); setSelected(null) }}
        />
      )}
      {showCompare && canCompare && (
        <CompareView
          photos={comparePair}
          onClose={() => setShowCompare(false)}
        />
      )}
    </>
  )
}
