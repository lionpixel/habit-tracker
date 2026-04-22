# Planejamento Semanal

## Objetivo
Dividir metas mensais por semana, alocar hábitos e tarefas por dia, e garantir cobertura dos pomodoros necessários.

## Como se conecta
- Recebe de: [[05_metas_mensais]] (metas mensais)
- Alimenta: [[07_tarefas_repeticoes]] (tarefas diárias)
- Suportado por: [[08_habitos_categorias]] (hábitos recorrentes)

## Estrutura Semanal

```
Segunda  | Top 3 + Hábitos + Extras + Projeto
Terça    | Top 3 + Hábitos + Extras + Projeto
Quarta   | Top 3 + Hábitos + Extras + Projeto
Quinta   | Top 3 + Hábitos + Extras + Projeto
Sexta    | Top 3 + Hábitos + Extras + Projeto
Sábado   | Top 3 + Hábitos (leves) + Lazer
Domingo  | Revisão semanal + Planejamento da próxima semana
```

## Campos de cada tarefa semanal

| Campo | Tipo | Exemplo |
|-------|------|---------|
| Título | string | "Fechar 3 contratos" |
| Meta mensal pai | ID | Link para monthlyGoals |
| Semana | number | 16 (ISO week) |
| Progresso | 0-100 | % das tarefas filhas concluídas |
| Status | enum | not_started / in_progress / done |
| Prioridade | enum | critical / high / medium / low |

## Tempo estimado e Pomodoros

```
Tarefa: Inglês 50min
  → 2 pomodoros (25min cada)

Tarefa: Ler 10 páginas
  → 1 pomodoro (25min)

Tarefa: Fazer 15 contatos
  → 3 pomodoros (45min ligações + 30min follow-up)
```

## Execução no código

- Store: `src/store/goalsStore.ts` → `weeklyGoals[]`
- Tipos: `src/types/goals.ts` → `WeeklyGoal`
- View: `src/components/planner/WeeklyPlannerView.tsx`
- Foco/Pomodoro: `src/components/focus/FocusView.tsx`
