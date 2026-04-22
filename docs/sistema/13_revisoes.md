# Revisões Automáticas

## Objetivo
Fechar o loop do sistema com revisões semanais e mensais que mostram o que foi feito, o que faltou e o que precisa ser recalibrado.

## Como se conecta
- Lê de todos os módulos: hábitos, metas, finanças, físico, projetos
- Alimenta: recalibração das [[04_metas_anuais]] e [[05_metas_mensais]]
- É o ponto de fechamento do ciclo: Planejamento → Execução → Revisão → Recalibração

## Revisão Semanal

Executada todo **domingo** à noite:

| Item | Fonte de dados |
|------|---------------|
| Hábitos com maior consistência | appStore (contagem semanal) |
| Hábitos com menor consistência | appStore |
| Tarefas concluídas | goalsStore (dailyTasks) |
| Meta semanal atingida? | goalsStore (weeklyGoals) |
| Receita da semana | financeStore |
| Peso atual | profileStore |
| Energia (0-10) | entrada manual |
| Produtividade (0-10) | entrada manual |
| Pomodoros feitos | appStore.pomoData |
| Insight gerado automaticamente | useSystemScore |

## Revisão Mensal

Executada no **último dia do mês**:

| Item | Fonte de dados |
|------|---------------|
| Principais vitórias | todos os módulos |
| Principais erros | todos os módulos |
| Receita total | financeStore |
| Taxa de poupança | financeStore |
| Evolução de peso | profileStore |
| BF atual | profileStore |
| % de progresso nas metas anuais | goalsStore |
| Hábito mais consistente | appStore |
| Streak atual do jejum | appStore |

## Insights automáticos gerados

O sistema gera insights em 6 categorias:
- 🎯 **Metas** — progresso acima/abaixo do esperado
- 📅 **Hoje** — tarefas concluídas vs. planejadas
- 💰 **Finanças** — poupança e gastos
- 🔥 **Hábitos** — minutos e consistência
- 💪 **Físico** — variação de peso/BF
- 📦 **Projetos** — projetos em aberto

## Execução no código

- View: `src/components/review/ReviewView.tsx`
- Insights: `src/hooks/useSystemScore.ts`
- Score integrado: `src/components/dashboard/LifeScoreCard.tsx`
