# Neon Non-Production — Caleida

**Status:** provisionado e integrado até a migration de auditoria da US-AUTH-008  
**Data de referência:** 2026-09-11  
**Projeto:** `caleida-nonprod / patient-glade-95136440`

## 1. Baseline canônica

```text
PostgreSQL: 18
Branch: main
Branch ID: br-restless-cherry-awpcwy6r
Database: neondb
Managed Better Auth: enabled
```

IDs de recurso não são credenciais. Connection strings, passwords, API keys, Auth URLs e cookie secrets nunca são persistidos neste arquivo.

A baseline `main` representa staging/non-production. Ela recebe somente mudanças persistentes versionadas e aprovadas depois dos gates aplicáveis; nunca é usada como laboratório destrutivo.

## 2. Estado Auth

Readback vigente:

```text
email/password: enabled
allow sign-up: true
verify email on sign-up: true
require email verification: true
verification method: OTP
email provider: shared Neon
```

Production Neon continua inexistente e non-production não deve ser reutilizado como Production.

## 3. Migrations integradas

```text
000001_migration_ledger.sql
000002_product_authorization.sql
000003_entry_control.sql
000004_controlled_signup.sql
000005_controlled_signup_consume_fix.sql
000006_before_create_without_user_id.sql
000007_claim_signature_compatibility.sql
000008_auth_security_audit.sql
```

A migration `000008` possui checksum:

```text
4f2ab39dd53413c522648ce7021a0051a163b009486c5dd6e7fcf1e2f81460b8
```

Ela foi promovida em 11/09/2026 somente após CI/PostgreSQL 18 e branch Neon isolada em `PASS`.

## 4. Dados após a promoção de 000008

Readback imediatamente após a promoção:

```text
caleida_audit.auth_security_events: 0
neon_auth.user: 0
neon_auth.session: 0
neon_auth.account: 0
neon_auth.verification: 0
```

Nenhuma fixture da validação isolada foi transportada para a baseline.

A comparação de schema entre `verify-us-auth-008` e `main` ficou vazia após a promoção.

## 5. Gate Neon US-AUTH-008

```text
Branch: verify-us-auth-008
Branch ID: br-delicate-meadow-aw1u62kn
Parent: main / br-restless-cherry-awpcwy6r
State: ready
```

A branch herdou Managed Better Auth, iniciou com migrations `000001`–`000007`, recebeu `000008`, passou o teste SQL/ACL adversarial e terminou sem usuários, sessões, contas, verificações ou eventos de auditoria.

## 6. Housekeeping de branches

```text
verify-us-auth-004 / br-plain-pond-aw5f59ia
verify-us-auth-005 / br-small-river-aww0rtxo
verify-us-auth-006 / br-cold-block-aww00k4o
verify-us-auth-007 / br-wandering-mountain-awjnqqps
verify-us-auth-008 / br-delicate-meadow-aw1u62kn
```

Essas branches não são ambientes permanentes nem fonte canônica de schema. A ferramenta trata exclusão como destrutiva; portanto nenhuma deve ser removida sem autorização específica do usuário.

## 7. Tooling/guardrails

Contratos versionados usam somente nomes/placeholders seguros:

- `DATABASE_URL` — runtime server-side;
- `DATABASE_URL_UNPOOLED` — migrations/testes/bootstrap;
- `CALEIDA_DB_TARGET=ephemeral|neon-isolated|baseline`;
- `CALEIDA_NEON_BRANCH_ID`;
- `CALEIDA_ALLOW_BASELINE_MIGRATIONS=YES` somente em promoção deliberada;
- `NEON_AUTH_BASE_URL` e `NEON_AUTH_COOKIE_SECRET` fora do Git;
- `CALEIDA_RATE_LIMIT_SECRET` fora do Git;
- bootstrap owner somente com UUID Auth existente e autorização explícita do tooling.

Data API e Object Storage continuam não provisionados. Não criar recursos adicionais apenas para satisfazer a US-AUTH-008 live; reutilizar a baseline non-production e fixtures temporárias mínimas quando a Preview estiver disponível.
