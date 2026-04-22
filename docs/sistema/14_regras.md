# Regras de Funcionamento do Sistema

## Objetivo
Garantir que o sistema opere de forma coerente, conectada e escalável — com boas práticas para criar qualquer item novo.

## Como se conecta
Estas regras se aplicam a todos os módulos:
[[03_quadro_sonhos]] → [[04_metas_anuais]] → [[05_metas_mensais]] → [[06_planejamento_semanal]] → [[07_tarefas_repeticoes]] → [[08_habitos_categorias]] → [[13_revisoes]]

---

## Ao criar qualquer item novo, sempre definir:

1. **Categoria** — a qual área da vida pertence?
2. **Prazo** — quando precisa estar concluído?
3. **Objetivo maior relacionado** — qual meta anual ou sonho isso serve?
4. **Frequência** — quantas vezes por semana/mês?
5. **Tempo estimado** — quantos minutos por sessão?
6. **Prioridade** — crítico / alto / médio / baixo

---

## O sistema deve sempre sugerir:

| Sugestão | Cálculo |
|----------|---------|
| Divisão por semana | `targetValue / 4.33` |
| Divisão por dia | `targetValue / 30` |
| Próxima ação | menor tarefa executável agora |
| Melhor horário | baseado no scheduleTime do hábito |
| Quantidade mínima viável | 20% do alvo diário |

---

## Cadeia obrigatória

Nenhum item deve existir "solto". Toda entidade deve ter pai:

```
Sonho           → linkedAnnualGoalId
Meta Anual      → year
Meta Trimestral → annualGoalId
Meta Mensal     → quarterlyGoalId
Meta Semanal    → monthlyGoalId
Tarefa Diária   → weeklyGoalId (ou standalone com data)
Hábito          → category + optional goalKey
Projeto         → linkedGoalIds[]
Transação       → monthKey
Check-in Físico → date
```

---

## Regras de Progressão

1. **Tarefas filhas concluídas** → progresso da meta semanal sobe automaticamente
2. **Metas semanais** → progresso da meta mensal (média das semanas)
3. **Metas mensais** → progresso da meta trimestral
4. **Metas trimestrais** → progresso da meta anual
5. **Meta anual 100%** → sonho vinculado marcado como "próximo de realizar"

---

## Regras de Status

```
progress == 0  → not_started
progress > 0   → in_progress
progress >= 100 → done
manual override → cancelled
```

---

## Pronto para escalar

| Fase | Ação |
|------|------|
| Atual | localStorage + Zustand |
| Próxima | Supabase (user_id + row-level security) |
| SaaS | Multi-tenant, planos, onboarding |
| Mobile | React Native com mesmo store |

---

## O ciclo completo

```
Sonho → Meta Anual → Meta Mensal → Meta Semanal
→ Tarefa Diária → Hábito → Pomodoro → Resultado
      ↑                                    ↓
   Revisão ←←←←←←←←←←←←←←←←←←←←←←←←←←←←
```
