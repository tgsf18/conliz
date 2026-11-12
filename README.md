# Conliz

Plataforma da Conliz Construtora: site público em Next.js 14 e API Spring Boot 3 (orçamentos, contratos, obras, financeiro, RH e painel administrativo).

## O que sobe junto

| Parte | Stack | Porta local |
| --- | --- | --- |
| Frontend | Next.js 14, Tailwind | 3000 |
| Backend | Spring Boot 3.3, Java 21 | 8080 |
| Banco | PostgreSQL 17 (Docker) ou H2 em memória no perfil local | 5432 |

O frontend encaminha `/api/*` para o backend (`BACKEND_INTERNAL_URL`, padrão `http://localhost:8080`).

## Subir com Docker

```bash
cp .env.example .env
# edite JWT_SECRET (mínimo 32 caracteres) e CONLIZ_ADMIN_PASSWORD
docker compose up --build
```

- Site: http://localhost:3000
- Login do painel: http://localhost:3000/gestao-conliz-acesso
- Swagger: http://localhost:8080/swagger-ui.html
- Saúde: http://localhost:8080/actuator/health

O Flyway aplica `backend/src/main/resources/db/migration` na subida do backend (perfil `docker` também aplica `migration-postgresql`). Não é preciso rodar `mvn flyway:migrate` à parte se o container sobe com o Postgres saudável.

Sem `CONLIZ_ADMIN_PASSWORD`, o backend não cria o usuário inicial.

## Desenvolvimento sem Docker

Backend (H2 em memória, perfil `local`):

```bash
cd backend
mvn spring-boot:run
```

Frontend:

```bash
cd frontend
npm ci
npm run dev
```

Testes:

```bash
mvn -B -f backend/pom.xml test
cd frontend && npm test && npx tsc --noEmit && npm run build
```

## Autenticação

- `POST /api/auth/login` — senha com BCrypt; se o 2FA estiver ativo, devolve desafio sem cookie de sessão.
- `POST /api/auth/2fa/verify` — TOTP ou código de recuperação.
- `POST /api/auth/2fa/setup` e `POST /api/auth/2fa/confirm` — QR, segredo e códigos de recuperação.
- `GET /api/auth/me`, `POST /api/auth/refresh`, `POST /api/auth/logout`.

Sessão em cookies (`conliz_access_token`, refresh e CSRF). `ROLE_ADMIN` implica `COMERCIAL`, `ENGENHARIA` e `RH` no `@PreAuthorize`.

O emissor do TOTP vem de `TOTP_ISSUER`.

## Variáveis

O arquivo `.env.example` lista banco, JWT, cookies, CORS, admin inicial, TOTP, rate limit, SMTP e Turnstile. Valores reais ficam só no `.env`, que o Git ignora.

O `JWT_SECRET` padrão do `application.yml` existe para o perfil local. Em Docker ou produção, substitua por um segredo exclusivo.

## Deploy em produção

Banco no **Supabase** (Postgres) + **um único serviço no Render** (Docker): o build do Next é exportado estático e embutido no jar do Spring Boot, então site, painel e API compartilham o mesmo domínio e a mesma porta — sem segundo serviço, sem proxy e sem CORS entre processos. Guia completo em [DEPLOY.md](DEPLOY.md); o `render.yaml` na raiz já traz healthcheck, segredos gerados e as variáveis do Supabase.

```bash
# atualizar o site/painel servido pela API
cd frontend && npm run build   # exporta out/ e copia para backend/src/main/resources/static
cd ../backend && mvn package
```

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/tgsf18/conliz)

## Painel

- Dashboard em `/admin/dashboard` lê funil, caixa, obras, contratos e headcount dos repositórios.
- Orçamentos em `/admin/orcamentos`: kanban com a lista completa; visão em lista usa `page` e `size` (máximo 100).
- Status, notas, PDF (`GET /api/admin/orcamentos/{id}/proposta-pdf`) e conversão em contrato são persistidos, com trilha em `auditoria`.
- Contratos em `/admin/contratos`: carteira paginada com busca por número/título/cliente, filtro por status, criação (número `CTR-ANO-NNN` gerado) e painel de vencimentos (`GET /api/admin/contratos/vencendo?dias=45`).
- Financeiro em `/admin/financeiro`: contas a pagar e receber com filtros de tipo/status/período, resumo de caixa (`GET /api/admin/financeiro/resumo`), baixa de títulos e exclusão restrita a `ADMIN`.
- RH em `/admin/rh`: quadro de pessoal paginado, headcount e folha base por departamento (`GET /api/admin/funcionarios/resumo`), cadastro com CPF único e CPF mascarado na listagem.
- Papéis: `ADMIN` herda `COMERCIAL`, `ENGENHARIA`, `RH` e `FINANCEIRO`. Escrita financeira exige `ADMIN`/`FINANCEIRO`; RH exige `ADMIN`/`RH`.
- Todas as escritas do painel passam pelo token CSRF (`X-XSRF-TOKEN`), enviado automaticamente por `src/lib/http.mjs`.
