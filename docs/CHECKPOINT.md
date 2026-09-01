# Checkpoint — Caleida

**PROJECT_STATUS:** READY  
**CURRENT_PHASE:** Incremento 0 — Fundação executável  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `US-PLAT-003 — Configurar o ambiente local da aplicação`  
**LAST_COMPLETED_ISSUE:** `#12`  
**LAST_COMPLETED_PR:** `#13`  
**ACTIVE_TASK:** none  
**ACTIVE_ISSUE:** none  
**ACTIVE_BRANCH:** none  
**NEXT_ACTION:** `US-PLAT-004 — Configurar a fundação Neon de desenvolvimento`  
**BLOCKERS:** none  
**ON_HOLD:** none  
**MANUAL_ACTION_REQUIRED:** none

## Comando de continuação

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

Recupere o estado pelo GitHub e pelos documentos canônicos. Não peça ao usuário contexto já disponível.

## Estado técnico atual

A aplicação e o ambiente local mínimo estão reproduzíveis.

Existe:

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
- `.env.example` como contrato seguro, atualmente sem variáveis obrigatórias;
- README com entrada rápida para desenvolvimento local;
- assets preexistentes preservados.

Ainda não existe:

- projeto Neon non-production do Caleida;
- branch Neon canônica de desenvolvimento/staging;
- schema/migrations/RLS de produto;
- Neon Auth/Data API implementados;
- Object Storage escolhido;
- CI permanente;
- projeto/conexão Vercel da execução canônica;
- deployment.

## Verificação de US-PLAT-003

Em runner GitHub Actions descartável, usando a branch de verificação `verify/us-plat-003-local-environment`:

- Node `24.20.0`: `PASS`;
- npm `11.19.0`: `PASS`;
- `npm ci`: `PASS`;
- `npm run dev` + resposta HTTP em localhost: `PASS`;
- `npm run lint`: `PASS`;
- `npm run typecheck`: `PASS`;
- `npm test`: `PASS`;
- `npm run build`: `PASS`;
- contrato `.env.example` sem secret: `PASS`;
- diff limitado a ambiente local/documentação: `PASS`;
- Neon/Auth/Storage: `SKIPPED — fora do escopo`;
- Vercel/deployment: `SKIPPED — fora do escopo e deployment proibido para IA`.

O workflow temporário de verificação não integra a PR #13 nem deve permanecer na `main`.

## Plataforma vigente

```text
Next.js / React / TypeScript
→ Neon Auth
→ Neon Data API
→ Neon Postgres
→ PostgreSQL RLS
```

Banco segue `ADR-004`; Neon segue `ADR-005`; Storage segue `ADR-006`; deployment segue `ADR-007`.

## Próxima ação — US-PLAT-004

Executar somente:

> `US-PLAT-004 — Configurar a fundação Neon de desenvolvimento`

A especificação executável está em `docs/EXECUTION_PLAN.md`.

A próxima Story pode criar infraestrutura Neon non-production, mas não deve criar schema de negócio prematuro, Production por conveniência, Vercel ou deployment.
