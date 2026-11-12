# Relatório de Entrega — Conliz Platform

**Data:** 12/11/2026
**Repositório:** https://github.com/tgsf18/conliz (privado, branch `main`)
**Último commit:** `95aaa66` — CI verde (Backend Maven + Frontend Node)

---

## 1. Resumo executivo

A plataforma Conliz está **funcional de ponta a ponta** em ambiente local e **pronta para publicar** em produção. O que foi entregue nesta rodada:

| Entrega | Situação |
|---------|----------|
| Três módulos novos do painel (Contratos, Financeiro, RH) com API real | ✅ Concluído e testado |
| Correção do seed que impedia o backend de iniciar | ✅ Concluído |
| Site + painel servidos pelo próprio backend (sem segundo serviço) | ✅ Concluído e testado |
| Blueprint de deploy no Render + banco no Supabase | ✅ Pronto (falta executar) |
| Publicação em produção | ⏳ Aguardando apenas as credenciais do Supabase |

---

## 2. Números do projeto

| Métrica | Valor |
|---------|-------|
| Classes Java | 73 |
| Arquivos de teste | 6 (21 testes JUnit + 5 node:test) |
| Páginas Next.js | 12 |
| Migrações Flyway | 4 (V1 schema, V2 seed, V3 RLS, V4 índices) |
| Endpoints REST | 30+ |
| Commits semânticos | 5 nesta rodada |

---

## 3. O que foi construído nesta rodada

### 3.1 Módulo Contratos — `/admin/contratos`
- Listagem paginada com busca por número, título e cliente; filtro por status (`VIGENTE`, `ENCERRADO`, `SUSPENSO`, `CANCELADO`).
- KPIs: total da carteira, valor vigente e contratos vencendo em 45 dias.
- Criação com numeração automática `CTR-2026-NNN` e cliente vinculado.
- Troca de status direto na linha, com auditoria.
- **API:** `GET/POST/PUT/PATCH /api/admin/contratos`, `GET /api/admin/contratos/vencendo?dias=45`.

### 3.2 Módulo Financeiro — `/admin/financeiro`
- Contas a pagar e a receber com filtros de tipo, status e busca textual.
- Cards de caixa: receitas pagas, despesas pagas, saldo realizado, saldo previsto, valores em atraso.
- Totais por categoria no mês corrente.
- Baixa de título (PATCH de status) e exclusão restrita ao perfil `ADMIN`.
- **API:** `GET/POST/PUT/PATCH/DELETE /api/admin/financeiro`, `GET /api/admin/financeiro/resumo`.

### 3.3 Módulo RH — `/admin/rh`
- Quadro de pessoal paginado, filtro por departamento e status (`ATIVO`, `AFASTADO`, `FERIAS`, `DESLIGADO`).
- Indicadores: headcount ativo, folha base, custo médio por ativo, admissões em 30 dias.
- Headcount e folha por departamento.
- Cadastro com **CPF único** e **CPF mascarado** na listagem (`***.456.789-**`).
- **API:** `GET/POST/PATCH /api/admin/funcionarios`, `/resumo`, `/departamentos`.

### 3.4 Segurança e auditoria
- Papel `FINANCEIRO` criado no enum `Role` e na hierarquia do Spring Security (`ROLE_ADMIN` herda `COMERCIAL`, `ENGENHARIA`, `RH`, `FINANCEIRO`).
- Escrita financeira exige `ADMIN`/`FINANCEIRO`; RH exige `ADMIN`/`RH`.
- Todas as escritas gravam na tabela `auditoria` com o e-mail do usuário autenticado.
- CSRF double-submit obrigatório — verificado: POST sem `X-XSRF-TOKEN` retorna **403**.
- Validações: data final anterior à inicial → **400**; CPF duplicado → **409**.

---

## 4. Correção crítica: o backend não iniciava

**Problema:** o arquivo `V2__seed_demo_data.sql` continha **69 UUIDs inválidos** (ex.: `'a0000001-0000-0000-0000-000000000001'`, com 9 caracteres no primeiro bloco em vez de 8). O H2 rejeitava a inserção, o Flyway abortava e a aplicação morria no boot:

```
Data conversion error converting "m0000001-0000-0000-0000-000000000001"
APPLICATION FAILED TO START
```

**Correção:** normalização de todos os identificadores para o formato canônico 8-4-4-4-12 (ex.: `a0000001-…` → `a0000001-…` corrigido e `610000001-…` → `61000001-…`). Validação automática confirmou **0 IDs inválidos** em 71 referências.

**Impacto:** sem isso, qualquer deploy em banco novo (inclusive Supabase) falharia na primeira execução.

---

## 5. Arquitetura de deploy (decisão desta rodada)

Você levantou a dúvida sobre a Vercel e portas. A solução adotada elimina o problema pela raiz:

