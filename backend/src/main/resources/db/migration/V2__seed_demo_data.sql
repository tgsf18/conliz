-- ==============================================================================
-- CONLIZ PLATFORM - V2 SEED DEMO DATA
-- Realistic data for Conliz Construtora (Sorocaba & Região)
-- ==============================================================================

-- 1. CLIENTES
INSERT INTO clientes (id, nome, documento, tipo_pessoa, email, telefone, endereco, cidade, uf) VALUES
('a0000001-0000-0000-0000-000000000001', 'Dr. Roberto Silveira', '12345678901', 'PF', 'roberto.silveira@email.com', '(15) 99811-2233', 'Alameda dos Ipês, 150 - Alphaville', 'Votorantim', 'SP'),
('a0000001-0000-0000-0000-000000000002', 'Clínica Odontológica Sorocaba Ltda', '12345678000199', 'PJ', 'contato@clinicasorocaba.com.br', '(15) 3232-4455', 'Av. Barão de Tatuí, 820 - Centro', 'Sorocaba', 'SP'),
('a0000001-0000-0000-0000-000000000003', 'Condomínio Residencial Saint Paul', '98765432000188', 'PJ', 'sindico@saintpaulsorocaba.com.br', '(15) 3211-7788', 'Rua José Maria Hanickel, 300 - Campolim', 'Sorocaba', 'SP'),
('a0000001-0000-0000-0000-000000000004', 'Camila Duarte Fagundes', '23456789012', 'PF', 'camila.fagundes@email.com', '(15) 99765-4321', 'Rua Professora Zélia Dulce, 45 - Granja Olga', 'Sorocaba', 'SP');

-- 2. ORCAMENTOS
INSERT INTO orcamentos (id, codigo, cliente_id, nome_solicitante, email_solicitante, telefone_solicitante, tipo_obra, area_m2, cidade, estado, status, valor_estimado, descricao, notas_internas) VALUES
('b0000001-0000-0000-0000-000000000001', 'ORC-2026-001', 'a0000001-0000-0000-0000-000000000004', 'Camila Duarte Fagundes', 'camila.fagundes@email.com', '(15) 99765-4321', 'Reforma Residencial', 185.00, 'Sorocaba', 'SP', 'NOVO', 125000.00, 'Reforma completa de apartamento no Campolim: integração de varanda gourmet com sala, troca total de revestimentos para estética Japandi/Maison e iluminação embutida.', 'Lead qualificado vindo pelo site. Aguardando agendamento de visita técnica.'),
('b0000001-0000-0000-0000-000000000002', 'ORC-2026-002', 'a0000001-0000-0000-0000-000000000001', 'Dr. Roberto Silveira', 'roberto.silveira@email.com', '(15) 99811-2233', 'Construção Residencial', 380.00, 'Votorantim', 'SP', 'EM_ANALISE', 890000.00, 'Construção de residência contemporânea em condomínio fechado com estrutura de concreto aparente e acabamento em madeira de carvalho e pedras naturais.', 'Projeto arquitetônico recebido. Engenharia calculando quantitativos de fundação.'),
('b0000001-0000-0000-0000-000000000003', 'ORC-2026-003', 'a0000001-0000-0000-0000-000000000002', 'Clínica Odontológica Sorocaba', 'contato@clinicasorocaba.com.br', '(15) 3232-4455', 'Comercial / Saúde', 220.00, 'Sorocaba', 'SP', 'ENVIADO', 280000.00, 'Adequação de salas para consultórios, infraestrutura de gases medicinais e recepção editorial minimalista.', 'Proposta técnica e comercial enviada. Retorno previsto para terça-feira.'),
('b0000001-0000-0000-0000-000000000004', 'ORC-2026-004', 'a0000001-0000-0000-0000-000000000003', 'Condomínio Residencial Saint Paul', 'sindico@saintpaulsorocaba.com.br', '(15) 3211-7788', 'Reforma Predial', 520.00, 'Sorocaba', 'SP', 'APROVADO', 410000.00, 'Revitalização do hall social de entrada, portaria blindada e área de convivência externa da piscina.', 'Aprovado em assembleia de condomínio. Contrato sendo emitido.'),
('b0000001-0000-0000-0000-000000000005', 'ORC-2026-005', NULL, 'Marcos Vinicius Pereira', 'marcos.pereira@email.com', '(15) 98111-9988', 'Pintura Simples', 80.00, 'Itu', 'SP', 'RECUSADO', 12000.00, 'Apenas pintura de fachada residencial de pequeno porte.', 'Fora do escopo estratégico de engenharia e obras da Conliz.');

