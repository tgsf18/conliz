# Conliz

Plataforma da Conliz Construtora: site público em Next.js 14 e API Spring Boot 3 (orçamentos, contratos, obras, financeiro, RH e painel administrativo).

## O que sobe junto

Um único serviço: o Next é exportado como HTML/CSS/JS estático (`output: "export"`) e
embutido no jar do Spring Boot, que serve site, painel e API na **mesma porta**.

| Parte | Stack | Porta |
| --- | --- | --- |
| Site + painel + API | Spring Boot 3.3 (Java 21) com o export do Next.js 14 embutido | 8080 |
| Banco | PostgreSQL 17 (Docker) ou H2 em memória no perfil local | 5432 |

Em produção não existe processo Node, proxy nem porta 3000. No desenvolvimento o
`npm run dev` sobe o Next na 3000 apenas para hot reload, chamando `/api` no próprio host.

## Subir com Docker

```bash
cp .env.example .env
# edite JWT_SECRET (mínimo 32 caracteres) e CONLIZ_ADMIN_PASSWORD
docker compose up --build
```

- Site: http://localhost:8080
- Login do painel: http://localhost:8080/gestao-conliz-acesso
- Swagger: http://localhost:8080/swagger-ui.html
- Saúde: http://localhost:8080/actuator/health

A imagem é construída por `backend/Dockerfile` (contexto = raiz do repositório):
estágio Node exporta o Next, estágio Maven embute o `out/` em `resources/static` e o
runtime é só a JRE com o jar.

O Flyway aplica `backend/src/main/resources/db/migration` na subida do backend (perfil `docker` também aplica `migration-postgresql`). Não é preciso rodar `mvn flyway:migrate` à parte se o container sobe com o Postgres saudável.

Sem `CONLIZ_ADMIN_PASSWORD`, o backend não cria o usuário inicial. Os usuários de
demonstração por departamento (`rh@`, `comercial@`, `engenharia@`) só são criados com
`CONLIZ_SEED_DEMO_USERS=true` — ligado por padrão **apenas** no perfil `local`
(`application-local.yml`). Em produção ficam desligados.

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

`FlywayMigrationTest` sobe o contexto com o Flyway **ligado** num H2 em modo PostgreSQL:
as migrations V1→V4 precisam aplicar e o Hibernate valida o schema resultante. É o que
impede um SQL inválido (UUID malformado, coluna inexistente) de só aparecer no primeiro
boot de produção — o perfil `test` normal usa `ddl-auto: create-drop` e não roda Flyway.

## Autenticação

- `POST /api/auth/login` — senha com BCrypt; se o 2FA estiver ativo, devolve desafio sem cookie de sessão.
- `POST /api/auth/2fa/verify` — TOTP ou código de recuperação.
- `POST /api/auth/2fa/setup` e `POST /api/auth/2fa/confirm` — QR, segredo e códigos de recuperação.
- `GET /api/auth/me`, `POST /api/auth/refresh`, `POST /api/auth/logout`.

Sessão em cookies (`conliz_access_token`, refresh e CSRF). `ROLE_ADMIN` implica `COMERCIAL`, `ENGENHARIA` e `RH` no `@PreAuthorize`.

O cookie `XSRF-TOKEN` (double-submit, legível pelo JS) usa os **mesmos atributos** dos
cookies de sessão: `Secure` quando `COOKIE_SECURE=true`, `SameSite` de `COOKIE_SAME_SITE`
e domínio de `COOKIE_DOMAIN`. Sem isso, em HTTPS o POST/PATCH autenticado do painel
voltava 403.

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
