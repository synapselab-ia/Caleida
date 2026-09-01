# Product Backlog

**Status:** Backlog do Incremento 0 reconciliado após US-PLAT-009  
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
- **Estado:** PRONTA
- **Resultado esperado:** ciclo real `Issue → branch → CI → PR → review → merge` validado de ponta a ponta com gates canônicos em PASS, ausência de deployment automático comprovada e evidência final do Incremento 0 registrada sem criar feature artificial.
- **Execução refinada:** `docs/EXECUTION_PLAN.md`.

---

# Critério de encerramento do Incremento 0

- clone/execução documentados;
- lint, typecheck, testes e build passando;
- fundação Neon non-production reproduzível;
- migrations reconstruindo baseline esperada;
- testes de banco/RLS em PostgreSQL descartável e gate Neon adicional quando aplicável;
- nenhuma credencial versionada;
- contratos local/non-production/Production explícitos;
- PRs executando CI sem CD;
- hosting preparado contra Git deployments automáticos;
- runbook de release manual;
- ciclo `PR → CI → review → merge` funcionando sem deployment;
- documentos refletindo estado real.

Deployment Vercel real não é obrigatório para fechar o incremento.

# Próxima ação operacional

O backlog não define sozinho a `NEXT_ACTION`.

Após US-PLAT-009, o `CHECKPOINT` promove `US-PLAT-010 — Validar o ciclo técnico de entrega`, refinada em `docs/EXECUTION_PLAN.md`.
