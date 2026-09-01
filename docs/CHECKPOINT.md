# Checkpoint — Caleida

**PROJECT_STATUS:** READY  
**CURRENT_PHASE:** Incremento 0 — Fundação executável  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `US-PLAT-005 — Definir migrations, testes de banco e RLS`  
**LAST_COMPLETED_ISSUE:** `#16`  
**LAST_COMPLETED_PR:** `#17`  
**ACTIVE_TASK:** none  
**ACTIVE_ISSUE:** none  
**ACTIVE_BRANCH:** none  
**ACTIVE_PR:** none  
**NEXT_ACTION:** `US-PLAT-006 — Configurar validações automatizadas`  
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
- lint, typecheck, test e build executáveis.

### Banco versionado

Existe agora:

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

O tooling usa Node + `psql`, sem ORM introduzido apenas para migrations.

Contratos principais:

- migrations ordenadas e imutáveis após aplicação;
- SHA-256 detecta migration histórica alterada;
- `db:migrations:check` valida manifesto sem banco;
- `db:migrate` aplica apenas a URL direta fornecida pelo ambiente;
- `db:test` executa a suíte SQL;
- `CALEIDA_DB_TARGET=ephemeral` é o gate PostgreSQL portável;
- `CALEIDA_DB_TARGET=neon-isolated` exige branch Neon descartável quando a mudança for Neon-specific;
- baseline Neon exige branch ID canônico + `CALEIDA_ALLOW_BASELINE_MIGRATIONS=YES`;
- `db:test` nunca aceita baseline.

Nenhuma entidade funcional de catálogo, biblioteca, perfil ou social foi criada.

## Decisão arquitetural de US-PLAT-005

`ADR-008 — PostgreSQL efêmero como gate primário de migrations e RLS` foi aceito.

Neon continua a plataforma canônica conforme `ADR-005`.

A verificação de banco agora distingue:

1. **PostgreSQL portável:** PostgreSQL descartável da mesma versão major do Neon canônico; atual = PostgreSQL 18.
2. **Neon-specific:** branch Neon descartável adicional quando a mudança depender de Auth/Data API, roles/permissões/extensões ou outro comportamento específico do serviço.

O defeito atual do conector de branching Neon fica registrado como limitação da integração, mas não bloqueia SQL PostgreSQL portável. A baseline Neon `main` continua protegida e não foi usada como laboratório.

## Verificação de US-PLAT-005

Em GitHub Actions descartável com service container `postgres:18`:

- PostgreSQL server 18.x: `PASS`;
- `npm ci`: `PASS`;
- `npm run db:migrations:check`: `PASS`;
- primeira aplicação de `db:migrate`: `PASS`;
- `db:test`: `PASS`;
- segunda aplicação de `db:migrate` / ledger sem duplicação: `PASS`;
- reconstrução do banco do zero + migrations + testes: `PASS`;
- `npm run lint`: `PASS`;
- `npm run typecheck`: `PASS`;
- `npm test`: `PASS`;
- `npm run build`: `PASS`;
- secrets reais: `PASS — nenhum`;
- workflow descartável na PR/main: `PASS — não integra`;
- gate Neon-specific: `SKIPPED — a migration ledger usa somente primitives PostgreSQL portáveis`;
- DDL na baseline Neon `main`: `SKIPPED — não necessário nesta Story`;
- Production/Vercel/deployment: `SKIPPED — fora do escopo`.

A primeira tentativa do gate PostgreSQL revelou um defeito real no runner (`PGDATABASE` recebia uma URL completa). O runner foi corrigido para usar `psql --dbname` e redigir a URL em mensagens de erro; a segunda execução passou integralmente.

## Neon non-production

O recurso remoto continua:

```text
Projeto: caleida-nonprod
Project ID: patient-glade-95136440
Região: aws-us-east-1
PostgreSQL: 18
Baseline branch: main
Branch ID: br-restless-cherry-awpcwy6r
Database: neondb
```

Ainda não existe:

- projeto Neon Production;
- schema funcional de produto na baseline Neon;
- Neon Auth/Data API implementados;
- Object Storage escolhido;
- integração da aplicação com banco;
- CI permanente;
- projeto/conexão Vercel da execução canônica;
- deployment.

## Próxima ação — US-PLAT-006

Executar somente:

> `US-PLAT-006 — Configurar validações automatizadas`

A próxima Story deve consolidar os gates técnicos em comandos reproduzíveis do repositório, sem criar CI permanente (`US-PLAT-007`) e sem deployment.
