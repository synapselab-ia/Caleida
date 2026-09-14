# Checkpoint - Caleida

**Status operacional:** `IN_PROGRESS`  
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
ACTIVE_PR: none

NEXT_ACTION: Concluir somente US-PRIV-001: passar gates PostgreSQL 18 e Neon-specific, promover somente após evidência em PASS, reconciliar documentação e não iniciar US-PRIV-002.

BLOCKERS: none
MANUAL_ACTION_REQUIRED: none
ON_HOLD: none
```

## Execução atual - US-PRIV-001

Estado real recuperado em 14/09/2026:

- `main` de partida: `f4240e3a8441bd863a5965b40f39dbe5fc74cbd7`;
- CI integrada de partida: `#251` / run `34866463895` - `SUCCESS`;
- antes da Story não havia Issue ou PR aberta;
- Issue ativa: `#61`;
- branch Git ativa: `feat/us-priv-001-profile-data-api-rls`;
- Neon non-production: `caleida-nonprod`, PostgreSQL 18;
- baseline Neon: `main` / `br-restless-cherry-awpcwy6r` / `ready`;
- branch Neon isolada: `verify-us-priv-001` / `br-silent-rain-aw4fqrhg` / `ready`;
- Managed Better Auth: disponível na branch isolada;
- Data API da baseline: não provisionada no início da Story;
- Data API isolada: provisionada sem grants automáticos e restrita ao schema de perfil após a migration;
- Production Neon: não provisionada;
- Storage: não adotado.

## Mudança técnica em construção

- `database/migrations/000009_profile_core.sql` cria o primeiro domínio user-scoped do Caleida;
- `caleida_profile.profiles` usa UUID Auth como ownership e `only_me` como visibilidade padrão;
- username é normalizado, case-insensitive unique, route-safe e bloqueia nomes reservados;
- RLS nasce habilitada e forçada;
- SELECT/INSERT/UPDATE exigem ownership; não existe policy de DELETE;
- grants normais são limitados ao papel `authenticated` quando esse papel existe;
- helper de identidade falha fechado quando `auth.uid()` não está disponível;
- `database/tests/000010_profile_core_contract.mjs` cobre integridade e casos adversariais no PostgreSQL 18 descartável.

## Limites preservados

- nenhum perfil público nesta Story;
- nenhuma relação social, bloqueio, catálogo ou favorito;
- nenhum avatar/banner ou Storage;
- nenhuma exclusão de conta;
- nenhuma Production Neon;
- nenhum deployment Vercel;
- nenhum secret, token, Auth URL real ou connection string versionado.

## Plano canônico do Incremento 3

Arquivo: `docs/INCREMENT_3_PLAN.md`.

```text
US-PRIV-001 - perfil básico user-scoped + Data API/RLS       EM ANDAMENTO
  ↓
US-PRIV-002 - personalização segura do perfil                A FAZER
  ↓
US-PRIV-003 - rota pública + visibilidade                     A FAZER
  ↓
US-PRIV-004 - bloqueio com efeito real                        A FAZER
  ↓
US-PRIV-005 - desativação e reativação                        A FAZER
  ↓
US-PRIV-006 - solicitação/cancelamento + export               A FAZER
  ↓
US-PRIV-007 - finalização segura da exclusão                  A FAZER
  ↓
US-PRIV-008 - validação integrada + fechamento                A FAZER
```

Não promover `US-PRIV-002` antes do fechamento verificável desta Story.
