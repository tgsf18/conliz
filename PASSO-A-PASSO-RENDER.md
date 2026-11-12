# Passo a passo — Render

Segunda metade do deploy (a primeira é `PASSO-A-PASSO-SUPABASE.md`).
Premissa: o projeto Supabase já existe e você tem em mãos a string do **session pooler**.

Tempo estimado: 20 a 30 minutos, quase todo de build.

---

## 0. Valores que você vai colar (preencha antes de começar)

Substitua o que está entre `<>` pelos seus dados reais. Estes cinco valores são os
únicos que você digita à mão no Render.

| Nome | Valor real (preencha) | De onde vem |
|---|---|---|
| `<PROJECT-REF>` | `________________________` | URL do dashboard do Supabase |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://aws-0-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require` | Supabase → Database → Session pooler (ajuste a região se o seu host for `aws-1-…`) |
| `SPRING_DATASOURCE_USERNAME` | `postgres.<PROJECT-REF>` | idem |
| `SPRING_DATASOURCE_PASSWORD` | `________________________` | a senha do banco (crua) |
| `CONLIZ_ADMIN_PASSWORD` | `________________________` | **você inventa**: 20+ caracteres |

### Região do Render — decida agora

O Render só tem **Oregon, Ohio, Virginia, Frankfurt e Singapore**. Não há São Paulo.
**A região não pode ser trocada depois** (teria que recriar o serviço).

| Supabase (onde você criou) | Região do Render | Latência aproximada por query |
|---|---|---|
| South America (São Paulo) | **Virginia** (`region: virginia`) | ~120–150 ms |
| South America (São Paulo) | Ohio (`region: ohio`) | ~140–170 ms |
| East US (Ohio/N. Virginia) | **Ohio** ou **Virginia** (a mesma) | ~1–5 ms |

Se você ainda não criou o Supabase e a prioridade é desempenho: crie o projeto em
**East US (North Virginia)** e o serviço do Render em **Virginia** — assim banco e API
ficam a poucos milissegundos. Se já criou em São Paulo, use `virginia` e siga.

> Trocar a região do Render se você já criou o serviço: **não é possível** — só recriando.
> Antes de fazer o primeiro deploy, confirme que a região do serviço é a que você escolheu.

---

## 1. Conectar o GitHub e criar o serviço

1. https://dashboard.render.com → **New** → **Blueprint**.
2. **Connect GitHub** (autorize o Render a ver o repositório `tgsf18/conliz`).
3. Escolha o repositório `conliz` e a branch `main`.
4. O Render lê o `render.yaml` e mostra o serviço **`conliz`** (Docker, plano Free,
   healthcheck `/actuator/health`). Confira o **Region** no seletor — deve ser
   **Virginia** (ou Ohio, conforme sua decisão acima). Se estiver diferente, cancele e
   ajuste `region:` no `render.yaml` antes.
5. **Apply** / **Create**.

> Se você **não** usa o Blueprint: **New → Web Service** → repositório → Runtime
> **Docker** → Dockerfile Path `backend/Dockerfile` → Docker Build Context `.` →
> Health Check Path `/actuator/health` → Region Virginia → Plan Free. Depois crie as
> variáveis da seção 2 manualmente.

---

## 2. Variáveis de ambiente (exatamente assim)

**Environment** → **Add Environment Variable**. As marcadas "você preenche" são as
`sync: false` do `render.yaml` — o Render pede antes de criar o serviço.

