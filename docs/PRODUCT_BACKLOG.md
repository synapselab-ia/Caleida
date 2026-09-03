# Product Backlog

**Status:** Incrementos 0 e 1 concluídos; Incremento 2 em andamento com US-AUTH-002 concluída  
**Último incremento detalhado:** `docs/INCREMENT_2_PLAN.md`  
**Próxima ação operacional:** `US-AUTH-003 — Modelar convites, solicitações de acesso e auditoria de entrada`

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
- **Resultado:** projeto Neon `caleida-nonprod` provisionado; branch Neon `main` adotada como baseline canônica non-production/staging; convenção de branches temporárias documentada; naquele momento Production/Auth/Data API/Storage/schema de produto não estavam provisionados.

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
- **Resultado:** paleta aprovada, temas light/dark e aliases semânticos codificados; contraste protegido por teste automatizado.

### US-DS-002 — Integrar tipografia e assinatura de marca

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Issue:** `#35`
- **PR:** `#36`
- **Resultado:** Manrope/Newsreader integradas; logo horizontal oficial integrado por `next/image`.

### US-DS-003 — Criar primitivos acessíveis essenciais

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Issue:** `#37`
- **PR:** `#38`
- **Resultado:** `Button`, `FormField` e `Feedback` mínimos e tipados com HTML nativo e relações acessíveis.

### US-DS-004 — Consolidar fundação responsiva e aplicar identidade à base

- **Prioridade:** P1
- **Estado:** CONCLUÍDA
- **Issue:** `#39`
- **PR:** `#40`
- **Resultado:** página base cultural/editorial mobile-first, sem fluxo falso; CI final e pós-merge em PASS.

**Incremento 1: CONCLUÍDO.**

---

# Incremento 2 — Acesso controlado / EPIC-02

**Plano:** `docs/INCREMENT_2_PLAN.md`  
**Refino:** `OPS-006` / Issue `#41` / PR `#42`

## Objetivo

Entregar contas e acesso seguro para o beta fechado de forma incremental, separando Auth gerenciado, autorização/papéis, controle de entrada, e-mail, cadastro, login/sessão e auditoria.

### US-AUTH-001 — Materializar fundação Neon Auth isolada e contrato de sessão

- **Prioridade:** P0
- **Estado:** CONCLUÍDA APÓS INTEGRAÇÃO
- **Issue:** `#43`
- **PR:** `#44`
- **Capacidade:** CAP-01
- **Resultado:** `@neondatabase/auth@0.5.0-beta` fixado; fronteira server-only/lazy/fail-closed; handler GET/POST catch-all; gate Neon-specific em branch isolada; Neon Auth Better Auth promovido à baseline `caleida-nonprod/main` somente após gates; nenhum usuário/Data API/schema de produto/e-mail/OAuth/Production/deployment criado.
- **Evidência:** `docs/US_AUTH_001_VERIFICATION.md`.
- **Operação:** `verify-us-auth-001` foi removida após autorização explícita antes de US-AUTH-002.

### US-AUTH-002 — Materializar papéis, autorização e bootstrap administrativo

- **Prioridade:** P0
- **Estado:** CONCLUÍDA APÓS INTEGRAÇÃO
- **Issue:** `#45`
- **PR:** `#46`
- **Capacidades:** CAP-04, CAP-35
- **Resultado:** papéis `proprietário`, `administrador`, `moderador`, `curador` e `usuário` separados do Admin Better Auth; autorização crítica server-side + banco; auditoria mínima; bootstrap owner explícito/idempotente por UUID Auth já existente; migrations `000001/000002` promovidas à baseline após PostgreSQL 18 e Neon-specific em PASS; baseline permaneceu sem usuários/papéis sintéticos.
- **Evidência:** `docs/US_AUTH_002_VERIFICATION.md`.
- **Operação:** `verify-us-auth-002` (`br-weathered-shape-awp7ckqa`) permanece pendente de exclusão explícita; não abrir outro branch descartável enquanto ela existir.

### US-AUTH-003 — Modelar convites, solicitações de acesso e auditoria de entrada

- **Prioridade:** P0
- **Estado:** PRONTA
- **Capacidades:** CAP-02, CAP-35
- **Resultado esperado:** estados, validade, limite de uso, destinatário opcional, aprovação e concorrência modelados antes do signup, sem envio de e-mail.
- **Pré-condição operacional:** limpar `verify-us-auth-002` mediante autorização explícita antes de criar novo ambiente Neon descartável.

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

> `US-AUTH-003 — Modelar convites, solicitações de acesso e auditoria de entrada`

Antes de criar nova branch Neon para essa Story, resolver a limpeza de `verify-us-auth-002` mediante autorização explícita. Não antecipar e-mail, cadastro, login/logout, Production ou deployment.
