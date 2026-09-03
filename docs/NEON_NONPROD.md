# Neon Non-Production — Caleida

**Status:** provisionado; Auth, autorização e entrada controlada integrados; SMTP customizado pendente  
**Data de referência:** 2026-09-03  
**Projeto relacionado:** `docs/NEON_PLATFORM.md`  
**Decisões:** `ADR-004`, `ADR-005`, `ADR-008`, `ADR-009`

## 1. Recurso remoto canônico

```text
Projeto: caleida-nonprod
Project ID: patient-glade-95136440
Região: aws-us-east-1
PostgreSQL: 18
Branch baseline: main
Branch ID: br-restless-cherry-awpcwy6r
Database default: neondb
```

Os IDs acima não são credenciais. Senhas, connection strings, Auth URLs, SMTP passwords e API keys nunca são registradas aqui.

## 2. Baseline `main`

A branch Neon `main` é a baseline canônica non-production/staging e não é a branch Git `main`.

Responsabilidades:

- receber apenas mudanças aprovadas após gates;
- representar estado integrado non-production;
- servir de parent para branches descartáveis quando comportamento Neon-specific exigir;
- nunca receber experimentos destrutivos diretamente.

## 3. Branches temporárias

Convenção:

```text
verify/<task-id>
dev/<task-id>
```

Regras:

- usar somente quando houver necessidade Neon-specific;
- remover depois do gate quando autorizado se a ação for destrutiva;
- não manter como ambiente permanente;
- nunca usar Production como laboratório.

Estado atual:

```text
main / br-restless-cherry-awpcwy6r / ready / default
```

Não existe branch descartável pendente.

## 4. Histórico de gates

### US-AUTH-001

`verify-us-auth-001` provou Managed Better Auth branch-scoped antes da promoção. Depois foi removida com autorização explícita.

### US-AUTH-002

`verify-us-auth-002` provou autorização/bootstrap com identidades sintéticas isoladas. Foi removida em 03/09/2026 após autorização explícita.

### US-AUTH-003

Nenhuma branch Neon foi criada: a Story dependia somente de PostgreSQL portável. Neon-specific foi `SKIPPED` conforme ADR-008.

### US-AUTH-004

Nenhuma branch Neon foi aberta até o momento.

A configuração real de SMTP do Neon Auth depende de uma credencial Resend e remetente externos. Criar um branch apenas para existir um gate, antes desses secrets estarem disponíveis em superfície segura, não acrescentaria evidência.

Quando a configuração externa estiver pronta, reavaliar se o gate SMTP deve ocorrer em branch Auth isolada antes de qualquer alteração da baseline. Se for criada branch descartável, sua remoção voltará a exigir autorização explícita quando a ferramenta a classificar como destrutiva.

## 5. Credenciais e tooling

Contrato atual:

- `DATABASE_URL` — runtime pooled futuro;
- `DATABASE_URL_UNPOOLED` — migrations/testes/bootstrap;
- `CALEIDA_DB_TARGET=ephemeral` — gate PostgreSQL;
- `CALEIDA_DB_TARGET=neon-isolated` + `CALEIDA_NEON_BRANCH_ID` — gate Neon-specific;
- `CALEIDA_DB_TARGET=baseline` + `CALEIDA_ALLOW_BASELINE_MIGRATIONS=YES` — promoção deliberada de migration;
- `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET` — Auth server-only;
- `RESEND_API_KEY`, `CALEIDA_EMAIL_FROM`, `CALEIDA_EMAIL_FROM_NAME` — transporte de e-mail non-production;
- `CALEIDA_BOOTSTRAP_OWNER_*` — bootstrap owner futuro.

Todos os valores sensíveis permanecem fora do Git/chat/browser.

## 6. Estado integrado da baseline

A baseline possui:

- Managed Better Auth no schema `neon_auth`;
- migration ledger;
- migrations `000001`, `000002`, `000003`;
- `caleida_auth.user_roles`;
- `caleida_audit.role_changes`;
- `caleida_access.invitations`, `invitation_uses`, `access_requests`;
- `caleida_audit.entry_events`;
- funções controladas com acesso público revogado.

Checksums:

```text
000001_migration_ledger.sql
4d9a403d6bd074faeca04bf3e714fd8066e5e9f3ae7358bbc0f27a1faf2f14c2

000002_product_authorization.sql
0ba6981b583ac8ed693a2a6b6eabc0c84d12678bdf9953e845a239d6b48493c8

000003_entry_control.sql
503700640a81cf41dfe56a0abe70fc581b9c64d8e9ad6585cbcb55d4751b7c5f
```

Contadores confirmados antes de US-AUTH-004:

```text
neon_auth.user: 0
caleida_auth.user_roles: 0
caleida_audit.role_changes: 0
caleida_access.invitations: 0
caleida_access.invitation_uses: 0
caleida_access.access_requests: 0
caleida_audit.entry_events: 0
```

## 7. E-mail Auth atual

Inspeção em 03/09/2026:

```text
Auth provider: Better Auth
Email provider: shared Neon
Require email verification: false
```

`ADR-009` escolheu Resend para non-production, mas a baseline ainda **não** foi alterada para SMTP customizado. O gate real exige credencial/domínio configurados fora do Git/chat.

Quando aplicado, o provider SMTP deve usar os campos suportados pelo Neon Auth (`host`, `port`, `username`, `password`, `sender_email`, `sender_name`) e permanecer com `require_email_verification=false` até US-AUTH-005.

## 8. Deliberadamente ausente

- conta real do beta/proprietário;
- convite/solicitação real;
- Data API;
- Object Storage;
- Production Neon;
- SMTP Resend configurado na baseline;
- OAuth customizado;
- deployment Vercel executado por IA.

## 9. Production

`caleida-production` não existe nesta fase. Production deve usar projeto, users, secrets, domínio/remetente e credencial de e-mail próprios, com revalidação de ADR-009 antes da operação real.