| Chave | Valor | Ação |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `docker` | já vem do `render.yaml` |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://aws-0-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require` | **você preenche** |
| `SPRING_DATASOURCE_USERNAME` | `postgres.<PROJECT-REF>` | **você preenche** |
| `SPRING_DATASOURCE_PASSWORD` | a senha do banco | **você preenche** |
| `CONLIZ_ADMIN_PASSWORD` | sua senha de bootstrap (20+ caracteres) | **você preenche** |
| `JWT_SECRET` | gerado pelo Render | automático |
| `CONLIZ_ADMIN_EMAIL` | `admin@conliz.com.br` | já vem |
| `CONLIZ_ADMIN_NAME` | `Diretoria Conliz` | já vem |
| `CONLIZ_SEED_DEMO_USERS` | `false` | já vem |
| `TOTP_ISSUER` | `Conliz Construtora` | já vem |
| `JWT_EXPIRATION_MINUTES` | `15` | já vem |
| `REFRESH_TOKEN_EXPIRATION_DAYS` | `7` | já vem |
| `COOKIE_SECURE` | `true` | já vem |
| `CORS_ALLOWED_ORIGINS` | `${RENDER_EXTERNAL_URL}` | já vem (resolve para a URL real do serviço) |
| `FRONTEND_URL` | `${RENDER_EXTERNAL_URL}` | já vem |
| `PORT` | **não crie** | o Render injeta sozinho |

Observações:
- **Não** adicione `PORT`: o `application.yml` já lê `${PORT:8080}` e sobrescrever quebra
  o healthcheck.
- `JWT_SECRET` com `generateValue` só é gerado **na criação** do serviço. Se você criar o
  serviço e depois editar o blueprint, o valor existente é mantido (não troca sozinho) —
  bom, porque trocar derrubaria todas as sessões.
- Se a senha do banco tiver caracteres especiais (`@ # : / ?`), cole a versão da string
  do Supabase **sem** o percent-encoding (`%40`, `%23`…), porque aqui o valor é passado
  direto ao driver JDBC, não dentro de uma URL.

---

## 3. Primeiro deploy e o que observar no log

**Create Web Service** (ou **Manual Deploy → Deploy latest commit**). O primeiro build
leva **8 a 15 minutos** no plano Free (dois estágios: `npm ci` + `next build`, depois
Maven).

No log (**Logs**), nesta ordem:

```
==> Cloning from https://github.com/tgsf18/conliz
==> Building image
# ... npm ci, next build, mvn clean package ...
==> Starting service
... Flyway: Migrating schema "public" to version "1"
... Flyway: Migrating schema "public" to version "2"
... Flyway: Migrating schema "public" to version "4"
... Flyway: Successfully applied 3 migrations
... Initial ADMIN user provisioned: email=admin@conliz.com.br
... Started ConlizPlatformApplication in XX seconds
==> Your service is live 🎉
```

O que cada linha confirma:

| Linha no log | Significa |
|---|---|
| `Successfully applied N migrations` | Supabase respondeu e o schema foi criado |
| `Initial ADMIN user provisioned` | a senha de bootstrap foi aplicada |
| `Started ConlizPlatformApplication` | o Spring subiu (site + painel + API no mesmo processo) |
| `Your service is live` | healthcheck em `/actuator/health` passou |

**Se não aparecer "Your service is live":** abra o painel do serviço → **Logs** e procure
a primeira exceção. A tabela de erros do Supabase (`PASSO-A-PASSO-SUPABASE.md`, seção 6)
cobre os casos de conexão; `Application run failed` sem stack de banco geralmente é
`CONLIZ_ADMIN_PASSWORD` vazia (o app sobe, mas sem admin) ou porta.

---

## 4. Pegar a URL real do serviço

No topo do painel do serviço aparece `https://<nome>.onrender.com`.

- Se o nome `conliz` estiver livre, será **`https://conliz.onrender.com`**.
- Se já existir (outra pessoa ou outro serviço seu), o Render sufixa:
  **`https://conliz-ab12.onrender.com`** (o sufixo é aleatório e você não escolhe).

Com `CORS_ALLOWED_ORIGINS=${RENDER_EXTERNAL_URL}` você **não precisa** editar nada:
site, painel e API já estão na mesma origem, e o valor se ajusta sozinho.

Se quiser fixar manualmente, troque as duas variáveis para a URL real:

```
CORS_ALLOWED_ORIGINS = https://conliz.onrender.com
FRONTEND_URL         = https://conliz.onrender.com
```

E, ao usar domínio próprio (depois), atualize as duas para `https://seudominio.com.br` —
mesmo com o domínio novo, o site continua funcionando no `.onrender.com`, mas o CORS
passa a recusar a origem antiga.

