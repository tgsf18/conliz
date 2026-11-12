-- ==============================================================================
-- CONLIZ PLATFORM - V4 INDEXES & AUDIT HARDENING
-- Compatible with PostgreSQL & H2 (MODE=PostgreSQL)
-- Idempotente: pode rodar sobre bases já criadas pela V1.
-- ==============================================================================

-- 1. FUNIL COMERCIAL: consultas do painel filtram por status + período
CREATE INDEX IF NOT EXISTS idx_orcamentos_status_criado ON orcamentos(status, criado_em);

-- 2. CLIENTES: busca por e-mail usada na conversão orçamento -> contrato
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);

-- 3. CONTRATOS: listagem por cliente e vigência
CREATE INDEX IF NOT EXISTS idx_contratos_cliente ON contratos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_contratos_orcamento ON contratos(orcamento_id);

-- 4. FINANCEIRO: fluxo de caixa por tipo (RECEITA/DESPESA) e período de pagamento
CREATE INDEX IF NOT EXISTS idx_financeiro_tipo_vencimento ON financeiro(tipo, data_vencimento);
CREATE INDEX IF NOT EXISTS idx_financeiro_pagamento ON financeiro(data_pagamento);

-- 5. RH: headcount ativo por departamento
CREATE INDEX IF NOT EXISTS idx_funcionarios_status_departamento ON funcionarios(status, departamento);

-- 6. AUDITORIA: trilha por entidade/registro e por data (painel de logs)
CREATE INDEX IF NOT EXISTS idx_auditoria_entidade ON auditoria(entidade, entidade_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_criado_em ON auditoria(criado_em);
