// ─────────────────────────────────────────────
//  Component: Dream Vision Board Mosaic
//  Grade 3x2 das primeiras imagens dos sonhos
// ─────────────────────────────────────────────

'use client'

import { useDreamsStore } from '@/store/dreamsStore'
import { DREAM_CATEGORIES } from '@/types/dreams'
import Link from 'next/link'
import { Sparkles, Plus } from 'lucide-react'
import { cn } from '@/lib/helpers'

export function DreamVisionMosaic() {
  const { dreams } = useDreamsStore()

  const withImages  = dreams.filter((d) => d.imageUrl && d.status !== 'achieved').slice(0, 6)
  const withEmoji   = dreams.filter((d) => d.status !== 'achieved').slice(0, 6)
  const items       = withImages.length >= 3 ? withImages : withEmoji

  if (items.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="text-3xl mb-3">🌟</div>
        <p className="text-slate-500 text-sm mb-4">Adicione sonhos para montar seu quadro de visão</p>
        <Link
          href="/dreams"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/15 text-violet-300 text-sm font-semibold hover:bg-violet-500/25 transition-colors"
        >
          <Plus size={14} /> Adicionar sonho
        </Link>
      </div>
    )
  }

  // Layout assimétrico: primeiro item ocupa 2 colunas se houver >= 5
  const bigFirst = items.length >= 5

  return (
    <div className="card overflow-hidden">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-violet-400" />
          <span className="text-xs font-bold text-slate-300">Quadro dos Sonhos</span>
        </div>
        <Link href="/dreams" className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold transition-colors">
          Ver todos →
        </Link>
      </div>

      <div className={cn(
        'grid gap-1 p-2',
        bigFirst ? 'grid-cols-3' : 'grid-cols-3',
      )}>
        {items.map((dream, idx) => {
          const cat   = DREAM_CATEGORIES[dream.category]
          const isBig = bigFirst && idx === 0
          return (
            <Link
              key={dream.id}
              href="/dreams"
              className={cn(
                'relative rounded-xl overflow-hidden aspect-square group',
                isBig && 'row-span-2 col-span-1',
              )}
              style={{ aspectRatio: isBig ? '1/2' : '1/1' }}
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
                  className="w-full h-full flex flex-col items-center justify-center gap-1"
                  style={{ background: `${cat.color}18` }}
                >
                  <span className="text-2xl">{cat.emoji}</span>
                </div>
              )}
              {/* overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <span className="text-white text-[10px] font-bold leading-tight line-clamp-2">{dream.title}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
