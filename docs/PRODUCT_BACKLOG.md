# Product Backlog

**Status:** Backlog do Incremento 0 reconciliado após US-PLAT-006  
**Escopo detalhado:** Incremento 0 — Fundação executável

## Convenções

Prioridades: `P0` núcleo/segurança, `P1` antes do beta, `P2` importante, `P3` expansão social, `P4` futuro.

Estados: `A FAZER`, `PRONTA`, `EM ANDAMENTO`, `EM REVISÃO`, `CONCLUÍDA`, `BLOQUEADA`.

---

# Incremento 0 — Fundação executável

## Objetivo

Criar aplicação vazia, instalável, testável, documentada e deployable, com fundação Neon reproduzível e sem iniciar funcionalidades de negócio.

Deployment real não é gate técnico. Vercel será preparada para release manual do usuário, sem Git deployments automáticos.

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
- **Estado:** PRONTA
- **Resultado:** GitHub Actions validando PRs com gates técnicos, incluindo banco descartável quando aplicável, sem jobs de deployment Vercel.
- **Execução refinada:** `docs/EXECUTION_PLAN.md`.

### US-PLAT-008 — Preparar hosting Vercel para release manual

- **Prioridade:** P0
- **Estado:** A FAZER
- **Resultado:** configuração compatível com Vercel, Git deployments automáticos desabilitados conforme documentação corrente, contrato de variáveis e runbook manual. Não exige conexão/publicação.

### US-PLAT-009 — Separar variáveis por ambiente

- **Prioridade:** P0
- **Estado:** A FAZER
- **Resultado:** local, non-production/staging e production com secrets separados; nenhum valor sensível versionado.

### US-PLAT-010 — Validar o ciclo técnico de entrega

- **Prioridade:** P0
- **Estado:** A FAZER
- **Resultado:** PR de teste passa por CI, review e merge; banco usa PostgreSQL descartável como gate portável e branch Neon adicional quando houver requisito Neon-specific; nenhum deployment decorre do fluxo.

---

# Critério de encerramento do Incremento 0

- clone/execução documentados;
- lint, typecheck, testes e build passando;
- fundação Neon non-production reproduzível;
- migrations reconstruindo baseline esperada;
- testes de banco/RLS em PostgreSQL descartável e gate Neon adicional quando aplicável;
- nenhuma credencial versionada;
- PRs executando CI sem CD;
- hosting preparado contra Git deployments automáticos;
- runbook de release manual;
- ciclo `PR → CI → review → merge` funcionando sem deployment;
- documentos refletindo estado real.

Deployment Vercel real não é obrigatório para fechar o incremento.

# Próxima ação operacional

O backlog não define sozinho a `NEXT_ACTION`.

Após US-PLAT-006, o `CHECKPOINT` promove `US-PLAT-007 — Configurar integração contínua`, refinada em `docs/EXECUTION_PLAN.md`.
