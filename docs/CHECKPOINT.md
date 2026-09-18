# Checkpoint - Caleida

**Status operacional:** `IN_REVIEW`  
**Fase:** Incremento 3 - Perfis e privacidade / EPIC-03  
**Story ativa:** `US-PRIV-002 - Personalização segura do perfil`

## Cursor

```text
LAST_COMPLETED_TASK: US-PRIV-001 - Materializar perfil básico user-scoped com Data API e RLS
LAST_COMPLETED_ISSUE: #61
LAST_COMPLETED_PR: #62
LAST_COMPLETED_MERGE: 8aeb90cdc3b9b017aee3cefcd4e60b35f22d2758

ACTIVE_TASK: US-PRIV-002 - Personalização segura do perfil
ACTIVE_ISSUE: #63
ACTIVE_BRANCH: feat/us-priv-002-profile-personalization
ACTIVE_PR: #64

NEXT_ACTION: Executar o CI final documental da PR #64. Se permanecer em PASS, mergear a PR, validar o CI pós-merge, fechar a Issue #63 e promover somente US-PRIV-003. Não antecipar US-PRIV-004.

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


## US-PRIV-002 em andamento

```text
Issue: #63 - open
Branch: feat/us-priv-002-profile-personalization
PR: #64 - open
Base Git: main @ 23ab71a37b191146209e3f90ace5b729918267de
Migration nova: database/migrations/000011_profile_personalization.sql
```

Escopo implementado na branch até este checkpoint:

- biografia opcional limitada a 280 caracteres;
- cor de destaque restrita a tokens aprovados do design system;
- até 5 links HTTPS, sem credenciais embutidas e com normalização server-side;
- até 3 categorias culturais favoritas da taxonomia canônica;
- novos campos no mesmo perfil user-scoped já protegido por RLS;
- `auth_user_id` e `visibility` continuam fora do payload editável;
- nenhum avatar, banner, upload, Storage, obra favorita, rota pública ou relação social foi introduzido.

Gates concluídos até este checkpoint:

```text
CI inicial #283 / 35350388259 / job 105616855060: FAILURE no teste DB sintético
Correção: papel sintético passou a reproduzir EXECUTE dos validadores
CI corrigido #284 / 35350619301 / job 105617610955: SUCCESS
PostgreSQL 18 + npm run verify:db: PASS
Neon isolated verify-us-priv-002 / br-proud-wind-awycp0sd: PASS
Baseline migration 000011: promovida
Baseline ledger: 000001-000011
000011 checksum: 4773504fe2296e7ce141e8efcb027efd2218f2fd5c5598585bd97f5a4f55f95f
Schema diff isolated vs baseline: vazio
Data API baseline: active / somente caleida_profile
Browser/live intermediário: SKIPPED/deferred
```

Readback baseline preservou RLS forçada, somente policies owner SELECT/INSERT/UPDATE, `authenticated` somente com INSERT/SELECT/UPDATE na tabela e `anonymous` sem grant de tabela.

Nenhum deployment Vercel foi executado.
