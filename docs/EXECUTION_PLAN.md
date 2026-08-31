# Execution Plan — Caleida

**Status:** roadmap operacional canônico  
**Regra:** uma `NEXT_ACTION` limitada por vez  
**Roadmap de produto:** `docs/PRODUCT_BACKLOG.md`

Este documento transforma o backlog macro em tarefas executáveis. O backlog descreve capacidades e prioridades; este plano define ordem, dependências, critérios e limites operacionais.

---

# OPS-001 — Modernizar o protocolo canônico

**Estado:** CONCLUÍDO

## Resultado

Source of Truth, AI Work Protocol, Verification Protocol, Deployment Policy, Execution Plan e Checkpoint passaram a permitir retomada confiável pelo repositório.

---

# OPS-002 — Formalizar o pivot Supabase → Neon

**Estado:** CONCLUÍDO

## Resultado

- `DEC-007` tornou Neon a plataforma canônica de Postgres/Auth/Data API/RLS;
- Production e non-production foram separados;
- branches descartáveis de verificação foram definidas;
- migrations/testes passaram a usar `database/migrations/` e `database/tests/` como layout planejado;
- Storage permaneceu provider-independent por `DEC-008`;
- `PROJECT_DESIGN_PLATFORM_AMENDMENT.md` preservou e reconciliou o Project Design v1.0.

---

# OPS-003 — Reconciliar a política de deployment

**Estado:** CONCLUÍDO

## Objetivo

Eliminar a ambiguidade entre Preview automático e release manual antes do bootstrap da aplicação.

## Evidência de contexto

Na execução de OPS-003 foi confirmado que:

- a aplicação ainda não existe;
- nenhum projeto/deployment Vercel do Caleida foi criado pela execução;
- o Project Design v1.0 ainda preserva referências históricas a Preview automático;
- a documentação oficial Vercel corrente permite desabilitar todos os Git deployments com `git.deploymentEnabled: false`;
- Preview/Production podem ser criados manualmente por mecanismos oficiais da Vercel.

## Decisões

- `DEC-009` define deployment como ação exclusivamente humana/manual;
- IA, automações e GitHub Actions não publicam o Caleida;
- Git deployments automáticos devem permanecer desabilitados;
- merge não significa release;
- CI permanece separada de CD;
- `PROJECT_DESIGN_DEPLOYMENT_AMENDMENT.md` supersede as premissas históricas de Preview/Production automáticos;
- `US-PLAT-008` prepara hosting sem exigir conexão/publicação;
- `US-PLAT-010` valida PR → CI → review → merge sem deployment;
- deployment real deixa de ser gate do Incremento 0.

## Verificação

- documentação oficial Vercel: `PASS`;
- comportamento/configuração `git.deploymentEnabled: false`: `PASS documental`;
- Project Design reconciliado por amendment: `PASS`;
- backlog/arquitetura/política reconciliados: `PASS`;
- regra human-only para deployment: `PASS`;
- secrets adicionados: `PASS — nenhum`;
- aplicação/lint/typecheck/test/build: `SKIPPED — aplicação ainda não inicializada`;
- conexão/projeto Vercel: `SKIPPED — fora do escopo`;
- Preview/Production deployment: `SKIPPED — proibido para IA e fora do escopo`.

## Artefatos principais

- `docs/PROJECT_DESIGN_DEPLOYMENT_AMENDMENT.md`;
- `00_SYSTEM/DEPLOYMENT_POLICY.md`;
- `docs/ARCHITECTURE.md`;
- `docs/DECISIONS.md`;
- `docs/PRODUCT_BACKLOG.md`;
- `docs/CHECKPOINT.md`;
- `AGENTS.md`.

---

# OPS-004 — Evoluir o registro de decisões para ADRs

**Estado:** NEXT_ACTION

## Objetivo

Criar estrutura `docs/adr/` e migrar gradualmente as decisões arquiteturais relevantes sem perder histórico, status ou relações de supersessão das `DEC-*` existentes.

## Por que agora

As OPS-002 e OPS-003 adicionaram novas decisões materiais e relações de supersessão. Antes de iniciar a implementação técnica e acumular mais decisões, o registro deve ganhar estrutura própria por decisão.

## Dependências

- OPS-001 concluída;
- OPS-002 concluída;
- OPS-003 concluída;
- `docs/DECISIONS.md` preservado como registro atual.

## Resultado esperado

- diretório `docs/adr/`;
- índice de ADRs;
- formato mínimo com status, contexto, decisão, consequências e supersessão;
- migração das decisões arquiteturais existentes para ADRs sem apagar `DECISIONS.md` silenciosamente;
- referências canônicas atualizadas;
- `CHECKPOINT` promovido para a primeira Story técnica depois da conclusão.

## Critérios de aceite

- histórico é preservado;
- relações `SUPERSEDED` permanecem explícitas;
- não há duas fontes concorrentes sem regra de precedência;
- nenhuma feature/código/banco/deployment é criado nesta tarefa;
- ao final, a próxima ação técnica é refinada a partir de `US-PLAT-001`.

## Non-goals

- não inicializar Next.js;
- não criar banco Neon;
- não criar `vercel.json`;
- não conectar Vercel;
- não implementar feature.

---

# Fundação técnica após reconciliação operacional

As User Stories do Incremento 0 permanecem no `PRODUCT_BACKLOG.md`.

Após OPS-004, a primeira tarefa técnica será refinada a partir de:

## US-PLAT-001 — Repository/application bootstrap

Criar a aplicação Next.js/React/TypeScript mínima e reproduzível, com versões e package manager definidos a partir da documentação oficial corrente.

Antes de executar, a sessão deve detalhar:

- objetivo;
- dependências;
- arquivos afetados;
- versões/runtime;
- segurança;
- testes;
- critérios de aceite;
- non-goals;
- Definition of Done.

Não iniciar `US-PLAT-001` enquanto o `CHECKPOINT` apontar para uma tarefa OPS anterior.

---

# Contrato de execução

Para cada tarefa:

1. recuperar estado pelo protocolo canônico;
2. confirmar que é a `NEXT_ACTION`;
3. inspecionar repositório e documentação relevante;
4. criar/usar Issue e branch limitadas ao escopo quando aplicável;
5. implementar somente o necessário;
6. executar `00_SYSTEM/VERIFICATION_PROTOCOL.md`;
7. revisar diff;
8. atualizar documentação/decisões afetadas;
9. atualizar `docs/CHECKPOINT.md`;
10. abrir PR/revisar/mergear conforme o fluxo vigente;
11. deixar uma única próxima ação clara para a sessão seguinte.

Deployment segue `DEC-009` e nunca é consequência automática deste contrato.