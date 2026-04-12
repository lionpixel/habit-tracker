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

export const DREAM_CATEGORIES: Record<DreamCategory, { label: string; color: string; emoji: string }> = {
  corpo:           { label: 'Corpo',           color: '#ef4444', emoji: '💪' },
  dinheiro:        { label: 'Dinheiro',        color: '#10b981', emoji: '💰' },
  carro:           { label: 'Carro',           color: '#0ea5e9', emoji: '🚗' },
  casa:            { label: 'Casa',            color: '#f59e0b', emoji: '🏠' },
  trabalho:        { label: 'Trabalho',        color: '#6366f1', emoji: '💼' },
  relacionamentos: { label: 'Relacionamentos', color: '#ec4899', emoji: '❤️' },
  viagens:         { label: 'Viagens',         color: '#22d3ee', emoji: '✈️' },
  estudos:         { label: 'Estudos',         color: '#a855f7', emoji: '📚' },
  estilo:          { label: 'Estilo de vida',  color: '#f97316', emoji: '✨' },
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
