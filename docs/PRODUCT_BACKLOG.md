# Product Backlog

**Status:** Incremento 0 concluído e validado por US-PLAT-010  
**Escopo detalhado:** Incremento 0 — Fundação executável

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

---

# Critério de encerramento do Incremento 0

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
- documentos refletindo estado real: `PASS` após integração do fechamento documental.

Deployment Vercel real não é obrigatório para fechar o incremento.

**Incremento 0: CONCLUÍDO.**

# Próximo horizonte

O Project Design posiciona `EPIC-01 — Identidade e design system` após a fundação técnica. O backlog ainda não deve antecipar Stories de implementação sem refino explícito do próximo incremento.

# Próxima ação operacional

O backlog não define sozinho a `NEXT_ACTION`.

A próxima ação canônica, registrada no `CHECKPOINT` e refinada em `docs/EXECUTION_PLAN.md`, é:

> `OPS-005 — Refinar o Incremento 1 (EPIC-01 — Identidade e design system)`
