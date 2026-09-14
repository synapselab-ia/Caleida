# Neon Platform — Caleida

**Status:** arquitetura canônica de plataforma após o fechamento da US-AUTH-008  
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
require email verification: true
verification method: OTP
email provider: shared Neon
```

A branch Neon `main` é staging/non-production e não é a branch Git `main`.

## 3. Baseline de migrations

A baseline integrada contém migrations `000001`–`000008`.

Checksum de `000008_auth_security_audit.sql`:

```text
4f2ab39dd53413c522648ce7021a0051a163b009486c5dd6e7fcf1e2f81460b8
```

`000008` foi promovida somente após CI/PostgreSQL 18, gate Neon isolated e ACL adversarial em PASS. Depois da promoção, o diff entre `verify-us-auth-008` e a baseline ficou vazio.

## 4. Auditoria Auth consolidada

Persistência:

```text
caleida_audit.auth_security_events
```

Metadados deliberadamente mínimos: id, event_type, actor_auth_user_id opcional, outcome, reason_code e occurred_at.

Eventos permitidos incluem login, logout, recovery, reset, password change, revogação individual/coletiva e POSTs relevantes do proxy Auth.

Não existem colunas de e-mail, senha, token, cookie, Auth URL, IP ou payload completo. `PUBLIC` não possui acesso direto à tabela/sequence.

## 5. Sessão e recovery — semântica consolidada

A aplicação usa `@neondatabase/auth@0.5.0-beta` em boundary server-only.

- `sessionDataTtl = 1 s`;
- recovery público é anti-enumeração;
- callback é derivado de origem same-origin validada;
- reset usa token do provider no fluxo server-side;
- session token nunca é enviado à UI;
- revogação individual valida ownership por session id antes de resolver token;
- revogação coletiva usa listagem server-side + revogação explícita de cada sessão remota, preservando a atual.

A matriz live da US-AUTH-008 confirmou que reset por e-mail não revoga automaticamente sessões existentes no Managed Neon observado, enquanto mudança autenticada de senha revoga as demais sessões.

## 6. Branches de verificação

```text
verify-us-auth-004 / br-plain-pond-aw5f59ia
verify-us-auth-005 / br-small-river-aww0rtxo
verify-us-auth-006 / br-cold-block-aww00k4o
verify-us-auth-007 / br-wandering-mountain-awjnqqps
verify-us-auth-008 / br-delicate-meadow-aw1u62kn
```

Branches temporárias não são fonte de verdade de schema. Exclusão exige autorização explícita porque é destrutiva.

## 7. Production e secrets

`caleida-production` continua não provisionado. Production nunca é laboratório.

Nunca versionar DATABASE_URLs, Neon API keys, Auth URLs reais, cookie secrets, rate-limit secrets, recovery/session tokens, OAuth/client secrets ou credenciais de e-mail/Storage.

## 8. Próximo gate de plataforma

Não há gate Neon ativo após o encerramento do Incremento 2.

O próximo incremento deve primeiro ser planejado (EPIC-03 — Perfis e privacidade). Qualquer nova tabela, RLS, Data API ou integração de Storage depende de Story própria e dos ADRs aplicáveis; nada deve ser provisionado antecipadamente.
