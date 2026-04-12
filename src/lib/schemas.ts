// ─────────────────────────────────────────────
//  Zod Schemas — validação de dados
//  Usados em forms, API responses e storage
// ─────────────────────────────────────────────

import { z } from 'zod'

// ── Primitives ───────────────────────────────

export const HabitKeySchema = z.enum([
  'reading', 'english', 'hiit', 'ppci', 'dopamine', 'fasting',
])

export const HabitColorSchema = z.enum([
  '#6366f1', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4',
])

export const WeeklyCountMapSchema = z.record(z.string(), z.number().nonnegative())
export const MonthlyTotalMapSchema = z.record(z.string(), z.number().nonnegative())

// ── HabitBase ────────────────────────────────

export const HabitBaseSchema = z.object({
  name:          z.string().min(1).max(50),
  icon:          z.string().min(1),         // Lucide icon id
  color:         HabitColorSchema,
  target:        z.number().int().min(1).max(300),
  unit:          z.string().min(1),
  frequency:     z.number().int().min(1).max(7),
  description:   z.string().max(200),
  counts:        WeeklyCountMapSchema,
  monthlyTotals: MonthlyTotalMapSchema,
  totalYear:     z.number().nonnegative(),
  goalFreq:      z.number().int().min(1).max(7).optional(),
  goalDuration:  z.union([z.literal(25), z.literal(50)]).optional(),
})

export const EnglishHabitSchema = HabitBaseSchema.extend({
  seriesCounts:     WeeklyCountMapSchema,
  carryoverMinutes: z.number().nonnegative(),
})

export const FastingHabitSchema = HabitBaseSchema.extend({
  currentStreak:    z.number().nonnegative(),
  completedCycles:  z.number().nonnegative(),
  lastUpdate:       z.string(),
  lastReset:        z.string(),
  isSpecial:        z.literal(true),
})

// ── HabitsMap ────────────────────────────────

export const HabitsMapSchema = z.object({
  reading:  HabitBaseSchema,
  english:  EnglishHabitSchema,
  hiit:     HabitBaseSchema,
  ppci:     HabitBaseSchema,
  dopamine: HabitBaseSchema,
  fasting:  FastingHabitSchema,
})

// ── AppData ──────────────────────────────────

export const AppDataSchema = z.object({
  currentWeek:  z.number().int().min(1).max(53),
  currentYear:  z.number().int().min(2024).max(2100),
  currentMonth: z.number().int().min(1).max(12),
  habits:       HabitsMapSchema,
})

// ── Sleep ────────────────────────────────────

export const SleepEntrySchema = z.object({
  date:           z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  bedTime:        z.string().regex(/^\d{2}:\d{2}$/),
  wakeTime:       z.string().regex(/^\d{2}:\d{2}$/),
  durationMinutes: z.number().nonnegative(),
  quality:        z.number().int().min(1).max(5).optional(),
  notes:          z.string().max(500).optional(),
})

export const SleepConfigSchema = z.object({
  targetWake: z.string().regex(/^\d{2}:\d{2}$/),
})

export const SleepDataSchema = z.object({
  log:    z.record(z.string(), SleepEntrySchema),
  config: SleepConfigSchema,
})

// ── Pomodoro ─────────────────────────────────

export const TaskPrioritySchema = z.enum(['P1', 'P2', 'P3'])

export const PomodoroTaskSchema = z.object({
  id:        z.string().min(1),
  name:      z.string().min(1).max(100),
  priority:  TaskPrioritySchema,
  pomodoros: z.number().int().min(0).max(20),
  log:       z.array(z.string()),
})

export const DayPomoDataSchema = z.object({
  tasks: z.array(PomodoroTaskSchema),
  total: z.number().nonnegative(),
})

// ── User / Settings ──────────────────────────

export const UserSettingsSchema = z.object({
  displayName:   z.string().min(1).max(60).optional(),
  theme:         z.enum(['dark', 'light']).default('dark'),
  language:      z.enum(['pt-BR', 'en-US']).default('pt-BR'),
  notifications: z.boolean().default(true),
  weekStartDay:  z.number().int().min(0).max(6).default(1), // 1 = Monday
})

// ── Achievements ─────────────────────────────

export const AchievementSchema = z.object({
  id:          z.string(),
  title:       z.string(),
  description: z.string(),
  iconId:      z.string(),
  unlockedAt:  z.string().optional(),
  unlocked:    z.boolean().default(false),
  progress:    z.number().min(0).max(100).default(0),
})

// ── API response wrappers (future backend) ───

export const ApiSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data:    dataSchema,
  })

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code:    z.string(),
    message: z.string(),
  }),
})

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.union([ApiSuccessSchema(dataSchema), ApiErrorSchema])

// ── Category ─────────────────────────────────

export const CategoryIdSchema = z.string().min(1).max(80)

