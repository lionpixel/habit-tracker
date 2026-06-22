// ─────────────────────────────────────────────
//  Component: Dream Vision Board Mosaic
//  Grade 3x2 das primeiras imagens dos sonhos
// ─────────────────────────────────────────────

'use client'

import { useDreamsStore } from '@/store/dreamsStore'
import { DREAM_CATEGORIES } from '@/types/dreams'
import Link from 'next/link'
import { Sparkles, Plus } from 'lucide-react'

export function DreamVisionMosaic() {
  const { dreams } = useDreamsStore()

  const items = dreams.filter((d) => d.status !== 'achieved').slice(0, 5)

  if (items.length === 0) {
    return (
      <div className="card p-6 text-center">
        <Sparkles size={18} className="text-slate-600 mx-auto mb-2" />
        <p className="text-slate-500 text-sm mb-3">Adicione sonhos para montar seu quadro de visão</p>
        <Link
          href="/dreams"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/15 text-violet-300 text-sm font-semibold hover:bg-violet-500/25 transition-colors"
        >
          <Plus size={14} /> Adicionar sonho
        </Link>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-violet-400" />
          <span className="text-xs font-bold text-slate-300">Quadro dos Sonhos</span>
        </div>
        <Link href="/dreams" className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold transition-colors">
          Ver todos →
        </Link>
      </div>

      <div className="grid grid-cols-5 gap-1.5 p-2 pt-1">
        {items.map((dream) => {
          const cat = DREAM_CATEGORIES[dream.category]
          return (
            <Link
              key={dream.id}
              href="/dreams"
              className="relative rounded-lg overflow-hidden group"
              style={{ aspectRatio: '1/1', height: 80 }}
            >
              {dream.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={dream.imageUrl}
                  alt={dream.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: `${cat.color}18` }}
                >
                  <span
                    className="text-[10px] text-center px-1 leading-tight font-medium"
                    style={{ color: cat.color }}
                  >
                    {dream.title.slice(0, 18)}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1">
                <span className="text-white text-[9px] font-bold leading-tight line-clamp-2">{dream.title}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
