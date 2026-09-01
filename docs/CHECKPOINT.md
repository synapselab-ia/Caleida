# Checkpoint — Caleida

**PROJECT_STATUS:** BLOCKED  
**CURRENT_PHASE:** Incremento 0 — Fundação executável  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `US-PLAT-004 — Configurar a fundação Neon de desenvolvimento`  
**LAST_COMPLETED_ISSUE:** `#14`  
**LAST_COMPLETED_PR:** `#15`  
**ACTIVE_TASK:** `US-PLAT-005 — Definir migrations, testes de banco e RLS`  
**ACTIVE_ISSUE:** `#16`  
**ACTIVE_BRANCH:** `infra/us-plat-005-db-foundation`  
**ACTIVE_PR:** `#17 — DRAFT`  
**NEXT_ACTION:** `US-PLAT-005 — revalidar branching Neon e concluir prova remota`  
**BLOCKERS:** `Neon create_branch: wrapper aceita camelCase, backend exige snake_case`  
**ON_HOLD:** none  
**MANUAL_ACTION_REQUIRED:** none

## Comando de continuação

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

A próxima sessão deve reutilizar Issue #16, branch `infra/us-plat-005-db-foundation` e PR #17. Não recriar a Story.

## Estado técnico

A aplicação, o ambiente local e a fundação Neon non-production existem. A baseline Neon continua:

```text
Projeto: caleida-nonprod
Project ID: patient-glade-95136440
PostgreSQL: 18
Baseline branch: main
Branch ID: br-restless-cherry-awpcwy6r
Database: neondb
```

A PR Draft #17 já implementa, sem merge:

- `database/migrations/000001_migration_ledger.sql` somente para infraestrutura interna;
- runner SQL por Node + `psql`, sem ORM/dependência npm adicional;
- checksums e detecção de migration histórica alterada;
- guardrails `CALEIDA_DB_TARGET` + `CALEIDA_NEON_BRANCH_ID`;
- recusa da baseline Neon como alvo `isolated`;
- promoção baseline com segundo sinal explícito;
- `database/tests/000001_migration_baseline.sql`;
- contrato futuro de testes RLS owner/non-owner/anonymous/ownership forjado;
- scripts `db:migrations:check`, `db:migrate`, `db:test`;
- documentação/`.env.example` sem secrets.

Nenhuma entidade funcional do produto foi criada.

## Verificação já concluída

Em runner GitHub Actions descartável:

- `npm ci`: `PASS`;
- `npm run db:migrations:check`: `PASS`;
- lint: `PASS`;
- typecheck: `PASS`;
- test: `PASS`;
- build: `PASS`;
- secrets: `PASS — nenhum`;
- workflow temporário na PR/main: `PASS — não integra`.

## Bloqueio remoto

A tentativa de criar `verify/us-plat-005-baseline` via conector Neon falha antes da criação do recurso. O wrapper expõe `projectId`/`branchName`, enquanto o backend rejeita essas chaves e solicita `project_id`/`branch_name`.

Por segurança:

- nenhum DDL foi executado na baseline Neon `main`;
- nenhuma migration foi promovida;
- `db:migrate`/`db:test` ainda não foram provados contra Neon real;
- PR #17 permanece Draft e não deve ser mergeada até esse gate passar.

## Próxima ação

1. revalidar `create_branch` no projeto `patient-glade-95136440`;
2. criar `verify/us-plat-005-baseline` se a ação estiver corrigida;
3. executar migrations e testes versionados apenas nessa branch;
4. inspecionar o estado técnico e remover a branch descartável;
5. só então concluir PR #17/Issue #16 e promover a próxima Story.

Se branching continuar indisponível, manter `BLOCKED`; não usar a baseline `main` como laboratório e não pedir ao usuário credenciais manuais apenas por conveniência.
