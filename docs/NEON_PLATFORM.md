# Neon Platform — Caleida

**Status:** arquitetura canônica de plataforma durante US-AUTH-007  
**Decisões relacionadas:** `ADR-004`, `ADR-005`, `ADR-008` e `ADR-009`  
**Project Design:** `PROJECT_DESIGN.md` + `PROJECT_DESIGN_PLATFORM_AMENDMENT.md`

## 1. Escopo

Este documento define como o Caleida usa Neon para Postgres e identidade. Schema persistente de produto pertence às migrations versionadas no Git; comportamento específico do serviço é verificado em branch Neon isolada.

## 2. Topologia

```text
Next.js
  ├── Neon Auth / Managed Better Auth
  │     ├── email/password + OTP
  │     ├── login/logout
  │     └── recovery + gestão de sessões
  ├── operações server-side confiáveis
  │     ↓
  │   Postgres direto com least privilege
  └── futuro browser/user data path
        ↓
      Neon Data API + JWT → PostgreSQL RLS

Object Storage: provider separado, ainda não escolhido
```

Data API continua não provisionada.

## 3. Ambientes

### Non-production

```text
Projeto: caleida-nonprod / patient-glade-95136440
PostgreSQL: 18
Baseline: main / br-restless-cherry-awpcwy6r
```

A branch Neon `main` não é a branch Git `main`.

Branches de verificação existem somente quando um gate Neon-specific exige isolamento. Elas não são fonte canônica de schema e não são removidas automaticamente, pois exclusão é ação destrutiva sujeita a autorização explícita.

Housekeeping atual:

```text
verify-us-auth-004 / br-plain-pond-aw5f59ia
verify-us-auth-005 / br-small-river-aww0rtxo
verify-us-auth-006 / br-cold-block-aww00k4o
verify-us-auth-007 / br-wandering-mountain-awjnqqps
```

### Production

`caleida-production` continua não provisionado. Production será projeto separado e nunca serve como laboratório.

## 4. Migrations e verificação

Schema de produto segue `ADR-004`; verificação segue `ADR-008`.

```text
database/migrations/
database/scripts/
database/tests/
```

SQL/constraints/RLS portáveis são provados primeiro em PostgreSQL 18 descartável. Branch Neon isolada é adicional quando a mudança depende de Neon Auth, Data API, roles/helpers gerenciados, extensão específica ou outra semântica do serviço.

A baseline nunca substitui ambiente de verificação.

## 5. Neon Auth e autorização

Managed Better Auth é a identidade canônica desde US-AUTH-001.

Estado non-production atual:

```text
Auth provider: better_auth
Auth schema: neon_auth
email/password: enabled
allow sign-up: true
verify email on sign-up: true
require email verification: true
verification method: OTP
email provider: shared Neon
```

UUID de `neon_auth.user.id` é a identidade canônica. Senha, recovery token, session token, Auth URL real e cookie secret não são duplicados no schema de produto nem versionados.

Papéis de produto permanecem independentes do Admin Better Auth:

```text
proprietário
administrador
moderador
curador
usuário
```

Persistência de produto relevante:

- `caleida_auth.user_roles`;
- `caleida_audit.role_changes`;
- `caleida_access.invitations`;
- `caleida_access.invitation_uses`;
- `caleida_access.access_requests`;
- `caleida_audit.entry_events`;
- estruturas de signup controlado das migrations `000004`–`000007`.

## 6. Estado integrado da baseline

`caleida-nonprod/main` possui migrations versionadas `000001`–`000007`.

A baseline integrada cobre:

1. ledger de migrations;
2. autorização/papéis;
3. entrada controlada e auditoria;
4. signup fail-closed por convite/aprovação;
5. verificação de webhooks Auth;
6. confirmação obrigatória de e-mail por OTP.

As Stories US-AUTH-006/007 não adicionam schema de produto: login/logout, recovery e sessões permanecem gerenciados pelo Auth.

## 7. Sessão e recovery

A aplicação usa `@neondatabase/auth@0.5.0-beta` em boundary server-only.

US-AUTH-007 adota `sessionDataTtl = 1 segundo`, reduzindo a janela de reutilização do cache assinado antes de revalidação upstream. Operações sensíveis do Better Auth usam sessão autoritativa na implementação corrente.

A configuração Managed Neon observada não expõe `revokeSessionsOnPasswordReset`; por isso reset por e-mail não é documentado como revogação automática de sessões existentes. Alteração autenticada usa `revokeOtherSessions: true`, e o usuário possui controles explícitos de sessão.

Contrato: `docs/SESSION_SECURITY.md`.

## 8. Data API, RLS e conexão direta

Data API permanece não provisionada. Quando dados privados forem expostos sob identidade de usuário:

- RLS será obrigatória onde aplicável;
- `authenticated` não equivale a ownership;
- grants e RLS são controles distintos;
- identidade gerenciada acoplada a política exige gate Neon-specific.

Conexão direta ao Postgres é server-only para migrations, manutenção, bootstrap ou operações confiáveis com least privilege. Owner/BYPASSRLS não substitui autorização de usuário.

## 9. Secrets

Nunca versionar:

- `DATABASE_URL` / `DATABASE_URL_UNPOOLED`;
- Neon API keys;
- Auth URLs reais;
- `NEON_AUTH_COOKIE_SECRET`;
- recovery/session tokens;
- OAuth client secrets;
- futuros secrets de e-mail/Storage.

`.env.example` documenta apenas nomes/placeholders seguros.

## 10. Histórico resumido

- `US-PLAT-004/005`: Neon/PostgreSQL 18 e migrations/testes;
- `US-AUTH-001`: Managed Better Auth;
- `US-AUTH-002`: papéis/autorização;
- `US-AUTH-003`: convites/solicitações/auditoria de entrada;
- `US-AUTH-004`: provider de e-mail shared Neon;
- `US-AUTH-005`: signup controlado + confirmação OTP + migrations `000004`–`000007`;
- `US-AUTH-006`: login/logout + boundary privado;
- `US-AUTH-007`: recovery, alteração de senha, gestão/revogação de sessões e cache de sessão reduzido.

## 11. Production, Storage e release

Object Storage segue desacoplado conforme ADR-006. Production Neon permanece inexistente. Vercel é destino de hosting com deployment exclusivamente humano/manual; Preview não é gate por Story.
