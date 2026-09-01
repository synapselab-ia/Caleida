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
**NEXT_ACTION:** `US-PLAT-005 — revalidar branching Neon e concluir prova remota da fundação de banco`  
**BLOCKERS:** `Neon create_branch: wrapper aceita camelCase, backend exige snake_case`  
**ON_HOLD:** none  
**MANUAL_ACTION_REQUIRED:** none

## Comando de continuação

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

A próxima sessão deve reutilizar Issue #16, branch `infra/us-plat-005-db-foundation` e PR #17. Não recriar a Story.

## Estado técnico confirmado

### Base já concluída

- aplicação Next.js/React/TypeScript reproduzível;
- ambiente local documentado;
- projeto Neon `caleida-nonprod` existente;
- baseline Neon `main` (`br-restless-cherry-awpcwy6r`) intacta;
- Production/Auth/Data API/Storage/Vercel continuam fora do escopo.

### US-PLAT-005 implementada na branch ativa

A PR Draft #17 contém:

- `database/migrations/000001_migration_ledger.sql` — somente infraestrutura técnica interna;
- runner SQL via Node + `psql`, sem ORM/dependência npm adicional;
- manifesto/checksums SHA-256 e detecção de migration aplicada alterada;
- guardrail `CALEIDA_DB_TARGET` + `CALEIDA_NEON_BRANCH_ID`;
- baseline Neon recusada como alvo `isolated`;
- promoção baseline exige `CALEIDA_ALLOW_BASELINE_MIGRATIONS=YES`;
- `database/tests/000001_migration_baseline.sql`;
- contrato futuro de testes RLS owner/non-owner/anonymous/ownership forjado;
- scripts npm `db:migrations:check`, `db:migrate`, `db:test`;
- documentação local e `.env.example` sem secrets.

Nenhuma entidade funcional de catálogo/biblioteca/perfil/social foi criada.

## Verificação já concluída

Em runner GitHub Actions descartável:

- `npm ci`: `PASS`;
- `npm run db:migrations:check`: `PASS`;
- `npm run lint`: `PASS`;
- `npm run typecheck`: `PASS`;
- `npm test`: `PASS`;
- `npm run build`: `PASS`;
- secrets no Git: `PASS — nenhum`;
- workflow de verificação na PR/main: `PASS — não integra`.

## Bloqueio remoto

A tentativa de criar `verify/us-plat-005-baseline` via conector Neon falha antes de criar recurso:

```text
wrapper: projectId / branchName
backend: project_id / branch_name
```

O contrato da ferramenta não permite enviar as chaves que o backend solicita.

Por segurança:

- nenhum DDL foi executado na baseline Neon `main`;
- nenhuma migration foi promovida;
- `db:migrate` e `db:test` ainda não foram provados contra Neon real;
- PR #17 permanece Draft e não deve ser mergeada enquanto esse gate não passar.

## Próxima ação — continuação de US-PLAT-005

1. revalidar `create_branch` no projeto `patient-glade-95136440`;
2. se funcionar, criar `verify/us-plat-005-baseline`;
3. obter a direct connection string da branch de forma segura/efêmera;
4. executar o runner versionado com `CALEIDA_DB_TARGET=isolated` e branch ID explícito;
5. executar `db:test` e inspecionar a baseline técnica;
6. limpar a branch descartável;
7. somente depois decidir promoção da migration versionada para a baseline non-production;
8. concluir docs/PR/Issue e promover a próxima Story.

Se `create_branch` continuar incompatível, manter `BLOCKED`; não usar a baseline `main` como laboratório e não pedir ao usuário para contornar com credenciais manuais apenas por conveniência.
