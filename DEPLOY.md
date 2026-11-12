# ==============================================================================
# CONLIZ — DEPLOY EM PRODUÇÃO (Supabase + Render)
# Guia passo a passo. Nenhum segredo fica no repositório.
# ==============================================================================

## Arquitetura: um único serviço

Site, painel e API rodam **no mesmo processo e no mesmo domínio**. O build do Next gera
HTML/CSS/JS estáticos (`output: "export"`), que são copiados para
`backend/src/main/resources/static` e embutidos no jar do Spring Boot. Não existe
segundo serviço, não existe porta 3000 em produção e o painel chama `/api/...` no
próprio host — sem proxy, sem CORS entre serviços.

| Peça | Onde roda |
|------|-----------|
| Banco Postgres | **Supabase** (projeto próprio) |
| Site + Painel + API | **Render**, um único serviço Docker (`conliz`) |

Repositório: https://github.com/tgsf18/conliz

---

## 1. Banco no Supabase

1. Crie um projeto em https://supabase.com/dashboard (região **South America (São Paulo)**).
2. Guarde a senha do banco definida na criação.
3. Em **Project Settings → Database → Connection string → URI**, copie o modo **Session pooler** (porta `5432`) — obrigatório para conexões de fora da rede do Supabase.

   > A conexão **direta** (`db.<ref>.supabase.co:5432`) é IPv6-only (salvo o add-on IPv4
   > pago) e o Render **não tem saída IPv6**: com ela o primeiro boot falha mesmo com as
   > credenciais certas. O host do pooler varia por projeto/região (`aws-0-…`, `aws-1-…`)
   > — copie do dashboard, não deste guia.

   ```
   postgresql://postgres.<ref>:<SENHA>@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
   ```

4. Monte as três variáveis do backend:

   | Variável | Valor |
   |----------|-------|
   | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://aws-0-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require` |
   | `SPRING_DATASOURCE_USERNAME` | `postgres.<ref>` |
   | `SPRING_DATASOURCE_PASSWORD` | a senha do banco |

> O Flyway roda sozinho no boot (`db/migration` + `db/migration-postgresql`): cria schema, índices e aplica a política de RLS. Nada de SQL manual.

### Opcional — usuário dedicado em vez do `postgres`
No **SQL Editor** do Supabase:

```sql
CREATE ROLE conliz_app WITH LOGIN PASSWORD senha-forte-aqui;
GRANT ALL ON SCHEMA public TO conliz_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO conliz_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO conliz_app;
```

---

## 2. Deploy no Render (um serviço)

1. Abra o blueprint: https://render.com/deploy?repo=https://github.com/tgsf18/conliz
   (ou **New → Blueprint** apontando para o repositório — o `render.yaml` cria o serviço `conliz`).
2. Preencha as variáveis marcadas `sync: false` no painel do Render:
   - `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`
   - `CONLIZ_ADMIN_PASSWORD` — **você define** uma senha forte. É a senha do primeiro
     login (`admin@conliz.com.br`). Não é gerada pelo Render de propósito: se o serviço
     for recriado, uma senha nova não substituiria a do usuário que já existe no banco.
   - `CORS_ALLOWED_ORIGINS` e `FRONTEND_URL` — a URL real do serviço (o Render sufixa o
     nome quando já existe) ou o domínio próprio.
   `JWT_SECRET` é gerado pelo Render.
3. Usuários de demonstração (`rh@`, `comercial@`, `engenharia@`) ficam desligados em
   produção (`CONLIZ_SEED_DEMO_USERS=false`); só existem no perfil local.
4. Confirme o healthcheck: `https://<sua-url>.onrender.com/actuator/health` → `{"status":"UP"}`.

Pronto: `https://conliz.onrender.com/` é o site e `https://conliz.onrender.com/gestao-conliz-acesso` é o login do painel.

---

## 3. Checklist pós-deploy

- [ ] `/actuator/health` responde `UP`
- [ ] Login em `/gestao-conliz-acesso` com `admin@conliz.com.br` + senha gerada
- [ ] 2FA: hoje só é possível configurar pela API (`POST /api/auth/2fa/setup` no
      Swagger); não há tela no painel. Não bloqueia o login.
- [ ] `/admin/dashboard`, `/admin/contratos`, `/admin/financeiro`, `/admin/rh` carregam dados
- [ ] Criação de orçamento e geração de PDF funcionam
- [ ] Domínio próprio (opcional): **Settings → Custom Domain**; depois atualize `CORS_ALLOWED_ORIGINS` e `FRONTEND_URL`

---

## 4. Limitações do plano Free do Render

- O serviço hiberna após ~15 min sem acesso; o primeiro request leva ~50 s (cold start).
- Para manter acordado, use um monitor externo batendo em `/actuator/health` a cada 10 min, ou migre para o plano Starter (US$ 7/mês).

---

## 5. Rodar localmente

### Docker (imagem única, igual à produção)
```bash
cp .env.example .env
docker compose up --build
# site + painel + API: http://localhost:8080
# admin:               http://localhost:8080/gestao-conliz-acesso
```

### Desenvolvimento com hot reload
```bash
# terminal 1 — API (H2 em memória, perfil local)
cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=local

# terminal 2 — site/painel
cd frontend && npm run dev     # http://localhost:3000 com proxy /api -> :8080
```

### Atualizar o site embutido na API
```bash
cd frontend && npm run build   # gera out/ e copia para backend/src/main/resources/static
cd ../backend && mvn package
```