---

## 5. Teste de fumaça (na URL real)

Faça **nesta ordem** — cada passo depende do anterior.

```bash
BASE=https://conliz.onrender.com   # troque pela sua URL real

# 1. Health (público)
curl -s $BASE/actuator/health
# esperado: {"status":"UP"}

# 2. Site (HTML)
curl -s -o NUL -w "%{http_code}\n" $BASE/
# esperado: 200

# 3. Painel (HTML)
curl -s -o NUL -w "%{http_code}\n" $BASE/admin/rh/
# esperado: 200

# 4. API pública (JSON)
curl -s -o NUL -w "%{http_code}\n" $BASE/api/public/obras
# esperado: 200

# 5. Rota inexistente (JSON, não HTML)
curl -s -o NUL -w "%{http_code}\n" $BASE/api/nao-existe
# esperado: 404

# 6. Admin sem sessão (JSON 401)
curl -s -o NUL -w "%{http_code}\n" $BASE/api/admin/dashboard
# esperado: 401
```

No navegador (a parte que o `curl` não cobre):

1. Abra `https://<sua-url>/gestao-conliz-acesso`.
2. Entre com `admin@conliz.com.br` + `CONLIZ_ADMIN_PASSWORD`.
3. Você deve cair em `/admin/dashboard` **sem** pedir código 2FA (o admin nasce sem 2FA).
4. Abra `/admin/contratos`, `/admin/financeiro`, `/admin/rh` — precisam carregar dados.
5. **Teste de escrita** (é o que valida a correção do CSRF): em `/admin/rh`, cadastre um
   funcionário. Se der **403**, o cookie CSRF não está sendo aceito — abra o DevTools →
   Application → Cookies e confira se `XSRF-TOKEN` tem `Secure` e `SameSite=Strict`.

> **Cold start:** o plano Free hiberna após 15 min sem acesso. O primeiro request depois
> disso leva **~50 segundos** e mostra uma página de carregamento do Render. Isso é
> esperado; não é erro de deploy.

---

## 6. Problemas comuns no Render (não no banco)

| Sintoma | Causa | Correção |
|---|---|---|
| Build falha em `npm ci` | `package-lock.json` divergente do `package.json` | rode `npm install` no frontend e commite o lock |
| Build falha em `mvn` (sem rede) | `mvn dependency:go-offline` não baixou tudo | **Manual Deploy** de novo (é transitório) |
| `Exited with status 1` logo no start | variável obrigatória vazia (`SPRING_DATASOURCE_*`) | preencha e faça deploy |
| Deploy "live" mas `/` dá 404 | build não embutiu o estático | confira se `frontend/out` foi gerado; o `dockerContext` tem que ser `.` |
| Healthcheck falha (timeout) | app subiu depois de 50 s ou em outra porta | não defina `PORT`; aumente o timeout do healthcheck se necessário |
| `403` em todo POST/PATCH no painel | cookie CSRF sem `Secure`/`SameSite` | já corrigido no código; precisa do commit aplicado no serviço |
| `502` intermitente | cold start do plano Free | esperado; Starter remove |
| Serviço suspenso com "service-initiated traffic" | Free + banco externo (Supabase) | migre para **Starter (US$ 7/mês)** |

---

## 7. Checklist final

- [ ] serviço criado na região escolhida (**não dá para trocar depois**)
- [ ] as 5 variáveis preenchidas; `PORT` **não** criada
- [ ] log com `Successfully applied N migrations` e `Initial ADMIN user provisioned`
- [ ] `/actuator/health` → `{"status":"UP"}`
- [ ] login em `/gestao-conliz-acesso` e dashboard abrindo
- [ ] **cadastro de um registro** no painel (valida CSRF) sem 403
- [ ] 2FA: opcional hoje (só via `POST /api/auth/2fa/setup` no Swagger — não há tela)
- [ ] domínio próprio: **Settings → Custom Domains** + atualizar `CORS_ALLOWED_ORIGINS` e `FRONTEND_URL`
- [ ] uso real: trocar o plano para Starter (o Free hiberna e pode ser suspenso)