**Antes:** dois serviços (API na 8080 + Next na 3000) + proxy + CORS entre domínios.

**Agora:** **um único serviço e uma única porta (8080)**.

```
┌─────────────────────────────────────────────┐
│  Render — serviço "conliz" (Docker)         │
│                                             │
│  Spring Boot :8080                          │
│   ├── /              → site (HTML estático) │
│   ├── /admin/*       → painel (SPA)         │
│   ├── /obras/*       → páginas pré-renderizadas
│   └── /api/*         → REST + JWT + CSRF    │
└──────────────────┬──────────────────────────┘
                   │ JDBC SSL
        ┌──────────▼──────────┐
        │  Supabase Postgres  │
        │  (Flyway + RLS)     │
        └─────────────────────┘
```

### Como foi implementado
1. `next.config.mjs`: `output: "export"` + `trailingSlash` → o Next gera HTML/CSS/JS puros em `out/`.
2. `npm run build`: além de exportar, o script `scripts/copy-static.mjs` copia `out/` para `backend/src/main/resources/static` (limpando a pasta antes, sem arquivos órfãos).
3. `SpaResourceConfig.java`: serve as rotas do Next pelo Spring Boot, resolvendo `/admin/rh` → `/admin/rh/index.html`. Caminhos de `/api`, `/actuator` e Swagger ficam **fora** do roteamento estático — a API responde JSON, nunca HTML.
4. `GlobalExceptionHandler`: rota inexistente devolve **404 JSON** (antes caía no handler genérico e retornava 500).
5. `backend/Dockerfile`: multi-stage `Node → Maven → JRE`. O contexto de build é a raiz do repositório.
6. `render.yaml` e `docker-compose.yml`: reduzidos a **um serviço**.

### Verificação executada (não apenas compilação)
Backend real rodando, requisições HTTP reais:

| Rota | Resultado |
|------|-----------|
| `/` | 200 — HTML do site |
| `/admin/rh/`, `/admin/rh`, `/admin/contratos/`, `/gestao-conliz-acesso/` | 200 — HTML do painel |
| `/obras/retrofit-hall-social-saint-paul/` | 200 — página pré-renderizada |
| `/_next/static/chunks/…js` | 200 — assets servidos |
| `/api/public/obras` | 200 — JSON |
| `/api/admin/funcionarios`, `/contratos`, `/financeiro/resumo` (autenticado) | 200 — JSON |
| `/api/nao-existe` | **404 JSON** |
| `/actuator/health` | 200 — `{"status":"UP"}` |

---

## 6. Próximo passo: publicar

### O que já está pronto no repositório
- `render.yaml` com healthcheck, segredos gerados automaticamente (`JWT_SECRET`, `CONLIZ_ADMIN_PASSWORD`) e as variáveis do Supabase marcadas para preenchimento.
- `DEPLOY.md` com o passo a passo completo.
- `.env.example` com o bloco de produção.
- `.dockerignore` na raiz para o contexto de build enxuto.

### O que depende de você (2 minutos)
1. Criar o projeto no **Supabase** (região São Paulo) e copiar a URI do *session pooler* com `sslmode=require`.
2. Clicar em **Deploy**: https://render.com/deploy?repo=https://github.com/tgsf18/conliz
3. Colar as 3 variáveis do Supabase no painel do Render e copiar a senha gerada de `CONLIZ_ADMIN_PASSWORD`.

Resultado: `https://conliz.onrender.com/` (site) e `https://conliz.onrender.com/gestao-conliz-acesso` (painel), com login `admin@conliz.com.br`.

> O Flyway cria schema, índices e aplica RLS automaticamente no primeiro boot. Nenhum SQL manual é necessário.

---

## 7. Limitações conhecidas

| Item | Detalhe |
|------|---------|
| Cold start (Render Free) | O serviço hiberna após ~15 min sem acesso; o primeiro request leva ~50 s |
| H2 local | Perfil `local` usa banco em memória: dados voltam ao estado do seed a cada boot |
| RLS no Supabase | Ativado em todas as tabelas; o acesso é exclusivo pela API (PostgREST bloqueado) |
| Módulos ainda sem tela | Estoque, Obras/Canteiro e Auditoria têm API e navegação no menu, mas falta a página |
| Testes de UI | Cobertura apenas de lógica (`node --test`); sem React Testing Library |
| Portas no Vercel | Não se aplica mais — não há segundo serviço nem porta 3000 em produção |

---

## 8. Histórico de commits desta rodada

| Commit | Descrição |
|--------|-----------|
| `9a94ffc` | `feat(admin)`: telas de Contratos, Financeiro e RH ligadas à API |
| `1c00a88` | `chore(deploy)`: blueprint do Render + guia Supabase/Produção |
| `95aaa66` | `feat(deploy)`: site e painel servidos pelo próprio backend (imagem única) |

Todos com CI verde (Backend Maven + Frontend Node).
