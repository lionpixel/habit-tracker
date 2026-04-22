# Controle Financeiro

## Objetivo
Registrar receitas, despesas e poupança mensais, medir taxa de poupança, acompanhar metas financeiras e visualizar evolução patrimonial.

## Como se conecta
- Alimenta: [[04_metas_anuais]] (meta de faturamento/renda)
- Alimenta: [[03_quadro_sonhos]] (sonhos financeiros)
- Revisado em: [[13_revisoes]] (mensal)

## Campos mensais

**Receitas:**
- Salário, Freelas, Negócios, Rend. Investimentos, Outras entradas

**Despesas:**
- Moradia, Alimentação, Transporte, Saúde, Educação
- Lazer, Contas, Vestuário, Pessoal, Dívidas, Outros

**Poupança:**
- Investimentos, Reserva de emergência, Poupança

## Métricas calculadas automaticamente

| Métrica | Fórmula |
|---------|---------|
| Receita total | soma das receitas |
| Despesa total | soma das despesas |
| Taxa de poupança | poupança / receita × 100 |
| Saldo líquido | receita − despesas − poupança |
| Por dia | receita total / 30 |
| Por semana | receita total / 4.33 |

## Comparação de nível de renda

| Nível | Renda Brasil (2024) |
|-------|---------------------|
| Top 50% | R$ 3.000+ |
| Top 10% | R$ 8.000+ |
| Top 1% | R$ 30.000+ |

## Metas financeiras

Cada meta tem:
- Nome, valor-alvo, valor atual, prazo
- Barra de progresso e contribuições mensais

## Gráficos disponíveis

- Receita mensal (últimos 12 meses)
- Evolução anual de receita e poupança
- Gastos por categoria (pizza)
- Lucro acumulado

## Execução no código

- Store: `src/store/financeStore.ts`
- Tipos: `src/types/finance.ts`
- View: `src/components/finance/FinanceView.tsx`
- Gráficos: `src/components/finance/IncomeChart.tsx`, `ExpenseChart.tsx`
- Metas: `src/components/finance/SavingsGoalCard.tsx`
