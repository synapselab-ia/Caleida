# Checkpoint — Caleida

**PROJECT_STATUS:** READY  
**CURRENT_PHASE:** Incremento 0 — Fundação executável  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `US-PLAT-006 — Configurar validações automatizadas`  
**LAST_COMPLETED_ISSUE:** `#20`  
**LAST_COMPLETED_PR:** `#21`  
**ACTIVE_TASK:** none  
**ACTIVE_ISSUE:** none  
**ACTIVE_BRANCH:** none  
**ACTIVE_PR:** none  
**NEXT_ACTION:** `US-PLAT-007 — Configurar integração contínua`  
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

O repositório possui agora duas entradas explícitas:

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

Contratos:

- `verify` é o gate padrão e não exige banco nem credencial externa;
- a composição usa `&&` e interrompe no primeiro gate inválido;
- `verify:db` exige ambiente PostgreSQL já provisionado e respeita os guardrails de `CALEIDA_DB_TARGET`;
- PostgreSQL portável usa PostgreSQL 18 descartável conforme `ADR-008`;
- gate Neon-specific permanece adicional somente quando a mudança depender do serviço;
- `tests/verification-contract.test.mjs` fixa a ordem/separação dos comandos;
- nenhum framework ou dependência de orquestração foi introduzido;
- CI permanente ainda **não existe**; pertence à `US-PLAT-007`.

### Banco versionado

Permanece:

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

Nenhuma migration ou entidade funcional foi alterada em `US-PLAT-006`.

## Verificação de US-PLAT-006

GitHub Actions descartável — run `33544713097` — usando Node `24.20.0`, npm `11.19.0` e service container `postgres:18`:

- `npm ci`: `PASS`;
- `npm run verify`: `PASS`;
- `db:migrations:check`: `PASS` como parte de `verify`;
- lint: `PASS` como parte de `verify`;
- typecheck: `PASS` como parte de `verify`;
- testes Node, incluindo contrato de verificação: `PASS` como parte de `verify`;
- build: `PASS` como parte de `verify`;
- PostgreSQL server 18.x: `PASS`;
- `npm run verify:db`: `PASS`;
- secrets reais: `PASS — nenhum`;
- workflow descartável na branch/PR final: `PASS — branch de verificação resetada para o head da Story`;
- workflow permanente em `.github/workflows`: `SKIPPED — pertence à US-PLAT-007`;
- Neon-specific gate: `SKIPPED — nenhuma mudança dependente de Neon`;
- Neon non-production: `SKIPPED — nenhuma alteração remota necessária`;
- Vercel/deployment: `SKIPPED — fora do escopo`.

## Neon non-production

Estado remoto revalidado antes de `US-PLAT-006`:

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

Nenhuma alteração Neon foi necessária nesta Story.

Ainda não existe:

- projeto Neon Production;
- schema funcional de produto na baseline Neon;
- Neon Auth/Data API implementados;
- Object Storage escolhido;
- integração da aplicação com banco;
- CI permanente;
- projeto/conexão Vercel da execução canônica;
- deployment.

## Próxima ação — US-PLAT-007

Executar somente:

> `US-PLAT-007 — Configurar integração contínua`

A próxima Story deve materializar GitHub Actions permanente usando `npm run verify` e PostgreSQL 18 + `npm run verify:db`, com permissões mínimas e **sem qualquer CD/deployment Vercel**.
