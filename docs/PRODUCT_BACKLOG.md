# Product Backlog

**Status:** Incrementos 0 e 1 concluídos; próximo incremento funcional ainda requer refino  
**Último incremento detalhado:** `docs/INCREMENT_1_PLAN.md`  
**Próxima ação operacional:** `OPS-006 — Refinar o próximo incremento funcional (EPIC-02 — Contas e autenticação)`

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
- **Resultado:** `vercel.json` desabilita Git deployments automáticos com `git.deploymentEnabled: false`; `tests/vercel-config-contract.test.mjs` protege o guardrail; `docs/VERCEL_RELEASE.md` documenta release manual.
- **Operação:** nenhum projeto Caleida foi conectado/importado na Vercel e nenhum Preview/Production foi executado.

### US-PLAT-009 — Separar variáveis por ambiente

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Resultado:** `docs/ENVIRONMENTS.md` formaliza local, non-production/staging e Production; `.env.example` permanece sem valores ativos/sensíveis; variáveis de banco são server-only; Production não reutiliza non-production.

### US-PLAT-010 — Validar o ciclo técnico de entrega

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Issue:** `#28`
- **PR:** `#29`
- **Resultado:** ciclo real `Issue → branch → CI → PR → review → merge → CI main` validado com gates aplicáveis em PASS; ausência de deployment automático comprovada; Neon-specific `SKIPPED` corretamente.
- **Evidência:** `docs/INCREMENT_0_VALIDATION.md`.

## Critério de encerramento do Incremento 0

Todos os gates de fundação executável, banco portável, CI sem CD, ambientes e ciclo de entrega foram concluídos.

**Incremento 0: CONCLUÍDO.**

---

# Incremento 1 — Fundação visual

## Objetivo

Materializar `EPIC-01 — Identidade e design system` como fundação visual reutilizável antes dos fluxos funcionais de acesso controlado.

Detalhamento: `docs/INCREMENT_1_PLAN.md`.  
Evidência: `docs/INCREMENT_1_VALIDATION.md`.

## EPIC-01 — Identidade e design system

### US-DS-001 — Materializar tokens de cor e temas base

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Issue:** `#33`
- **PR:** `#34`
- **Resultado:** paleta aprovada, temas light/dark e aliases semânticos codificados em `src/app/globals.css`; categorias documentadas; contraste protegido por teste automatizado.
- **Documentação:** `docs/DESIGN_TOKENS.md`.
- **Banco/Neon:** Neon-specific `SKIPPED` por escopo.

### US-DS-002 — Integrar tipografia e assinatura de marca

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Issue:** `#35`
- **PR:** `#36`
- **Resultado:** Manrope/Newsreader integradas via `next/font`; logo horizontal oficial integrado por `next/image`; variantes ausentes permanecem pendências reais.
- **Documentação:** `docs/BRAND_TYPOGRAPHY.md`.
- **Banco/Neon:** Neon-specific `SKIPPED` por escopo.

### US-DS-003 — Criar primitivos acessíveis essenciais

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Issue:** `#37`
- **PR:** `#38`
- **Resultado:** `Button`, `FormField` e `Feedback` mínimos e tipados, com HTML nativo, focus-visible explícito, label/descrição/erro associados e live-region roles proporcionais.
- **Documentação:** `docs/UI_PRIMITIVES.md`.
- **Banco/Neon:** Neon-specific `SKIPPED` por escopo.

### US-DS-004 — Consolidar fundação responsiva e aplicar identidade à base

- **Prioridade:** P1
- **Estado:** CONCLUÍDA APÓS INTEGRAÇÃO
- **Issue:** `#39`
- **PR:** `#40`
- **Resultado:** página base cultural/editorial, mobile-first e sem fluxo falso; tokens, tipografia e logo oficial aplicados; sete categorias preservam texto além da cor; nenhuma animação/hover obrigatório; contrato responsivo automatizado.
- **Guardrail:** `tests/base-visual-foundation-contract.test.mjs`.
- **Verificação:** CI inicial `33662849749` falhou legitimamente em contrato legado do logo; contrato corrigido sem relaxar gate; head técnico `a4198a7c7508ae9ede628c59455a64d00cd55d94`, CI `33663025148` em `PASS` para `npm run verify`, PostgreSQL 18 e `verify:db`.
- **Browser real:** `SKIPPED` por indisponibilidade de checkout/dev server local na sessão; nenhum deployment foi criado como atalho.
- **Banco/Neon:** Neon-specific `SKIPPED` por escopo.

## Critério de encerramento do Incremento 1

- tokens e temas reutilizáveis: `PASS`;
- tipografia e marca: `PASS`;
- primitivos acessíveis: `PASS`;
- composição responsiva sem fluxo falso: `PASS` por código/contrato/build;
- browser real: `SKIPPED` com motivo explícito;
- lint/typecheck/test/build: `PASS` no head técnico corrigido;
- banco/infraestrutura criados por conveniência visual: nenhum;
- deployment: não executado.

**Incremento 1: CONCLUÍDO após CI final da PR #40 e CI pós-merge da `main` em PASS.**

---

# Próximo horizonte funcional — EPIC-02

O Project Design define:

### EPIC-02 — Contas e autenticação

Convites, cadastro, login, sessão, SMTP, papéis e auditoria básica, com relação direta a CAP-01, CAP-02, CAP-04 e CAP-35.

O épico ainda **não está refinado em Stories técnicas executáveis** e toca Auth, segurança, autorização, e-mail e comportamento gerenciado do Neon. Implementação direta está proibida até o refino canônico.

# Próxima ação operacional

> `OPS-006 — Refinar o próximo incremento funcional (EPIC-02 — Contas e autenticação)`

O refino deve verificar arquitetura/ADRs, estado real do Neon e documentação oficial corrente antes de decompor o épico e promover exatamente uma Story técnica.
