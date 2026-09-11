# Neon Platform — Caleida

**Status:** arquitetura canônica de plataforma durante US-AUTH-008  
**Decisões:** ADR-004, ADR-005, ADR-008 e ADR-009

## 1. Topologia vigente

```text
Next.js
  ├── Neon Auth / Managed Better Auth
  │     ├── email/password + OTP
  │     ├── login/logout
  │     └── recovery + gestão/revogação de sessões
  ├── operações server-side confiáveis
  │     └── Neon Postgres
  └── futuro acesso normal sob usuário
        └── Neon Data API + JWT + RLS
```

Data API continua não provisionada. Object Storage continua desacoplado e sem provider escolhido.

## 2. Non-production canônico

```text
Project: caleida-nonprod / patient-glade-95136440
PostgreSQL: 18
Baseline: main / br-restless-cherry-awpcwy6r / ready
Managed Better Auth: enabled
email/password: enabled
allow sign-up: true
require email verification: true
verification method: OTP
email provider: shared Neon
```

A branch Neon `main` é staging/non-production e não é a branch Git `main`.

## 3. Baseline de migrations

A baseline integrada contém:

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

`000008` foi promovida somente após:

1. CI + PostgreSQL 18 `PASS`;
2. migration/testes executados em `verify-us-auth-008`;
3. ACL adversarial `PASS`;
4. confirmação de zero fixtures;
5. comparação de schema limitada ao delta esperado.

Depois da promoção, `compare_database_schema(verify-us-auth-008, main)` retornou diff vazio.

## 4. Auditoria Auth consolidada

Persistência adicionada por US-AUTH-008:

```text
caleida_audit.auth_security_events
```

Colunas deliberadamente mínimas:

- id;
- event_type;
- actor_auth_user_id opcional;
- outcome;
- reason_code;
- occurred_at.

Eventos permitidos:

```text
login
logout
password_recovery_requested
password_reset
password_changed
session_revoked
other_sessions_revoked
auth_proxy_post
```

Não existem colunas de e-mail, senha, token, cookie, Auth URL, IP ou payload completo. `PUBLIC` não possui acesso à tabela/sequence.

## 5. Sessão e recovery

A aplicação usa `@neondatabase/auth@0.5.0-beta` em boundary server-only.

- `sessionDataTtl = 1 segundo`;
- recovery público é anti-enumeração;
- callback é derivado de origem same-origin validada;
- reset usa token do provider somente no servidor/fluxo de formulário;
- alteração autenticada exige senha atual e solicita revogação das outras sessões;
- session token nunca é enviado à UI;
- revogação individual resolve o token somente após validar ownership pelo session id.

O Managed Neon observado não expõe `revokeSessionsOnPasswordReset`; a US-AUTH-008 deve medir o comportamento live em vez de presumir revogação automática.

## 6. Branches de verificação

Housekeeping atual:

```text
verify-us-auth-004 / br-plain-pond-aw5f59ia
verify-us-auth-005 / br-small-river-aww0rtxo
verify-us-auth-006 / br-cold-block-aww00k4o
verify-us-auth-007 / br-wandering-mountain-awjnqqps
verify-us-auth-008 / br-delicate-meadow-aw1u62kn
```

`verify-us-auth-008` foi criada da baseline, recebeu somente a migration/testes necessários e terminou com:

```text
auth_security_events: 0
auth users: 0
auth sessions: 0
auth accounts: 0
auth verifications: 0
```

Branches temporárias não são fonte de verdade de schema. Exclusão exige autorização explícita porque é destrutiva.

## 7. Production e secrets

`caleida-production` continua não provisionado. Production não faz parte da US-AUTH-008 e nunca é laboratório.

Nunca versionar:

- DATABASE_URL / DATABASE_URL_UNPOOLED;
- Neon API keys;
- Auth URLs reais;
- NEON_AUTH_COOKIE_SECRET;
- CALEIDA_RATE_LIMIT_SECRET;
- recovery/session tokens;
- OAuth/client secrets;
- credenciais de e-mail/Storage.

## 8. Gate seguinte

Banco e Auth non-production estão preparados para a única release candidate live da US-AUTH-008. O próximo gate é uma Preview Vercel manual da PR #58, seguida da matriz integrada. Nenhum novo recurso Neon deve ser criado antes desse resultado, exceto fixture temporária estritamente necessária ao teste e removida/neutralizada conforme a evidência.
