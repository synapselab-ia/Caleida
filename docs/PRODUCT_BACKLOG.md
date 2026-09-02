# Product Backlog

**Status:** Incremento 0 concluído; Incremento 1 em execução  
**Escopo detalhado atual:** `docs/INCREMENT_1_PLAN.md`

## Convenções

Prioridades: `P0` núcleo/segurança, `P1` antes do beta, `P2` importante, `P3` expansão social, `P4` futuro.

Estados: `A FAZER`, `PRONTA`, `EM ANDAMENTO`, `EM REVISÃO`, `CONCLUÍDA`, `BLOQUEADA`.

---

# Incremento 0 — Fundação executável

## Objetivo

Criar aplicação vazia, instalável, testável, documentada e deployable, com fundação Neon reproduzível e sem iniciar funcionalidades de negócio.

Deployment real não é gate técnico. Vercel permanece preparada para release manual do usuário, sem Git deployments automáticos.

## EPIC-00 — Fundação técnica

### US-PLAT-001 — Inicializar a aplicação web

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Resultado:** aplicação Next.js com TypeScript strict, estrutura mínima, runtime/package manager fixados, lockfile, lint, typecheck, teste básico e build.

### US-PLAT-002 — Organizar a estrutura documental

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Resultado:** Project Design, amendments, ADRs, arquitetura, protocolo canônico, Execution Plan, Checkpoint, backlog e changelog recuperáveis pelo GitHub.

### US-PLAT-003 — Configurar o ambiente local da aplicação

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Resultado:** guia local reproduzível para clone, runtime, `npm ci`, `npm run dev`, variáveis seguras, gates e troubleshooting; ambiente validado sem serviços remotos.

### US-PLAT-004 — Configurar a fundação Neon de desenvolvimento

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Resultado:** projeto Neon `caleida-nonprod` provisionado; branch Neon `main` adotada como baseline canônica non-production/staging; convenção de branches temporárias documentada; Production/Auth/Data API/Storage/schema de produto não provisionados.

### US-PLAT-005 — Definir migrations, testes de banco e RLS

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Resultado:** `database/migrations/`, runner Node + `psql`, ledger/checksums, `database/tests/`, guardrails de alvo e contrato de testes RLS; migrations portáveis verificadas em PostgreSQL 18 descartável.
- **Decisão:** `ADR-008` separa gate PostgreSQL portável de gate Neon-specific sem alterar Neon como plataforma canônica.

### US-PLAT-006 — Configurar validações automatizadas

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Resultado:** `npm run verify` consolida manifesto de migrations, lint, typecheck, testes e build; `npm run verify:db` mantém migration + testes SQL como gate explícito que exige ambiente PostgreSQL apropriado.

### US-PLAT-007 — Configurar integração contínua

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Resultado:** `.github/workflows/ci.yml` valida PRs para `main` e pushes integrados na `main` com Node/npm pinados, `npm ci`, `npm run verify`, PostgreSQL 18 efêmero e `npm run verify:db`; permissões mínimas e nenhum CD/deployment.
- **Documentação:** `docs/CI.md`.

### US-PLAT-008 — Preparar hosting Vercel para release manual

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Resultado:** `vercel.json` desabilita todos os Git deployments automáticos com `git.deploymentEnabled: false`; `tests/vercel-config-contract.test.mjs` protege o guardrail; `docs/VERCEL_RELEASE.md` documenta release manual, pré-condições, alertas e ausência de CD.
- **Operação:** nenhum projeto Caleida foi conectado/importado na Vercel e nenhum Preview/Production foi executado.

### US-PLAT-009 — Separar variáveis por ambiente

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Resultado:** `docs/ENVIRONMENTS.md` formaliza local, non-production/staging e Production; `.env.example` permanece sem valores ativos/sensíveis; variáveis de banco são server-only; Production não reutiliza non-production e o tooling não inventa alvo Production inexistente.
- **Guardrail:** `tests/environment-contract.test.mjs` protege `.env.example`, `.gitignore`, ausência de `NEXT_PUBLIC_*` sensível e CI sem repository secrets/CD.
- **Operação:** nenhum secret remoto, projeto Neon Production, projeto Vercel Caleida ou deployment foi criado.

