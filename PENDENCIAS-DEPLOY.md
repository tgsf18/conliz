# Conliz — auditoria de deploy (Supabase + Render)

Auditoria do commit `41c5559` (CI verde). Abaixo, o que **falta** antes de subir e o
que é ajuste de configuração. Nada foi alterado no código ainda — este arquivo é só o
diagnóstico para você aprovar.

Legenda: 🔴 bloqueia o deploy · 🟡 funciona, mas dá problema no uso real · 🟢 ok.

---

## 🔴 1. O login do painel vai quebrar no Render (bug real, não hipótese)

O painel (`frontend/src/lib/http.mjs`) exige o header `X-XSRF-TOKEN` em todo POST/PATCH
para passar pelo CSRF do Spring. O cookie `XSRF-TOKEN` é emitido pelo filtro
`CsrfCookieFilter` (config `CookieCsrfTokenRepository.withHttpOnlyFalse()`).

Esse repositório de cookie grava o cookie **sem `Secure`** por padrão — e no Render o
site é HTTPS. Detalhe do navegador: cookie sem `Secure` em página HTTPS *é* enviado, mas
o Render serve o app atrás do proxy dele; combinado com `SameSite=Strict` + `COOKIE_SECURE=true`
configurado só no *seu* cookie (`CookieService`), o resultado é dois cookies com
atributos diferentes. Na prática o sintoma clássico é **login OK e todo PATCH/POST
seguinte devolvendo 403**.

**Correção:** customizar o `CookieCsrfTokenRepository` em `SecurityConfig` para
`setCookieCustomizer(b -> b.secure(true).sameSite("Strict").path("/"))`, alinhado ao
`CookieService`. Depois testar `POST /api/admin/...` no domínio HTTPS.

> Verificação que já existe no relatório (403 sem header) prova que o CSRF bloqueia —
> mas foi feita em HTTP local, onde `Secure` não é exigido. É exatamente o cenário que
> muda em produção.

## 🔴 2. `render.yaml`: `generateValue: true` em `CONLIZ_ADMIN_PASSWORD`

`JWT_SECRET` gerado automaticamente: ok. Mas `CONLIZ_ADMIN_PASSWORD` gerado pelo Render
tem dois problemas:

- o `InitialAdminConfig` exige **BCrypt cost 12**; uma senha gerada aleatória é longa,
  mas o que importa é você **conseguir ler** o valor;
- se o valor for regenerado (novo blueprint, serviço recriado), o usuário `admin@conliz.com.br`
  já existe no Supabase e **a senha antiga continua valendo** — a senha nova não faz nada.

**Recomendação:** trocar para `sync: false` e você define uma senha forte no painel
(senha de bootstrap, não gerada). Ela só é usada no primeiro boot de banco vazio.

## 🔴 3. `InitialAdminConfig` cria 4 usuários com a MESMA senha

Além do admin, o código provisiona `rh@`, `comercial@` e `engenharia@conliz.com.br` com a
mesma `CONLIZ_ADMIN_PASSWORD`, em produção. Isso é conveniente para demo e **inseguro
para produção** (3 contas com privilégio e senha conhecida).

**Recomendação:** gate por perfil — provisionar esses 3 só quando
`conliz.admin.seed-demo-users=true` (padrão `false`; `true` no perfil `local`).

## 🔴 4. Seed de dados fictícios em produção

`V2__seed_demo_data.sql` roda no Supabase e insere clientes, contratos, funcionários
(com **CPF e chave PIX**) e financeiro fictícios. Para um site de construtora real isso
aparece no painel e no site (`/obras` mostra as obras de exemplo).

**Decisão necessária:** manter (demonstração) ou separar em migration condicional.
Flyway não tem `if profile`; a saída limpa é mover a V2 para
`db/migration-demo` e só incluir esse location quando `CONLIZ_SEED_DEMO=true`.

⚠️ Se a V2 já tiver rodado num banco, **não edite o arquivo** — o checksum muda e o
Flyway aborta o boot (`Validate failed: Migration checksum mismatch`). Em banco novo,
tudo bem.

## 🟡 5. Flyway e H2: o bug dos UUIDs nunca foi reproduzido pelo CI

O CI roda `mvn test` com `application-test.yml`, que tem **`flyway.enabled: false`** e
`ddl-auto: create-drop`. Ou seja: nenhum teste executa V1→V4. A correção dos 69 UUIDs
foi validada por script, não pelo build. Se sobrou um UUID inválido, o **primeiro boot
no Supabase** é que vai descobrir.

**Correção barata:** um teste `@SpringBootTest` com perfil de teste + Flyway ligado em H2
(`MODE=PostgreSQL`) que só valida "a aplicação sobe com as migrations". Isso pega erro de
sintaxe/SQL incompatível em qualquer mudança futura, sem precisar de Postgres no CI.

