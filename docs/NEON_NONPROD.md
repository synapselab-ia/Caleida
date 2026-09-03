# Neon Non-Production — Caleida

**Status:** provisionado; Auth, autorização, entrada controlada e e-mail Auth non-production integrados na baseline  
**Data de referência:** 2026-09-03  
**Projeto relacionado:** `docs/NEON_PLATFORM.md`  
**Decisões:** `ADR-004`, `ADR-005`, `ADR-008` e `ADR-009`

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

Os IDs acima identificam recursos e **não são credenciais**. Senhas, connection strings, Auth URLs e API keys nunca são registradas neste arquivo.

## 2. Papel do branch `main`

No projeto Neon `caleida-nonprod`, o branch `main` é a baseline canônica de non-production/staging e não deve ser confundido com a branch Git `main`.

Responsabilidades:

- receber somente mudanças persistentes aprovadas depois dos gates aplicáveis;
- representar o estado integrado de non-production;
- servir de parent para branches descartáveis quando um gate Neon-specific realmente exigir isolamento;
- nunca receber experimentos destrutivos diretamente.

## 3. Convenção de branches temporárias

Quando necessárias:

```text
verify/<task-id>
dev/<task-id>
```

Regras:

- derivar da baseline apropriada;
- usar isolamento apenas quando a mudança depender de comportamento específico do Neon;
- remover a branch depois da tarefa mediante autorização explícita quando a ferramenta classificar a exclusão como destrutiva;
- não manter branches temporárias como ambientes permanentes;
- nunca usar Production como laboratório.

`ADR-008` não exige branch Neon para provar SQL PostgreSQL portável.

## 4. Histórico recente de gates Neon

### US-AUTH-001

`verify-us-auth-001` provou Managed Better Auth branch-scoped antes da promoção Auth para a baseline. A branch foi removida posteriormente mediante autorização explícita.

### US-AUTH-002

`verify-us-auth-002` herdou Managed Better Auth, recebeu identidades sintéticas apenas para o gate de autorização e provou vínculo por UUID, bootstrap e negações administrativas. A branch foi removida em 03/09/2026 após autorização explícita do usuário, antes do início de US-AUTH-003.

### US-AUTH-003

Nenhuma branch Neon descartável foi criada.

A Story utiliza somente SQL PostgreSQL portável e UUIDs opacos, sem consultar `neon_auth`, Data API, roles/helpers gerenciados ou outra semântica específica do serviço. O gate adicional Neon foi corretamente `SKIPPED` conforme `ADR-008`.

### US-AUTH-004

O readback da baseline confirmou:

```text
Auth provider: better_auth
Email/password: enabled
Email provider: shared
Sender email: auth@mail.myneon.app
Sender name: Neon Auth
Require email verification: false
```

A Story concluiu que o provider compartilhado do Neon Auth já atende desenvolvimento/non-production e o beta fechado inicial. Resend, SMTP customizado e domínio próprio foram retirados do escopo antes do merge; nenhuma configuração externa foi aplicada à baseline.

Durante a investigação inicial foi criada `verify-us-auth-004` (`br-plain-pond-aw5f59ia`). Ela herdou o mesmo provider `shared`, não recebeu SMTP externo e tornou-se housekeeping não bloqueante. Sua eventual exclusão exige autorização explícita.

Estado atual de branches:

```text
main / br-restless-cherry-awpcwy6r / ready / default
verify-us-auth-004 / br-plain-pond-aw5f59ia / ready / parent main
```

## 5. Credenciais e tooling

Nenhum valor real é versionado.

Contrato atual:

- `DATABASE_URL` — conexão pooled para runtime server-side futuro quando apropriado;
- `DATABASE_URL_UNPOOLED` — conexão PostgreSQL direta usada por migrations/testes/bootstrap operacional;
- `CALEIDA_DB_TARGET=ephemeral` — gate primário PostgreSQL descartável;
- `CALEIDA_DB_TARGET=neon-isolated` + `CALEIDA_NEON_BRANCH_ID` — gate Neon-specific quando necessário;
- `CALEIDA_DB_TARGET=baseline` + branch ID canônico + `CALEIDA_ALLOW_BASELINE_MIGRATIONS=YES` — promoção deliberada para a baseline;
- `NEON_AUTH_BASE_URL` — endpoint Auth branch-scoped fora do Git;
- `NEON_AUTH_COOKIE_SECRET` — secret server-only fora do Git;
- `CALEIDA_BOOTSTRAP_OWNER_USER_ID`, `CALEIDA_BOOTSTRAP_REASON` e `CALEIDA_ALLOW_OWNER_BOOTSTRAP=YES` — contrato operacional do bootstrap inicial futuro.

Neon API key, connection strings, Auth URLs reais, cookie secrets e credenciais owner/admin permanecem fora do Git e do browser.

O provider compartilhado do Neon Auth não exige credencial de e-mail adicional do Caleida nesta fase. Não existem `RESEND_API_KEY`, credenciais SMTP ou remetente próprio no contrato atual.

## 6. Estado integrado após US-AUTH-004

A baseline possui:

- Managed Better Auth no schema gerenciado `neon_auth`;
- provider de e-mail Auth `shared`;
- migration ledger `caleida_internal.schema_migrations`;
- `000001_migration_ledger.sql`;
- `000002_product_authorization.sql`;
- `000003_entry_control.sql`;
- `caleida_auth.user_roles`;
- `caleida_audit.role_changes`;
- `caleida_access.invitations`;
- `caleida_access.invitation_uses`;
- `caleida_access.access_requests`;
- `caleida_audit.entry_events`;
- funções controladas de autorização e entrada com acesso público revogado.

Checksums confirmados no ledger:

```text
000001_migration_ledger.sql
4d9a403d6bd074faeca04bf3e714fd8066e5e9f3ae7358bbc0f27a1faf2f14c2

000002_product_authorization.sql
0ba6981b583ac8ed693a2a6b6eabc0c84d12678bdf9953e845a239d6b48493c8

000003_entry_control.sql
503700640a81cf41dfe56a0abe70fc581b9c64d8e9ad6585cbcb55d4751b7c5f
```

Estado de dados confirmado imediatamente depois da promoção de `000003`:

```text
neon_auth.user: 0
caleida_auth.user_roles: 0
caleida_audit.role_changes: 0
caleida_access.invitations: 0
caleida_access.invitation_uses: 0
caleida_access.access_requests: 0
caleida_audit.entry_events: 0
```

Nenhum fixture do CI foi promovido. US-AUTH-004 não criou migration nem dados funcionais.

Deliberadamente **não** existem ainda:

- conta real do beta ou proprietário bootstrapado;
- convite real emitido;
- solicitação real de acesso;
- Neon Data API habilitada para o produto;
- Object Storage;
- projeto Neon de Production;
- SMTP customizado/domínio próprio/provedor externo de e-mail;
- confirmação obrigatória de e-mail (`require_email_verification` permanece `false` até US-AUTH-005);
- OAuth customizado;
- projeto/deployment Vercel do Caleida.

## 7. Production

`caleida-production` **não existe por decisão deliberada nesta fase**.

Production será um projeto Neon separado quando uma Story futura exigir ambiente real de produção. Non-production não deve compartilhar secrets, usuários ou dados reais com Production. A estratégia de e-mail deve ser reavaliada antes de abertura pública/Production; o provider compartilhado não é declarado solução definitiva para esse ambiente.
