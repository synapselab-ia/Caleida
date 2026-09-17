# Checkpoint - Caleida

**Status operacional:** `READY`  
**Fase:** Incremento 3 - Perfis e privacidade / EPIC-03  
**Story ativa:** nenhuma

## Cursor

```text
LAST_COMPLETED_TASK: US-PRIV-001 - Materializar perfil básico user-scoped com Data API e RLS
LAST_COMPLETED_ISSUE: #61
LAST_COMPLETED_PR: #62
LAST_COMPLETED_MERGE: 8aeb90cdc3b9b017aee3cefcd4e60b35f22d2758

ACTIVE_TASK: none
ACTIVE_ISSUE: none
ACTIVE_BRANCH: none
ACTIVE_PR: none

NEXT_ACTION: Promover US-PRIV-002 - Personalização segura do perfil como próxima Story limitada. Criar a Issue e branch próprias a partir da main atual, reler o escopo canônico em docs/INCREMENT_3_PLAN.md e implementar somente biografia, cor de destaque por tokens aprovados, links HTTPS permitidos e categorias culturais favoritas, preservando ownership e validação server-side/banco. Não antecipar avatar, banner, Storage, obras favoritas, perfil público ou relações sociais.

BLOCKERS: none
MANUAL_ACTION_REQUIRED: none
ON_HOLD: none
```

## Fechamento real da US-PRIV-001

### Git e CI

```text
Issue: #61 - closed / completed
PR: #62 - merged
Feature head final: ec644c1495644a74a281f08848224c43cc60daf7
Merge: 8aeb90cdc3b9b017aee3cefcd4e60b35f22d2758
CI final da PR #279 / run 35241013997 / job 105269156530: SUCCESS
CI pós-merge main #280 / run 35241229260 / job 105269874527: SUCCESS
Open Issues/PRs após o fechamento: none
```

O CI cobre runtime, manifest de migrations, lint, typecheck, testes, build Next.js, PostgreSQL 18 e `npm run verify:db`.

### Gate live obrigatório

```text
Probe branch: probe/us-priv-001-live
Workflow: US-PRIV-001 live probe
Run #11: 35013092108
Job: 104529657936
Prepare isolated fixtures: SUCCESS
JWT/Data API/RLS matrix: SUCCESS
Cleanup synthetic fixtures: SUCCESS
```

A matriz atravessou Managed Better Auth, JWT, Data API e RLS com duas identidades sintéticas A/B e anônimo, cobrindo ownership, leitura/alteração cruzada, forged ownership, transferência de ownership, DELETE negado e cleanup.

### Neon baseline promovida

```text
Project: caleida-nonprod / patient-glade-95136440
PostgreSQL: 18
Baseline: main / br-restless-cherry-awpcwy6r / ready
Baseline migrations: 000001-000010
Managed Better Auth: enabled
Data API: active
Schema exposto: caleida_profile
Default grants amplos: não usados
OpenAPI: disabled
```

Checksums promovidos:

```text
000009_profile_core.sql: 33f33c043c1a94b8ec4d5df3edd2a1fcb6c08d13abb3e128771687a576120de1
000010_profile_identity_claim_fix.sql: 4a47f6715566445bcbed2f56fb2a9a15d867c633e85e89375e487aaa3c1ec2be
```

Promotion probe:

```text
Workflow: US-PRIV-001 baseline promotion
Run #1: 35239947088
Job: 105265502696
Migration ledger check: SUCCESS
Data API create/config readback: SUCCESS
```

Readback confirmou RLS habilitada e forçada, somente policies owner `SELECT`/`INSERT`/`UPDATE`, `authenticated` somente com esses três privilégios na tabela, nenhum grant de tabela para `anonymous`/`PUBLIC`, nenhum `DELETE` normal, Data API expondo apenas `caleida_profile` e diff de schema vazio entre `verify-us-priv-001` e a baseline.

A Data API cria o papel gerenciado `authenticated`. Como as migrations foram aplicadas antes do provisionamento do serviço, os grants condicionais de `000009` foram reaplicados depois exatamente como versionados, sem privilégio adicional, e o ACL readback ficou correto.

## Implementação consolidada

- `database/migrations/000009_profile_core.sql` cria schema, perfil, constraints, RLS, policies e grants mínimos;
- `database/migrations/000010_profile_identity_claim_fix.sql` deriva identidade do `sub` de `request.jwt.claims` como `SECURITY INVOKER`, retornando `NULL` em claims ausentes ou inválidos;
- `database/tests/000010_profile_core_contract.mjs` cobre integridade, ownership, claims fail-closed, não-owner, anônimo e DELETE negado;
- `src/lib/profile/data-api.ts` usa JWT server-side e Data API, sem conexão owner no CRUD normal;
- `src/lib/profile/actions.ts` mantém validação server-side;
- `/account/profile` oferece setup/edição de `username` e `display_name` com estados reais de interface;
- `/app` possui acesso a `Meu perfil`;
- `.env.example` documenta somente o nome `NEON_DATA_API_URL`, sem endpoint real;
- `tests/profile-data-api-contract.test.mjs` fixa o boundary user-scoped.

O payload normal aceita somente `username` e `display_name`. `auth_user_id` e visibilidade não são controláveis pelo usuário nesta Story.

## Restrições vigentes

- uma Story limitada por vez;
- não criar Storage, catálogo, relações sociais ou Production Neon fora de Story própria;
- deployment Vercel continua exclusivamente humano/manual;
- nenhum endpoint real, JWT, OTP, senha, API key ou connection string é persistido;
- branches históricas Git/Neon não são removidas sem autorização destrutiva explícita.
