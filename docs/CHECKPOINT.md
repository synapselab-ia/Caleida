# Checkpoint — Caleida

**PROJECT_STATUS:** READY  
**CURRENT_PHASE:** Incremento 0 — Fundação executável  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `US-PLAT-009 — Separar variáveis por ambiente`  
**LAST_COMPLETED_ISSUE:** `#26`  
**LAST_COMPLETED_PR:** `#27`  
**ACTIVE_TASK:** none  
**ACTIVE_ISSUE:** none  
**ACTIVE_BRANCH:** none  
**ACTIVE_PR:** none  
**NEXT_ACTION:** `US-PLAT-010 — Validar o ciclo técnico de entrega`  
**BLOCKERS:** none  
**ON_HOLD:** none  
**MANUAL_ACTION_REQUIRED:** none

## Comando de continuação

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

Recupere o estado real no GitHub e siga os documentos canônicos. Não refaça Stories concluídas.

## Estado técnico atual

### Aplicação e gates

- Next.js `16.3.3` / React `19.2.8`;
- TypeScript strict;
- Tailwind CSS 4;
- Node `24.20.0` / npm `11.19.0`;
- `npm run verify` executa `db:migrations:check → lint → typecheck → test → build`;
- `npm run verify:db` executa `db:migrate → db:test`;
- CI permanente em `.github/workflows/ci.yml` usa PostgreSQL 18 efêmero e não possui CD;
- aplicação ainda inicia sem banco ou secret externo.

### Contrato de ambientes

Existe agora:

```text
.env.example
docs/ENVIRONMENTS.md
tests/environment-contract.test.mjs
```

Contrato canônico:

```text
local
  ↓ somente recursos locais, descartáveis ou non-production
non-production / staging
  ↓ isolado de Production
Production
  ↓ recursos e secrets dedicados quando provisionados
```

Regras fixadas em `US-PLAT-009`:

- `.env.example` é deliberadamente não executável e contém somente declarações comentadas/documentação;
- `.env*` continua ignorado pelo Git, exceto `.env.example`;
- `DATABASE_URL` é reservado ao runtime server-side pooled futuro;
- `DATABASE_URL_UNPOOLED` permanece a conexão direta server-only do tooling de banco;
- `CALEIDA_DB_TARGET` continua limitado aos alvos implementados: `ephemeral`, `neon-isolated` e `baseline`;
- `baseline` significa somente a baseline Neon non-production e não pode ser reinterpretado como Production;
- o tooling atual não possui alvo de migration Production;
- nenhuma variável `NEXT_PUBLIC_*` é necessária no estado atual;
- connection strings, tokens e secrets nunca usam `NEXT_PUBLIC_*`;
- desenvolvimento local e futuro Preview usam somente recursos non-production/descartáveis;
- Production não reutiliza credenciais non-production.

`docs/LOCAL_DEVELOPMENT.md` e `docs/VERCEL_RELEASE.md` apontam para `docs/ENVIRONMENTS.md`.

## Estado externo verificado em US-PLAT-009

### Neon

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

- `caleida-production`: não provisionado;
- Neon Auth/Data API: não implementados;
- Object Storage: não escolhido;
- nenhuma branch/recurso Neon foi criado ou alterado em `US-PLAT-009`.

### Vercel

- a conta conectada continua sem projeto Caleida;
- nenhum Project Linking Caleida existe;
- nenhum secret/variável Caleida foi configurado remotamente;
- nenhum Preview ou Production foi executado;
- `vercel.json` continua com `git.deploymentEnabled: false`;
- release continua exclusivamente humana/manual conforme `ADR-007`.

## Verificação de US-PLAT-009

Issue `#26`, PR `#27`.

No head de implementação `5b91c07d665b73a249a07665612bd4548fa888a1`, workflow permanente `CI`, run `33549192981`:

- checkout/setup Node: `PASS`;
- Node `24.20.0`: `PASS`;
- npm `11.19.0`: `PASS`;
- `npm ci`: `PASS`;
- `npm run verify`: `PASS`;
- contrato de ambientes: `PASS` dentro da suíte `node:test`;
- PostgreSQL server 18.x: `PASS`;
- `npm run verify:db`: `PASS`;
- `.gitignore` mantém somente `.env.example` versionável entre `.env*`: `PASS`;
- CI sem repository secrets externos e sem deployment surface: `PASS`;
- diff sem migrations, dependências ou workflow alterados: `PASS`;
- gate Neon-specific: `SKIPPED — Story não altera comportamento gerenciado do Neon`;
- deployment Vercel: `SKIPPED/PROIBIDO — nenhum deployment executado`.

O head documental final da PR #27 deve possuir CI `PASS` antes do merge; esse run posterior é evidência adicional e não exige novo commit apenas para registrar seu ID.

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

Nenhuma migration, entidade funcional ou política RLS foi alterada em `US-PLAT-009`.

## Próxima ação — US-PLAT-010

Executar somente:

> `US-PLAT-010 — Validar o ciclo técnico de entrega`

A próxima Story deve validar o ciclo real `Issue → branch → CI → PR → review → merge`, provar que ele permanece sem deployment automático e fechar a evidência técnica do Incremento 0 sem inventar feature ou infraestrutura. O escopo refinado está em `docs/EXECUTION_PLAN.md`.
