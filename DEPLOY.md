# ==============================================================================
# CONLIZ — DEPLOY EM PRODUÇÃO (Supabase + Render)
# Guia passo a passo. Nenhum segredo fica no repositório.
# ==============================================================================

## Visão geral

| Peça | Onde roda | Plano |
|------|-----------|-------|
| Banco Postgres | **Supabase** (projeto próprio) | Free |
| API Spring Boot | **Render** (Docker, `conliz-api`) | Free |
| Site + Admin Next.js | **Render** (Docker, `conliz-web`) | Free |

Repositório: https://github.com/tgsf18/conliz

---

## 1. Banco no Supabase

1. Crie um projeto em https://supabase.com/dashboard (região **South America (São Paulo)** para menor latência).
2. Guarde a senha do banco definida na criação.
3. Vá em **Project Settings → Database → Connection string → URI** e copie a string no modo **Session pooler** (porta `5432`) — o pooler é obrigatório para conexões de fora da rede do Supabase:

   ```
   postgresql://postgres.<ref>:<SENHA>@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
   ```

4. Monte as três variáveis do backend a partir dela:

   | Variável | Valor |
   |----------|-------|
   | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://aws-0-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require` |
   | `SPRING_DATASOURCE_USERNAME` | `postgres.<ref>` |
   | `SPRING_DATASOURCE_PASSWORD` | a senha do banco |

> O Flyway roda sozinho no boot (`db/migration` + `db/migration-postgresql`), criando schema, índices e a política de RLS. Não é preciso rodar SQL à mão.

### Opcional — usuário dedicado em vez do `postgres`
No **SQL Editor** do Supabase:

```sql
CREATE ROLE conliz_app WITH LOGIN PASSWORD 'senha-forte-aqui';
GRANT ALL ON SCHEMA public TO conliz_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO conliz_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO conliz_app;
```

Depois use `conliz_app` em `SPRING_DATASOURCE_USERNAME`.

---

## 2. Backend no Render

1. Abra o blueprint: https://render.com/deploy?repo=https://github.com/tgsf18/conliz
   (ou **New → Blueprint** e aponte para o repositório — o `render.yaml` da raiz cria os dois serviços).
2. Preencha as variáveis marcadas `sync: false`:
   - `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`
   - `CORS_ALLOWED_ORIGINS` → `https://conliz-web.onrender.com`
   - `FRONTEND_URL` → `https://conliz-web.onrender.com`
3. `JWT_SECRET` e `CONLIZ_ADMIN_PASSWORD` são gerados pelo Render. **Copie o valor de `CONLIZ_ADMIN_PASSWORD`** nos Environment Variables do serviço — é a senha do primeiro login (`admin@conliz.com.br`).
4. Depois do deploy, confirme: `https://conliz-api.onrender.com/actuator/health` → `{"status":"UP"}`.

---

## 3. Frontend no Render

1. No mesmo blueprint, o serviço `conliz-web` já foi criado. Preencha:
   - `BACKEND_INTERNAL_URL` → `https://conliz-api.onrender.com` (usado pelo rewrite `/api/*`)
   - `NEXT_PUBLIC_SITE_URL` → `https://conliz-web.onrender.com`
2. Deploy. O painel fica em `https://conliz-web.onrender.com/gestao-conliz-acesso`.

> Cookie de sessão é `Secure` em produção (`COOKIE_SECURE=true`), então o acesso ao admin só funciona por HTTPS — o Render já entrega HTTPS nos domínios `*.onrender.com`.

---

## 4. Checklist pós-deploy

- [ ] `/actuator/health` do backend responde `UP`
- [ ] Login em `/gestao-conliz-acesso` com `admin@conliz.com.br` + senha gerada
- [ ] 2FA configurado no primeiro acesso (QR + códigos de recuperação)
- [ ] `/admin/dashboard`, `/admin/contratos`, `/admin/financeiro`, `/admin/rh` carregam dados
- [ ] Criação de orçamento e geração de PDF funcionam
- [ ] Domínio próprio (opcional): **Settings → Custom Domain** nos dois serviços, depois atualize `CORS_ALLOWED_ORIGINS` e `BACKEND_INTERNAL_URL`

---

## 5. Limitações do plano Free do Render

- O serviço hiberna após ~15 min sem acesso; o primeiro request depois disso leva ~50 s (cold start).
- Para manter sempre acordado, use um monitor externo batendo em `/actuator/health` a cada 10 min, ou migre para o plano Starter (US$ 7/mês por serviço).

---

## 6. Rodar tudo localmente (Docker)

```bash
cp .env.example .env
docker compose up --build
# site:  http://localhost:3000
# admin: http://localhost:3000/gestao-conliz-acesso
# API:   http://localhost:8080/actuator/health
```
