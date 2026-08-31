# Registro legado de decisões — Caleida

**Status:** índice histórico e registro de decisões não arquiteturais  
**Arquitetura canônica:** `docs/adr/`

A partir de `OPS-004`, decisões arquiteturais são registradas exclusivamente como Architecture Decision Records em `docs/adr/`.

Este arquivo permanece para:

- preservar identificadores `DEC-*` já citados historicamente;
- mapear decisões arquiteturais antigas para seus ADRs canônicos;
- manter decisões de produto/processo que não justificam ADR.

Quando uma entrada arquitetural deste arquivo divergir do ADR correspondente, **o ADR prevalece**.

## Mapa de migração arquitetural

| Decisão legado | Estado histórico | ADR canônico |
|---|---|---|
| `DEC-002` — Catálogo global e biblioteca pessoal separados | Aprovada | `ADR-001` |
| `DEC-003` — Stack técnica de referência original | Superseded em partes | `ADR-002` |
| `DEC-004` — Supabase Free como infraestrutura temporária | Superseded | `ADR-003` |
| `DEC-006` — Mudanças de banco somente por migration | Aprovada | `ADR-004` |
| `DEC-007` — Neon como plataforma canônica de dados e identidade | Aprovada | `ADR-005` |
| `DEC-008` — Storage desacoplado e decisão adiada | Aprovada | `ADR-006` |
| `DEC-009` — Deployment Vercel exclusivamente humano/manual | Aprovada | `ADR-007` |

## DEC-001 — Plataforma pública com beta fechado

**Data:** 03 de agosto de 2026  
**Tipo:** Produto  
**Status:** Aprovada

O Caleida será construído como plataforma pública multiusuário, mas seu lançamento inicial ocorrerá por convite ou aprovação administrativa.

Consequências principais:

- arquitetura multiusuário desde o início;
- privacidade, moderação e isolamento não podem ser adicionados apenas no final;
- beta controla custos, estabilidade e crescimento antes da abertura pública.

A autoridade principal dessa decisão é o `docs/PROJECT_DESIGN.md`.

## DEC-002 — Catálogo global e biblioteca pessoal separados

**Tipo:** Arquitetura de domínio  
**Status:** MIGRADA para `docs/adr/ADR-001-global-catalog-personal-library.md`

O conteúdo arquitetural canônico está em `ADR-001`.

## DEC-003 — Stack técnica de referência original

**Tipo:** Arquitetura  
**Status:** MIGRADA para `ADR-002`; superseded em partes por `ADR-005` e `ADR-007`

O histórico da stack original permanece em `ADR-002`.

## DEC-004 — Supabase Free como infraestrutura temporária

**Tipo:** Arquitetura  
**Status:** MIGRADA para `ADR-003`; superseded por `ADR-005`

## DEC-005 — Desenvolvimento incremental por User Story

**Data:** 03 de agosto de 2026  
**Tipo:** Processo  
**Status:** Aprovada

O produto será construído por incrementos, épicos e User Stories pequenas e verificáveis.

Consequências principais:

- cada tarefa possui critérios de aceite e non-goals;
- trabalho é limitado pela `NEXT_ACTION`;
- cada entrega reconcilia Checkpoint/documentação;
- funcionalidades futuras não são antecipadas sem necessidade.

A materialização operacional desta decisão está em `00_SYSTEM/AI_WORK_PROTOCOL.md` e `docs/EXECUTION_PLAN.md`.

## DEC-006 — Mudanças de banco somente por migration

**Tipo:** Arquitetura  
**Status:** MIGRADA para `docs/adr/ADR-004-database-changes-by-migrations.md`

## DEC-007 — Neon como plataforma canônica de dados e identidade

**Tipo:** Arquitetura  
**Status:** MIGRADA para `docs/adr/ADR-005-neon-data-identity-platform.md`

## DEC-008 — Storage desacoplado e decisão adiada

**Tipo:** Arquitetura  
**Status:** MIGRADA para `docs/adr/ADR-006-object-storage-deferred.md`

## DEC-009 — Deployment Vercel exclusivamente humano e manual

**Tipo:** Arquitetura  
**Status:** MIGRADA para `docs/adr/ADR-007-manual-vercel-deployment.md`

## Regra para decisões futuras

- arquitetura: criar/alterar relação de supersessão em `docs/adr/`;
- produto: atualizar Project Design/amendment apropriado e registrar decisão adicional somente quando útil;
- processo operacional: atualizar protocolo/Execution Plan correspondente.

Não crie uma nova `DEC-*` arquitetural em paralelo a um ADR.
