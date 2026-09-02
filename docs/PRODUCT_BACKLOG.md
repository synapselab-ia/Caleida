# Product Backlog

**Status:** Incrementos 0 e 1 concluídos; Incremento 2 refinado e primeira Story pronta  
**Último incremento detalhado:** `docs/INCREMENT_2_PLAN.md`  
**Próxima ação operacional:** `US-AUTH-001 — Materializar fundação Neon Auth isolada e contrato de sessão`

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

# Incremento 2 — Acesso controlado / EPIC-02

**Plano:** `docs/INCREMENT_2_PLAN.md`  
**Refino:** `OPS-006` / Issue `#41`

## Objetivo

Entregar contas e acesso seguro para o beta fechado de forma incremental, separando Auth gerenciado, autorização/papéis, controle de entrada, e-mail, cadastro, login/sessão e auditoria.

### US-AUTH-001 — Materializar fundação Neon Auth isolada e contrato de sessão

- **Prioridade:** P0
- **Estado:** PRONTA
- **Capacidade:** CAP-01
- **Resultado esperado:** Neon Auth integrado ao Next.js 16 em branch Neon descartável, contrato server-side de sessão, variáveis documentadas sem valores e gate Neon-specific real, sem cadastro/login/Data API/e-mail/schema funcional.

### US-AUTH-002 — Materializar papéis, autorização e bootstrap administrativo

- **Prioridade:** P0
- **Estado:** A FAZER
- **Capacidades:** CAP-04, CAP-35
- **Resultado esperado:** papéis de produto e autorização crítica verificados no servidor e no banco, com bootstrap administrativo controlado e auditável.

### US-AUTH-003 — Modelar convites, solicitações de acesso e auditoria de entrada

- **Prioridade:** P0
- **Estado:** A FAZER
- **Capacidades:** CAP-02, CAP-35
- **Resultado esperado:** estados, validade, limite de uso, destinatário opcional, aprovação e concorrência modelados antes do signup, sem envio de e-mail.

### US-AUTH-004 — Selecionar e integrar e-mail transacional non-production

- **Prioridade:** P0
- **Estado:** A FAZER
- **Capacidades:** CAP-01, CAP-02
- **Resultado esperado:** decisão documentada de provedor e transporte non-production para confirmação, convite e recuperação, com secrets server-only.

### US-AUTH-005 — Implementar cadastro controlado por convite ou aprovação

- **Prioridade:** P0
- **Estado:** A FAZER
- **Capacidades:** CAP-01, CAP-02
- **Resultado esperado:** signup direto sem autorização de entrada negado inclusive fora da UI; confirmação de e-mail e consumo seguro do mecanismo de entrada.

### US-AUTH-006 — Implementar login, logout e proteção de sessão

- **Prioridade:** P0
- **Estado:** A FAZER
- **Capacidade:** CAP-01
- **Resultado esperado:** login/logout e superfícies privadas protegidas por validação server-side, com estados acessíveis e sem flash de conteúdo privado.

### US-AUTH-007 — Implementar recuperação de senha e gestão/revogação de sessões

- **Prioridade:** P0
- **Estado:** A FAZER
- **Capacidades:** CAP-01, CAP-35
- **Resultado esperado:** recuperação/alteração de senha e sessões consultáveis/revogáveis com semântica de cache explicitamente testada.

### US-AUTH-008 — Consolidar auditoria e validar Incremento 2

- **Prioridade:** P1
- **Estado:** A FAZER
- **Capacidades:** CAP-04, CAP-35
- **Resultado esperado:** matriz adversarial integrada, auditoria sem secrets e evidência de encerramento do incremento.

## Regra de execução

Não antecipar Stories seguintes. Cada mudança de schema/RLS usa migration versionada e gate PostgreSQL 18; qualquer dependência de Neon Auth/Data API exige também branch Neon isolada conforme `ADR-008`.

# Próxima ação operacional

> `US-AUTH-001 — Materializar fundação Neon Auth isolada e contrato de sessão`

Não implementar convite, cadastro, papéis, e-mail, Data API ou Production dentro de US-AUTH-001.