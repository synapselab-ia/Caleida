# Checkpoint — Caleida

**PROJECT_STATUS:** READY  
**CURRENT_PHASE:** Incremento 0 — Fundação executável  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `US-PLAT-001 — Inicializar a aplicação web`  
**LAST_COMPLETED_ISSUE:** `#8`  
**LAST_COMPLETED_PR:** `#11`  
**ACTIVE_TASK:** none  
**ACTIVE_ISSUE:** none  
**ACTIVE_BRANCH:** none  
**NEXT_ACTION:** `US-PLAT-003 — Configurar o ambiente local da aplicação`  
**BLOCKERS:** none  
**ON_HOLD:** none  
**MANUAL_ACTION_REQUIRED:** none

## Comando de continuação

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

Recupere o estado pelo GitHub e pelos documentos canônicos. Não peça ao usuário contexto já disponível.

## Estado técnico atual

A primeira base executável do Caleida está concluída.

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
- smoke test mínimo com `node:test`;
- README com comandos locais;
- assets preexistentes preservados.

Ainda não existe:

- projeto Neon do Caleida;
- schema/migrations/RLS de produto;
- Neon Auth/Data API implementados;
- Object Storage escolhido;
- CI permanente;
- projeto/conexão Vercel da execução canônica;
- deployment.

## Verificação de US-PLAT-001

Em runner GitHub Actions descartável, Node `24.20.0` e npm `11.19.0`:

- runner/checkout/setup Node: `PASS`;
- geração de `package-lock.json`: `PASS`;
- `npm ci`: `PASS`;
- `npm run lint`: `PASS`;
- `npm run typecheck`: `PASS`;
- `npm test`: `PASS`;
- `npm run build`: `PASS`;
- secrets: `PASS — nenhum`;
- Neon/Auth/Storage: `SKIPPED — fora do escopo`;
- Vercel/deployment: `SKIPPED — fora do escopo e deployment proibido para IA`.

O workflow temporário usado para desbloquear a verificação não integra a Story nem deve permanecer na `main`.

A PR #9 preserva o histórico da tentativa original em Draft; a PR #11 a substituiu exclusivamente porque o comando do conector para retirar o estado Draft falhou por erro interno.

## Plataforma vigente

```text
Next.js / React / TypeScript
→ Neon Auth
→ Neon Data API
→ Neon Postgres
→ PostgreSQL RLS
```

Banco segue `ADR-004`; Neon segue `ADR-005`; Storage segue `ADR-006`; deployment segue `ADR-007`.

## Próxima ação — US-PLAT-003

Executar somente:

> `US-PLAT-003 — Configurar o ambiente local da aplicação`

A especificação executável está em `docs/EXECUTION_PLAN.md`.

Não provisionar Neon ou Vercel nesta Story.
