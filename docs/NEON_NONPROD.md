# Neon Non-Production — Caleida

**Status:** provisionado; Auth, autorização, entrada controlada e transporte Auth non-production integrados  
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

IDs não são credenciais. Senhas, connection strings, Auth URLs e secrets nunca são registrados aqui.

## 2. Baseline `main`

A branch Neon `main` é a baseline canônica non-production/staging e não é a branch Git `main`.

Responsabilidades:

- receber apenas mudanças aprovadas após gates;
- representar estado integrado non-production;
- servir de parent para branches descartáveis quando comportamento Neon-specific exigir;
- nunca receber experimentos destrutivos diretamente.

## 3. Estado Auth atual

Readback de 03/09/2026:

```text
Auth provider: better_auth
Email/password: enabled
Email provider: shared
Sender email: auth@mail.myneon.app
Sender name: Neon Auth
Require email verification: false
```

Conclusão de US-AUTH-004: o provider compartilhado do Neon Auth é suficiente para desenvolvimento e non-production/beta fechado enquanto seus limites atenderem.

Não existe SMTP customizado, domínio próprio ou API key de provedor externo configurado no estado canônico atual.

`require_email_verification` permanece `false` até US-AUTH-005 integrar o cadastro controlado de forma fail-closed.

## 4. Branches temporárias

Convenção:

```text
verify/<task-id>
dev/<task-id>
```

Regras:

- usar somente quando houver necessidade Neon-specific;
- remover depois do gate mediante autorização explícita quando `delete_branch` for a ação necessária;
- não manter como ambiente permanente;
- nunca usar Production como laboratório.

Estado atual:

```text
main / br-restless-cherry-awpcwy6r / ready / default
verify-us-auth-004 / br-plain-pond-aw5f59ia / ready / parent main
```

`verify-us-auth-004` foi criada durante a investigação inicial de SMTP externo. O readback confirmou que ela herdou Better Auth + provider `shared` e não recebeu configuração Resend/SMTP.

Com a decisão final de ADR-009, a branch não é mais necessária. A exclusão é housekeeping não bloqueante e exige autorização explícita do usuário porque `delete_branch` é destrutiva.

## 5. Histórico de gates

### US-AUTH-001

`verify-us-auth-001` provou Managed Better Auth branch-scoped antes da promoção e foi removida com autorização explícita.

### US-AUTH-002

`verify-us-auth-002` provou autorização/bootstrap com identidades sintéticas isoladas e foi removida com autorização explícita.

### US-AUTH-003

Nenhuma branch Neon foi criada: a Story dependia somente de PostgreSQL portável. Neon-specific foi `SKIPPED` conforme ADR-008.

### US-AUTH-004

A investigação começou considerando SMTP externo e criou `verify-us-auth-004`. Antes de qualquer secret/configuração externa ser aplicada, o escopo foi corrigido após confirmar que o servidor compartilhado do Neon Auth já atende non-production.

Resultado:

```text
Baseline main: shared email provider / unchanged
verify-us-auth-004: shared email provider / no external SMTP
require_email_verification: false em ambas
```

Nenhum gate SMTP externo é requisito para conclusão da Story.

## 6. Credenciais e tooling

Contrato atual:

- `DATABASE_URL` — runtime pooled futuro;
- `DATABASE_URL_UNPOOLED` — migrations/testes/bootstrap;
- `CALEIDA_DB_TARGET=ephemeral` — gate PostgreSQL;
- `CALEIDA_DB_TARGET=neon-isolated` + `CALEIDA_NEON_BRANCH_ID` — gate Neon-specific;
- `CALEIDA_DB_TARGET=baseline` + `CALEIDA_ALLOW_BASELINE_MIGRATIONS=YES` — promoção deliberada de migration;
- `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET` — Auth server-only;
- `CALEIDA_BOOTSTRAP_OWNER_*` — bootstrap owner futuro.

Não existem variáveis Resend/SMTP no contrato atual.

## 7. Estado integrado da baseline

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

US-AUTH-004 não criou migration nem dados funcionais.

## 8. Deliberadamente ausente

- conta real do beta/proprietário;
- convite/solicitação real;
- Data API;
- Object Storage;
- Production Neon;
- SMTP externo;
- domínio/remetente próprio;
- confirmação obrigatória de e-mail;
- OAuth customizado;
- deployment Vercel executado por IA.

## 9. Production

`caleida-production` não existe nesta fase. Antes de Production/abertura pública, a estratégia de e-mail deverá ser reavaliada; o provider compartilhado do Neon não é declarado solução definitiva de Production.
