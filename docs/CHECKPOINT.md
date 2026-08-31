# Checkpoint — Caleida

**PROJECT_STATUS:** READY  
**CURRENT_PHASE:** Incremento 0 — Fundação executável / início técnico  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `OPS-004 — Evoluir o registro de decisões para ADRs`  
**LAST_COMPLETED_ISSUE:** `#6`  
**BASELINE_BEFORE_OPS_004:** `8be56851684a891d4001c5eb740a38d8d647d999`  
**ACTIVE_TASK:** none  
**ACTIVE_ISSUE:** none  
**ACTIVE_BRANCH:** none  
**NEXT_ACTION:** `US-PLAT-001 — Inicializar a aplicação web`  
**BLOCKERS:** none  
**ON_HOLD:** none  
**MANUAL_ACTION_REQUIRED:** none

## Comando de continuação

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

Recupere o estado pelo GitHub e pelos documentos canônicos. Não peça ao usuário contexto já disponível.

## Estado técnico atual

O projeto concluiu a reconciliação operacional e está pronto para o primeiro bootstrap técnico.

Ainda não existe:

- aplicação Next.js inicializada;
- `package.json`/lockfile de aplicação;
- schema/migrations de produto;
- projeto Neon do Caleida;
- Neon Auth/Data API implementados;
- Object Storage escolhido;
- projeto/conexão Vercel criada pela execução canônica;
- Preview/Production deployment.

Assets/documentação existentes devem ser preservados durante o bootstrap.

## Autoridade arquitetural

A partir de OPS-004, `docs/adr/` é a fonte canônica das decisões arquiteturais.

ADRs migrados:

- `ADR-001` — catálogo global separado da biblioteca pessoal — `Accepted`;
- `ADR-002` — stack técnica original — `Superseded em partes`;
- `ADR-003` — Supabase Free temporário — `Superseded`;
- `ADR-004` — mudanças de banco somente por migrations — `Accepted`;
- `ADR-005` — Neon como plataforma de dados/identidade — `Accepted`;
- `ADR-006` — Object Storage desacoplado/adiado — `Accepted`;
- `ADR-007` — deployment Vercel humano/manual — `Accepted`.

`docs/DECISIONS.md` agora é índice/histórico legado e mantém `DEC-001` (produto) e `DEC-005` (processo) sem competir com ADRs.

## Plataforma vigente

```text
Next.js / React / TypeScript
→ Neon Auth
→ Neon Data API
→ Neon Postgres
→ PostgreSQL RLS
```

Banco segue `ADR-004`; Storage segue `ADR-006`; deployment segue `ADR-007`.

## Deployment

- IA/automações não publicam;
- push/PR/merge não publicam;
- release Vercel é humana/manual;
- nenhum deployment é necessário para a próxima Story.

## Verificação de OPS-004

- estado real da `main` inspecionado: `PASS`;
- decisões arquiteturais classificadas: `PASS`;
- sete ADRs migrados com origem/status/supersessão: `PASS`;
- `DECISIONS.md` convertido sem apagar histórico: `PASS`;
- precedência ADR × legado definida: `PASS`;
- protocolos/documentação operacional reconciliados: `PASS`;
- `US-PLAT-001` refinada no Execution Plan: `PASS`;
- código de aplicação: `SKIPPED — não alterado`;
- lint/typecheck/test/build: `SKIPPED — aplicação ainda não existe`;
- Neon/banco: `SKIPPED — não alterado`;
- Vercel/deployment: `SKIPPED — não alterado e deployment proibido para IA`;
- secrets adicionados: `PASS — nenhum`.

## Próxima ação — US-PLAT-001

Executar somente:

> `US-PLAT-001 — Inicializar a aplicação web`

A especificação executável está em `docs/EXECUTION_PLAN.md`.

Requisitos essenciais:

1. verificar documentação oficial corrente de Next.js, React e Node antes de escolher versões;
2. pin de runtime e um único package manager/lockfile;
3. Next.js App Router + React + TypeScript strict;
4. fundação Tailwind conforme stack vigente;
5. scripts reais de lint/typecheck/test/build;
6. página mínima sem feature de negócio;
7. preservar assets existentes;
8. nenhum Neon/Auth/Storage/Vercel remoto;
9. nenhum `vercel.json` ou deployment nesta Story;
10. executar clean install, lint, typecheck, test e build antes de concluir.

Não há mais tarefa OPS bloqueando o início técnico.
