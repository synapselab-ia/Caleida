# Checkpoint - Caleida

**Status operacional:** `READY_TO_MERGE`  
**Fase:** Incremento 3 - Perfis e privacidade / EPIC-03  
**Story ativa:** `US-PRIV-001 - Materializar perfil básico user-scoped com Data API e RLS`

## Cursor

```text
LAST_COMPLETED_TASK: OPS-007 - Refinar EPIC-03: Perfis e privacidade
LAST_COMPLETED_ISSUE: #59
LAST_COMPLETED_PR: #60
LAST_COMPLETED_MERGE: f8424916dc1ecff5276451bab9c636cbcc57dc32

ACTIVE_TASK: US-PRIV-001 - Materializar perfil básico user-scoped com Data API e RLS
ACTIVE_ISSUE: #61
ACTIVE_BRANCH: feat/us-priv-001-profile-data-api-rls
ACTIVE_PR: #62

NEXT_ACTION: Executar o CI final do head documental reconciliado. Se e somente se permanecer em PASS, mergear PR #62, fechar Issue #61 como completed e reconciliar o checkpoint em main promovendo US-PRIV-002 como próxima Story. Não iniciar a implementação de US-PRIV-002 antes do merge de #62.

BLOCKERS: none
MANUAL_ACTION_REQUIRED: none
ON_HOLD: none
```

## Estado real da US-PRIV-001

### Git e CI

```text
Issue: #61 - open
PR: #62 - open / mergeable
Branch: feat/us-priv-001-profile-data-api-rls
Head funcional antes desta reconciliação documental: 14c5e5cf28901746c3dd1cc824c0e03d2f36d7b7
CI #278 / run 35012494049 / job 104527930487: SUCCESS
```

O CI funcional cobre runtime, manifest de migrations, lint, typecheck, testes, build Next.js, PostgreSQL 18 e `npm run verify:db`.

### Gate live obrigatório

O bloqueio por `NEON_API_KEY` deixou de existir. O secret passou a estar disponível no runtime sem exposição do valor e o probe acumulado executou a matriz real:

```text
Probe branch: probe/us-priv-001-live
Workflow: US-PRIV-001 live probe
Run #11: 35013092108
Job: 104529657936
Prepare isolated fixtures: SUCCESS
JWT/Data API/RLS matrix: SUCCESS
Cleanup synthetic fixtures: SUCCESS
```

A matriz usa duas identidades Managed Better Auth sintéticas A/B e anônimo e cobre ownership, leitura/alteração cruzada, forged ownership, transferência de ownership, DELETE e cleanup.

### Neon baseline promovida

```text
Project: caleida-nonprod / patient-glade-95136440
PostgreSQL: 18
Baseline: main / br-restless-cherry-awpcwy6r / ready
Baseline migrations: 000001-000010
000009 checksum: 33f33c043c1a94b8ec4d5df3edd2a1fcb6c08d13abb3e128771687a576120de1
000010 checksum: 4a47f6715566445bcbed2f56fb2a9a15d867c633e85e89375e487aaa3c1ec2be
Managed Better Auth: enabled
Data API: active
Schema exposto: caleida_profile
Default grants amplos: não usados
OpenAPI: disabled
```

Promotion probe:

```text
Workflow: US-PRIV-001 baseline promotion
Run #1: 35239947088
Job: 105265502696
Migration ledger check: SUCCESS
Data API create/config readback: SUCCESS
```

Readback direto no Neon confirmou:

- RLS habilitada e forçada em `caleida_profile.profiles`;
- somente policies owner `SELECT`, `INSERT` e `UPDATE`;
- `authenticated` possui somente `SELECT`, `INSERT` e `UPDATE` na tabela;
- `anonymous` e `PUBLIC` não possuem grants de tabela;
- nenhum `DELETE` normal;
- Data API expõe somente `caleida_profile`;
- diff de schema entre `verify-us-priv-001` e baseline: vazio.

A Data API cria o papel gerenciado `authenticated`. Como a promoção aplicou as migrations antes de provisionar o serviço, o bloco condicional de grants de `000009` não encontrou esse papel naquele instante. Depois do provisionamento, foram reaplicados exatamente os grants já versionados em `000009`, sem privilégio adicional, e o ACL readback ficou correto. Essa ordem operacional fica registrada em `docs/NEON_PLATFORM.md`.

## Implementação final

- `database/migrations/000009_profile_core.sql` cria schema, perfil, constraints, RLS, policies e grants mínimos;
- `database/migrations/000010_profile_identity_claim_fix.sql` faz a identidade derivar do `sub` de `request.jwt.claims`, como função `SECURITY INVOKER`, retornando `NULL` em claims ausentes ou inválidos;
- `database/tests/000010_profile_core_contract.mjs` cobre integridade, ownership, claims fail-closed, não-owner, anônimo e DELETE negado;
- `src/lib/profile/data-api.ts` usa JWT server-side e Data API, sem conexão owner no CRUD normal;
- `src/lib/profile/actions.ts` mantém validação server-side;
- `/account/profile` oferece setup/edição de `username` e `display_name` com estados de loading, erro, pending, sucesso e perfil ausente;
- `/app` possui acesso a `Meu perfil`;
- `.env.example` documenta somente o nome `NEON_DATA_API_URL`, sem endpoint real;
- `tests/profile-data-api-contract.test.mjs` fixa o boundary user-scoped.

O payload normal aceita somente `username` e `display_name`. `auth_user_id` e visibilidade não são campos controláveis pelo usuário nesta Story.

## Restrições vigentes

- não iniciar US-PRIV-002 antes do merge de #62;
- não criar Storage, catálogo, relações sociais ou Production Neon;
- deployment Vercel continua exclusivamente humano/manual;
- nenhum endpoint real, JWT, OTP, senha, API key ou connection string é persistido;
- branches históricas Git/Neon não são removidas sem autorização destrutiva explícita.
