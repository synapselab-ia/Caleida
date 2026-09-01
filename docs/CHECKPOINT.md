# Checkpoint — Caleida

**PROJECT_STATUS:** READY  
**CURRENT_PHASE:** Incremento 0 — Fundação executável  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `US-PLAT-004 — Configurar a fundação Neon de desenvolvimento`  
**LAST_COMPLETED_ISSUE:** `#14`  
**LAST_COMPLETED_PR:** `#15`  
**ACTIVE_TASK:** none  
**ACTIVE_ISSUE:** none  
**ACTIVE_BRANCH:** none  
**NEXT_ACTION:** `US-PLAT-005 — Definir migrations, testes de banco e RLS`  
**BLOCKERS:** none  
**ON_HOLD:** none  
**MANUAL_ACTION_REQUIRED:** none

## Comando de continuação

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

Recupere o estado pelo GitHub e pelos documentos canônicos. Não peça ao usuário contexto já disponível.

## Estado técnico atual

A aplicação, o ambiente local e a fundação Neon non-production existem.

### Aplicação/local

- Next.js `16.3.3` com App Router em `src/app`;
- React/React DOM `19.2.8`;
- TypeScript strict;
- Tailwind CSS 4 via PostCSS;
- ESLint CLI com `eslint-config-next`;
- Node `24.20.0` fixado em `.nvmrc`;
- npm `11.19.0` declarado como package manager;
- `package-lock.json` canônico;
- scripts `dev`, `lint`, `typecheck`, `test`, `build`;
- `docs/LOCAL_DEVELOPMENT.md` com clone, instalação, execução, variáveis, gates e troubleshooting;
- `.env.example` sem secrets, com nomes reservados para conexões Neon futuras.

### Neon non-production

```text
Projeto: caleida-nonprod
Project ID: patient-glade-95136440
Região: aws-us-east-1
PostgreSQL: 18
Baseline branch: main
Branch ID: br-restless-cherry-awpcwy6r
Database default: neondb
```

O branch Neon `main` é a baseline canônica non-production/staging. Não confundir com a branch Git `main`.

Ainda não existe:

- projeto Neon Production;
- schema/migrations/RLS de produto;
- Neon Auth/Data API implementados;
- Object Storage escolhido;
- integração da aplicação com banco;
- CI permanente;
- projeto/conexão Vercel da execução canônica;
- deployment.

## Verificação de US-PLAT-004

Via Neon conectado e revisão Git:

- organização/projeto `caleida-nonprod`: `PASS`;
- projeto remoto identificável e pronto: `PASS`;
- PostgreSQL 18 / `aws-us-east-1`: `PASS`;
- branch Neon `main` pronta como baseline non-production/staging: `PASS`;
- nenhuma operação SQL/migration executada: `PASS`;
- nenhum Neon Auth/Data API/Object Storage provisionado: `PASS`;
- Production não provisionada: `PASS`;
- `DATABASE_URL`/`DATABASE_URL_UNPOOLED` documentadas apenas por nome/placeholder: `PASS`;
- secrets/connection strings reais no Git: `PASS — nenhum`;
- Vercel/deployment: `SKIPPED — fora do escopo`;
- lint/typecheck/test/build: `SKIPPED — nenhuma alteração de aplicação/dependência`;
- branch adicional `staging`: `SKIPPED — branch default main adotada como baseline canônica`;
- branch descartável de prova: `BLOCKED — ação de branching do conector Neon apresenta inconsistência de schema nesta sessão`.

O último item não bloqueia a conclusão da fundação non-production, mas é uma **precondição de segurança da US-PLAT-005**. Antes de qualquer DDL destrutivo, a próxima Story deve revalidar branching. Se não conseguir criar branch isolada, deve ficar `BLOCKED`; não aplicar migrations de teste diretamente na baseline `main`.

## Plataforma vigente

```text
Next.js / React / TypeScript
→ Neon Auth
→ Neon Data API
→ Neon Postgres
→ PostgreSQL RLS
```

Banco segue `ADR-004`; Neon segue `ADR-005`; Storage segue `ADR-006`; deployment segue `ADR-007`.

O estado operacional remoto do Neon está em `docs/NEON_NONPROD.md`.

## Próxima ação — US-PLAT-005

Executar somente:

> `US-PLAT-005 — Definir migrations, testes de banco e RLS`

A especificação executável está em `docs/EXECUTION_PLAN.md`.

Primeiro revalidar a criação de branch Neon descartável. Não usar a baseline `main` como laboratório destrutivo se o tooling continuar indisponível.

Não provisionar Production, Vercel, deployment ou features de negócio nesta Story.
