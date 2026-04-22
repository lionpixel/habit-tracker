# Área EU — Controle Físico

## Objetivo
Rastrear composição corporal, evolução de peso/BF, calcular IMC e massa magra automaticamente, e medir progresso rumo às metas físicas.

## Como se conecta
- Alimenta: [[04_metas_anuais]] (meta de BF, peso)
- Suportado por: [[08_habitos_categorias]] (HIIT, alimentação)
- Revisado em: [[13_revisoes]] (mensal — check-in obrigatório)

## Campos do perfil

| Campo | Tipo | Exemplo |
|-------|------|---------|
| Nome | string | João |
| Idade | number | 23 |
| Sexo | enum | male / female / other |
| Altura | number (cm) | 175 |
| Nível de atividade | enum | sedentary → very_active |
| Objetivo físico | enum | lose_fat / gain_muscle / maintain |
| Peso atual | number (kg) | 74 |
| BF atual | number (%) | 16 |
| Massa magra | calc | 62.2kg |
| Massa gorda | calc | 11.8kg |
| Cintura | number (cm) | 85 |
| IMC | calc | 24.2 |
| Meta peso | number | 78 |
| Meta BF | number (%) | 12 |

## Cálculos automáticos

```
IMC = peso / (altura/100)²
Massa magra = peso × (1 - BF/100)
Massa gorda = peso × (BF/100)
```

## Check-ins periódicos

Cada check-in registra:
- Data
- Peso
- BF (%)
- Cintura
- Calorias do dia (opcional)
- Água (litros, opcional)
- Notas

## Gráficos disponíveis

- Peso ao longo do tempo
- BF ao longo do tempo
- Massa magra vs. massa gorda
- Evolução de medidas
- Comparação: atual vs. meta

## Execução no código

- Store: `src/store/profileStore.ts`
- Tipos: `src/types/profile.ts`
- View: `src/components/profile/ProfileView.tsx`
- Gráfico: `src/components/profile/BodyEvolutionChart.tsx`
- Check-in: `src/components/profile/WeeklyCheckinModal.tsx`