## 🟡 6. Plano Free do Render + banco remoto: `Service-initiated traffic threshold`

Documentação do Render (confirmada hoje): o Free **pode suspender** o serviço que gera
volume alto de tráfego de saída para a internet — e **acessar banco externo conta como
tráfego de saída**. Combinado com o hibernar a cada 15 min (~50 s de cold start), um app
Spring Boot com pool de conexões + Supabase é justamente o perfil que pode ser suspenso.

**Recomendação:** plano Starter (US$ 7/mês) para o serviço; o Free serve para o primeiro
teste de fumaça. O guia vai deixar isso explícito em vez de prometer "de graça e estável".

## 🟡 7. Supabase: só a string do *shared pooler* funciona

Confirmado na doc do Render: a conexão direta do Supabase (`db.<ref>.supabase.co:5432`)
é **IPv6-only** (a menos do add-on IPv4 pago) e o Render **não tem saída IPv6** — a
primeira conexão falha mesmo com credenciais certas.

O `DEPLOY.md` já aponta o pooler em session mode (`aws-0-<região>.pooler.supabase.com:5432`)
— está correto. Falta:
- o host do pooler **muda por projeto/região** (`aws-1-…`, `aws-0-sa-east-1`…); copiar do
  dashboard, não do guia;
- `?sslmode=require` (o guia já tem) e o usuário no formato `postgres.<ref>`;
- **região do Render**: o `render.yaml` está em `region: oregon`. Supabase em São Paulo
  ⇒ ~200 ms por query. Vale decidir: região do Supabase (Ohio/Virginia) ou aceitar a
  latência. Região do Render **não muda depois** de criado.

## 🟡 8. Divergência entre `render.yaml` e a realidade do repositório

- `CORS_ALLOWED_ORIGINS` e `FRONTEND_URL` apontam para `https://conliz.onrender.com`.
  Se o serviço receber outro nome (o Render sufixa quando o nome já existe), o valor
  fica errado. Melhor deixar `sync: false` e preencher depois, ou usar
  `RENDER_EXTERNAL_URL` (variável que o Render injeta) no `application.yml`.
- Não há `SMTP_*` no `render.yaml`, mas o backend envia notificação de contato. Sem SMTP,
  o formulário de contato grava/retorna mas **nenhum e-mail sai** — e o Free bloqueia as
  portas 25/465/587 de qualquer forma. Precisa de provedor com API (Resend/SendGrid HTTP)
  ou desligar o envio por flag.
- `TURNSTILE_ENABLED` não está no `render.yaml`: o captcha fica **desligado** em produção.

## 🟡 9. Arquivos mortos / confusos no repositório

- `frontend/Dockerfile` (servidor Next na porta 3000) é do desenho antigo; hoje só
  `backend/Dockerfile` é usado. Manter os dois convida a erro de deploy.
- `README.md` ainda descreve frontend na 3000 + proxy `/api`, o que contradiz o desenho
  atual (um serviço, 8080).
- `frontend/src/app/gestao-conliz-acesso/page.tsx` faz `fetch("/api/auth/login")` **sem**
  tratar CSRF e sem `credentials: "include"` explícito — funciona porque é same-origin,
  mas o `refresh`/logout precisa do mesmo cuidado. Vale um teste E2E no domínio real.
- `GET /api/auth/2fa/setup` exige estar autenticado, mas **não existe** tela no painel
  para configurar 2FA. O checklist do `DEPLOY.md` pede "2FA configurado no primeiro
  acesso" — hoje só é possível via Swagger. Ou criar a tela, ou tirar do checklist.

## 🟢 10. O que já está certo (para não mexer)

- Um único serviço/porta (8080), estático embutido no jar, `SpaResourceConfig` servindo
  `/`, `/admin/*` e devolvendo JSON nas rotas de API.
- `server.port: ${PORT:8080}` — o Render injeta `PORT`; está correto.
- Healthcheck em `/actuator/health` (público) com `healthCheckPath` no `render.yaml`.
- `dockerContext: .` + `.dockerignore` corretos para o Dockerfile na raiz.
- V3 (RLS) só existe em `migration-postgresql` — não quebra o H2 local.
- CI verde em `41c5559` (backend `mvn test`, frontend `node --test` + `tsc` + build).

---

## Ordem sugerida

1. Corrigir CSRF cookie `Secure` (§1) e `render.yaml` (§2, §8) — é código, vai num commit.
2. Decidir seed demo (§4) e usuários demo (§3).
3. Adicionar o teste de Flyway (§5) para o primeiro boot não ser a descoberta.
4. Subir Supabase → rodar as migrations → só então Render.
5. Trocar para Starter se for uso real (§6).
