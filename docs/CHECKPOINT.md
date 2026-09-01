# Checkpoint — Caleida

**PROJECT_STATUS:** READY  
**CURRENT_PHASE:** Incremento 0 — Fundação executável  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `US-PLAT-008 — Preparar hosting Vercel para release manual`  
**LAST_COMPLETED_ISSUE:** `#24`  
**LAST_COMPLETED_PR:** `#25`  
**ACTIVE_TASK:** none  
**ACTIVE_ISSUE:** none  
**ACTIVE_BRANCH:** none  
**ACTIVE_PR:** none  
**NEXT_ACTION:** `US-PLAT-009 — Separar variáveis por ambiente`  
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

Permanece:

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

## Hosting Vercel preparado

Existe agora no Git:

```text
vercel.json
docs/VERCEL_RELEASE.md
tests/vercel-config-contract.test.mjs
```

Guardrail canônico:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "git": {
    "deploymentEnabled": false
  }
}
```

Estado operacional verificado em `US-PLAT-008`:

- `git.deploymentEnabled: false` revalidado contra documentação oficial Vercel em 01/09/2026;
- a chave legada `github.enabled` não é utilizada;
- `.vercel/` permanece ignorado pelo Git;
- a conta Vercel conectada não possui projeto Caleida;
- nenhum projeto Caleida foi conectado/importado;
- nenhum Preview ou Production foi criado;
- nenhum deploy hook foi criado;
- nenhum `VERCEL_TOKEN` foi introduzido no CI;
- release continua exclusivamente humana/manual conforme `ADR-007`;
- `docs/VERCEL_RELEASE.md` registra que o primeiro deployment de um projeto Vercel novo é Production mesmo sem `--prod`, exigindo decisão humana deliberada antes da primeira publicação.

## Verificação de US-PLAT-008

Issue `#24`, PR `#25`.

No head `c967a544d0861647f4673eedd06101e3ec7d2555`, workflow permanente `CI`, run `33547497622`:

- workflow/sintaxe: `PASS`;
- checkout/setup Node: `PASS`;
- Node `24.20.0`: `PASS`;
- npm `11.19.0`: `PASS`;
- `npm ci`: `PASS`;
- `npm run verify`: `PASS`;
- teste do guardrail Vercel: `PASS` dentro do gate de testes;
- PostgreSQL server 18.x: `PASS`;
- `npm run verify:db`: `PASS`;
- CI sem superfície de deployment: `PASS`;
- secrets/tokens/deploy hooks novos: `PASS — nenhum`;
- gate Neon-specific: `SKIPPED — Story não toca comportamento gerenciado do Neon`;
- deployment Vercel: `SKIPPED/PROIBIDO — nenhum deployment executado`;
- verificação local no runner da sessão: `BLOCKED — ambiente sem resolução de github.com`; o CI permanente executou os gates canônicos com sucesso.

O head documental final da PR deve possuir CI `PASS` antes do merge; esse run posterior é evidência adicional e não exige reabrir o checkpoint apenas para registrar seu ID.

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

Nenhuma migration, entidade funcional ou política RLS foi alterada em `US-PLAT-008`.

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

Nenhuma mudança Neon foi necessária em `US-PLAT-008`.

Ainda não existe:

- projeto Neon Production;
- schema funcional de produto na baseline Neon;
- Neon Auth/Data API implementados;
- Object Storage escolhido;
- integração da aplicação com banco;
- projeto/conexão Vercel para o Caleida;
- deployment Vercel do Caleida.

## Próxima ação — US-PLAT-009

Executar somente:

> `US-PLAT-009 — Separar variáveis por ambiente`

A próxima Story deve separar os contratos de configuração para local, non-production/staging e Production, sem versionar secrets, sem antecipar integrações funcionais e sem executar deployment. O escopo refinado está em `docs/EXECUTION_PLAN.md`.
