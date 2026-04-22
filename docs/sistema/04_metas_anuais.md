# Metas Anuais

## Objetivo
Definir os grandes resultados do ano, quebrar em trimestres e rastrear progresso com divisão automática por período.

## Como se conecta
- Recebe de: [[03_quadro_sonhos]] (sonhos vinculados)
- Alimenta: metas trimestrais → mensais → semanais → tarefas
- Revisado em: [[13_revisoes]] (mensal e anual)

## Campos

| Campo | Tipo | Exemplo |
|-------|------|---------|
| Título | string | "Faturar R$ 120.000" |
| Categoria | string | Financeiro / Saúde / Carreira |
| Valor-alvo | number | 120000 |
| Unidade | string | "R$" / "kg" / "livros" |
| Valor atual | number | Atualizado pelas metas filhas |
| Progresso | 0-100 | Calculado das metas trimestrais |
| Status | enum | not_started / in_progress / done / cancelled |
| Prioridade | enum | critical / high / medium / low |
| Prazo | date | 2026-12-31 |
| Sonho vinculado | ID | Link para Quadro dos Sonhos |

## Exemplos de Metas Anuais 2026

```yaml
- Faturar R$ 120.000 no ano           # Financeiro · Critical
- Peso 78kg                            # Saúde · High
- BF 12%                               # Saúde · High
- Inglês intermediário                 # Estudos · High
- Ler 50 livros                        # Estudos · Medium
- Morar sozinho                        # Pessoal · Medium
```

## Divisão automática por trimestre

```
Meta: Faturar R$ 120.000
Q1 (Jan-Mar): R$ 30.000
Q2 (Abr-Jun): R$ 30.000
Q3 (Jul-Set): R$ 30.000
Q4 (Out-Dez): R$ 30.000
```

## Execução no código

- Store: `src/store/goalsStore.ts` → `annualGoals[]`
- Tipos: `src/types/goals.ts` → `AnnualGoal`
- View: `src/components/planner/AnnualGoalsView.tsx`
- Cascata: `src/components/planner/GoalCascadePanel.tsx`
