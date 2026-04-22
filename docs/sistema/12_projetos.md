# Projetos

## Objetivo
Gerenciar projetos pessoais e profissionais com etapas, checklists, prazos e vínculo com metas anuais.

## Como se conecta
- Vincula a: [[04_metas_anuais]] (via `linkedGoalIds`)
- Gera tarefas em: [[07_tarefas_repeticoes]]
- Revisado em: [[13_revisoes]] (semanal)

## Campos do projeto

| Campo | Tipo | Exemplo |
|-------|------|---------|
| Nome | string | "PPCI — Site + Anúncios" |
| Objetivo | string | Fechar 3 clientes/mês |
| Categoria | string | Negócios / Pessoal |
| Status | enum | not_started / in_progress / done |
| Prioridade | enum | critical / high / medium / low |
| Data início | YYYY-MM-DD | 2026-04-01 |
| Prazo | YYYY-MM-DD | 2026-06-30 |
| Progresso | 0-100 | % dos milestones concluídos |
| Meta financeira | number | R$ 5.000/mês |
| Milestones | array | etapas com prazo e status |
| Notas | string | observações |
| Metas vinculadas | ID[] | links para goals |

## Exemplos de projetos

```yaml
Projeto: PPCI
  objetivo: Construir pipeline de clientes
  milestones:
    - Fazer site landing page     [Em andamento]
    - Configurar anúncios Google  [Não iniciado]
    - Fechar primeiro cliente     [Não iniciado]
    - Fazer 5 orçamentos          [Não iniciado]

Projeto: Marca Pessoal
  objetivo: 10k seguidores, autoridade no nicho
  milestones:
    - Criar identidade visual     [Feito]
    - Produzir 10 vídeos          [Em andamento]
    - Criar Instagram profissional [Feito]
    - Publicar 30 posts           [Em andamento]
    - Criar site próprio          [Não iniciado]
```

## Execução no código

- Store: `src/store/goalsStore.ts` → `projects[]`
- Tipos: `src/types/goals.ts` → `Project`, `ProjectMilestone`
- View: `src/components/projects/ProjectsView.tsx`
- Card: `src/components/projects/ProjectCard.tsx`
- Modal: `src/components/projects/ProjectFormModal.tsx`
