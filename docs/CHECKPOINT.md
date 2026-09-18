# Checkpoint - Caleida

**Status operacional:** `READY`  
**Fase:** Incremento 3 - Perfis e privacidade / EPIC-03  
**Story ativa:** nenhuma

## Cursor

```text
LAST_COMPLETED_TASK: US-PRIV-003 - Publicar perfil com visibilidade fail-closed
LAST_COMPLETED_ISSUE: #65
LAST_COMPLETED_PR: #66
LAST_COMPLETED_MERGE: 8541324800708eaecaff17c9492ef072142672a5

ACTIVE_TASK: none
ACTIVE_ISSUE: none
ACTIVE_BRANCH: none
ACTIVE_PR: none

NEXT_ACTION: Promover US-PRIV-004 - Implementar bloqueio com efeito real como próxima Story limitada. Criar Issue e branch próprias a partir da main atual, reler docs/INCREMENT_3_PLAN.md e implementar somente a relação direcional de bloqueio e seu enforcement real sobre leitura de perfil autenticada. Preservar a leitura pública anônima definida em US-PRIV-003, impedir auto-bloqueio e duplicidade, negar leitura entre identidades quando qualquer lado bloqueou o outro e não antecipar mute/restrict, US-PRIV-005, relações sociais funcionais, Storage, Production Neon ou deployment Vercel.

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


## Fechamento real da US-PRIV-002

### Git e CI

```text
Issue: #63 - closed / completed
PR: #64 - merged
Feature head final: 510f4ee461b9976d8f8311dbe3d9a9557c46cdd8
Merge: d19be4e881da6f8e3ba54a50ecef1c67fb1160e3
CI final da PR #289 / run 35351088749 / job 105619133550: SUCCESS
CI pós-merge main #290 / run 35351301592 / job 105619831900: SUCCESS
Open Issues/PRs após o fechamento: none
```

O CI final e o pós-merge cobriram runtime, manifest de migrations, lint, typecheck, testes, build Next.js, PostgreSQL 18 e `npm run verify:db`.

### Neon e baseline non-production

```text
Project: caleida-nonprod / patient-glade-95136440
PostgreSQL: 18
Baseline: main / br-restless-cherry-awpcwy6r / ready
Neon isolated: verify-us-priv-002 / br-proud-wind-awycp0sd / PASS
Baseline migrations: 000001-000011
000011 checksum: 4773504fe2296e7ce141e8efcb027efd2218f2fd5c5598585bd97f5a4f55f95f
Schema diff isolated vs baseline: vazio
Data API: active / somente caleida_profile
OpenAPI: disabled
```

Readback preservou RLS habilitada e forçada, somente as policies owner `SELECT`/`INSERT`/`UPDATE`, `authenticated` somente com `INSERT`, `SELECT` e `UPDATE` na tabela, `anonymous` sem grant de tabela e os validadores novos sem `EXECUTE` para `PUBLIC`.

### Implementação consolidada

- `database/migrations/000011_profile_personalization.sql` adiciona biografia, token de destaque, links e categorias culturais favoritas;
- biografia é limitada a 280 caracteres;
- token de destaque é restrito a `violet`, `magenta`, `blue`, `green` e `amber`;
- links são limitados a 5 URLs HTTPS sem credenciais embutidas;
- categorias favoritas são limitadas a 3 valores únicos da taxonomia canônica;
- validação existe no servidor e no banco;
- `auth_user_id` e `visibility` continuam fora do payload editável;
- nenhum avatar, banner, upload, Storage, obra favorita, rota pública ou relação social foi introduzido.

Browser/live intermediário permaneceu `SKIPPED/deferred` conforme o Verification Protocol e ADR-007. Nenhum deployment Vercel foi executado.


## Fechamento real da US-PRIV-003

### Git e CI

```text
Issue: #65 - closed / completed
PR: #66 - merged
Feature head final: ed821cf9bcf5ee77b9fbec57ba75b19c014d4458
Merge: 8541324800708eaecaff17c9492ef072142672a5
CI final da PR #296 / run 35355383381 / job 105633487565: SUCCESS
CI pós-merge main #297 / run 35355615237 / job 105634118124: SUCCESS
Open Issues/PRs após o fechamento: none
```

O CI final e o pós-merge cobriram runtime, manifest de migrations, lint, typecheck, testes, build Next.js, PostgreSQL 18 e `npm run verify:db`.

### Neon e baseline non-production

```text
Project: caleida-nonprod / patient-glade-95136440
PostgreSQL: 18
Baseline: main / br-restless-cherry-awpcwy6r / ready
Neon isolated: verify-us-priv-003 / br-noisy-firefly-aw06x1br / PASS
Baseline migrations: 000001-000012
000012 checksum: d8a1f4f7f973e12490cf205bd8ec96ce50c55e4dbc5dd09bb978f16dcfdf3713
Schema diff isolated vs baseline: vazio
Data API: active / somente caleida_profile
anonymous: SELECT somente nas seis colunas públicas
OpenAPI: disabled
```

Readback confirmou RLS habilitada e forçada, policies owner preservadas, policy pública somente de SELECT para `visibility = 'public'`, `authenticated` com INSERT/SELECT/UPDATE e `anonymous` sem grant amplo de tabela ou escrita. O papel gerenciado `anonymous` conseguiu executar a leitura pública permitida e recebeu `permission denied` ao tentar selecionar `auth_user_id`.

### Implementação consolidada

- `database/migrations/000012_profile_public_visibility.sql` introduz leitura pública fail-closed;
- owner pode escolher funcionalmente somente `public` ou `only_me`;
- `followers` e `connections` permanecem estados canônicos privados para terceiros;
- rota pública `/<username>` usa Server Component, loading, erro e not-found fail-closed;
- perfil privado e username inexistente compartilham ausência de dados públicos;
- projeção pública contém somente `username`, `display_name`, `biography`, `accent_token`, `links` e `favorite_categories`;
- nenhum bloqueio, mute/restrict, Storage ou relação social funcional foi antecipado.

Browser/live intermediário e probe HTTP externo direto permaneceram `SKIPPED/deferred` pelos motivos registrados em `docs/US_PRIV_003_VERIFICATION.md`. Nenhum deployment Vercel foi executado.
