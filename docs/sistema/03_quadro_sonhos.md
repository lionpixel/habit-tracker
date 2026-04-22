# Quadro dos Sonhos 2026

## Objetivo
Área visual e emocional que conecta sonhos de vida às metas anuais. Cada sonho tem motivo emocional, plano de execução e vínculo automático com o planejamento.

## Como se conecta
- Alimenta: [[04_metas_anuais]] via `linkedAnnualGoalId`
- Aparece em: [[02_estrutura_principal]] (topo da cascata)
- Revisado em: [[13_revisoes]] (mensal)

## Campos de cada Sonho

| Campo | Tipo | Descrição |
|-------|------|-----------|
| Nome | string | Ex: "Morar sozinho" |
| Categoria | enum | corpo / dinheiro / carro / casa / trabalho / relacionamentos / viagens / estudos / estilo |
| Meta financeira | number | Valor estimado necessário |
| Data estimada | string | YYYY-MM |
| Progresso | 0-100 | Calculado das metas vinculadas |
| Motivo emocional | string | Por que isso importa |
| Plano de execução | string | Próximos 3 passos |
| Meta anual vinculada | ID | Link para `annualGoals` |

## Categorias

- **Corpo**: BF 12%, 88kg, corridas, condicionamento
- **Dinheiro**: R$ 20k/mês, reserva, investimentos
- **Carro**: Ford Focus, quitação, seguro
- **Casa**: morar sozinho, reforma, escritório próprio
- **Trabalho**: empresa, promoção, negócio próprio
- **Relacionamentos**: amizades, família, networking
- **Viagens**: destinos nacionais e internacionais
- **Estudos**: inglês fluente, MBA, cursos
- **Estilo de vida**: rotina, hábitos, liberdade

## Exemplos de Sonhos

```
Nome: BF 12% e 88kg
Categoria: corpo
Meta financeira: R$ 2.400 (suplementos + treino/ano)
Data estimada: 2026-12
Motivo: Autoestima, saúde e performance
Plano: HIIT 4x/semana → checar BF mensalmente → ajustar dieta
Meta anual vinculada: [ID da meta "Atingir BF 12%"]
```

## Execução no código

- Store: `src/store/dreamsStore.ts`
- Tipos: `src/types/dreams.ts`
- View: `src/components/dreams/DreamBoardView.tsx`
