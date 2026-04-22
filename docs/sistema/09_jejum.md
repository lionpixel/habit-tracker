# Controle de Jejum / Desafio Sem Açúcar

## Objetivo
Gerenciar desafios de 40 dias (ou personalizado) com calendário visual dia-a-dia, marcação de recaídas e histórico de ciclos completos.

## Como se conecta
- Parte de: [[08_habitos_categorias]] (hábito especial `fasting`)
- Impacta: [[10_area_eu]] (alimentação, BF)
- Revisado em: [[13_revisoes]] (semanal)

## Funcionalidades

| Funcionalidade | Status |
|----------------|--------|
| Contador 40 dias automático | ✅ |
| Data de início | ✅ |
| Data de término calculada | ✅ |
| Dias restantes | ✅ |
| Barra de progresso | ✅ |
| Calendário visual 40 dias | ✅ |
| Marcar dia limpo / recaída | ✅ |
| Notas por dia | ✅ |
| Marcar como finalizado | ✅ |
| Histórico de ciclos | ✅ |
| Taxa de sucesso | ✅ |
| Maior sequência | ✅ |
| Iniciar novo ciclo | ✅ |

## Campos do desafio

| Campo | Tipo | Descrição |
|-------|------|-----------|
| fastingDays | number | Total de dias (default: 40) |
| fastingStartDate | YYYY-MM-DD | Início do ciclo atual |
| currentStreak | number | Dias limpos consecutivos |
| longestStreak | number | Recorde histórico |
| completedCycles | number | Ciclos de 40 dias completos |
| fastingComplete | boolean | Ciclo atual concluído |
| fastingLog | Record | Dia → 'clean' \| 'relapse' |
| fastingNotes | Record | Dia → texto livre |

## Ao finalizar um ciclo

1. `completedCycles++`
2. `fastingLog` movido para histórico
3. Novo ciclo inicia com `fastingStartDate = today`
4. `currentStreak` reinicia em 0

## Execução no código

- Tipo: `src/types/habit.ts` → `FastingHabit`
- Store: `src/store/appStore.ts` → `logFastingDay()`, `resetFasting()`
- Calendar: `src/components/habits/FastingCalendarView.tsx`
- Card: `src/components/habits/FastingProgressCard.tsx`
- Config: `src/components/habits/FastingEditorModal.tsx`