### US-PLAT-010 — Validar o ciclo técnico de entrega

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Issue:** `#28`
- **PR:** `#29`
- **Resultado:** ciclo real `Issue → branch → CI → PR → review → merge → CI main` validado com todos os gates aplicáveis em PASS; ausência de deployment automático comprovada; gate Neon-specific corretamente `SKIPPED`; nenhuma feature artificial, secret, migration ou infraestrutura introduzida.
- **Evidência:** `docs/INCREMENT_0_VALIDATION.md`.

## Critério de encerramento do Incremento 0

- clone/execução documentados: `PASS`;
- lint, typecheck, testes e build passando: `PASS`;
- fundação Neon non-production reproduzível: `PASS`;
- migrations reconstruindo baseline esperada: `PASS`;
- testes de banco/RLS em PostgreSQL descartável e gate Neon adicional quando aplicável: `PASS`;
- nenhuma credencial versionada: `PASS`;
- contratos local/non-production/Production explícitos: `PASS`;
- PRs executando CI sem CD: `PASS`;
- hosting preparado contra Git deployments automáticos: `PASS`;
- runbook de release manual: `PASS`;
- ciclo `PR → CI → review → merge` funcionando sem deployment: `PASS`;
- documentos refletindo estado real: `PASS`.

**Incremento 0: CONCLUÍDO.**

---

# Incremento 1 — Fundação visual

## Objetivo

Materializar `EPIC-01 — Identidade e design system` como fundação visual reutilizável antes dos fluxos funcionais de acesso controlado.

Este é um incremento operacional de interface. Ele não altera a ordem funcional de capacidades do Project Design e não antecipa Auth, catálogo, biblioteca ou outros domínios.

## EPIC-01 — Identidade e design system

### US-DS-001 — Materializar tokens de cor e temas base

- **Prioridade:** P0
- **Estado:** CONCLUÍDA após integração da PR `#34`
- **Issue:** `#33`
- **PR:** `#34`
- **Resultado:** paleta aprovada, temas light/dark e aliases semânticos codificados em `src/app/globals.css`; categorias documentadas; contraste protegido por teste automatizado; nenhuma dependência, componente, banco ou infraestrutura adicionados.
- **Documentação:** `docs/DESIGN_TOKENS.md`.
- **Banco/Neon:** nenhum; Neon-specific `SKIPPED` por escopo.

### US-DS-002 — Integrar tipografia e assinatura de marca

- **Prioridade:** P0
- **Estado:** PRONTA
- **Resultado esperado:** Manrope/Newsreader integradas com fallbacks adequados e uso responsivo do ativo oficial de marca existente, sem fabricar variantes ausentes.
- **Dependência:** `US-DS-001`.

### US-DS-003 — Criar primitivos acessíveis essenciais

- **Prioridade:** P0
- **Estado:** A FAZER
- **Resultado esperado:** conjunto mínimo tipado e acessível de botão, campo/form-field e feedback, usando tokens canônicos e sem biblioteca externa sem necessidade demonstrada.
- **Dependências:** `US-DS-001`, `US-DS-002`.

### US-DS-004 — Consolidar fundação responsiva e aplicar identidade à base

- **Prioridade:** P1
- **Estado:** A FAZER
- **Resultado esperado:** layout raiz e página base coerentes com a marca em celular/tablet/notebook/desktop, sem fluxo falso ou feature futura antecipada.
- **Dependências:** `US-DS-001` a `US-DS-003`.

## Critério de encerramento do Incremento 1

- tokens visuais canônicos e temas light/dark reutilizáveis: `PASS` após US-DS-001;
- tipografia de referência integrada;
- primitivos mínimos acessíveis e testados;
- layout base responsivo e sem fluxos falsos;
- WCAG 2.2 AA considerada nos contrastes/foco aplicáveis;
- redução de movimento respeitada quando houver movimento;
- lint, typecheck, testes e build em PASS;
- nenhuma infraestrutura/banco criado por conveniência visual;
- deployment permanece separado e manual.

Detalhamento: `docs/INCREMENT_1_PLAN.md`.

# Próxima ação operacional

O backlog não define sozinho a `NEXT_ACTION`.

Após integração de `US-DS-001`, a próxima ação canônica deve ser:

> `US-DS-002 — Integrar tipografia e assinatura de marca`
