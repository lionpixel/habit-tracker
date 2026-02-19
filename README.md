# 🎯 HabitDB 2026

**Sistema Científico de Formação de Hábitos + Banco de Dados de Memória Permanente**

> _"Os dados são o espelho mais honesto da sua disciplina."_

---

## 📖 O que é este projeto?

O **HabitDB 2026** é um sistema completo de rastreamento de hábitos baseado em ciência, com duas camadas integradas:

1. **`index.html`** — Aplicativo web completo (roda 100% no browser, sem servidor)
2. **`database/schema.sql`** — Banco de dados permanente para nunca perder dados

### Hábitos rastreados
| Hábito | Meta | Frequência |
|--------|------|------------|
| 📚 Leitura | 25 min/sessão | 5x por semana |
| 🗣️ Inglês | 50 min/sessão | 6x por semana |
| 🏃 HIIT | 30 min/sessão | 5x por semana |
| 🛠️ PPCI | 50 min/sessão | 3x por semana |
| 🧠 Detox Dopamina | 50 min/sessão | 2x por semana |
| 🍬 Zero Açúcar | Desafio 40 dias | Contínuo |

---

## 🚀 Como usar

### Opção 1 — Direto no browser (mais simples)
```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/habitdb-2026.git
cd habitdb-2026

# Abra o arquivo principal
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```
> Todos os dados ficam no `localStorage` do browser. Sem servidor, sem instalação.

### Opção 2 — Com servidor local (recomendado)
```bash
# Python 3
python -m http.server 8080

# Node.js
npx serve .

# Acesse
http://localhost:8080
```

### Opção 3 — GitHub Pages (acesso em qualquer lugar)
1. Fork este repositório
2. Vá em `Settings > Pages`
3. Source: `Deploy from a branch > main > / (root)`
4. Acesse: `https://SEU_USUARIO.github.io/habitdb-2026`

---

## 🗄️ Banco de Dados Permanente

Para nunca perder seus dados históricos, use o banco SQL:

```bash
# Instale o SQLite (se não tiver)
# macOS
brew install sqlite

# Ubuntu/Debian
sudo apt install sqlite3

# Crie o banco e importe o schema
sqlite3 habitdb.db < database/schema.sql

# Abra o banco
sqlite3 habitdb.db
```

Veja a documentação completa em [`database/README.md`](database/README.md).

---

## 📁 Estrutura do Projeto

```
habitdb-2026/
├── index.html              ← App principal (abre direto no browser)
├── docs/
│   └── database-system.html ← Documentação visual do banco de dados
├── database/
│   ├── schema.sql          ← Schema completo (5 tabelas)
│   ├── queries.sql         ← Queries prontas (relatórios semanais, mensais, anuais)
│   ├── seed.sql            ← Dados iniciais e exemplos
│   └── README.md           ← Guia completo do banco
├── exports/
│   └── .gitkeep            ← Pasta para exportações de dados
├── .gitignore
└── README.md
```

---

## ✨ Funcionalidades do App

### Visão Semanal
- Registro de sessões por hábito com um clique
- Progresso visual da semana atual
- Comparação com médias brasileiras e mundiais
- Sistema de alertas de risco (hábito abandonado)
- Insights automáticos baseados nos dados

### Visão Mensal
- Totais acumulados por mês
- Gráfico de desempenho por hábito
- Navegação entre meses

### Visão Anual 2026
- Comparação mês a mês
- Evolução de todos os hábitos ao longo do ano
- Métricas consolidadas

### Base Científica
Cada hábito inclui painel expansível com:
- Situação do Brasil vs. Mundo
- Estudos científicos referenciados (PubMed, Harvard, MIT, etc.)
- Dicas práticas baseadas em evidências

---

## 💾 Backup dos Dados (localStorage)

Os dados do app ficam no `localStorage` do browser. Para fazer backup:

```javascript
// Abra o Console do browser (F12) e cole:

// EXPORTAR
const dados = localStorage.getItem('habitSciencePro2026Complete');
const blob = new Blob([dados], {type: 'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `habitdb_backup_${new Date().toISOString().split('T')[0]}.json`;
a.click();

// IMPORTAR (cole o JSON exportado como string)
// localStorage.setItem('habitSciencePro2026Complete', COLE_O_JSON_AQUI);
// location.reload();
```

---

## 🔬 Base Científica

O sistema usa dados de estudos de:
- **Yale School of Public Health** — Leitura e longevidade
- **EF English Proficiency Index 2023** — Proficiência em inglês
- **British Journal of Sports Medicine** — Eficácia do HIIT
- **Stanford Medicine (Dr. Anna Lembke)** — Dopamina e detox digital
- **NIH Diabetes Prevention Program** — Impacto do açúcar
- **MIT Active Learning Study** — Aprendizado por projetos

---

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla — sem framework)
- **Dados**: localStorage (app) + SQLite/PostgreSQL (banco permanente)
- **Charts**: Chart.js 4.x
- **Icons**: Font Awesome 6.x
- **Fontes**: Segoe UI (sistema)

Zero dependências de build. Zero Node.js obrigatório. Abre direto no browser.

---

## 🤝 Contribuindo

```bash
# Fork > Clone > Branch > Commit > PR
git checkout -b feature/nova-funcionalidade
git commit -m "feat: descrição da mudança"
git push origin feature/nova-funcionalidade
```

---

## 📄 Licença

MIT License — use, modifique e distribua livremente.

---

**Feito com consistência, ciência e dados.**
