# Checkpoint — Caleida

**PROJECT_STATUS:** IN_PROGRESS  
**CURRENT_PHASE:** Incremento 0 — Fundação executável  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `US-PLAT-009 — Separar variáveis por ambiente`  
**LAST_COMPLETED_ISSUE:** `#26`  
**LAST_COMPLETED_PR:** `#27`  
**ACTIVE_TASK:** `US-PLAT-010 — Validar o ciclo técnico de entrega`  
**ACTIVE_ISSUE:** `#28`  
**ACTIVE_BRANCH:** `verify/us-plat-010-delivery-cycle`  
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

### Banco versionado

Permanece sem mudança funcional em `US-PLAT-010`:

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

Nenhuma migration, entidade funcional ou política RLS foi adicionada nesta Story.

### Contrato de ambientes e deployment

- `.env.example` continua deliberadamente não executável e sem valores reais;
- `DATABASE_URL`/`DATABASE_URL_UNPOOLED` permanecem server-only;
- nenhuma variável `NEXT_PUBLIC_*` é necessária;
- `vercel.json` mantém `git.deploymentEnabled: false`;
- deployment continua exclusivamente humano/manual conforme `ADR-007`;
- CI permanece sem Vercel, deploy hook, token de publicação ou CD.

## US-PLAT-010 — estado recuperado e pré-validação

Baseline antes da Story:

```text
main: 88dfde9abec1937c0366662a4ff34eeba0edf957
última Story: US-PLAT-009
última Issue: #26
última PR: #27
CI main: 33549799028 — PASS
```

A Story foi iniciada com:

```text
Issue: #28
Branch: verify/us-plat-010-delivery-cycle
Evidência: docs/INCREMENT_0_VALIDATION.md
```

### Neon verificado

```text
Projeto: caleida-nonprod
Project ID: patient-glade-95136440
Região: aws-us-east-1
PostgreSQL: 18
Branches: 1
Baseline: main / br-restless-cherry-awpcwy6r
```

- `caleida-production`: não provisionado;
- Neon Auth/Data API/Object Storage: não implementados;
- nenhum recurso Neon foi criado ou alterado nesta Story;
- gate Neon-specific: `SKIPPED — US-PLAT-010 não altera comportamento gerenciado do Neon`;
- gate PostgreSQL portável permanece obrigatório via CI.

### Vercel verificada antes da PR

- a conta/team conectada não possui projeto Caleida;
- nenhum Preview/Production do Caleida existe;
- `git.deploymentEnabled: false` foi revalidado contra documentação oficial corrente em 01/09/2026;
- nenhum deployment foi ou será executado por IA.

## Verificação pendente de US-PLAT-010

Ainda é necessário, nesta ordem operacional:

1. abrir PR da branch ativa;
2. obter CI permanente em `PASS` no head da PR, incluindo `npm run verify` e PostgreSQL 18 + `npm run verify:db`;
3. revisar diff completo, secrets, reviews/threads e mergeability;
4. confirmar ausência de projeto/deployment Caleida na Vercel durante a PR;
5. mergear somente o head verificado;
6. confirmar CI pós-merge na `main` em `PASS`;
7. confirmar Vercel pós-merge sem projeto/deployment Caleida;
8. reconciliar documentos canônicos e encerrar o Incremento 0 somente com todas as evidências satisfeitas.

## Próximo horizonte

O Project Design indica `EPIC-01 — Identidade e design system` após a fundação técnica, mas o backlog operacional está refinado somente até o Incremento 0.

Nenhuma feature futura será antecipada nesta Story. A próxima ação após o encerramento verificável de `US-PLAT-010` deve ser um refino limitado do próximo incremento antes de qualquer implementação funcional.
