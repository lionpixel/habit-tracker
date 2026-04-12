# HabitDB 2026 — Sistema Científico de Hábitos

Rastreador de hábitos profissional construído com Next.js 15, TypeScript e Tailwind CSS.

## ✨ Funcionalidades

- **6 hábitos rastreados**: Leitura, Inglês, HIIT, PPCI, Detox de Dopamina, Sem Açúcar
- **Visões**: Semanal, Mensal, Anual
- **Metas mensais** configuráveis por hábito (frequência + duração)
- **Detecção de risco** automática (crítico, alto, médio)
- **Módulo de Sono** com plano de horários, score de energia e ajuste gradual
- **Módulo de Foco** com sistema Pomodoro e tarefas por prioridade
- **Heatmap anual** por hábito
- **Gerador de relatórios** semanal/mensal em HTML
- **Backup/Restore** automático no localStorage
- **Export JSON** dos dados

## 🚀 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/habitdb.git
cd habitdb

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Rode em desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🗂️ Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 15)
│   ├── layout.tsx          # Layout raiz com Toaster
│   ├── page.tsx            # Redirect → /weekly
│   ├── globals.css         # Estilos globais + Tailwind
│   ├── weekly/page.tsx     # Rota semanal
│   ├── monthly/page.tsx    # Rota mensal
│   ├── yearly/page.tsx     # Rota anual
│   ├── metas/page.tsx      # Rota metas/heatmap
│   ├── sleep/page.tsx      # Rota sono
│   ├── focus/page.tsx      # Rota pomodoro/foco
│   └── report/page.tsx     # Rota relatório
│
├── components/
│   ├── layout/             # Header, TabNav, Providers, Banners
│   ├── dashboard/          # HabitCard, WeeklyView, MonthlyView, YearlyView
│   ├── charts/             # WeeklyChart (Recharts)
│   ├── metas/              # MetasView, heatmap
│   ├── sleep/              # SleepView
│   ├── focus/              # FocusView (Pomodoro)
│   ├── report/             # ReportView
│   └── ui/                 # Button, Badge, ProgressBar, StatCard
│
├── hooks/
│   ├── useHabits.ts        # Acesso ao store de hábitos + cálculos
│   ├── useSleep.ts         # Módulo sono
│   ├── useFocus.ts         # Módulo pomodoro
│   └── useLocalStorage.ts  # Hook genérico de localStorage
│
├── store/
│   └── appStore.ts         # Zustand (estado global)
│
├── services/
│   ├── habitsService.ts    # Toggle, cálculos, detecção de risco
│   ├── sleepService.ts     # Plano de sono, score de energia
│   ├── focusService.ts     # Pomodoro, tarefas, métricas
│   └── storageService.ts   # localStorage, backup/restore, export
│
├── lib/
│   ├── helpers.ts          # Datas, tempo, formatação, cn()
│   └── constants.ts        # Cores, keys, limites, CEFR
│
├── types/
│   ├── habit.ts            # AppData, Habit, RiskAlert, Insight
│   ├── sleep.ts            # SleepData, SleepEntry, EnergyScore
│   ├── focus.ts            # PomoDataMap, PomodoroTask, FocusMetrics
│   └── stats.ts            # StatCard, ChartData, MetaSummary
│
├── data/
│   └── mockHabits.ts       # Estado inicial dos hábitos
│
└── context/
    └── ThemeContext.tsx     # Dark/Light (preparado)
```

## 🛠️ Stack

| Tecnologia      | Uso                            |
|-----------------|--------------------------------|
| Next.js 15      | Framework + App Router         |
| TypeScript      | Tipagem estática               |
| Tailwind CSS    | Estilização utilitária         |
| Zustand         | Estado global                  |
| Recharts        | Gráficos                       |
| Sonner          | Notificações toast             |
| date-fns        | Manipulação de datas           |
| Lucide React    | Ícones                         |
| Framer Motion   | Animações (preparado)          |
| Zod + RHF       | Validação de formulários       |

## 🗺️ Roadmap

- [ ] Gráfico de evolução 8 semanas
- [ ] Heatmap anual completo com dados reais
- [ ] Tema claro/escuro
- [ ] Animações com Framer Motion
- [ ] Login com NextAuth
- [ ] Banco de dados (Supabase ou Prisma + PostgreSQL)
- [ ] Gráficos avançados (Recharts compostos)
- [ ] Notificações push (PWA)
- [ ] App mobile (React Native / Expo)

## 🚢 Deploy na Vercel

```bash
# Instale a CLI da Vercel
npm i -g vercel

# Faça login
vercel login

# Deploy
vercel --prod
```

Ou conecte o repositório diretamente em [vercel.com](https://vercel.com/new).

## 📄 Licença

MIT — veja [LICENSE](LICENSE)