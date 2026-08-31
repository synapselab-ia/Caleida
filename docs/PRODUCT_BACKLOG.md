# Product Backlog

**Status:** Backlog do Incremento 0 reconciliado após OPS-003  
**Escopo detalhado neste momento:** Incremento 0 — Fundação executável

## Convenções

- `P0`: obrigatório para o núcleo ou segurança.
- `P1`: obrigatório antes do beta fechado.
- `P2`: importante para completar a proposta.
- `P3`: expansão social e descoberta.
- `P4`: evolução futura.

Estados:

- `A FAZER`;
- `PRONTA`;
- `EM ANDAMENTO`;
- `EM REVISÃO`;
- `CONCLUÍDA`;
- `BLOQUEADA`.

---

# Incremento 0 — Fundação executável

## Objetivo

Criar uma aplicação vazia, porém instalável, testável, documentada e **deployable**, com fundação Neon reproduzível e sem iniciar funcionalidades de negócio.

Deployment real não é gate técnico do Incremento 0. Vercel é preparada para release manual do usuário, sem Git deployments automáticos.

## EPIC-00 — Fundação técnica

### US-PLAT-001 — Inicializar a aplicação web

- **Prioridade:** P0
- **Estado:** A FAZER
- **Resultado:** aplicação Next.js com TypeScript estrito, estrutura mínima, lockfile, lint, typecheck, testes básicos e build.

### US-PLAT-002 — Organizar a estrutura documental

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Resultado:** Project Design, amendments, arquitetura, decisões, protocolo canônico, Execution Plan, Checkpoint, backlog e changelog recuperáveis pelo GitHub.

### US-PLAT-003 — Configurar o ambiente local da aplicação

- **Prioridade:** P0
- **Estado:** A FAZER
- **Resultado:** instruções reproduzíveis para instalar dependências, configurar variáveis sem valores sensíveis e executar a aplicação localmente.

### US-PLAT-004 — Configurar a fundação Neon de desenvolvimento

- **Prioridade:** P0
- **Estado:** A FAZER
- **Resultado:** estratégia definida em `docs/NEON_PLATFORM.md` materializada com projeto non-production, branch canônica de staging e workflow de branches descartáveis, sem schema de negócio prematuro.

### US-PLAT-005 — Definir estrutura de migrations, testes de banco e RLS

- **Prioridade:** P0
- **Estado:** A FAZER
- **Resultado:** `database/migrations/` e `database/tests/` com runner reproduzível, baseline mínima e convenções de autorização sem antecipar o modelo completo do produto.

### US-PLAT-006 — Configurar validações automatizadas

- **Prioridade:** P0
- **Estado:** A FAZER
- **Resultado:** comandos reais de lint, typecheck, testes e build executáveis de forma consistente.

### US-PLAT-007 — Configurar integração contínua

- **Prioridade:** P0
- **Estado:** A FAZER
- **Resultado:** GitHub Actions validando pull requests com lint, typecheck, testes e build, sem jobs de deployment Vercel.

### US-PLAT-008 — Preparar hosting Vercel para release manual

- **Prioridade:** P0
- **Estado:** A FAZER
- **Resultado:** configuração de hosting compatível com Vercel, `vercel.json` com Git deployments automáticos desabilitados conforme documentação corrente, contrato de variáveis e runbook de release manual. A Story não exige conectar ou publicar o projeto.

### US-PLAT-009 — Separar variáveis por ambiente

- **Prioridade:** P0
- **Estado:** A FAZER
- **Resultado:** local, non-production/staging e production com secrets separados; nenhum valor sensível versionado.

### US-PLAT-010 — Validar o ciclo técnico de entrega

- **Prioridade:** P0
- **Estado:** A FAZER
- **Resultado:** uma pull request de teste passa por CI, revisão e merge; banco quando aplicável é verificado em branch Neon isolada; nenhum deployment é criado como consequência do fluxo.

---

# Critério de encerramento do Incremento 0

O incremento estará concluído quando:

- o projeto puder ser clonado e executado com documentação clara;
- lint, typecheck, testes e build passarem;
- a fundação Neon non-production estiver reproduzível e documentada;
- migrations puderem reconstruir o estado esperado desde baseline conhecida;
- testes de banco/RLS puderem executar em branch isolada sem usar Production;
- nenhuma credencial estiver versionada;
- pull requests executarem CI sem CD;
- a configuração de hosting estiver preparada para impedir Git deployments automáticos;
- existir runbook de release manual do usuário;
- o ciclo PR → CI → review → merge funcionar sem deployment;
- os documentos operacionais refletirem o estado real.

Um deployment Vercel real não é obrigatório para concluir o Incremento 0.

# Próxima ação operacional

O backlog não define sozinho a `NEXT_ACTION`.

A sequência é governada por `docs/CHECKPOINT.md` e `docs/EXECUTION_PLAN.md`. Após OPS-003, a próxima tarefa operacional é `OPS-004 — Evoluir o registro de decisões para ADRs`.