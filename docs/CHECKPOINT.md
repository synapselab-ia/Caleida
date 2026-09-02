# Checkpoint — Caleida

**PROJECT_STATUS:** READY  
**CURRENT_PHASE:** Incremento 1 — Fundação visual / EPIC-01 Identidade e design system  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `US-DS-001 — Materializar tokens de cor e temas base`  
**LAST_COMPLETED_ISSUE:** `#33`  
**LAST_COMPLETED_PR:** `#34`  
**ACTIVE_TASK:** none  
**ACTIVE_ISSUE:** none  
**ACTIVE_BRANCH:** none  
**ACTIVE_PR:** none  
**NEXT_ACTION:** `US-DS-002 — Integrar tipografia e assinatura de marca`  
**BLOCKERS:** none  
**ON_HOLD:** none  
**MANUAL_ACTION_REQUIRED:** none

## Comando de continuação

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

Recupere o estado real no GitHub e siga os documentos canônicos. Não refaça Stories concluídas.

## Incremento 0

**Incremento 0 — Fundação executável: CONCLUÍDO.**

Evidência detalhada: `docs/INCREMENT_0_VALIDATION.md`.

## Incremento 1 — estado integrado após US-DS-001

Ordem vigente:

```text
US-DS-001 tokens/temas — CONCLUÍDA
  ↓
US-DS-002 tipografia/marca — NEXT_ACTION
  ↓
US-DS-003 primitivos acessíveis
  ↓
US-DS-004 fundação responsiva aplicada
```

Plano detalhado: `docs/INCREMENT_1_PLAN.md`.

## US-DS-001 — resultado

A Story foi executada em:

```text
Issue: #33
Branch: feat/us-ds-001-design-tokens
PR: #34
Contrato visual: docs/DESIGN_TOKENS.md
Contrato automatizado: tests/design-tokens-contract.test.mjs
```

### Tokens materializados

`src/app/globals.css` agora contém:

- paleta canônica do Project Design em `@theme`;
- aliases semânticos para background, surface, surface-raised, border, text-primary, text-muted, accent e focus;
- `@theme inline` para expor aliases runtime no namespace de cores do Tailwind CSS 4;
- light/dark por `prefers-color-scheme`, sem JavaScript, cookie, localStorage ou theme switch persistido;
- `color-scheme` coerente com a preferência do sistema;
- tokens para Livro, Mangá, Manhwa, Manhua, Filme, Série e Anime.

Valores definidos nesta Story para categorias sem hexadecimal canônico:

```text
Manhua / coral: #D9685B
Série / ciano: #278EAF
Anime / verde-azulado: #278F83
```

Accent/focus escuro: `#A994FF`, tint acessível derivado do violeta canônico `#7457E8`. O token de marca original permanece inalterado.

### Contraste protegido

`tests/design-tokens-contract.test.mjs` lê os próprios tokens CSS e calcula contraste WCAG.

Mínimos verificados no contrato:

```text
Light
text-primary >= 14.72:1
text-muted   >= 4.90:1
accent       >= 4.57:1

Dark
text-primary >= 14.77:1
text-muted   >= 6.73:1
accent       >= 6.44:1

focus >= 3:1 contra background/surfaces suportadas
```

Cores de categoria continuam sendo pistas auxiliares; nunca são o único identificador conceitual.

## Verificação de US-DS-001

- documentação oficial Tailwind CSS 4 (`@theme`, `@theme inline`, custom colors): `PASS — verificada em 02/09/2026`;
- diff inicial limitado a `globals.css`, contrato automatizado e documentação visual: `PASS`;
- dependências/package-lock: `PASS — nenhuma alteração`;
- componentes/telas/feature funcional: `PASS — nenhuma alteração`;
- migration/banco/Auth/RLS/Storage: `PASS — nenhuma alteração`;
- secrets/tokens/connection strings: `PASS — nenhum introduzido`;
- CI inicial da PR #34, head `b7abe1dfb1a6efb26a3da07a445e8723386d12c2`, run `33645092044`: `PASS`;
- `npm run verify`: `PASS` no CI inicial;
- PostgreSQL 18 + `npm run verify:db`: `PASS` no CI inicial, embora sem impacto semântico nesta Story;
- gate Neon-specific: `SKIPPED — nenhuma mudança depende de comportamento gerenciado do Neon`;
- consulta/mutação remota Neon nesta Story: `SKIPPED — não aplicável ao escopo visual`;
- deployment Vercel: `SKIPPED/PROIBIDO` conforme `ADR-007`;
- CI do head documental final da PR #34: **deve estar `PASS` antes do merge**;
- CI pós-merge da `main`: **deve estar `PASS` antes do fechamento operacional da sessão; evidência final deve ser registrada em #33/#34**.

## Estado técnico preservado

- Next.js `16.3.3` / React `19.2.8`;
- TypeScript strict;
- Tailwind CSS 4;
- Node `24.20.0` / npm `11.19.0`;
- CI permanente continua sem CD;
- banco/migrations/Neon não foram alterados;
- `vercel.json` e política de release manual permanecem inalterados.

## Próxima ação — US-DS-002

Executar somente:

> `US-DS-002 — Integrar tipografia e assinatura de marca`

A próxima Story deve criar Issue/branch próprias, ler `docs/DESIGN_TOKENS.md`, inspecionar os ativos reais de `public/brand` e revalidar a documentação oficial corrente do Next.js para fontes antes de implementar.

Não fabricar variantes de logo ausentes, não antecipar os primitivos de `US-DS-003` e não iniciar Auth/banco/features funcionais.
