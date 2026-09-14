# Neon Non-Production — Caleida

**Status:** provisionado e integrado até o fechamento da US-AUTH-008  
**Projeto:** `caleida-nonprod / patient-glade-95136440`

## 1. Baseline canônica

```text
PostgreSQL: 18
Branch: main
Branch ID: br-restless-cherry-awpcwy6r
Database: neondb
Managed Better Auth: enabled
```

A baseline Neon `main` representa staging/non-production. Ela recebe somente mudanças persistentes versionadas e aprovadas depois dos gates aplicáveis; nunca é usada como laboratório destrutivo.

Production Neon continua inexistente e non-production não deve ser reutilizado como Production.

## 2. Estado Auth

```text
email/password: enabled
allow sign-up: true
verify email on sign-up: true
require email verification: true
verification method: OTP
email provider: shared Neon
```

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

Checksum de `000008_auth_security_audit.sql`:

```text
4f2ab39dd53413c522648ce7021a0051a163b009486c5dd6e7fcf1e2f81460b8
```

A migration `000008` foi promovida após CI/PostgreSQL 18, branch Neon isolada e testes adversariais em PASS.

## 4. Gate Neon US-AUTH-008

```text
Branch: verify-us-auth-008
Branch ID: br-delicate-meadow-aw1u62kn
Parent: main / br-restless-cherry-awpcwy6r
State: ready
```

A branch isolada recebeu `000008`, passou o teste SQL/ACL adversarial e terminou sem usuários, sessões, contas, verificações ou eventos de auditoria. A comparação de schema vs baseline ficou vazia após a promoção.

A Preview final da US-AUTH-008 reutilizou a configuração histórica ligada a `verify-us-auth-005 / br-small-river-aww0rtxo`; o readback confirmou migrations `000001`–`000008`, permitindo o gate live final sem criar Production.

## 5. Housekeeping

```text
verify-us-auth-004 / br-plain-pond-aw5f59ia
verify-us-auth-005 / br-small-river-aww0rtxo
verify-us-auth-006 / br-cold-block-aww00k4o
verify-us-auth-007 / br-wandering-mountain-awjnqqps
verify-us-auth-008 / br-delicate-meadow-aw1u62kn
```

Essas branches não são ambientes permanentes nem fonte canônica de schema. Exclusão é destrutiva e exige autorização específica do usuário.

## 6. Tooling/guardrails

Contratos versionados usam apenas nomes/placeholders seguros:

- `DATABASE_URL` — runtime server-side;
- `DATABASE_URL_UNPOOLED` — migrations/testes/bootstrap;
- `CALEIDA_DB_TARGET=ephemeral|neon-isolated|baseline`;
- `CALEIDA_NEON_BRANCH_ID`;
- `CALEIDA_ALLOW_BASELINE_MIGRATIONS=YES` somente em promoção deliberada;
- `NEON_AUTH_BASE_URL` e `NEON_AUTH_COOKIE_SECRET` fora do Git;
- `CALEIDA_RATE_LIMIT_SECRET` fora do Git.

Connection strings, passwords, API keys, Auth URLs reais, cookie secrets e demais credenciais nunca são persistidos neste arquivo.

## 7. Próximo trabalho de dados

O fechamento da US-AUTH-008 não autoriza novos recursos Neon. Data API e Object Storage continuam não provisionados.

O próximo incremento será primeiro planejado (EPIC-03 — Perfis e privacidade); qualquer migration/RLS adicional deve nascer de uma Story própria desse plano e seguir ADR-004/ADR-008.
