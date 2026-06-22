// ─────────────────────────────────────────────
//  Types: Quadro dos Sonhos 2026
// ─────────────────────────────────────────────

export type DreamCategory =
  | 'corpo'
  | 'dinheiro'
  | 'carro'
  | 'casa'
  | 'trabalho'
  | 'relacionamentos'
  | 'viagens'
  | 'estudos'
  | 'estilo'

export const DREAM_CATEGORIES: Record<DreamCategory, { label: string; color: string }> = {
  corpo:           { label: 'Corpo',           color: '#ef4444' },
  dinheiro:        { label: 'Dinheiro',        color: '#10b981' },
  carro:           { label: 'Carro',           color: '#0ea5e9' },
  casa:            { label: 'Casa',            color: '#f59e0b' },
  trabalho:        { label: 'Trabalho',        color: '#6366f1' },
  relacionamentos: { label: 'Relacionamentos', color: '#ec4899' },
  viagens:         { label: 'Viagens',         color: '#22d3ee' },
  estudos:         { label: 'Estudos',         color: '#a855f7' },
  estilo:          { label: 'Estilo de vida',  color: '#f97316' },
}

export type DreamStatus = 'active' | 'achieved' | 'paused'

export interface Dream {
  id:               string
  title:            string
  description:      string
  category:         DreamCategory
  imageUrl?:        string
  targetDate?:      string           // YYYY-MM-DD
  financialTarget?: number           // R$ meta
  financialCurrent?: number          // R$ atual
  emotionalReason:  string           // por que isso importa
  executionPlan:    string           // como conquistar
  progress:         number           // 0–100
  status:           DreamStatus
  linkedAnnualGoalId?: string
  createdAt:        string
  updatedAt:        string
}
