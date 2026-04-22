# Tarefas e Repetições

## Objetivo
Gerenciar tarefas diárias com frequências flexíveis, horários, prioridades e vínculos com metas superiores.

## Como se conecta
- Recebe de: [[06_planejamento_semanal]] (metas semanais)
- Alimenta: [[08_habitos_categorias]] (hábitos se tornam tarefas recorrentes)
- Revisado em: [[13_revisoes]] (diário e semanal)

## Operações disponíveis

- ✅ Criar tarefa
- ✏️ Editar (título, categoria, duração, frequência)
- 📋 Duplicar
- 📦 Arquivar
- 🗑️ Excluir
- 🔀 Mudar categoria
- 🔁 Alterar frequência

## Frequências possíveis

| Tipo | Exemplo |
|------|---------|
| Diário | Toda manhã |
| Dias específicos | Seg, Qua, Sex |
| X vezes/semana | 5x por semana |
| X vezes/mês | 15x por mês |
| Personalizado | A cada 3 dias |

## Campos completos

| Campo | Tipo | Exemplo |
|-------|------|---------|
| Título | string | "Ler 10 páginas" |
| Descrição | string | opcional |
| Data | YYYY-MM-DD | 2026-04-15 |
| Horário | HH:MM | 07:30 |
| Tempo estimado | number | 25 (min) |
| Tempo real | number | registrado ao concluir |
| Prioridade | P1/P2/P3 ou critical/high/med/low | |
| Status | not_started / done / cancelled | |
| Categoria | string | Estudos / Trabalho / Saúde |
| Meta semanal pai | ID | Link para weeklyGoals |
| Frequência | RecurrenceConfig | |

## Exemplo completo

```yaml
Tarefa: Ler 10 páginas
  frequência: 5x por semana (Seg a Sex)
  tempo estimado: 25 min
  horário: 21:00
  categoria: Estudos
  meta semanal: [ID da meta "Ler 1 livro/semana"]
  meta anual:   [ID da meta "Ler 50 livros"]
```

## Execução no código

- Store: `src/store/goalsStore.ts` → `dailyTasks[]`
- Tipos: `src/types/goals.ts` → `DailyTask`
- View: `src/components/planner/DailyPlannerView.tsx`
