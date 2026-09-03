# Ambientes e variáveis — Caleida

**Status:** contrato operacional canônico durante US-AUTH-004  
**Decisões relacionadas:** `ADR-005`, `ADR-007`, `ADR-009`  
**Plataforma:** `docs/NEON_PLATFORM.md`  
**E-mail:** `docs/EMAIL_TRANSPORT.md`  
**Release:** `docs/VERCEL_RELEASE.md`

Este documento define como configuração e secrets são separados entre desenvolvimento local, non-production/staging e Production. Ele documenta **nomes, escopos e regras**; valores reais permanecem fora do Git.

## 1. Princípio central

```text
local
  ↓ somente recursos descartáveis ou non-production
non-production / staging
  ↓ isolado de Production
Production
  ↓ recursos e secrets próprios, quando provisionados
```

Regras obrigatórias:

- nunca usar credencial Production em local, CI, Preview ou staging;
- nunca promover credencial non-production para Production por conveniência;
- nenhum secret, token, senha, API key ou connection string é versionado;
- variáveis server-only nunca recebem prefixo `NEXT_PUBLIC_`;
- toda nova variável deve ser classificada aqui ou em contrato de domínio antes do uso operacional.

## 2. Estado real em 03/09/2026

### Neon non-production

```text
Projeto: caleida-nonprod
Project ID: patient-glade-95136440
PostgreSQL: 18
Baseline: main
Branch ID: br-restless-cherry-awpcwy6r
Branches descartáveis: nenhuma
Managed Better Auth: habilitado
Email provider Auth: shared Neon
Require email verification: false
Data API: não provisionada
```

Migrations integradas: `000001`, `000002`, `000003`.

Contadores confirmados antes de US-AUTH-004: zero usuários Auth, papéis, role_changes, convites, usos, solicitações e entry_events.

As branches temporárias de US-AUTH-001/002 já foram removidas após as autorizações destrutivas correspondentes. Não existe branch Neon descartável pendente.

### Production

O projeto Neon Production **não está provisionado**. Portanto não existe connection string, endpoint Auth, cookie secret, domínio de e-mail ou credencial Resend Production canônicos.

### Vercel

Nenhum deployment Caleida é criado por IA. Quando um projeto Vercel existir por ação humana deliberada:

| Caleida | Vercel | Dados permitidos |
|---|---|---|
| local | `.env.local` | somente local/non-production |
| non-production/staging | Preview manual | somente credenciais non-production |
| Production | Production manual | somente recursos Production dedicados |

Configurar secret nunca autoriza deployment.

## 3. Contrato de arquivos locais

`.env.example` é o único `.env*` versionado e contém apenas linhas comentadas/documentação.

`.gitignore` deve preservar:

```text
.env*
!.env.example
```

Uso local:

```text
.env.local
.env.*.local
```

Esses arquivos ficam fora do Git.

## 4. Variáveis atuais

| Variável | Classe | Escopo | Regra |
|---|---|---|---|
| `DATABASE_URL` | secret server-only | runtime futuro | conexão pooled; nunca browser |
| `DATABASE_URL_UNPOOLED` | secret server-only | tooling | migrations/testes/bootstrap |
| `CALEIDA_DB_TARGET` | controle não secreto | tooling | `ephemeral`, `neon-isolated` ou `baseline` |
| `CALEIDA_NEON_BRANCH_ID` | identificador | tooling Neon | prende operação ao branch esperado |
| `CALEIDA_ALLOW_BASELINE_MIGRATIONS` | confirmação | baseline nonprod | deve ser explícita para promoção de migration |
| `NEON_AUTH_BASE_URL` | config server-only | Auth branch-scoped | endpoint do ambiente correspondente |
| `NEON_AUTH_COOKIE_SECRET` | secret server-only | Auth | 32+ caracteres, nunca browser/Git |
| `RESEND_API_KEY` | secret server-only | e-mail nonprod | somente `sending_access`, preferencialmente limitado ao domínio |
| `CALEIDA_EMAIL_FROM` | config server-only | e-mail | remetente de domínio/subdomínio verificado |
| `CALEIDA_EMAIL_FROM_NAME` | config server-only | e-mail | nome de exibição; default runtime `Caleida` |
| `CALEIDA_BOOTSTRAP_OWNER_USER_ID` | identificador | bootstrap owner | UUID Auth existente |
| `CALEIDA_BOOTSTRAP_REASON` | metadado | bootstrap owner | motivo auditável, sem secret |
| `CALEIDA_ALLOW_OWNER_BOOTSTRAP` | confirmação | bootstrap owner | deve ser `YES` quando operação real ocorrer |
| `NEXT_PUBLIC_*` | público | nenhum atualmente | somente dado deliberadamente público |

## 5. Desenvolvimento local

### Build/CI sem serviços externos

`npm run verify` deve continuar funcionando sem Neon Auth ou Resend configurados. Auth e e-mail são inicializados somente quando suas operações reais são invocadas.

### Auth local

```text
NEON_AUTH_BASE_URL=<nonprod-auth-endpoint>
NEON_AUTH_COOKIE_SECRET=<local-server-only-secret>
```

