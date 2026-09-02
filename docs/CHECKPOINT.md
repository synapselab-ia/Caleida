# Checkpoint — Caleida

**PROJECT_STATUS:** IN_PROGRESS  
**CURRENT_PHASE:** Planejamento do Incremento 1 — EPIC-01 Identidade e design system  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `US-PLAT-010 — Validar o ciclo técnico de entrega`  
**LAST_COMPLETED_ISSUE:** `#28`  
**LAST_COMPLETED_PR:** `#30`  
**ACTIVE_TASK:** `OPS-005 — Refinar o Incremento 1 (EPIC-01 — Identidade e design system)`  
**ACTIVE_ISSUE:** `#31`  
**ACTIVE_BRANCH:** `ops/005-refine-increment-1`  
**ACTIVE_PR:** `#32`  
**NEXT_ACTION:** `OPS-005 — concluir refino e, após merge, promover US-DS-001`  
**BLOCKERS:** none  
**ON_HOLD:** none  
**MANUAL_ACTION_REQUIRED:** none

## Comando de continuação

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

Recupere o estado real no GitHub e siga os documentos canônicos. Não refaça Stories concluídas.

## Incremento 0 — estado integrado

**Incremento 0 — Fundação executável: CONCLUÍDO.**

Última integração antes de OPS-005:

```text
main: 52065a10416432fd8d5b70b5a92c99a6dd9b5270
último CI main: 33560939552 — PASS
Issues abertas antes de OPS-005: nenhuma
PRs abertas antes de OPS-005: nenhuma
```

A evidência detalhada permanece em `docs/INCREMENT_0_VALIDATION.md`.

## OPS-005 — estado atual

A frente foi materializada como:

```text
Issue: #31
Branch: ops/005-refine-increment-1
PR: #32
Plano: docs/INCREMENT_1_PLAN.md
```

### Baseline visual inspecionada

- Project Design mantém `EPIC-01 — Identidade e design system` como fundação transversal;
- `src/app/globals.css` ainda possui somente Tailwind + `color-scheme` mínimo, sem tokens próprios;
- `src/app/layout.tsx` e `src/app/page.tsx` continuam mínimos;
- `public/brand/caleida-logo-horizontal.png` já existe como ativo oficial;
- variantes clara/escura, símbolo, favicon, vetor e ícone continuam registradas como futuras em `public/brand/README.md`;
- nenhum componente ou tela de produto foi implementado em OPS-005.

### Incremento 1 refinado

Objetivo operacional: materializar a fundação visual do Caleida antes dos fluxos funcionais de acesso controlado.

Stories ordenadas:

1. `US-DS-001 — Materializar tokens de cor e temas base` — P0;
2. `US-DS-002 — Integrar tipografia e assinatura de marca` — P0;
3. `US-DS-003 — Criar primitivos acessíveis essenciais` — P0;
4. `US-DS-004 — Consolidar fundação responsiva e aplicar identidade à base` — P1.

NFR-01 responsividade e NFR-02 acessibilidade/WCAG 2.2 AA permanecem requisitos transversais.

Detalhamento, critérios, dependências, non-goals e porta de saída: `docs/INCREMENT_1_PLAN.md`.

## Estado Neon conferido em OPS-005

```text
Projeto: caleida-nonprod
Project ID: patient-glade-95136440
Região: aws-us-east-1
PostgreSQL: 18
Branches: 1
Baseline: main / br-restless-cherry-awpcwy6r
```

- nenhum recurso Neon foi criado ou alterado;
- gate Neon-specific: `SKIPPED — OPS-005 é refino documental de UI sem comportamento Neon`;
- banco/migrations/RLS/Auth/Data API/Storage permanecem fora do escopo.

## Deployment

- nenhuma mudança de Vercel é necessária em OPS-005;
- `ADR-007` permanece vigente;
- IA não executa Preview/Production/promote/rollback/redeploy;
- deployment: `SKIPPED/PROIBIDO`.

## Verificação pendente para fechar OPS-005

1. CI permanente da PR #32 em `PASS` no head final;
2. revisão do diff completo, coerência documental e secrets;
3. revisão de reviews/threads/mergeability;
4. merge somente do head verificado;
5. CI pós-merge da `main` em `PASS`;
6. Issue #31 fechada e estado canônico final reconciliado.

## Próxima ação após integração

Se todos os gates acima passarem, promover exatamente:

> `US-DS-001 — Materializar tokens de cor e temas base`

Nenhuma implementação de `US-DS-001` deve ocorrer dentro de OPS-005.
