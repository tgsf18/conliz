-- ==============================================================================
-- CONLIZ PLATFORM - V1 INITIAL DATABASE SCHEMA
-- Compatible with PostgreSQL & H2
-- ==============================================================================

-- 1. USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    recovery_codes TEXT,
    failed_attempts INT NOT NULL DEFAULT 0,
    lockout_until TIMESTAMP,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_role ON usuarios(role);

-- 2. REFRESH TOKENS (Rotating, SHA-256 hashed)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    replaced_by_token_hash VARCHAR(255),
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_usuario ON refresh_tokens(usuario_id);

-- 3. CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    documento VARCHAR(20),
    tipo_pessoa VARCHAR(2) NOT NULL DEFAULT 'PF',
    email VARCHAR(150),
    telefone VARCHAR(30),
    endereco VARCHAR(255),
    cidade VARCHAR(100),
    uf VARCHAR(2) DEFAULT 'SP',
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome);
CREATE INDEX IF NOT EXISTS idx_clientes_documento ON clientes(documento);

-- 4. ORCAMENTOS
CREATE TABLE IF NOT EXISTS orcamentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    nome_solicitante VARCHAR(150) NOT NULL,
    email_solicitante VARCHAR(150) NOT NULL,
    telefone_solicitante VARCHAR(30) NOT NULL,
    tipo_obra VARCHAR(50) NOT NULL,
    area_m2 NUMERIC(10, 2),
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL DEFAULT 'SP',
    status VARCHAR(30) NOT NULL DEFAULT 'NOVO',
    valor_estimado NUMERIC(15, 2),
    descricao TEXT NOT NULL,
    anexos_urls TEXT,
    notas_internas TEXT,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orcamentos_codigo ON orcamentos(codigo);
CREATE INDEX IF NOT EXISTS idx_orcamentos_status ON orcamentos(status);
CREATE INDEX IF NOT EXISTS idx_orcamentos_criado_em ON orcamentos(criado_em);

-- 5. CONTRATOS
CREATE TABLE IF NOT EXISTS contratos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero VARCHAR(50) NOT NULL UNIQUE,
    orcamento_id UUID REFERENCES orcamentos(id) ON DELETE SET NULL,
    cliente_id UUID NOT NULL REFERENCES clientes(id),
    titulo VARCHAR(200) NOT NULL,
    valor_total NUMERIC(15, 2) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'VIGENTE',
    arquivo_url VARCHAR(500),
    observacoes TEXT,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contratos_numero ON contratos(numero);
CREATE INDEX IF NOT EXISTS idx_contratos_status ON contratos(status);
CREATE INDEX IF NOT EXISTS idx_contratos_vencimento ON contratos(data_fim);

