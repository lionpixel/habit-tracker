// ─────────────────────────────────────────────
//  Habit Icon Registry — maps string IDs to Lucide components
// ─────────────────────────────────────────────

import {
  BookOpen,
  Languages,
  Dumbbell,
  Code2,
  Brain,
  Apple,
  // Generic fallback icons for future habits
  Star,
  Heart,
  Moon,
  Sun,
  Zap,
  Target,
  Music,
  Coffee,
  Bike,
  Wind,
  Flame,
  type LucideProps,
} from 'lucide-react'
import type { ComponentType } from 'react'

export type LucideIconId =
  | 'BookOpen' | 'Languages' | 'Dumbbell' | 'Code2' | 'Brain' | 'Apple'
  | 'Star' | 'Heart' | 'Moon' | 'Sun' | 'Zap' | 'Target'
  | 'Music' | 'Coffee' | 'Bike' | 'Wind' | 'Flame'

const ICON_MAP: Record<LucideIconId, ComponentType<LucideProps>> = {
  BookOpen,
  Languages,
  Dumbbell,
  Code2,
  Brain,
  Apple,
  Star,
  Heart,
  Moon,
  Sun,
  Zap,
  Target,
  Music,
  Coffee,
  Bike,
  Wind,
  Flame,
}

interface HabitIconProps extends LucideProps {
  id: string
}

export function HabitIcon({ id, ...props }: HabitIconProps) {
  const Icon = ICON_MAP[id as LucideIconId] ?? Star
  return <Icon {...props} />
}