Apontar apenas para non-production apropriado.

### E-mail local/non-production

```text
RESEND_API_KEY=<nonprod-sending-only-key>
CALEIDA_EMAIL_FROM=<verified-nonprod-sender>
CALEIDA_EMAIL_FROM_NAME=<sender-display-name>
```

Regras:

- a chave não é copiada para CI padrão;
- não colar API key em Issue/PR/chat;
- testes automatizados não enviam mensagem externa;
- antes do domínio real existir, não inventar remetente versionado.

### PostgreSQL descartável

```text
DATABASE_URL_UNPOOLED=<direct-ephemeral-postgres-connection>
CALEIDA_DB_TARGET=ephemeral
```

Esse é o gate PostgreSQL 18 portável.

## 6. Non-production / staging

### Baseline Auth

```text
NEON_AUTH_BASE_URL=<baseline-auth-endpoint>
NEON_AUTH_COOKIE_SECRET=<baseline-server-only-secret>
```

A configuração atual ainda usa o servidor compartilhado do Neon para e-mail Auth. US-AUTH-004 prepara a troca para SMTP customizado Resend, mas a alteração live depende de credencial/domínio externos.

### Resend

Contrato non-production:

```text
RESEND_API_KEY=<sending-access-domain-scoped-key>
CALEIDA_EMAIL_FROM=<verified-nonprod-sender>
CALEIDA_EMAIL_FROM_NAME=<sender-display-name>
```

O mesmo secret `sending_access` pode autenticar:

- REST da aplicação em `src/lib/email/server.ts`;
- SMTP customizado do Neon Auth, configurado fora do Git.

Isso não torna a chave pública nem justifica armazená-la em dois arquivos versionados. Cada superfície deve lê-la do secret store apropriado.

### Neon Auth SMTP customizado

Quando configurado externamente, usar os campos suportados pela API corrente do Neon:

```text
host=smtp.resend.com
port=<465-or-587-conforme-gate-live>
username=resend
password=<RESEND_API_KEY>
sender_email=<CALEIDA_EMAIL_FROM>
sender_name=<CALEIDA_EMAIL_FROM_NAME>
```

Não ativar `require_email_verification` durante US-AUTH-004. Essa política pertence a US-AUTH-005, quando o cadastro controlado existir.

### Branch Neon isolada

Quando uma mudança futura realmente depender de comportamento Neon-specific:

```text
DATABASE_URL_UNPOOLED=<direct-disposable-neon-branch-connection>
CALEIDA_DB_TARGET=neon-isolated
CALEIDA_NEON_BRANCH_ID=<disposable-branch-id>
```

A baseline `main` não é laboratório.

### Promoção de migrations non-production

```text
DATABASE_URL_UNPOOLED=<direct-baseline-connection>
CALEIDA_DB_TARGET=baseline
CALEIDA_NEON_BRANCH_ID=br-restless-cherry-awpcwy6r
CALEIDA_ALLOW_BASELINE_MIGRATIONS=YES
```

US-AUTH-004 não cria migration.

## 7. Production

Até Story explícita provisionar Production:

- não existe `DATABASE_URL` Production;
- não existe `NEON_AUTH_BASE_URL`/cookie secret Production;
- não existe `RESEND_API_KEY` Production;
- não existe remetente/domínio Production aprovado;
- não existe alvo Production no runner de migrations;
- não se reutiliza baseline/non-production como Production.

A escolha Resend de `ADR-009` deve ser revalidada antes de Production, incluindo pricing, volume, DPA, subprocessadores, data residency, entregabilidade e segregação de credenciais.

## 8. Exposição ao browser

São proibidos em `NEXT_PUBLIC_*`:

- URLs/credenciais de banco privadas;
- Neon API keys;
- `NEON_AUTH_COOKIE_SECRET`;
- `RESEND_API_KEY` ou credencial SMTP;
- OAuth client secrets;
- Vercel tokens;
- secrets futuros de Storage/API.

O Caleida continua sem variável `NEXT_PUBLIC_*` necessária nesta fase.

## 9. CI

O workflow permanente usa somente valores locais do próprio PostgreSQL 18 efêmero.

CI padrão não recebe:

- Neon API key/connection string;
- Auth endpoint/cookie secret;
- Resend API key;
- Vercel token.

`npm run verify` testa a boundary de e-mail por contrato/typecheck/build sem envio real. `npm run verify:db` continua executado pelo workflow permanente, mas US-AUTH-004 não altera schema.

## 10. Fontes externas revalidadas

- US-AUTH-001: Neon Auth SDK/session.
- US-AUTH-002: Admin Better Auth versus papéis de produto.
- US-AUTH-004 em 03/09/2026: Resend pricing/API/idempotência/API keys/domínios/regiões/DPA e Neon Auth custom email provider.

Detalhes e links: `ADR-009` e `docs/EMAIL_TRANSPORT.md`.

Revalidar novamente Vercel, Neon Production, Data API, OAuth, e-mail e revogação de sessão quando a Story correspondente realmente alterar essas superfícies.
