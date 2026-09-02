# Checkpoint — Caleida

**PROJECT_STATUS:** READY  
**CURRENT_PHASE:** Incremento 1 — Fundação visual / EPIC-01 Identidade e design system  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `US-DS-002 — Integrar tipografia e assinatura de marca`  
**LAST_COMPLETED_ISSUE:** `#35`  
**LAST_COMPLETED_PR:** `#36`  
**ACTIVE_TASK:** none  
**ACTIVE_ISSUE:** none  
**ACTIVE_BRANCH:** none  
**ACTIVE_PR:** none  
**NEXT_ACTION:** `US-DS-003 — Criar primitivos acessíveis essenciais`  
**BLOCKERS:** none  
**ON_HOLD:** none  
**MANUAL_ACTION_REQUIRED:** none

## Comando de continuação

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

Recupere o estado real no GitHub e siga os documentos canônicos. Não refaça Stories concluídas.

## Incremento 0

**Incremento 0 — Fundação executável: CONCLUÍDO.**

Evidência detalhada: `docs/INCREMENT_0_VALIDATION.md`.

## Incremento 1 — estado integrado após US-DS-002

Ordem vigente:

```text
US-DS-001 tokens/temas — CONCLUÍDA
  ↓
US-DS-002 tipografia/marca — CONCLUÍDA
  ↓
US-DS-003 primitivos acessíveis — NEXT_ACTION
  ↓
US-DS-004 fundação responsiva aplicada
```

Plano detalhado: `docs/INCREMENT_1_PLAN.md`.

## US-DS-002 — resultado

A Story foi executada em:

```text
Issue: #35
Branch: feat/us-ds-002-typography-brand
PR: #36
Contrato visual: docs/BRAND_TYPOGRAPHY.md
Contrato automatizado: tests/brand-typography-contract.test.mjs
```

### Tipografia materializada

- `src/app/fonts.ts` centraliza Manrope e Newsreader via `next/font/google`;
- Manrope é a fonte padrão da interface;
- Newsreader possui papel editorial explícito para resenhas, citações e retrospectivas;
- ambas usam subset `latin`, `display: "swap"` e fallbacks explícitos;
- Newsreader não é preloaded globalmente por ser família secundária;
- `src/app/layout.tsx` instala as duas variáveis de fonte no layout raiz;
- `src/app/globals.css` expõe `font-sans` e `font-editorial` sem alterar os tokens de cor de US-DS-001;
- o carregamento usa `next/font`, sem stylesheet do Google Fonts requisitada pelo browser em runtime.

### Assinatura de marca materializada

- o único ativo oficial disponível continua sendo `public/brand/caleida-logo-horizontal.png`;
- `src/components/brand/CaleidaLogo.tsx` usa `next/image` com caminho público, caixa responsiva estável e `object-contain`;
- não houve recoloração, filtro, recorte ou reconstrução do logo;
- versões clara/escura, símbolo, favicon, vetor e ícones permanecem pendências reais de ativo;
- `src/app/page.tsx` não foi redesenhada; aplicação da identidade à página base permanece em US-DS-004.

## Verificação de US-DS-002

- documentação oficial corrente do Next.js para `next/font`: `PASS — revalidada em 02/09/2026`;
- dependências/package-lock: `PASS — nenhuma alteração`;
- primitivos/telas/feature funcional: `PASS — nenhuma antecipação de US-DS-003/US-DS-004`;
- migration/banco/Auth/RLS/Data API/Storage: `PASS — nenhuma alteração`;
- secrets/tokens/connection strings: `PASS — nenhum introduzido`;
- CI inicial da PR #36, run `33653117310`: `FAIL` legítimo em typecheck por import estático do PNG fora de `src/`;
- correção: logo passou a usar `/brand/caleida-logo-horizontal.png` com `next/image`, `fill` e caixa responsiva estável, sem relaxar gate;
- CI corrigido da PR #36, head `f6db6b5237ae77ac1597bc5889c8acf21204792d`, run `33653441581`: `PASS`;
- `npm run verify`: `PASS` no run corrigido;
- PostgreSQL 18 + `npm run verify:db`: `PASS` no run corrigido;
- gate Neon-specific: `SKIPPED — nenhuma mudança depende de comportamento gerenciado do Neon`;
- consulta/mutação remota Neon nesta Story: `SKIPPED — não aplicável ao escopo visual`;
- verificação visual em browser: `SKIPPED — Story não aplica o componente à página base e nenhum deployment/dev server remoto é gate; validação visual de composição pertence a US-DS-004`;
- deployment Vercel: `SKIPPED/PROIBIDO` conforme `ADR-007`;
- CI do head documental final da PR #36: **deve estar `PASS` antes do merge**;
- CI pós-merge da `main`: **deve estar `PASS` antes do fechamento operacional da sessão; evidência final deve ser registrada em #35/#36**.

## Estado técnico preservado

- Next.js `16.3.3` / React `19.2.8`;
- TypeScript strict;
- Tailwind CSS 4;
- Node `24.20.0` / npm `11.19.0`;
- CI permanente continua sem CD;
- banco/migrations/Neon não foram alterados;
- `vercel.json` e política de release manual permanecem inalterados.

## Próxima ação — US-DS-003

Executar somente:

> `US-DS-003 — Criar primitivos acessíveis essenciais`

A próxima Story deve criar Issue/branch próprias, ler `docs/DESIGN_TOKENS.md` e `docs/BRAND_TYPOGRAPHY.md`, inspecionar os padrões existentes e implementar apenas botão, campo/form-field e feedback mínimos, tipados e acessíveis.

Não iniciar redesign da página base de `US-DS-004`, não adicionar biblioteca de componentes sem necessidade demonstrada e não iniciar Auth/banco/features funcionais.
