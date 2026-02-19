-- ═══════════════════════════════════════════════════════════════════
-- HabitDB 2026 — Schema SQL Completo
-- Filosofia: Append-Only · Imutável · Event-Sourced
-- Compatível com: SQLite 3.x · PostgreSQL 14+ · MySQL 8+
--
-- REGRAS DE OURO:
--   1. NUNCA deletar linhas de registros_diarios
--   2. NUNCA fazer UPDATE em registros_diarios
--   3. Mudança de meta = nova versão do hábito (versionar_habito)
--   4. IDs são eternos — nunca reutilizar
--   5. Recalcular metricas_acumuladas após cada INSERT
-- ═══════════════════════════════════════════════════════════════════

PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

-- ───────────────────────────────────────────────────────────────────
-- TABELA 1: HABITOS
-- Catálogo mestre com suporte a versionamento.
-- Nunca deletar. Ao mudar meta: fechar versão atual e criar nova.
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS habitos (
    id_habito             TEXT        PRIMARY KEY,
    nome_habito           TEXT        NOT NULL,
    categoria             TEXT        NOT NULL
                          CHECK (categoria IN (
                              'estudo','saude','treino','dinheiro','rotina','mental'
                          )),
    descricao             TEXT,
    frequencia_semana     INTEGER     NOT NULL CHECK (frequencia_semana > 0),
    minutos_sessao        INTEGER     NOT NULL CHECK (minutos_sessao > 0),
    tipo_medicao          TEXT        NOT NULL DEFAULT 'minutos'
                          CHECK (tipo_medicao IN (
                              'minutos','dias','sessoes','unidades','binario'
                          )),
    meta_anual_minutos    INTEGER,
    icone                 TEXT,
    cor_hex               TEXT,
    versao                INTEGER     NOT NULL DEFAULT 1 CHECK (versao > 0),
    status                TEXT        NOT NULL DEFAULT 'ativo'
                          CHECK (status IN (
                              'ativo','pausado','arquivado','concluido'
                          )),
    data_criacao          DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_vigencia_fim     DATETIME    DEFAULT NULL,     -- NULL = versão atual ativa
    notas_criacao         TEXT
);

