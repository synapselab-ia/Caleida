# Product Backlog

**Status:** Backlog do Incremento 0 em execução  
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
- **Resultado:** aplicação Next.js com TypeScript strict, estrutura mínima, runtime/package manager fixados, lockfile, lint, typecheck, teste básico e build verificados.

### US-PLAT-002 — Organizar a estrutura documental

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Resultado:** Project Design, amendments, ADRs, arquitetura, protocolo canônico, Execution Plan, Checkpoint, backlog e changelog recuperáveis pelo GitHub.

### US-PLAT-003 — Configurar o ambiente local da aplicação

- **Prioridade:** P0
- **Estado:** PRONTA
- **Resultado:** instruções reproduzíveis para dependências, variáveis sem valores sensíveis e execução local.

### US-PLAT-004 — Configurar a fundação Neon de desenvolvimento

- **Prioridade:** P0
- **Estado:** A FAZER
- **Resultado:** projeto non-production, branch canônica de staging e workflow de branches descartáveis, sem schema de negócio prematuro.

### US-PLAT-005 — Definir migrations, testes de banco e RLS

- **Prioridade:** P0
- **Estado:** A FAZER
- **Resultado:** `database/migrations/` e `database/tests/` com runner reproduzível, baseline mínima e convenções de autorização.

### US-PLAT-006 — Configurar validações automatizadas

- **Prioridade:** P0
- **Estado:** A FAZER
- **Resultado:** comandos reais de lint, typecheck, testes e build executáveis consistentemente.

### US-PLAT-007 — Configurar integração contínua

- **Prioridade:** P0
- **Estado:** A FAZER
- **Resultado:** GitHub Actions validando PRs com lint/typecheck/test/build, sem jobs de deployment Vercel.

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
- **Resultado:** PR de teste passa por CI, review e merge; banco quando aplicável usa branch Neon isolada; nenhum deployment decorre do fluxo.

---

# Critério de encerramento do Incremento 0

- clone/execução documentados;
- lint, typecheck, testes e build passando;
- fundação Neon non-production reproduzível;
- migrations reconstruindo baseline esperada;
- testes de banco/RLS em branch isolada;
- nenhuma credencial versionada;
- PRs executando CI sem CD;
- hosting preparado contra Git deployments automáticos;
- runbook de release manual;
- ciclo `PR → CI → review → merge` funcionando sem deployment;
- documentos refletindo estado real.

Deployment Vercel real não é obrigatório para fechar o incremento.

# Próxima ação operacional

O backlog não define sozinho a `NEXT_ACTION`.

Após a conclusão da US-PLAT-001, o `CHECKPOINT` promove `US-PLAT-003 — Configurar o ambiente local da aplicação`.