-- 6. OBRAS
CREATE TABLE IF NOT EXISTS obras (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contrato_id UUID REFERENCES contratos(id) ON DELETE SET NULL,
    nome VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    categoria VARCHAR(50) NOT NULL,
    descricao TEXT,
    localizacao VARCHAR(150) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    uf VARCHAR(2) NOT NULL DEFAULT 'SP',
    area_m2 NUMERIC(10, 2),
    ano_conclusao INT,
    percentual_concluido NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    fase_atual VARCHAR(50) NOT NULL DEFAULT 'FUNDACAO',
    publica BOOLEAN NOT NULL DEFAULT FALSE,
    imagem_capa_url VARCHAR(500),
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_obras_slug ON obras(slug);
CREATE INDEX IF NOT EXISTS idx_obras_publica ON obras(publica);
CREATE INDEX IF NOT EXISTS idx_obras_status ON obras(fase_atual);

-- 7. OBRA FOTOS (Galeria e Antes/Depois)
CREATE TABLE IF NOT EXISTS obra_fotos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    legenda VARCHAR(255),
    eh_antes_depois BOOLEAN NOT NULL DEFAULT FALSE,
    eh_antes BOOLEAN NOT NULL DEFAULT FALSE,
    ordem INT NOT NULL DEFAULT 0,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_obra_fotos_obra ON obra_fotos(obra_id);

-- 8. FUNCIONARIOS (RH)
CREATE TABLE IF NOT EXISTS funcionarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    cpf VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(150),
    telefone VARCHAR(30),
    cargo VARCHAR(100) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    data_admissao DATE NOT NULL,
    data_demissao DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'ATIVO',
    salario_base NUMERIC(12, 2) NOT NULL,
    obra_atual_id UUID REFERENCES obras(id) ON DELETE SET NULL,
    chave_pix VARCHAR(100),
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_funcionarios_cpf ON funcionarios(cpf);
CREATE INDEX IF NOT EXISTS idx_funcionarios_status ON funcionarios(status);
CREATE INDEX IF NOT EXISTS idx_funcionarios_departamento ON funcionarios(departamento);

-- 9. PONTO (Registro de Ponto)
CREATE TABLE IF NOT EXISTS ponto (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    funcionario_id UUID NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    hora_entrada TIME,
    hora_saida_almoco TIME,
    hora_retorno_almoco TIME,
    hora_saida TIME,
    horas_trabalhadas NUMERIC(5, 2),
    horas_extras NUMERIC(5, 2) DEFAULT 0.00,
    observacoes TEXT,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ponto_func_data ON ponto(funcionario_id, data);

-- 10. FERIAS
CREATE TABLE IF NOT EXISTS ferias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    funcionario_id UUID NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    dias INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'SOLICITADA',
    observacoes TEXT,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ferias_func ON ferias(funcionario_id);

-- 11. FOLHA DE PAGAMENTO
CREATE TABLE IF NOT EXISTS folha_pagamento (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    funcionario_id UUID NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
    mes INT NOT NULL,
    ano INT NOT NULL,
    salario_base NUMERIC(12, 2) NOT NULL,
    horas_extras_valor NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    beneficios_valor NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    descontos_valor NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_liquido NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDENTE',
    pago_em TIMESTAMP,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_folha_periodo ON folha_pagamento(mes, ano);

-- 12. DOCUMENTOS RH (ASO, NRs, Contratos)
CREATE TABLE IF NOT EXISTS documentos_rh (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    funcionario_id UUID NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    arquivo_url VARCHAR(500) NOT NULL,
    data_emissao DATE,
    data_vencimento DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'VIGENTE',
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_docs_vencimento ON documentos_rh(data_vencimento);

-- 13. FORNECEDORES
CREATE TABLE IF NOT EXISTS fornecedores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    razao_social VARCHAR(200) NOT NULL,
    nome_fantasia VARCHAR(200),
    cnpj VARCHAR(20) NOT NULL UNIQUE,
    contato_nome VARCHAR(100),
    email VARCHAR(150),
    telefone VARCHAR(30),
    categoria VARCHAR(100) NOT NULL,
    cidade VARCHAR(100),
    uf VARCHAR(2) DEFAULT 'SP',
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fornecedores_cnpj ON fornecedores(cnpj);
CREATE INDEX IF NOT EXISTS idx_fornecedores_categoria ON fornecedores(categoria);

-- 14. MATERIAIS
CREATE TABLE IF NOT EXISTS materiais (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nome VARCHAR(200) NOT NULL,
    unidade VARCHAR(20) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    estoque_atual NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    estoque_minimo NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    preco_medio NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    fornecedor_padrao_id UUID REFERENCES fornecedores(id) ON DELETE SET NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_materiais_codigo ON materiais(codigo);
CREATE INDEX IF NOT EXISTS idx_materiais_categoria ON materiais(categoria);

-- 15. MOVIMENTACOES DE ESTOQUE
CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    material_id UUID NOT NULL REFERENCES materiais(id),
    obra_id UUID REFERENCES obras(id),
    tipo VARCHAR(30) NOT NULL,
    quantidade NUMERIC(12, 2) NOT NULL,
    preco_unitario NUMERIC(12, 2),
    motivo TEXT,
    criado_por UUID REFERENCES usuarios(id),
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_movimentacoes_material ON movimentacoes_estoque(material_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_obra ON movimentacoes_estoque(obra_id);

-- 16. MEDICOES
CREATE TABLE IF NOT EXISTS medicoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    numero INT NOT NULL,
    data_medicao DATE NOT NULL,
    percentual_medido NUMERIC(5, 2) NOT NULL,
    valor_medido NUMERIC(15, 2) NOT NULL,
    observacoes TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'RASCUNHO',
    aprovado_por UUID REFERENCES usuarios(id),
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_medicoes_obra ON medicoes(obra_id);

-- 17. FINANCEIRO (Contas a Pagar e Receber por Obra)
CREATE TABLE IF NOT EXISTS financeiro (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    obra_id UUID REFERENCES obras(id) ON DELETE SET NULL,
    tipo VARCHAR(30) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    valor NUMERIC(15, 2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDENTE',
    documento_num VARCHAR(100),
    fornecedor_id UUID REFERENCES fornecedores(id) ON DELETE SET NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_financeiro_obra ON financeiro(obra_id);
CREATE INDEX IF NOT EXISTS idx_financeiro_vencimento ON financeiro(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_financeiro_status ON financeiro(status);

-- 18. EQUIPAMENTOS
CREATE TABLE IF NOT EXISTS equipamentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nome VARCHAR(150) NOT NULL,
    modelo VARCHAR(100),
    numero_serie VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'DISPONIVEL',
    obra_alocada_id UUID REFERENCES obras(id) ON DELETE SET NULL,
    data_aquisicao DATE,
    valor_aquisicao NUMERIC(12, 2),
    proxima_manutencao DATE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_equipamentos_status ON equipamentos(status);

-- 19. DIARIO DE OBRA
CREATE TABLE IF NOT EXISTS diario_obra (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    clima VARCHAR(50),
    efetivo_proprio INT DEFAULT 0,
    efetivo_terceirizado INT DEFAULT 0,
    atividades_realizadas TEXT NOT NULL,
    ocorrencias TEXT,
    fotos_urls TEXT,
    registrado_por UUID REFERENCES usuarios(id),
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_diario_obra_data ON diario_obra(obra_id, data);

-- 20. AUDITORIA
CREATE TABLE IF NOT EXISTS auditoria (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID,
    usuario_email VARCHAR(150),
    acao VARCHAR(100) NOT NULL,
    entidade VARCHAR(100) NOT NULL,
    entidade_id VARCHAR(100),
    ip_origem VARCHAR(50),
    detalhes TEXT,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_entidade ON auditoria(entidade, entidade_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_criado_em ON auditoria(criado_em);
