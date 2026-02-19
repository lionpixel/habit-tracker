-- ═══════════════════════════════════════════════════════════════════
-- HabitDB 2026 — Queries de Uso Diário
-- Cole e execute no sqlite3, DB Browser, DBeaver ou qualquer cliente
-- ═══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- SEÇÃO 1: REGISTRAR EXECUÇÕES
-- ═══════════════════════════════════════════════════════════════════

-- ── Registrar uma sessão (substitua os valores)
-- PASSO 1: INSERT do registro
INSERT INTO registros_diarios VALUES (
    'REG_' || strftime('%Y%m%d%H%M%S', 'now'),  -- id automático
    'HAB_LEITURA_001',       -- id_habito
    '2026-02-19',            -- data_execucao (YYYY-MM-DD)
    '07:30',                 -- hora_inicio (opcional, pode ser NULL)
    28,                      -- minutos_realizado
    1,                       -- concluido (1=sim, 0=não)
    4,                       -- qualidade (1-5, ou NULL)
    3,                       -- energia_antes (1-5, ou NULL)
    NULL,                    -- tipo_sessao ('estudo_ativo', 'serie', etc.)
    'Capítulo 5-7 do livro Atomic Habits',  -- observacoes
    '2026-W08',              -- semana_iso (calcule conforme a data)
    '2026-02',               -- mes_ano
    'manual',                -- fonte
    CURRENT_TIMESTAMP        -- created_at
);

-- PASSO 2: Recalcular métricas após cada INSERT (substitua o id)
UPDATE metricas_acumuladas SET
    total_minutos         = (SELECT SUM(minutos_realizado) FROM registros_diarios
                             WHERE id_habito = 'HAB_LEITURA_001'),
    total_horas           = (SELECT ROUND(SUM(minutos_realizado)/60.0, 2) FROM registros_diarios
                             WHERE id_habito = 'HAB_LEITURA_001'),
    total_sessoes         = (SELECT COUNT(*) FROM registros_diarios
                             WHERE id_habito = 'HAB_LEITURA_001'),
    total_dias_praticados = (SELECT COUNT(DISTINCT data_execucao) FROM registros_diarios
                             WHERE id_habito = 'HAB_LEITURA_001'),
    media_qualidade       = (SELECT ROUND(AVG(qualidade), 2) FROM registros_diarios
                             WHERE id_habito = 'HAB_LEITURA_001' AND qualidade IS NOT NULL),
    media_minutos_sessao  = (SELECT ROUND(AVG(minutos_realizado), 1) FROM registros_diarios
                             WHERE id_habito = 'HAB_LEITURA_001'),
    taxa_conclusao_pct    = (SELECT ROUND(SUM(concluido)*100.0/COUNT(*), 1) FROM registros_diarios
                             WHERE id_habito = 'HAB_LEITURA_001'),
    total_ano_corrente    = (SELECT SUM(minutos_realizado) FROM registros_diarios
                             WHERE id_habito = 'HAB_LEITURA_001'
                             AND strftime('%Y', data_execucao) = strftime('%Y', 'now')),
    ultima_execucao       = (SELECT MAX(data_execucao) FROM registros_diarios
                             WHERE id_habito = 'HAB_LEITURA_001'),
    ultima_atualizacao    = CURRENT_TIMESTAMP
WHERE id_habito = 'HAB_LEITURA_001';

