# Checkpoint — Caleida

**PROJECT_STATUS:** READY  
**CURRENT_PHASE:** Incremento 0 — Fundação executável / reconciliação operacional  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `OPS-003 — Reconciliar a política de deployment`  
**LAST_COMPLETED_ISSUE:** `#4`  
**BASELINE_BEFORE_OPS_003:** `dc682e31f071ff93c6c52f26aaff87721cca1189`  
**ACTIVE_TASK:** none  
**ACTIVE_ISSUE:** none  
**ACTIVE_BRANCH:** none  
**NEXT_ACTION:** `OPS-004 — Evoluir o registro de decisões para ADRs`  
**BLOCKERS:** none  
**ON_HOLD:** none  
**MANUAL_ACTION_REQUIRED:** none

## Comando de continuação

Uma nova sessão deve poder iniciar com:

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

Recupere o estado pelo GitHub e pelos documentos canônicos. Não peça ao usuário para repetir contexto já disponível.

## Estado técnico atual

O Caleida continua antes do bootstrap da aplicação:

- aplicação Next.js ainda não inicializada;
- nenhum `package.json` de aplicação;
- nenhum schema/migration de produto;
- nenhum banco hospedado do Caleida criado;
- nenhuma integração de autenticação implementada;
- nenhum Object Storage selecionado/configurado;
- nenhum projeto Vercel criado/conectado pela execução canônica;
- nenhum Preview ou Production deployment executado.

A plataforma canônica de dados/identidade é:

```text
Next.js
→ Neon Auth
→ Neon Data API
→ Neon Postgres
→ PostgreSQL RLS
```

Vercel permanece destino de hosting, mas release é humana/manual.

## Decisões canônicas recentes

- `DEC-007` — Neon como plataforma canônica de Postgres/Auth/Data API/RLS: `APROVADA`;
- `DEC-008` — Object Storage desacoplado e decisão adiada: `APROVADA`;
- `DEC-009` — Deployment Vercel exclusivamente humano/manual: `APROVADA`.

Amendments ativos do Project Design:

- `docs/PROJECT_DESIGN_PLATFORM_AMENDMENT.md`;
- `docs/PROJECT_DESIGN_DEPLOYMENT_AMENDMENT.md`.

## Política de deployment aprovada

Enquanto `DEC-009` estiver vigente:

- IA não executa deployments;
- automações/CI não executam deployments;
- push/branch/PR/merge não podem gerar deployments automáticos;
- quando `vercel.json` existir, deve desabilitar Git deployments automáticos conforme documentação Vercel corrente; em OPS-003 o contrato verificado é `git.deploymentEnabled: false`;
- Preview é opcional e manual;
- Production é manual;
- promote/rollback/redeploy são ações humanas;
- IA pode preparar runbook, validar pré-condições e diagnosticar deployments já existentes.

## CI e release

Fluxo técnico normal:

```text
branch
→ implementação
→ lint/typecheck/test/build
→ verificação de banco quando aplicável
→ PR
→ review
→ merge
→ sem deploy automático
```

Release externa é uma ação separada. Quando uma futura tarefa depender dela, o Checkpoint deve usar `MANUAL_ACTION_REQUIRED` e o usuário executará o deployment.

## Backlog reconciliado

- `US-PLAT-007` — CI sem CD;
- `US-PLAT-008` — preparar hosting Vercel para release manual, sem exigir conexão/publicação;
- `US-PLAT-010` — validar PR → CI → review → merge sem deployment;
- deployment real não é critério obrigatório de encerramento do Incremento 0.

## Verificação de OPS-003

- estado real da `main` inspecionado antes da edição: `PASS`;
- documentação oficial Vercel consultada: `PASS`;
- `git.deploymentEnabled: false` confirmado como configuração oficial para desabilitar Git deployments: `PASS`;
- Project Design reconciliado por amendment específico: `PASS`;
- arquitetura/backlog/Execution Plan reconciliados: `PASS`;
- regra human-only de deployment documentada: `PASS`;
- CI separado de deployment: `PASS`;
- secrets/credenciais adicionados: `PASS — nenhum`;
- aplicação/lint/typecheck/test/build: `SKIPPED — aplicação ainda não inicializada`;
- projeto/conexão Vercel: `SKIPPED — fora do escopo`;
- Preview/Production deployment: `SKIPPED — proibido para IA e fora do escopo`;
- Neon/banco: `SKIPPED — não alterado por OPS-003`.

## Próxima ação — OPS-004

Executar somente:

> `OPS-004 — Evoluir o registro de decisões para ADRs`

Requisitos essenciais:

1. criar `docs/adr/` e índice canônico;
2. definir formato mínimo de ADR;
3. migrar decisões arquiteturais existentes preservando histórico e supersessões;
4. evitar duas fontes concorrentes sem precedência clara;
5. atualizar Source of Truth, AGENTS, README documental, Execution Plan e Checkpoint;
6. não inicializar aplicação, banco ou Vercel;
7. não executar deployment;
8. ao final promover uma tarefa refinada derivada de `US-PLAT-001` como próxima ação técnica.

`US-PLAT-001` não deve começar enquanto OPS-004 permanecer como `NEXT_ACTION`.