-- ───────────────────────────────────────────────────────────────────
-- TABELA 2: REGISTROS_DIARIOS
-- SAGRADA. Append-Only. Cada linha = evento imutável no tempo.
-- Erros: adicionar linha de correção com observacoes='CORREÇÃO: ...'
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS registros_diarios (
    id_registro           TEXT        PRIMARY KEY,
    id_habito             TEXT        NOT NULL
                          REFERENCES habitos(id_habito),
    data_execucao         DATE        NOT NULL,
    hora_inicio           TEXT,                         -- formato HH:MM
    minutos_realizado     INTEGER     NOT NULL CHECK (minutos_realizado >= 0),
    concluido             INTEGER     NOT NULL DEFAULT 1
                          CHECK (concluido IN (0, 1)),  -- 1=sim, 0=não
    qualidade             INTEGER
                          CHECK (qualidade IS NULL OR qualidade BETWEEN 1 AND 5),
    energia_antes         INTEGER
                          CHECK (energia_antes IS NULL OR energia_antes BETWEEN 1 AND 5),
    tipo_sessao           TEXT,                         -- ex: 'estudo_ativo', 'serie', 'HIIT'
    observacoes           TEXT,
    semana_iso            TEXT        NOT NULL,          -- ex: '2026-W08'
    mes_ano               TEXT        NOT NULL,          -- ex: '2026-02'
    fonte                 TEXT        NOT NULL DEFAULT 'manual',  -- app_web|app_mobile|api|manual
    created_at            DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ───────────────────────────────────────────────────────────────────
-- TABELA 3: METRICAS_ACUMULADAS
-- Cache computado. Uma linha por hábito.
-- UPDATE é permitido aqui (é snapshot — sempre recalculado).
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS metricas_acumuladas (
    id_metrica              TEXT        PRIMARY KEY,
    id_habito               TEXT        NOT NULL UNIQUE
                            REFERENCES habitos(id_habito),
    total_minutos           INTEGER     NOT NULL DEFAULT 0,
    total_horas             REAL        NOT NULL DEFAULT 0,
    total_dias_praticados   INTEGER     NOT NULL DEFAULT 0,
    total_sessoes           INTEGER     NOT NULL DEFAULT 0,
    streak_atual            INTEGER     NOT NULL DEFAULT 0,
    maior_streak            INTEGER     NOT NULL DEFAULT 0,
    media_minutos_sessao    REAL                 DEFAULT 0,
    media_qualidade         REAL                 DEFAULT 0,
    taxa_conclusao_pct      REAL                 DEFAULT 0,
    total_ano_corrente      INTEGER     NOT NULL DEFAULT 0,
    ultima_execucao         DATE,
    ultima_atualizacao      DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ───────────────────────────────────────────────────────────────────
-- TABELA 4: PROGRESSO_NIVEIS
-- Gamificação e evolução de nível.
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS progresso_niveis (
    id_progresso         TEXT        PRIMARY KEY,
    id_habito            TEXT        NOT NULL
                         REFERENCES habitos(id_habito),
    metrica_nivel        TEXT        NOT NULL DEFAULT 'horas',
    nivel_atual          TEXT        NOT NULL,
    nivel_label          TEXT,
    valor_atual          REAL        NOT NULL DEFAULT 0,
    limiar_nivel_min     REAL,
    limiar_nivel_max     REAL,
    proximo_nivel        TEXT,
    progresso_pct        REAL        NOT NULL DEFAULT 0,
    faltam_para_proximo  REAL,
    data_subiu_nivel     DATE,
    atualizado_em        DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ───────────────────────────────────────────────────────────────────
-- TABELA 5: MEMORIA_GERAL
-- Diário qualitativo. Append-Only. Nunca deletar.
-- ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS memoria_geral (
    id_memoria         TEXT        PRIMARY KEY,
    id_habito          TEXT        REFERENCES habitos(id_habito),  -- opcional
    tipo_memoria       TEXT        NOT NULL
                       CHECK (tipo_memoria IN (
                           'insight','ajuste','aprendizado','regra',
                           'reflexao','conquista','alerta'
                       )),
    titulo             TEXT        NOT NULL,
    conteudo           TEXT        NOT NULL,
    impacto_estimado   INTEGER
                       CHECK (impacto_estimado IS NULL OR impacto_estimado BETWEEN 1 AND 5),
    tags               TEXT,               -- separar por vírgula
    acao_tomada        TEXT,
    data_memoria       DATE        NOT NULL,
    criado_em          DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════════
-- ÍNDICES — Performance
-- ═══════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_reg_habito       ON registros_diarios(id_habito);
CREATE INDEX IF NOT EXISTS idx_reg_data         ON registros_diarios(data_execucao);
CREATE INDEX IF NOT EXISTS idx_reg_semana       ON registros_diarios(semana_iso);
CREATE INDEX IF NOT EXISTS idx_reg_mes          ON registros_diarios(mes_ano);
CREATE INDEX IF NOT EXISTS idx_reg_habito_data  ON registros_diarios(id_habito, data_execucao);
CREATE INDEX IF NOT EXISTS idx_mem_tipo         ON memoria_geral(tipo_memoria);
CREATE INDEX IF NOT EXISTS idx_mem_habito       ON memoria_geral(id_habito);
CREATE INDEX IF NOT EXISTS idx_mem_data         ON memoria_geral(data_memoria);
CREATE UNIQUE INDEX IF NOT EXISTS idx_met_habito ON metricas_acumuladas(id_habito);

-- ═══════════════════════════════════════════════════════════════════
-- DADOS INICIAIS — 6 hábitos do HabitDB 2026
-- ═══════════════════════════════════════════════════════════════════
INSERT OR IGNORE INTO habitos
    (id_habito, nome_habito, categoria, descricao, frequencia_semana,
     minutos_sessao, tipo_medicao, meta_anual_minutos, icone, cor_hex,
     versao, status, data_criacao, data_vigencia_fim, notas_criacao)
VALUES
    ('HAB_LEITURA_001', 'Leitura', 'estudo',
     '25 minutos de leitura, 5 dias por semana',
     5, 25, 'minutos', 6500, '📚', '#3b82f6',
     1, 'ativo', '2026-01-01 00:00:00', NULL, 'Hábito inicial 2026'),

    ('HAB_INGLES_001', 'Inglês', 'estudo',
     '50 minutos de estudo, 6 dias por semana (5x ativo + 1x série)',
     6, 50, 'minutos', 15600, '🗣️', '#10b981',
     1, 'ativo', '2026-01-01 00:00:00', NULL, 'Hábito inicial 2026'),

    ('HAB_HIIT_001', 'HIIT', 'treino',
     '30 minutos de exercício intenso, 5 dias por semana',
     5, 30, 'minutos', 7800, '🏃', '#f59e0b',
     1, 'ativo', '2026-01-01 00:00:00', NULL, 'Hábito inicial 2026'),

    ('HAB_PPCI_001', 'PPCI', 'estudo',
     '50 minutos de projeto prático, 3 dias por semana',
     3, 50, 'minutos', 7800, '🛠️', '#8b5cf6',
     1, 'ativo', '2026-01-01 00:00:00', NULL, 'Hábito inicial 2026'),

    ('HAB_DOPAMINA_001', 'Detox Dopamina', 'mental',
     '50 minutos de detox digital, 2 dias por semana',
     2, 50, 'minutos', 5200, '🧠', '#ec4899',
     1, 'ativo', '2026-01-01 00:00:00', NULL, 'Hábito inicial 2026'),

    ('HAB_ACUCAR_001', 'Zero Açúcar', 'saude',
     'Desafio contínuo de 40 dias sem açúcar',
     7, 1440, 'dias', NULL, '🍬', '#06b6d4',
     1, 'ativo', '2026-01-01 00:00:00', NULL, 'Hábito inicial 2026');

-- Inicializar métricas (zeranas) para cada hábito
INSERT OR IGNORE INTO metricas_acumuladas (id_metrica, id_habito)
VALUES
    ('MET_LEITURA',   'HAB_LEITURA_001'),
    ('MET_INGLES',    'HAB_INGLES_001'),
    ('MET_HIIT',      'HAB_HIIT_001'),
    ('MET_PPCI',      'HAB_PPCI_001'),
    ('MET_DOPAMINA',  'HAB_DOPAMINA_001'),
    ('MET_ACUCAR',    'HAB_ACUCAR_001');

-- Inicializar níveis
INSERT OR IGNORE INTO progresso_niveis
    (id_progresso, id_habito, metrica_nivel, nivel_atual, nivel_label,
     valor_atual, limiar_nivel_min, limiar_nivel_max, proximo_nivel)
VALUES
    ('PRG_LEITURA',  'HAB_LEITURA_001',  'horas', 'Iniciante', 'Iniciante', 0, 0, 50,  'Leitor'),
    ('PRG_INGLES',   'HAB_INGLES_001',   'horas', 'A1',        'Iniciante', 0, 0, 100, 'A2'),
    ('PRG_HIIT',     'HAB_HIIT_001',     'horas', 'Iniciante', 'Iniciante', 0, 0, 30,  'Ativo'),
    ('PRG_PPCI',     'HAB_PPCI_001',     'horas', 'Iniciante', 'Iniciante', 0, 0, 50,  'Builder'),
    ('PRG_DOPAMINA', 'HAB_DOPAMINA_001', 'horas', 'Iniciante', 'Iniciante', 0, 0, 20,  'Focado'),
    ('PRG_ACUCAR',   'HAB_ACUCAR_001',   'dias',  'Iniciante', 'Iniciante', 0, 0, 40,  'Limpo');
