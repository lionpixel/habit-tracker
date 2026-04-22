# Metas Mensais

## Objetivo
Transformar metas trimestrais em objetivos concretos do mês, com cálculo automático de quanto fazer por semana e por dia.

## Como se conecta
- Recebe de: metas trimestrais (`quarterlyGoalId`)
- Alimenta: [[06_planejamento_semanal]] (metas semanais)
- Revisado em: [[13_revisoes]] (mensal)

## Campos

| Campo | Tipo | Exemplo |
|-------|------|---------|
| Título | string | "Fazer R$ 10.000 em maio" |
| Mês | number | 5 (maio) |
| Valor-alvo | number | 10000 |
| Unidade | string | "R$" |
| Valor atual | number | 0 |
| Por semana (auto) | calc | R$ 2.307 |
| Por dia (auto) | calc | R$ 333 |
| Progresso | 0-100 | Calculado das metas semanais |
| Status | enum | not_started / in_progress / done |
| Meta trimestral pai | ID | Link para quarterlyGoals |

## Matemática automática (Cálculo do sistema)

```
targetValue ÷ 4.33 = por semana
targetValue ÷ 30   = por dia
```

## Exemplos

```yaml
Fazer R$ 10.000 no mês:
  por semana: R$ 2.307
  por dia:    R$ 333

Ler 4 livros:
  por semana: 1 livro
  por dia:    ~14 páginas

Emagrecer 1kg:
  déficit semanal: 1.000 kcal
  déficit diário:  ~143 kcal
```

## Execução no código

- Store: `src/store/goalsStore.ts` → `monthlyGoals[]`
- Tipos: `src/types/goals.ts` → `MonthlyGoal`
- View: `src/components/planner/MonthlyPlannerView.tsx`
- Cálculo automático: `src/components/planner/GoalCascadePanel.tsx` → `autoMath()`
