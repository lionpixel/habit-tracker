# 🗄️ HabitDB — Banco de Dados Permanente

Guia completo para usar o banco de dados SQL do sistema.

---

## ⚡ Início Rápido (SQLite)

```bash
# 1. Instalar SQLite
brew install sqlite          # macOS
sudo apt install sqlite3     # Ubuntu/Debian
# Windows: baixar em https://sqlite.org/download.html

# 2. Criar banco e importar schema
sqlite3 habitdb.db < schema.sql

# 3. Confirmar que funcionou
sqlite3 habitdb.db "SELECT nome_habito, status FROM habitos;"

# 4. Abrir modo interativo
sqlite3 habitdb.db
```

---

## 🖥️ Interface Visual (recomendado)

Instale o **DB Browser for SQLite** — gratuito, sem código:
- macOS: `brew install --cask db-browser-for-sqlite`
- Windows/Linux: https://sqlitebrowser.org/dl/

Depois: File > Open Database > selecione `habitdb.db`

---

## 📁 Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `schema.sql` | CREATE TABLE de todas as 5 tabelas + índices + dados iniciais |
| `queries.sql` | Todas as queries úteis: registros, relatórios, histórico |

---

## 🏗️ Estrutura das Tabelas

```
habitos              ← Catálogo mestre (versionado)
  │
  ├── registros_diarios    ← Cada sessão (append-only, sagrado)
  ├── metricas_acumuladas  ← Cache de totais (recalculado)
  ├── progresso_niveis     ← Gamificação / níveis
  └── memoria_geral        ← Diário qualitativo (append-only)
```

---

## 📋 Uso Básico

### Registrar uma sessão de leitura
```sql
-- Passo 1: INSERT (imutável após este ponto)
INSERT INTO registros_diarios VALUES (
    'REG_20260219_001',
    'HAB_LEITURA_001',
    '2026-02-19',
    '07:30',     -- hora início
    28,          -- minutos realizados
    1,           -- concluido (1=sim)
    4,           -- qualidade (1-5)
    3,           -- energia antes (1-5)
    NULL,        -- tipo_sessao
    'Cap. 5-7 do Atomic Habits',
    '2026-W08',
    '2026-02',
    'manual',
    CURRENT_TIMESTAMP
);

-- Passo 2: Recalcular métricas
UPDATE metricas_acumuladas SET
    total_minutos     = (SELECT SUM(minutos_realizado) FROM registros_diarios WHERE id_habito='HAB_LEITURA_001'),
    total_horas       = (SELECT ROUND(SUM(minutos_realizado)/60.0,2) FROM registros_diarios WHERE id_habito='HAB_LEITURA_001'),
    total_sessoes     = (SELECT COUNT(*) FROM registros_diarios WHERE id_habito='HAB_LEITURA_001'),
    ultima_execucao   = '2026-02-19',
    ultima_atualizacao= CURRENT_TIMESTAMP
WHERE id_habito = 'HAB_LEITURA_001';
```

### Ver relatório da semana
```sql
SELECT h.nome_habito, COUNT(r.id_registro) AS sessoes,
       ROUND(COUNT(r.id_registro)*100.0/h.frequencia_semana,1) AS pct_meta,
       SUM(r.minutos_realizado) AS minutos
FROM habitos h
LEFT JOIN registros_diarios r ON r.id_habito=h.id_habito AND r.semana_iso='2026-W08'
WHERE h.status='ativo'
GROUP BY h.id_habito;
```

### Ver dashboard geral
```sql
SELECT h.nome_habito, m.total_horas, m.streak_atual,
       m.maior_streak, m.taxa_conclusao_pct, m.ultima_execucao
FROM metricas_acumuladas m
JOIN habitos h ON h.id_habito=m.id_habito
ORDER BY m.total_horas DESC;
```

---

## 🔄 Mudar Meta de um Hábito (Versionamento)

```sql
-- 1. Fechar versão atual
UPDATE habitos SET data_vigencia_fim = CURRENT_TIMESTAMP
WHERE id_habito = 'HAB_LEITURA_001' AND data_vigencia_fim IS NULL;

-- 2. Criar versão nova (mesmo id_habito, versao+1)
INSERT INTO habitos VALUES (
    'HAB_LEITURA_001', 'Leitura', 'estudo',
    '30 minutos de leitura, 5 dias por semana',
    5, 30, 'minutos', 7800, '📚', '#3b82f6',
    2,          -- versao incrementada
    'ativo', CURRENT_TIMESTAMP, NULL,
    'Ajuste: aumentei para 30min/sessão'
);
```

---

## 🔁 Migrar Dados do App (localStorage → SQLite)

1. No browser, pressione `F12` > Console
2. Cole e execute:
```javascript
const dados = JSON.parse(localStorage.getItem('habitSciencePro2026Complete'));
console.log(JSON.stringify(dados.habits, null, 2));
```
3. Copie o output e converta cada `counts` em INSERTs na tabela `registros_diarios`

---

## 📊 Compatibilidade com Outras Plataformas

### PostgreSQL
```bash
psql -U seu_usuario -d habitdb -f schema.sql
psql -U seu_usuario -d habitdb -f queries.sql
```
> Remova `PRAGMA` lines (são específicas do SQLite)

### Airtable
- Crie uma Base com 5 tabelas
- Use os nomes e tipos de campo do `schema.sql` como referência
- Relacione as tabelas pelo campo `id_habito`

### Google Sheets
- Uma aba por tabela
- Use QUERY() e SUMIF() para replicar as queries analíticas

---

## 🔒 Regras de Ouro

| ❌ NUNCA | ✅ SEMPRE |
|---------|----------|
| DELETE em `registros_diarios` | Adicionar linha de correção |
| UPDATE em `registros_diarios` | Criar novo registro corretivo |
| Reutilizar um `id_habito` | IDs são eternos e únicos |
| Editar meta diretamente | Versionar o hábito (steps acima) |
| Confiar em uma plataforma só | Backup semanal em arquivo local |

---

**HabitDB 2026** — _"Os dados são o espelho mais honesto da sua disciplina."_