export const HabitCategorySchema = z.object({
  id:             CategoryIdSchema,
  name:           z.string().min(1).max(50),
  icon:           z.string().min(1),
  color:          z.string().regex(/^#[0-9a-fA-F]{6}$/),
  description:    z.string().max(200),
  isDefault:      z.boolean(),
  archived:       z.boolean().optional(),
  sortOrder:      z.number().int().nonnegative().optional(),
  weeklyGoalMin:  z.number().nonnegative().optional(),
  monthlyGoalMin: z.number().nonnegative().optional(),
  habitKeys:      z.array(z.string()),
  createdAt:      z.string(),
  updatedAt:      z.string().optional(),
})

// ── Physical Profile ──────────────────────────

export const SexSchema          = z.enum(['male', 'female', 'other'])
export const ActivityLevelSchema = z.enum(['sedentary','light','moderate','active','very_active'])
export const PhysicalGoalSchema  = z.enum(['lose_fat','gain_muscle','maintain','improve_health','improve_performance'])

export const PhysicalProfileSchema = z.object({
  name:          z.string().max(60).optional(),
  age:           z.number().int().min(1).max(120).optional(),
  sex:           SexSchema.optional(),
  height:        z.number().min(50).max(300).optional(),
  activityLevel: ActivityLevelSchema.optional(),
  goal:          PhysicalGoalSchema.optional(),
  weight:        z.number().min(10).max(500).optional(),
  bodyFat:       z.number().min(0).max(100).optional(),
  leanMass:      z.number().nonnegative().optional(),
  fatMass:       z.number().nonnegative().optional(),
  waist:         z.number().min(20).max(300).optional(),
  imc:           z.number().nonnegative().optional(),
  goalWeight:    z.number().nonnegative().optional(),
  goalBodyFat:   z.number().min(0).max(100).optional(),
  goalLeanMass:  z.number().nonnegative().optional(),
  goalWaist:     z.number().nonnegative().optional(),
  updatedAt:     z.string().optional(),
})

export const BodyCheckInSchema = z.object({
  date:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weight:    z.number().nonnegative().optional(),
  bodyFat:   z.number().min(0).max(100).optional(),
  leanMass:  z.number().nonnegative().optional(),
  fatMass:   z.number().nonnegative().optional(),
  waist:     z.number().nonnegative().optional(),
  imc:       z.number().nonnegative().optional(),
  calories:  z.number().nonnegative().optional(),
  water:     z.number().nonnegative().optional(),
  notes:     z.string().max(500).optional(),
})

// ── Finance ───────────────────────────────────

const MoneySchema = z.number().nonnegative()
const MonthKeySchema = z.string().regex(/^\d{4}-\d{2}$/)

export const MonthlyFinanceSchema = z.object({
  monthKey:        MonthKeySchema,
  salary:          MoneySchema,
  freelance:       MoneySchema,
  business:        MoneySchema,
  investmentReturn:MoneySchema,
  otherIncome:     MoneySchema,
  housing:         MoneySchema,
  food:            MoneySchema,
  transport:       MoneySchema,
  health:          MoneySchema,
  education:       MoneySchema,
  entertainment:   MoneySchema,
  utilities:       MoneySchema,
  clothing:        MoneySchema,
  personal:        MoneySchema,
  debt:            MoneySchema,
  otherExpense:    MoneySchema,
  investments:     MoneySchema,
  emergencyFund:   MoneySchema,
  savings:         MoneySchema,
  notes:           z.string().max(500).optional(),
})

export const FinancialGoalSchema = z.object({
  id:            z.string().min(1),
  name:          z.string().min(1).max(60),
  targetAmount:  MoneySchema,
  currentAmount: MoneySchema,
  deadline:      MonthKeySchema.optional(),
  icon:          z.string().optional(),
  color:         z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  createdAt:     z.string(),
})

// ── Export inferred types ────────────────────

export type HabitKeyType         = z.infer<typeof HabitKeySchema>
export type HabitBaseType        = z.infer<typeof HabitBaseSchema>
export type EnglishHabitType     = z.infer<typeof EnglishHabitSchema>
export type FastingHabitType     = z.infer<typeof FastingHabitSchema>
export type AppDataType          = z.infer<typeof AppDataSchema>
export type SleepEntryType       = z.infer<typeof SleepEntrySchema>
export type SleepDataType        = z.infer<typeof SleepDataSchema>
export type UserSettingsType     = z.infer<typeof UserSettingsSchema>
export type AchievementType      = z.infer<typeof AchievementSchema>
export type HabitCategoryType    = z.infer<typeof HabitCategorySchema>
export type PhysicalProfileType  = z.infer<typeof PhysicalProfileSchema>
export type BodyCheckInType      = z.infer<typeof BodyCheckInSchema>
export type MonthlyFinanceType   = z.infer<typeof MonthlyFinanceSchema>
export type FinancialGoalType    = z.infer<typeof FinancialGoalSchema>