-- 3. CONTRATOS
INSERT INTO contratos (id, numero, orcamento_id, cliente_id, titulo, valor_total, data_inicio, data_fim, status, observacoes) VALUES
('c0000001-0000-0000-0000-000000000001', 'CTR-2026-001', 'b0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000003', 'Contrato Empreitada Global - Condomínio Saint Paul', 410000.00, '2026-01-15', '2026-08-30', 'VIGENTE', 'Prazo estimado de 7 meses. Medições quinzenais com retenção técnica de 5%.'),
('c0000001-0000-0000-0000-000000000002', 'CTR-2025-018', NULL, 'a0000001-0000-0000-0000-000000000001', 'Construção Casa Alphaville - Etapa Concreto e Acabamento', 750000.00, '2025-06-01', '2026-12-15', 'VIGENTE', 'Contrato por administração com taxa de gestão acordada em 14%.');

-- 4. OBRAS
INSERT INTO obras (id, contrato_id, nome, slug, categoria, descricao, localizacao, cidade, uf, area_m2, ano_conclusao, percentual_concluido, fase_atual, publica, imagem_capa_url) VALUES
('d0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000002', 'Residência Alphaville Nova Esplanada', 'residencia-alphaville-nova-esplanada', 'RESIDENCIAL', 'Projeto residencial de alto padrão em Votorantim/Sorocaba. Estrutura pura com grandes vãos, integração bioclimática com a natureza e acabamentos em linho, concreto ripado e madeira nobre.', 'Condomínio Alphaville Nova Esplanada 3', 'Votorantim', 'SP', 380.00, 2026, 68.00, 'ESTRUTURA', TRUE, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80'),
('d0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', 'Retrofit e Hall Social Saint Paul', 'retrofit-hall-social-saint-paul', 'REFORMA', 'Transformação e modernização de área social comum predial. Piso em pedra calcária, iluminação escandinava difusa e detalhes em latão fosco.', 'Rua José Maria Hanickel, Campolim', 'Sorocaba', 'SP', 520.00, 2026, 42.00, 'ALVENARIA', TRUE, 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=80'),
('d0000001-0000-0000-0000-000000000003', NULL, 'Consultórios Integrados Barão de Tatuí', 'consultorios-integrados-barao-de-tatui', 'COMERCIAL', 'Ambiente corporativo de saúde com linhas arquitetônicas puras, acústica refinada e materiais térmicos.', 'Av. Barão de Tatuí, Sorocaba', 'Sorocaba', 'SP', 220.00, 2025, 100.00, 'CONCLUIDA', TRUE, 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80'),
('d0000001-0000-0000-0000-000000000004', NULL, 'Villa Quinta da Primavera', 'villa-quinta-da-primavera', 'RESIDENCIAL', 'Construção residencial unifamiliar térrea com pátio central ajardinado, telhado em balanço e claraboias zenitais.', 'Condomínio Quinta da Primavera', 'Itu', 'SP', 410.00, 2025, 100.00, 'CONCLUIDA', TRUE, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80');

-- 5. OBRA FOTOS (Galeria e Antes/Depois)
INSERT INTO obra_fotos (id, obra_id, url, legenda, eh_antes_depois, eh_antes, ordem) VALUES
('e0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80', 'Fachada principal ao entardecer', FALSE, FALSE, 1),
('e0000001-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80', 'Living integrado com pé direito duplo e luz natural', FALSE, FALSE, 2),
('e0000001-0000-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80', 'Hall antes da reforma', TRUE, TRUE, 1),
('e0000001-0000-0000-0000-000000000004', 'd0000001-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=80', 'Hall depois da intervenção Conliz', TRUE, FALSE, 2),
('e0000001-0000-0000-0000-000000000005', 'd0000001-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80', 'Recepção executiva com revestimento amadeirado', FALSE, FALSE, 1);

-- 6. FORNECEDORES
INSERT INTO fornecedores (id, razao_social, nome_fantasia, cnpj, contato_nome, email, telefone, categoria, cidade, uf) VALUES
('f0000001-0000-0000-0000-000000000001', 'Votorantim Cimentos S.A.', 'Votorantim Cimentos', '01234567000101', 'Eduardo Ramos', 'vendas.sorocaba@votorantim.com', '(15) 3300-1100', 'MATERIAIS_BASICOS', 'Sorocaba', 'SP'),
('f0000001-0000-0000-0000-000000000002', 'Gerdau Aços Longos S.A.', 'Gerdau', '02345678000102', 'Ana Beatriz Paes', 'atendimento@gerdau.com', '(15) 3220-4000', 'MATERIAIS_BASICOS', 'Sorocaba', 'SP'),
('f0000001-0000-0000-0000-000000000003', 'Portobello Shop Sorocaba', 'Portobello Shop Campolim', '03456789000103', 'Marcio Antunes', 'campolim@portobelloshop.com.br', '(15) 3212-9900', 'ACABAMENTOS', 'Sorocaba', 'SP'),
('f0000001-0000-0000-0000-000000000004', 'Locadora de Andaimes Sorocaba Ltda', 'LocaAndaimes Sorocaba', '04567890000104', 'Reginaldo Costa', 'contato@locaandaimes.com.br', '(15) 3234-8877', 'LOCACAO_EQUIPAMENTOS', 'Sorocaba', 'SP');

-- 7. MATERIAIS
INSERT INTO materiais (id, codigo, nome, unidade, categoria, estoque_atual, estoque_minimo, preco_medio, fornecedor_padrao_id) VALUES
('m0000001-0000-0000-0000-000000000001', 'MAT-CIM-01', 'Cimento Portland CP II-Z-32 (Saco 50kg)', 'SACO', 'Cimento e Agregados', 340.00, 100.00, 36.50, 'f0000001-0000-0000-0000-000000000001'),
('m0000001-0000-0000-0000-000000000002', 'MAT-ACO-02', 'Aço CA-50 Barra 10.0mm (12m)', 'BARRA', 'Ferragens', 185.00, 50.00, 68.90, 'f0000001-0000-0000-0000-000000000002'),
('m0000001-0000-0000-0000-000000000003', 'MAT-ARE-03', 'Areia Lavada Grossa para Concreto', 'M3', 'Cimento e Agregados', 24.00, 10.00, 130.00, 'f0000001-0000-0000-0000-000000000001'),
('m0000001-0000-0000-0000-000000000004', 'MAT-POR-04', 'Porcelanato Maison Crema 90x90 Fosco', 'M2', 'Acabamentos', 45.00, 60.00, 149.00, 'f0000001-0000-0000-0000-000000000003'),
('m0000001-0000-0000-0000-000000000005', 'MAT-BLC-05', 'Bloco Estrutural Cerâmico 14x19x29', 'MILHEIRO', 'Alvenaria', 8.50, 4.00, 2450.00, 'f0000001-0000-0000-0000-000000000001');

-- 8. FUNCIONARIOS (RH)
INSERT INTO funcionarios (id, nome, cpf, email, telefone, cargo, departamento, data_admissao, status, salario_base, obra_atual_id, chave_pix) VALUES
('fa000001-0000-0000-0000-000000000001', 'Eng. Leonardo Prado', '11122233344', 'leonardo.prado@conliz.com.br', '(15) 99111-2233', 'Engenheiro Civil Residente', 'ENGENHARIA', '2023-03-01', 'ATIVO', 11500.00, 'd0000001-0000-0000-0000-000000000001', 'leonardo.prado@conliz.com.br'),
('fa000001-0000-0000-0000-000000000002', 'Mariana Alencar', '22233344455', 'mariana.alencar@conliz.com.br', '(15) 99222-3344', 'Arquiteta de Obras e Detalhamento', 'ENGENHARIA', '2023-08-15', 'ATIVO', 8800.00, 'd0000001-0000-0000-0000-000000000002', 'mariana.pix@email.com'),
('fa000001-0000-0000-0000-000000000003', 'Sebastião Valério Ribeiro', '33344455566', 'sebastiao.mestre@conliz.com.br', '(15) 99333-4455', 'Mestre de Obras Geral', 'OPERACIONAL', '2022-01-10', 'ATIVO', 6400.00, 'd0000001-0000-0000-0000-000000000001', '33344455566'),
('fa000001-0000-0000-0000-000000000004', 'Beatriz Castanho', '44455566677', 'beatriz.rh@conliz.com.br', '(15) 99444-5566', 'Coordenadora de Recursos Humanos', 'RH', '2023-02-01', 'ATIVO', 7200.00, NULL, 'beatriz.castanho@conliz.com.br'),
('fa000001-0000-0000-0000-000000000005', 'Gustavo Henrique Silva', '55566677788', 'gustavo.comercial@conliz.com.br', '(15) 99555-6677', 'Executivo Comercial de Obras', 'COMERCIAL', '2024-01-05', 'ATIVO', 6500.00, NULL, 'gustavo.comercial@conliz.com.br');

-- 9. EQUIPAMENTOS
INSERT INTO equipamentos (id, codigo, nome, modelo, numero_serie, status, obra_alocada_id, data_aquisicao, valor_aquisicao, proxima_manutencao) VALUES
('eq000001-0000-0000-0000-000000000001', 'EQP-BET-01', 'Betoneira 400 Litros Monofásica', 'CSM 400L Pro', 'CSM-2024-9981', 'EM_USO', 'd0000001-0000-0000-0000-000000000001', '2024-02-10', 4850.00, '2026-12-10'),
('eq000001-0000-0000-0000-000000000002', 'EQP-LAS-02', 'Nível Laser Autonivelante 360', 'Bosch GLL 3-80 G', 'BSH-774129', 'EM_USO', 'd0000001-0000-0000-0000-000000000002', '2024-05-18', 2990.00, '2026-11-30'),
('eq000001-0000-0000-0000-000000000003', 'EQP-CMP-03', 'Compactador de Percussão "Sapo"', 'Wacker Neuson BS50-2', 'WCK-881203', 'DISPONIVEL', NULL, '2023-11-04', 12400.00, '2027-01-15');

-- 10. FINANCEIRO (Fluxo de Caixa e Lançamentos)
INSERT INTO financeiro (id, obra_id, tipo, categoria, descricao, valor, data_vencimento, data_pagamento, status, documento_num, fornecedor_id) VALUES
('fn000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'RECEITA', 'MEDICAO_CLIENTE', '1ª Medição de Estrutura - Dr. Roberto', 85000.00, '2026-02-10', '2026-02-09', 'PAGO', 'NF-1042', NULL),
('fn000001-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000001', 'DESPESA', 'MATERIAL', 'Fornecimento de Aço Estrutural CA-50', 28500.00, '2026-02-15', '2026-02-14', 'PAGO', 'NFe-88129', 'f0000001-0000-0000-0000-000000000002'),
('fn000001-0000-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000002', 'RECEITA', 'MEDICAO_CLIENTE', '2ª Parcela Empreitada Saint Paul', 58500.00, '2026-03-05', NULL, 'PENDENTE', 'BOL-9901', NULL),
('fn000001-0000-0000-0000-000000000004', 'd0000001-0000-0000-0000-000000000002', 'DESPESA', 'MAO_DE_OBRA', 'Empreiteira de Pintura e Revestimento Especializado', 18400.00, '2026-03-10', NULL, 'PENDENTE', 'REC-014', NULL);

-- 11. AUDITORIA INICIAL
INSERT INTO auditoria (id, usuario_id, usuario_email, acao, entidade, entidade_id, ip_origem, detalhes) VALUES
('ad000001-0000-0000-0000-000000000001', NULL, 'system@conliz.com.br', 'INITIAL_MIGRATION', 'SYSTEM', 'V2', '127.0.0.1', 'Carga de semente de dados de demonstração inicial para Sorocaba e região concluída.');
