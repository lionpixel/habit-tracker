// ─────────────────────────────────────────────
//  Types: Category system
// ─────────────────────────────────────────────

import type { HabitKey } from './habit'

export type CategoryId = string  // slug, e.g. 'saude', 'estudos', 'custom-uuid'

export interface HabitCategory {
  id:          CategoryId
  name:        string
  icon:        string          // Lucide icon name
  color:       string          // hex
  description: string
  isDefault:   boolean
  archived?:   boolean
  sortOrder?:  number

  // Goals
  weeklyGoalMin?:  number
  monthlyGoalMin?: number

  // Linked habits
  habitKeys:   HabitKey[]

  createdAt:   string
  updatedAt?:  string
}

export interface CategoryStats {
  categoryId:        CategoryId
  totalMinutes:      number
  weekMinutes:       number
  monthMinutes:      number
  consistency:       number    // 0-100
  streak:            number
  riskLevel:         'low' | 'medium' | 'high'
  score:             number    // 0-100 overall score
  habitsCompleted:   number
  habitsTotal:       number
}

export type CategoryInsightType =
  | 'most_consistent'
  | 'most_invested'
  | 'at_risk'
  | 'most_neglected'
  | 'most_improved'
  | 'goal_achieved'

export interface CategoryInsight {
  type:       CategoryInsightType
  categoryId: CategoryId
  title:      string
  body:       string
  iconId:     string
}

// Default category definitions
export const DEFAULT_CATEGORIES: Omit<HabitCategory, 'createdAt' | 'habitKeys'>[] = [
  { id: 'saude',       name: 'Saúde',                icon: 'Heart',        color: '#ef4444', description: 'Saúde geral e bem-estar',     isDefault: true, sortOrder: 1  },
  { id: 'sono',        name: 'Sono',                 icon: 'Moon',         color: '#6366f1', description: 'Qualidade do sono',            isDefault: true, sortOrder: 2  },
  { id: 'exercicio',   name: 'Exercício',            icon: 'Dumbbell',     color: '#f97316', description: 'Treino e atividade física',    isDefault: true, sortOrder: 3  },
  { id: 'alimentacao', name: 'Alimentação',          icon: 'Apple',        color: '#10b981', description: 'Nutrição e dieta',             isDefault: true, sortOrder: 4  },
  { id: 'leitura',     name: 'Leitura',              icon: 'BookOpen',     color: '#8b5cf6', description: 'Livros e artigos',             isDefault: true, sortOrder: 5  },
  { id: 'estudos',     name: 'Estudos',              icon: 'GraduationCap',color: '#0ea5e9', description: 'Aprendizado e educação',       isDefault: true, sortOrder: 6  },
  { id: 'trabalho',    name: 'Trabalho',             icon: 'Briefcase',    color: '#f59e0b', description: 'Produtividade profissional',   isDefault: true, sortOrder: 7  },
  { id: 'produtividade',name: 'Produtividade',       icon: 'Zap',          color: '#22d3ee', description: 'Foco e eficiência',            isDefault: true, sortOrder: 8  },
  { id: 'espiritualidade',name: 'Espiritualidade',  icon: 'Sparkles',     color: '#a78bfa', description: 'Meditação e espiritualidade',  isDefault: true, sortOrder: 9  },
  { id: 'financas',    name: 'Finanças',             icon: 'TrendingUp',   color: '#34d399', description: 'Educação financeira',          isDefault: true, sortOrder: 10 },
  { id: 'relacionamentos',name: 'Relacionamentos',  icon: 'Users',        color: '#fb7185', description: 'Família e amizades',           isDefault: true, sortOrder: 11 },
  { id: 'mentalidade', name: 'Mentalidade',          icon: 'Brain',        color: '#c084fc', description: 'Saúde mental e mindset',       isDefault: true, sortOrder: 12 },
  { id: 'desenvolvimento',name: 'Desenvolvimento',  icon: 'Target',       color: '#38bdf8', description: 'Desenvolvimento pessoal',      isDefault: true, sortOrder: 13 },
  { id: 'lazer',       name: 'Lazer',               icon: 'Smile',        color: '#fbbf24', description: 'Descanso e lazer',             isDefault: true, sortOrder: 14 },
  { id: 'casa',        name: 'Casa',                icon: 'Home',         color: '#64748b', description: 'Organização e casa',           isDefault: true, sortOrder: 15 },
]
