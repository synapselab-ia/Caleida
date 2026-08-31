# Product Backlog

**Status:** Backlog do Incremento 0 reconciliado após OPS-002  
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

Criar uma aplicação vazia, porém instalável, testável e documentada, com fundação Neon reproduzível e sem iniciar funcionalidades de negócio.

Deployment real não faz parte automaticamente do gate técnico; a política será reconciliada em `OPS-003`.

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
- **Resultado:** GitHub Actions validando pull requests sem disparar deployment Vercel por consequência implícita.

### US-PLAT-008 — Preparar integração de hosting Vercel

- **Prioridade:** P0
- **Estado:** BLOQUEADA — aguarda `OPS-003`
- **Resultado:** compatibilidade e configuração de hosting alinhadas à política canônica de deployment controlado, sem Preview/Production automáticos não autorizados.

### US-PLAT-009 — Separar variáveis por ambiente

- **Prioridade:** P0
- **Estado:** A FAZER
- **Resultado:** local, non-production/staging e production com secrets separados; nenhum valor sensível versionado.

### US-PLAT-010 — Validar o ciclo técnico de entrega

- **Prioridade:** P0
- **Estado:** A FAZER
- **Resultado:** uma pull request de teste passa por CI, revisão e merge; banco quando aplicável é verificado em branch Neon isolada; deployment só participa se houver autorização/política específica vigente.

---

# Critério de encerramento do Incremento 0

O incremento estará concluído quando:

- o projeto puder ser clonado e executado com documentação clara;
- lint, typecheck, testes e build passarem;
- a fundação Neon non-production estiver reproduzível e documentada;
- migrations puderem reconstruir o estado esperado desde baseline conhecida;
- testes de banco/RLS puderem executar em branch isolada sem usar Production;
- nenhuma credencial estiver versionada;
- pull requests executarem CI;
- a política de hosting/deployment estiver reconciliada e comprovadamente não gerar deploys não autorizados;
- os documentos operacionais refletirem o estado real.

# Próxima ação operacional

O backlog não define sozinho a `NEXT_ACTION`.

A sequência atual é governada por `docs/CHECKPOINT.md` e `docs/EXECUTION_PLAN.md`. Após OPS-002, a próxima tarefa operacional é `OPS-003 — Reconciliar a política de deployment`.
