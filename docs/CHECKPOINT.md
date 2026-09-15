# Checkpoint - Caleida

**Status operacional:** `MANUAL_ACTION_REQUIRED`  
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

NEXT_ACTION: Após configurar com segurança o secret GitHub Actions NEON_API_KEY, rerodar somente o job 104422466974 do workflow US-PRIV-001 live probe e executar a matriz JWT/Data API/RLS já preparada. Se e somente se o gate live passar, promover deliberadamente 000009 + Data API para a baseline non-production, fazer readback/CI final, reconciliar a documentação e concluir PR #62. Não iniciar US-PRIV-002.

BLOCKERS: Gate obrigatório com duas identidades Auth reais A/B + anônimo pela Data API não pode executar porque o repositório não possui NEON_API_KEY em GitHub Actions. Owner/BYPASSRLS não serve como substituto.
MANUAL_ACTION_REQUIRED: Configurar no repositório GitHub Actions um secret chamado NEON_API_KEY com acesso somente ao necessário no projeto Neon non-production. Não enviar a chave pelo chat.
ON_HOLD: none
```

## Estado real da US-PRIV-001

### Git/CI

```text
Issue: #61 - open
PR: #62 - open
Branch: feat/us-priv-001-profile-data-api-rls
Último gate funcional antes da reconciliação documental:
  CI #263 / run 34981001267 / job 104421003400 - SUCCESS
```

A Story já possui migration, contrato adversarial, boundary server-only da Data API e superfície privada `/account/profile`.

### Neon isolado

```text
Project: caleida-nonprod / patient-glade-95136440
PostgreSQL: 18
Baseline: main / br-restless-cherry-awpcwy6r / ready
Baseline migrations: 000001-000008
Baseline Data API: não provisionada

Isolated: verify-us-priv-001 / br-silent-rain-aw4fqrhg / ready
Managed Better Auth: enabled
Data API: active somente no isolated
Schema exposto: caleida_profile
Default grants amplos: não usados
Migration ledger isolated: 000001-000009
000009 checksum: 33f33c043c1a94b8ec4d5df3edd2a1fcb6c08d13abb3e128771687a576120de1
```

A baseline continua intacta. Nenhuma promoção foi executada.

## Implementação atual

- `database/migrations/000009_profile_core.sql`;
- `database/tests/000010_profile_core_contract.mjs`;
- `src/lib/profile/data-api.ts` com JWT server-side e Data API, sem conexão owner no CRUD normal;
- `src/lib/profile/actions.ts`;
- `src/components/profile/ProfileForm.tsx`;
- `/account/profile` com setup/edit, loading, erro, pending, sucesso e estado sem perfil;
- `/app` possui acesso para `Meu perfil`;
- `.env.example` documenta somente o nome `NEON_DATA_API_URL`, sem valor real;
- `tests/profile-data-api-contract.test.mjs` fixa o boundary user-scoped.

O payload normal aceita somente `username` e `display_name`. `auth_user_id` e visibilidade não são campos controláveis pelo usuário nesta Story.

## Gate Neon já comprovado

- RLS habilitada e forçada;
- somente policies `SELECT`, `INSERT`, `UPDATE` do owner;
- nenhum `DELETE` normal;
- `authenticated` não recebe acesso genérico ao schema gerenciado `auth`;
- wrapper `current_auth_user_id()` resolve apenas `auth.uid()` sob contexto controlado;
- sem JWT, identidade resolve `NULL` e nenhum perfil fica visível;
- anônimo sem `SELECT` e `authenticated` sem `DELETE`.

A prova isolada encontrou e corrigiu um defeito real: `authenticated` não podia chamar diretamente `auth.uid()` por falta de `USAGE` no schema gerenciado. A correção usa wrapper mínimo `SECURITY DEFINER`, sem abrir `auth` ao papel de aplicação.

## Gate live preparado e bloqueado

```text
Probe branch: probe/us-priv-001-live
Probe head: 5c034c42c455a2812cd6e4b1dd1674c66e0733be
Workflow: US-PRIV-001 live probe
Run #4: 34981435532
Job: 104422466974
Probe syntax: PASS
NEON_API_KEY preflight: FAIL-CLOSED / secret ausente
JWT/Data API matrix: SKIPPED
Cleanup: SUCCESS
```

O probe pronto cobre duas identidades sintéticas A/B e anônimo, ownership, leitura/alteração cruzada, forged ownership, transferência de ownership e `DELETE`, com cleanup automático de fixtures.

Nenhum endpoint Auth/Data API real, JWT, OTP, senha, API key ou connection string foi persistido.

Evidência detalhada: `docs/US_PRIV_001_VERIFICATION.md`.

## Restrições vigentes

- não promover `000009` enquanto o gate live não passar;
- não provisionar Data API na baseline antes desse gate;
- não mergear #62 como Story concluída;
- não iniciar US-PRIV-002;
- não criar Storage, catálogo, relações sociais ou Production Neon;
- deployment Vercel continua exclusivamente humano/manual;
- branches históricas Git/Neon não são removidas sem autorização destrutiva explícita.
