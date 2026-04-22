# Estrutura Principal do Sistema

## Objetivo
Definir a hierarquia de planejamento e garantir que toda meta grande se decomponha até a ação diária executável.

## Como se conecta
- Alimenta: [[03_quadro_sonhos]], [[04_metas_anuais]], [[05_metas_mensais]], [[06_planejamento_semanal]]
- Recebe de: [[13_revisoes]] (recalibração)

## Hierarquia de Planejamento

```
Meta Anual: Ganhar R$ 120.000 no ano
  ↓  (÷12)
Meta Mensal: Ganhar R$ 10.000 em maio
  ↓  (÷4.3)
Meta Semanal: Fechar 3 contratos na semana
  ↓  (÷5)
Tarefa Diária: Fazer 15 contatos por dia
```

## Campos obrigatórios em cada nível

Todos os níveis exibem:
- **Progresso** em % com barra visual
- **Status**: Não iniciado / Em andamento / Finalizado / Cancelado
- **Prazo**: data limite
- **Prioridade**: Crítico / Alto / Médio / Baixo
- **Categoria**: Financeiro / Carreira / Saúde / etc.
- **Relacionamento**: ID da meta superior

## Execução no código

- Store: `src/store/goalsStore.ts`
- Tipos: `src/types/goals.ts`
- Views: `src/components/planner/`
- Cascata: `src/components/planner/GoalCascadePanel.tsx`

## Matemática automática

| Período | Divisor | Exemplo (R$ 120k/ano) |
|---------|---------|----------------------|
| Anual   | 1       | R$ 120.000           |
| Mensal  | 12      | R$ 10.000            |
| Semanal | 52      | R$ 2.307             |
| Diário  | 365     | R$ 329               |