-- ── Adicionar uma memória/insight
INSERT INTO memoria_geral VALUES (
    'MEM_' || strftime('%Y%m%d%H%M%S', 'now'),
    'HAB_HIIT_001',          -- id_habito (NULL se for global)
    'insight',               -- tipo: insight|ajuste|aprendizado|regra|reflexao|conquista|alerta
    'Treinar cedo aumenta consistência',
    'Percebi que ao treinar às 6h, minha taxa de conclusão sobe para 95%. Após o trabalho cai para 60%.',
    4,                       -- impacto (1-5)
    'consistência,manhã,rotina', -- tags
    'Mudei horário de treino para 6h de segunda a sexta',
    '2026-02-19',            -- data_memoria
    CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════════
-- SEÇÃO 2: RELATÓRIOS SEMANAIS
-- ═══════════════════════════════════════════════════════════════════

-- ── Relatório da semana atual
SELECT
    h.icone || ' ' || h.nome_habito              AS habito,
    COUNT(r.id_registro)                         AS sessoes_feitas,
    h.frequencia_semana                          AS meta_sessoes,
    ROUND(COUNT(r.id_registro)*100.0/h.frequencia_semana, 1) AS pct_meta,
    SUM(r.minutos_realizado)                     AS minutos_total,
    ROUND(SUM(r.minutos_realizado)/60.0, 1)      AS horas_total,
    ROUND(AVG(r.qualidade), 1)                   AS qualidade_media,
    CASE
        WHEN COUNT(r.id_registro)*100.0/h.frequencia_semana >= 100 THEN '✅ Meta atingida'
        WHEN COUNT(r.id_registro)*100.0/h.frequencia_semana >= 60  THEN '⚡ Bom progresso'
        WHEN COUNT(r.id_registro) = 0                              THEN '🚨 Sem registro'
        ELSE '⏳ Em andamento'
    END AS status
FROM habitos h
LEFT JOIN registros_diarios r ON
    r.id_habito = h.id_habito
    AND r.semana_iso = strftime('%Y-W', 'now') || printf('%02d', strftime('%W','now'))
WHERE h.status = 'ativo'
  AND h.data_vigencia_fim IS NULL
GROUP BY h.id_habito
ORDER BY pct_meta DESC;

-- ── Relatório de semana específica (altere o valor)
SELECT
    h.icone || ' ' || h.nome_habito              AS habito,
    COUNT(r.id_registro)                         AS sessoes,
    SUM(r.minutos_realizado)                     AS minutos,
    ROUND(COUNT(r.id_registro)*100.0/h.frequencia_semana, 1) AS pct_meta
FROM habitos h
LEFT JOIN registros_diarios r ON r.id_habito = h.id_habito AND r.semana_iso = '2026-W08'
WHERE h.status = 'ativo'
GROUP BY h.id_habito;

-- ── Evolução das últimas 8 semanas
SELECT
    r.semana_iso,
    h.nome_habito,
    COUNT(r.id_registro)                         AS sessoes,
    SUM(r.minutos_realizado)                     AS minutos,
    ROUND(COUNT(r.id_registro)*100.0/h.frequencia_semana, 1) AS pct_meta
FROM registros_diarios r
JOIN habitos h ON h.id_habito = r.id_habito
WHERE r.semana_iso >= strftime('%Y-W', date('now', '-56 days'))
GROUP BY r.semana_iso, r.id_habito
ORDER BY r.semana_iso DESC, minutos DESC;

-- ═══════════════════════════════════════════════════════════════════
-- SEÇÃO 3: RELATÓRIOS MENSAIS
-- ═══════════════════════════════════════════════════════════════════

-- ── Relatório do mês atual
SELECT
    h.icone || ' ' || h.nome_habito              AS habito,
    r.mes_ano,
    COUNT(r.id_registro)                         AS total_sessoes,
    SUM(r.minutos_realizado)                     AS total_minutos,
    ROUND(SUM(r.minutos_realizado)/60.0, 1)      AS total_horas,
    ROUND(AVG(r.qualidade), 2)                   AS qualidade_media,
    COUNT(DISTINCT r.data_execucao)              AS dias_praticados
FROM habitos h
JOIN registros_diarios r ON r.id_habito = h.id_habito
WHERE r.mes_ano = strftime('%Y-%m', 'now')
GROUP BY h.id_habito, r.mes_ano
ORDER BY total_horas DESC;

-- ── Comparação mensal (evolução ao longo de 2026)
SELECT
    r.mes_ano,
    h.nome_habito,
    SUM(r.minutos_realizado)                     AS minutos,
    ROUND(SUM(r.minutos_realizado)/60.0, 1)      AS horas,
    COUNT(r.id_registro)                         AS sessoes,
    ROUND(AVG(r.qualidade), 2)                   AS qualidade
FROM registros_diarios r
JOIN habitos h ON h.id_habito = r.id_habito
WHERE strftime('%Y', r.data_execucao) = '2026'
GROUP BY r.mes_ano, r.id_habito
ORDER BY r.mes_ano ASC, horas DESC;

-- ═══════════════════════════════════════════════════════════════════
-- SEÇÃO 4: RELATÓRIO ANUAL E DASHBOARD
-- ═══════════════════════════════════════════════════════════════════

-- ── Dashboard completo (visão geral de todos os hábitos)
SELECT
    h.icone,
    h.nome_habito,
    h.status,
    m.total_horas,
    m.total_dias_praticados,
    m.total_sessoes,
    m.streak_atual,
    m.maior_streak,
    ROUND(m.media_qualidade, 2)                  AS qualidade_media,
    m.taxa_conclusao_pct                         AS conclusao_pct,
    m.ultima_execucao,
    CAST(julianday('now') - julianday(m.ultima_execucao) AS INTEGER) AS dias_desde_ultima
FROM metricas_acumuladas m
JOIN habitos h ON h.id_habito = m.id_habito
WHERE h.data_vigencia_fim IS NULL
ORDER BY m.total_horas DESC;

-- ── Hábitos em risco (sem registro por 14+ dias)
SELECT
    h.icone || ' ' || h.nome_habito              AS habito,
    m.ultima_execucao,
    CAST(julianday('now') - julianday(m.ultima_execucao) AS INTEGER) AS dias_sem_registro,
    CASE
        WHEN CAST(julianday('now') - julianday(m.ultima_execucao) AS INTEGER) > 14 THEN '🚨 CRÍTICO'
        WHEN CAST(julianday('now') - julianday(m.ultima_execucao) AS INTEGER) > 7  THEN '⚠️ ALTO'
        ELSE '⚡ MÉDIO'
    END AS nivel_risco
FROM metricas_acumuladas m
JOIN habitos h ON h.id_habito = m.id_habito
WHERE h.status = 'ativo'
  AND h.data_vigencia_fim IS NULL
  AND (m.ultima_execucao IS NULL OR
       CAST(julianday('now') - julianday(m.ultima_execucao) AS INTEGER) > 7)
ORDER BY dias_sem_registro DESC;

-- ── Melhores dias da semana (qual dia você pratica mais)
SELECT
    CASE strftime('%w', r.data_execucao)
        WHEN '0' THEN 'Domingo'    WHEN '1' THEN 'Segunda'
        WHEN '2' THEN 'Terça'     WHEN '3' THEN 'Quarta'
        WHEN '4' THEN 'Quinta'    WHEN '5' THEN 'Sexta'
        WHEN '6' THEN 'Sábado'
    END AS dia_semana,
    COUNT(r.id_registro)                         AS total_sessoes,
    ROUND(AVG(r.minutos_realizado), 1)           AS media_minutos,
    ROUND(AVG(r.qualidade), 2)                   AS media_qualidade
FROM registros_diarios r
JOIN habitos h ON h.id_habito = r.id_habito
WHERE h.status = 'ativo'
GROUP BY strftime('%w', r.data_execucao)
ORDER BY total_sessoes DESC;

-- ── Melhor hora do dia (horários de maior performance)
SELECT
    CASE
        WHEN CAST(substr(hora_inicio, 1, 2) AS INTEGER) BETWEEN 5  AND 8  THEN '🌅 Madrugada (5-8h)'
        WHEN CAST(substr(hora_inicio, 1, 2) AS INTEGER) BETWEEN 9  AND 11 THEN '☀️ Manhã (9-11h)'
        WHEN CAST(substr(hora_inicio, 1, 2) AS INTEGER) BETWEEN 12 AND 13 THEN '🌤️ Almoço (12-13h)'
        WHEN CAST(substr(hora_inicio, 1, 2) AS INTEGER) BETWEEN 14 AND 17 THEN '🌇 Tarde (14-17h)'
        WHEN CAST(substr(hora_inicio, 1, 2) AS INTEGER) BETWEEN 18 AND 20 THEN '🌆 Início noite (18-20h)'
        WHEN CAST(substr(hora_inicio, 1, 2) AS INTEGER) BETWEEN 21 AND 23 THEN '🌙 Noite (21-23h)'
        ELSE '⏰ Horário não registrado'
    END AS periodo,
    COUNT(*)                                     AS sessoes,
    ROUND(AVG(qualidade), 2)                     AS qualidade_media,
    ROUND(AVG(minutos_realizado), 1)             AS media_minutos
FROM registros_diarios
WHERE hora_inicio IS NOT NULL
GROUP BY periodo
ORDER BY qualidade_media DESC;

-- ═══════════════════════════════════════════════════════════════════
-- SEÇÃO 5: HISTÓRICO COMPLETO DE UM HÁBITO
-- ═══════════════════════════════════════════════════════════════════

-- ── Histórico completo (mais recente primeiro)
SELECT
    r.data_execucao,
    r.semana_iso,
    r.hora_inicio,
    r.minutos_realizado,
    r.concluido,
    r.qualidade,
    r.tipo_sessao,
    r.observacoes
FROM registros_diarios r
WHERE r.id_habito = 'HAB_INGLES_001'   -- << altere o hábito
ORDER BY r.data_execucao DESC;

-- ── Estatísticas de um hábito específico
SELECT
    COUNT(*)                                     AS total_sessoes,
    COUNT(DISTINCT data_execucao)                AS dias_praticados,
    SUM(minutos_realizado)                       AS total_minutos,
    ROUND(SUM(minutos_realizado)/60.0, 1)        AS total_horas,
    MIN(data_execucao)                           AS primeiro_registro,
    MAX(data_execucao)                           AS ultimo_registro,
    ROUND(AVG(minutos_realizado), 1)             AS media_min_sessao,
    ROUND(AVG(qualidade), 2)                     AS qualidade_media,
    MAX(minutos_realizado)                       AS maior_sessao,
    SUM(concluido)                               AS sessoes_concluidas,
    ROUND(SUM(concluido)*100.0/COUNT(*), 1)      AS taxa_conclusao
FROM registros_diarios
WHERE id_habito = 'HAB_INGLES_001';   -- << altere o hábito

-- ═══════════════════════════════════════════════════════════════════
-- SEÇÃO 6: VERSIONAMENTO DE HÁBITOS
-- Use quando precisar mudar a meta de qualquer hábito
-- ═══════════════════════════════════════════════════════════════════

-- ── Versionar hábito (substitua os valores)
-- PASSO 1: Fechar versão atual
UPDATE habitos
SET data_vigencia_fim = CURRENT_TIMESTAMP
WHERE id_habito = 'HAB_LEITURA_001'
  AND data_vigencia_fim IS NULL;

-- PASSO 2: Criar nova versão (com versao+1 e novas configurações)
INSERT INTO habitos VALUES (
    'HAB_LEITURA_001',   -- MESMO id_habito
    'Leitura',
    'estudo',
    '30 minutos de leitura, 5 dias por semana',   -- nova meta
    5,                   -- nova frequência
    30,                  -- nova duração (era 25, agora 30)
    'minutos',
    7800,                -- nova meta anual
    '📚', '#3b82f6',
    2,                   -- VERSAO INCREMENTADA (era 1, agora 2)
    'ativo',
    CURRENT_TIMESTAMP,
    NULL,
    'Ajuste: aumentei para 30min/sessão a partir de março/26'
);

-- ── Consultar todas as versões de um hábito
SELECT id_habito, nome_habito, versao, frequencia_semana, minutos_sessao,
       data_criacao, data_vigencia_fim, notas_criacao
FROM habitos
WHERE id_habito = 'HAB_LEITURA_001'
ORDER BY versao;

-- ═══════════════════════════════════════════════════════════════════
-- SEÇÃO 7: RECALCULAR TUDO
-- Use este bloco para recalcular as métricas de todos os hábitos
-- de uma vez (rode após importar dados do localStorage)
-- ═══════════════════════════════════════════════════════════════════
UPDATE metricas_acumuladas SET
    total_minutos         = (SELECT COALESCE(SUM(r.minutos_realizado),0) FROM registros_diarios r WHERE r.id_habito = metricas_acumuladas.id_habito),
    total_horas           = (SELECT ROUND(COALESCE(SUM(r.minutos_realizado),0)/60.0,2) FROM registros_diarios r WHERE r.id_habito = metricas_acumuladas.id_habito),
    total_sessoes         = (SELECT COUNT(*) FROM registros_diarios r WHERE r.id_habito = metricas_acumuladas.id_habito),
    total_dias_praticados = (SELECT COUNT(DISTINCT r.data_execucao) FROM registros_diarios r WHERE r.id_habito = metricas_acumuladas.id_habito),
    media_qualidade       = (SELECT ROUND(AVG(r.qualidade),2) FROM registros_diarios r WHERE r.id_habito = metricas_acumuladas.id_habito AND r.qualidade IS NOT NULL),
    media_minutos_sessao  = (SELECT ROUND(AVG(r.minutos_realizado),1) FROM registros_diarios r WHERE r.id_habito = metricas_acumuladas.id_habito),
    taxa_conclusao_pct    = (SELECT ROUND(SUM(r.concluido)*100.0/COUNT(*),1) FROM registros_diarios r WHERE r.id_habito = metricas_acumuladas.id_habito),
    total_ano_corrente    = (SELECT COALESCE(SUM(r.minutos_realizado),0) FROM registros_diarios r WHERE r.id_habito = metricas_acumuladas.id_habito AND strftime('%Y',r.data_execucao)=strftime('%Y','now')),
    ultima_execucao       = (SELECT MAX(r.data_execucao) FROM registros_diarios r WHERE r.id_habito = metricas_acumuladas.id_habito),
    ultima_atualizacao    = CURRENT_TIMESTAMP;

-- ═══════════════════════════════════════════════════════════════════
-- SEÇÃO 8: MEMÓRIA GERAL — CONSULTAS
-- ═══════════════════════════════════════════════════════════════════

-- ── Todos os insights e aprendizados (mais recentes primeiro)
SELECT data_memoria, tipo_memoria, titulo, impacto_estimado, tags, conteudo
FROM memoria_geral
ORDER BY data_memoria DESC;

-- ── Memórias de um hábito específico
SELECT data_memoria, tipo_memoria, titulo, conteudo, acao_tomada
FROM memoria_geral
WHERE id_habito = 'HAB_HIIT_001'
ORDER BY data_memoria DESC;

-- ── Memórias de alto impacto
SELECT data_memoria, h.nome_habito, m.tipo_memoria, m.titulo, m.impacto_estimado, m.conteudo
FROM memoria_geral m
LEFT JOIN habitos h ON h.id_habito = m.id_habito
WHERE m.impacto_estimado >= 4
ORDER BY m.impacto_estimado DESC, m.data_memoria DESC;

-- ── Busca por tag
SELECT data_memoria, tipo_memoria, titulo, conteudo, tags
FROM memoria_geral
WHERE tags LIKE '%consistência%'   -- << altere a tag
ORDER BY data_memoria DESC;
