# Passo a passo — Supabase

Banco de produção do Conliz. Faça **nesta ordem** e guarde cada valor num lugar seguro
(gerenciador de senhas). Nenhum segredo vai para o repositório.

Tempo estimado: 15 a 20 minutos.

---

## 1. Criar o projeto

1. Abra https://supabase.com/dashboard e entre (ou crie a conta).
2. **New project**.
3. Preencha:

   | Campo | Valor |
   |---|---|
   | Organization | a sua |
   | Name | `conliz` |
   | Database Password | **clique em Generate** e copie sAbKPKGsS3Hc6mktantes de continuar |
   | Region | **South America (São Paulo)** — `sa-east-1` |
   | Plan | Free |

4. **Create new project** e aguarde ~2 minutos (o provisionamento do banco).

> ⚠️ **A senha do banco aparece uma única vez.** Se perder, só resolve com
> **Settings → Database → Reset database password** (e aí todas as variáveis do Render
> precisam ser atualizadas).

Anote o **Project ref**: está na URL do dashboard
(`supabase.com/dashboard/project/`**`abcdefghijklmno`**) e em **Settings → General**.

---

## 2. Pegar a string de conexão certa (a parte que mais dá errado)

1. **Project Settings** (engrenagem) → **Database** → **Connection string** → aba **URI**.
2. Escolha **Session pooler** — host `aws-0-sa-east-1.pooler.supabase.com`, porta `5432`.
3. Copie. Vai parecer com:

   ```
   postgresql://postgres.abcdefghijklmno:SUA-SENHA@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
   ```

**Por que não a "Direct connection":** ela aponta para `db.<ref>.supabase.co`, que é
IPv6-only (salvo o add-on IPv4 pago) — e o Render não tem saída IPv6. O resultado é
"connection refused/timeout" no primeiro boot mesmo com a senha certa.

**Cuidados ao copiar:**
- o host do pooler muda de projeto para projeto (`aws-0-…`, `aws-1-…`, outra região):
  copie do dashboard, não de guia nenhum;
- o usuário é `postgres.<project-ref>` (com o ref, não só `postgres`);
- se a senha tiver `@`, `#`, `:` ou `/`, ela vem percent-encoded na string — use
  exatamente como está.

---

## 3. Montar as três variáveis do Render

O backend (Spring) não usa a URL do Postgres crua; ele quer JDBC. Converta assim:

| Variável | Valor |
|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://aws-0-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | `postgres.abcdefghijklmno` |
| `SPRING_DATASOURCE_PASSWORD` | a senha do banco (crua, **sem** percent-encoding) |

Regras:
- prefixo `jdbc:` na URL;
- `?sslmode=require` no fim (o Supabase exige TLS);
- se você usar o **transaction pooler** (porta `6543`), acrescente
  `&prepareThreshold=0` — o pooler de transação não suporta prepared statements e o
  driver JDBC do Postgres usa por padrão. Com o **session pooler** (recomendado aqui)
  não precisa.

---

## 4. Rodar as migrations

Não há nada de SQL manual: o Flyway roda no boot do backend (`SPRING_PROFILES_ACTIVE=docker`).

- V1 cria o schema, V2 o seed, V4 índices/auditoria — de `db/migration`;
- V3 ativa **Row Level Security** em todas as tabelas — de `db/migration-postgresql`,
  que só é carregado no perfil `docker`. Ela bloqueia o acesso anônimo do PostgREST
  (a API REST automática do Supabase): o seu backend conecta como `postgres`, então
  continua funcionando.

Duas formas de rodar:

**A) No primeiro deploy do Render (mais simples).** Só suba o serviço com as variáveis
preenchidas — o Flyway aplica tudo antes de a aplicação começar a atender.

**B) Antes do Render, da sua máquina.** Útil para ver o erro de migration sem depender
do log do Render:

```bash
cd backend
SPRING_PROFILES_ACTIVE=docker \
SPRING_DATASOURCE_URL="jdbc:postgresql://aws-0-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require" \
SPRING_DATASOURCE_USERNAME="postgres.abcdefghijklmno" \
SPRING_DATASOURCE_PASSWORD="sua-senha" \
CONLIZ_ADMIN_PASSWORD="senha-de-bootstrap" \
mvn spring-boot:run
```

Quando aparecer `Started ConlizPlatformApplication`, as migrations foram aplicadas.
Pare com `Ctrl+C`.

### Conferir no Supabase

**Table Editor** → schema `public`: devem existir, entre outras, `usuarios`, `clientes`,
`orcamentos`, `contratos`, `obras`, `funcionarios`, `financeiro`, `auditoria` e
`flyway_schema_history` (com 4 linhas e `success = true`).

Se `flyway_schema_history` tiver uma linha com `success = false`, leia a coluna
`error` na mesma linha — é o SQL que falhou.

---

## 5. Usuário inicial (admin)

O backend só cria o admin se `CONLIZ_ADMIN_PASSWORD` estiver definida **no primeiro boot
com banco vazio**.

- defina uma senha forte sua (20+ caracteres) — não use a gerada pelo Render;
- o e-mail vem de `CONLIZ_ADMIN_EMAIL` (`admin@conliz.com.br`);
- os usuários de departamento (`rh@`, `comercial@`, `engenharia@`) **não** são criados
  em produção (`CONLIZ_SEED_DEMO_USERS=false`). Crie-os depois pelo painel, cada um com
  a própria senha.

---

## 6. Problemas comuns

| Sintoma no log do Render | Causa | Correção |
|---|---|---|
| `UnknownHostException: db.xxxx.supabase.co` ou timeout | usou a conexão direta (IPv6) | use o **session pooler** (porta 5432) |
| `password authentication failed for user "postgres"` | usuário sem o `.<project-ref>` | `postgres.abcdefghijklmno` |
| `FATAL: Tenant or user not found` | host do pooler de outra região/projeto | copie o host do dashboard |
| `The server does not support SSL` | faltou `sslmode=require` | acrescente na URL |
| `Validate failed: Migration checksum mismatch` | a V2 foi editada depois de já ter rodado | restaure o arquivo original ou `flyway repair` |
| `relation "usuarios" does not exist` | Flyway não rodou | confirme `SPRING_PROFILES_ACTIVE=docker` |
| `prepared statement "S_1" already exists` | transaction pooler (6543) sem ajuste | use 5432 ou `&prepareThreshold=0` |
| `too many connections` | pool do Hikari + conexões presas | reinicie o serviço no Render; com 1 instância não deve ocorrer |

---

## 7. Checklist final do Supabase

- [ ] projeto criado em `sa-east-1` e senha guardada
- [ ] string do **session pooler** copiada
- [ ] as 3 variáveis `SPRING_DATASOURCE_*` montadas (com `jdbc:` e `sslmode=require`)
- [ ] migrations aplicadas (4 linhas em `flyway_schema_history`)
- [ ] RLS ativa nas tabelas (`Table Editor` → tabela → RLS enabled)
- [ ] `CONLIZ_ADMIN_PASSWORD` definida antes do primeiro boot

Próximo passo: `DEPLOY.md`, seção 2 (Render).
