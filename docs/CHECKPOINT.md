# Checkpoint — Caleida

**PROJECT_STATUS:** READY  
**CURRENT_PHASE:** Incremento 0 — Fundação executável  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `US-PLAT-007 — Configurar integração contínua`  
**LAST_COMPLETED_ISSUE:** `#22`  
**LAST_COMPLETED_PR:** `#23`  
**ACTIVE_TASK:** none  
**ACTIVE_ISSUE:** none  
**ACTIVE_BRANCH:** none  
**ACTIVE_PR:** none  
**NEXT_ACTION:** `US-PLAT-008 — Preparar hosting Vercel para release manual`  
**BLOCKERS:** none  
**ON_HOLD:** none  
**MANUAL_ACTION_REQUIRED:** none

## Comando de continuação

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

Recupere o estado real no GitHub e siga os documentos canônicos. Não refaça Stories concluídas.

## Estado técnico atual

### Aplicação

- Next.js `16.3.3` / React `19.2.8`;
- TypeScript strict;
- Tailwind CSS 4;
- Node `24.20.0` / npm `11.19.0`;
- lockfile canônico;
- aplicação ainda inicia sem banco/secret externo.

### Verificação canônica

```text
npm run verify
  db:migrations:check
  → lint
  → typecheck
  → test
  → build

npm run verify:db
  db:migrate
  → db:test
```

`tests/verification-contract.test.mjs` fixa a composição dos comandos.

### CI permanente

Existe agora:

```text
.github/workflows/ci.yml
```

Contrato:

- `pull_request` para `main`;
- `push` na `main`;
- `permissions: contents: read`;
- `actions/checkout@v7`;
- `actions/setup-node@v7` lendo `.nvmrc`;
- Node `24.20.0` e npm `11.19.0` validados;
- `npm ci`;
- `npm run verify`;
- service container `postgres:18`;
- PostgreSQL server 18.x confirmado;
- `CALEIDA_DB_TARGET=ephemeral`;
- `npm run verify:db`;
- nenhum secret externo;
- nenhum cache enquanto não houver benefício demonstrado;
- nenhum Vercel/CD/deployment.

`docs/CI.md` é o runbook operacional do CI. `tests/ci-contract.test.mjs` protege o contrato mínimo e a ausência de superfície de deployment.

## Verificação de US-PLAT-007

PR `#23`, workflow permanente `CI`, run inicial `33545687786`:

- workflow/sintaxe aceitos pelo GitHub: `PASS`;
- service container PostgreSQL: `PASS`;
- checkout/setup Node: `PASS`;
- Node `24.20.0`: `PASS`;
- npm `11.19.0`: `PASS`;
- `npm ci`: `PASS`;
- `npm run verify`: `PASS`;
- PostgreSQL server 18.x: `PASS`;
- `npm run verify:db`: `PASS`;
- permissões mínimas: `PASS — contents: read`;
- secrets externos: `PASS — nenhum`;
- Neon credential: `PASS — nenhuma`;
- Vercel/deployment/CD: `PASS — ausente`.

A revisão final deve considerar também o run disparado pelo head documental final da PR antes do merge.

## Banco versionado

Permanece sem mudança funcional:

```text
database/
  migrations/
    000001_migration_ledger.sql
  scripts/
    lib.mjs
    migrate.mjs
    test.mjs
    validate-migrations.mjs
  tests/
    000001_migration_baseline.sql
    000002_postgres_18.sql
```

Nenhuma migration ou entidade funcional foi alterada em `US-PLAT-007`.

## Neon non-production

Permanece:

```text
Projeto: caleida-nonprod
Project ID: patient-glade-95136440
Região: aws-us-east-1
PostgreSQL: 18
Branches: 1
Baseline branch: main
Branch ID: br-restless-cherry-awpcwy6r
Database: neondb
```

Nenhuma credencial Neon é necessária para o CI portável.

Ainda não existe:

- projeto Neon Production;
- schema funcional de produto na baseline Neon;
- Neon Auth/Data API implementados;
- Object Storage escolhido;
- integração da aplicação com banco;
- projeto/conexão Vercel da execução canônica;
- deployment.

## Próxima ação — US-PLAT-008

Executar somente:

> `US-PLAT-008 — Preparar hosting Vercel para release manual`

A próxima Story deve preparar `vercel.json`/guardrails e runbook de release manual conforme `ADR-007`, sem conectar/publicar projeto e sem executar Preview ou Production.
