# Architecture Decision Records — Caleida

**Status:** índice canônico de decisões arquiteturais

A partir de `OPS-004`, este diretório é a fonte canônica para decisões de arquitetura do Caleida.

`docs/DECISIONS.md` permanece como índice/histórico legado de decisões de produto, processo e arquitetura, mas uma entrada arquitetural migrada não compete com seu ADR: o ADR correspondente prevalece.

## Convenções

Cada ADR deve registrar, no mínimo:

- título e identificador;
- status;
- data da decisão;
- contexto;
- decisão;
- consequências;
- relações de supersessão, quando existirem;
- origem histórica quando migrado de uma `DEC-*`.

Status permitidos:

- `Proposed` — em avaliação;
- `Accepted` — decisão vigente;
- `Superseded` — substituída total ou parcialmente por ADR posterior; o escopo da supersessão deve ser explicitado no ADR;
- `Deprecated` — não deve ser usada em trabalho novo, sem substituta direta obrigatória;
- `Rejected` — considerada e não adotada.

## Regra de imutabilidade histórica

Depois de aceito, um ADR não deve ser reescrito para fazer uma decisão antiga parecer compatível com o estado atual.

São permitidas correções editoriais que não mudem semântica e atualização de links/metadados. Uma mudança material deve gerar novo ADR e registrar `Supersedes` / `Superseded by`.

## Índice

| ADR | Status | Decisão | Origem |
|---|---|---|---|
| [ADR-001](ADR-001-global-catalog-personal-library.md) | Accepted | Catálogo global separado da biblioteca pessoal | `DEC-002` |
| [ADR-002](ADR-002-original-technical-stack.md) | Superseded | Stack técnica original — supersessão parcial | `DEC-003` |
| [ADR-003](ADR-003-supabase-free-temporary-infrastructure.md) | Superseded | Supabase Free como infraestrutura temporária | `DEC-004` |
| [ADR-004](ADR-004-database-changes-by-migrations.md) | Accepted | Mudanças de banco somente por migrations | `DEC-006` |
| [ADR-005](ADR-005-neon-data-identity-platform.md) | Accepted | Neon como plataforma canônica de dados e identidade | `DEC-007` |
| [ADR-006](ADR-006-object-storage-deferred.md) | Accepted | Object Storage desacoplado e decisão adiada | `DEC-008` |
| [ADR-007](ADR-007-manual-vercel-deployment.md) | Accepted | Deployment Vercel exclusivamente humano/manual | `DEC-009` |
| [ADR-008](ADR-008-ephemeral-postgres-verification.md) | Accepted | PostgreSQL efêmero como gate primário de migrations/RLS portáveis | decisão de `US-PLAT-005` |

## O que não virou ADR

- `DEC-001 — Plataforma pública com beta fechado`: decisão de produto, governada principalmente pelo Project Design.
- `DEC-005 — Desenvolvimento incremental por User Story`: decisão de processo, hoje materializada pelo protocolo canônico e pelo Execution Plan.

Elas continuam preservadas em `docs/DECISIONS.md` até existir motivo real para um registro próprio de decisões não arquiteturais.

## Novos ADRs

Use `TEMPLATE.md` e o próximo número sequencial. Antes de aceitar uma nova decisão, verifique se ela supersede algum ADR existente e atualize o índice e as relações correspondentes na mesma unidade de trabalho.
