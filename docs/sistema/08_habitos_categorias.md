# Hábitos e Categorias

## Objetivo
Rastrear hábitos recorrentes por categoria, medir consistência, sequências e tempo total investido.

## Como se conecta
- Alimenta: [[06_planejamento_semanal]] (sessões semanais)
- Suporta: [[10_area_eu]] (hábitos físicos), [[11_financeiro]] (hábito de poupar)
- Revisado em: [[13_revisoes]] (consistência semanal e mensal)

## Categorias do sistema

| Categoria | Hábitos exemplo |
|-----------|----------------|
| Saúde | Água, suplementos, vitaminas |
| Corpo | HIIT, corrida, mobilidade |
| Estudos | Inglês, leitura, cursos |
| Trabalho | Prospecção, criação, reuniões |
| Financeiro | Registro gastos, investimentos |
| Espiritual | Meditação, gratidão, oração |
| Casa | Organização, limpeza |
| Relacionamentos | Ligar para família, amigos |
| Lazer | Passeio, hobby, descanso |
| Conteúdo | Posts, vídeos, escrita |
| Negócios | Prospecção, proposta, follow-up |

## Campos de cada hábito

| Campo | Tipo | Descrição |
|-------|------|-----------|
| Nome | string | "Inglês" |
| Ícone | Lucide ID | Languages / BookOpen / Dumbbell |
| Cor | hex | #10b981 |
| Categoria | string | Estudos |
| Frequência | number | vezes/semana |
| Meta duração | number | minutos/sessão |
| Streak atual | number | dias consecutivos |
| Melhor streak | number | recorde histórico |
| % consistência | calc | sessões / possíveis |
| Tempo total | number | minutos acumulados |
| Meta vinculada | ID | link para annualGoals |

## Hábitos atuais do sistema (HabitDB)

```
📖 Leitura       → 6x/sem · 25min · meta: 50 livros/ano
🌍 Inglês        → 6x/sem · 50min · meta: fluência
🏋️ HIIT          → 4x/sem · 50min · meta: BF 12%
💻 PPCI          → 5x/sem · 50min · meta: projetos
🧠 Detox         → 5x/sem · 50min · meta: foco
🚫 Sem Açúcar    → 7x/sem · desafio 40 dias
```

## Execução no código

- Store: `src/store/appStore.ts` + `src/store/categoryStore.ts`
- Tipos: `src/types/habit.ts`, `src/types/category.ts`
- Views: `src/components/dashboard/WeeklyView.tsx`, `src/components/metas/MetasView.tsx`
- Categorias: `src/components/categories/CategoriesView.tsx`
