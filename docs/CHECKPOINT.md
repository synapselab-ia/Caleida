# Checkpoint — Caleida

**PROJECT_STATUS:** READY  
**CURRENT_PHASE:** Incremento 1 — Fundação visual / EPIC-01 Identidade e design system  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `US-DS-003 — Criar primitivos acessíveis essenciais`  
**LAST_COMPLETED_ISSUE:** `#37`  
**LAST_COMPLETED_PR:** `#38`  
**ACTIVE_TASK:** none  
**ACTIVE_ISSUE:** none  
**ACTIVE_BRANCH:** none  
**ACTIVE_PR:** none  
**NEXT_ACTION:** `US-DS-004 — Consolidar fundação responsiva e aplicar identidade à base`  
**BLOCKERS:** none  
**ON_HOLD:** none  
**MANUAL_ACTION_REQUIRED:** none

## Comando de continuação

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

Recupere o estado real no GitHub e siga os documentos canônicos. Não refaça Stories concluídas.

## Incremento 0

**Incremento 0 — Fundação executável: CONCLUÍDO.**

Evidência detalhada: `docs/INCREMENT_0_VALIDATION.md`.

## Incremento 1 — estado integrado após US-DS-003

```text
US-DS-001 tokens/temas — CONCLUÍDA
  ↓
US-DS-002 tipografia/marca — CONCLUÍDA
  ↓
US-DS-003 primitivos acessíveis — CONCLUÍDA
  ↓
US-DS-004 fundação responsiva aplicada — NEXT_ACTION
```

Plano detalhado: `docs/INCREMENT_1_PLAN.md`.

## US-DS-003 — resultado

```text
Issue: #37
Branch: feat/us-ds-003-accessible-primitives
PR: #38
Contrato: docs/UI_PRIMITIVES.md
Contrato automatizado: tests/ui-primitives-contract.test.mjs
```

### Primitivos materializados

- `src/components/ui/Button.tsx`: `<button>` nativo e tipado, `type="button"` por padrão, variantes `primary`/`secondary`, hover somente quando enabled, disabled nativo e `focus-visible` explícito;
- `src/components/ui/FormField.tsx`: `<label htmlFor>` + `<input>`, `id` obrigatório, descrição/erro associados por `aria-describedby`, `aria-invalid` somente quando há erro e pistas textuais para obrigatório/erro;
- `src/components/ui/Feedback.tsx`: `note` sem live region, `status` para atualização não urgente e `alert` somente para mensagem urgente;
- todos usam tokens canônicos de `US-DS-001` e herdam a tipografia de `US-DS-002`;
- nenhum primitivo foi aplicado à página base, preservando o escopo de `US-DS-004`;
- nenhuma biblioteca externa de UI, dependência npm ou feature de produto foi adicionada.

### Acessibilidade

- HTML nativo permanece a primeira camada de semântica;
- foco perceptível usa outline de 2 px + offset de 2 px com token `focus`;
- hover não é necessário para operar os controles;
- label, descrição, erro e estado inválido possuem relações programáticas explícitas;
- erro visível começa por `Erro:` e não depende apenas da cor da borda;
- feedback estático não recebe anúncio intrusivo por padrão;
- padrões WAI/WCAG correntes para foco, labels, `aria-describedby`, `aria-invalid` e status messages foram revalidados em 02/09/2026.

## Verificação de US-DS-003

- baseline: `main` `1fda10cd786749b2d5c220144b25b3c08ca92c79`, último CI anterior `33654393286` — `PASS`;
- Issue/branch/PR reais: `#37` / `feat/us-ds-003-accessible-primitives` / `#38`;
- diff inicial limitado a três primitivos, `docs/UI_PRIMITIVES.md` e teste de contrato: `PASS`;
- dependências/package-lock: `PASS — nenhuma alteração`;
- `src/app/page.tsx`, layout, migrations e workflow CI: `PASS — nenhuma alteração`;
- TypeScript strict e semântica/estados: `PASS` no CI inicial;
- CI inicial da PR #38, head `3839651f980ae6c693572fc6f2b4bd8045910736`, run `33656150580`: `PASS`;
- `npm run verify`: `PASS` no run inicial;
- PostgreSQL 18 + `npm run verify:db`: `PASS` no run inicial, embora sem impacto semântico nesta Story;
- gate Neon-specific: `SKIPPED — Story visual sem mudança de dados ou comportamento gerenciado do Neon`;
- consulta/mutação remota Neon: `SKIPPED — não aplicável ao escopo`;
- verificação visual composta em browser: `SKIPPED — os primitivos não são montados na página nesta Story; a prova visual/responsiva pertence a US-DS-004`;
- deployment Vercel: `SKIPPED/PROIBIDO` conforme `ADR-007`;
- CI do head documental final da PR #38: **deve estar `PASS` antes do merge**;
- CI pós-merge da `main`: **deve estar `PASS` antes do fechamento operacional; evidência final deve ser registrada em #37/#38**.

## Estado técnico preservado

- Next.js `16.3.3` / React `19.2.8`;
- TypeScript strict;
- Tailwind CSS 4;
- Node `24.20.0` / npm `11.19.0`;
- CI permanente continua sem CD;
- banco/migrations/Neon/Auth/RLS/Data API/Storage não foram alterados;
- `vercel.json` e política de release manual permanecem inalterados.

## Próxima ação — US-DS-004

Executar somente:

> `US-DS-004 — Consolidar fundação responsiva e aplicar identidade à base`

A próxima Story deve criar Issue/branch próprias, ler `docs/DESIGN_TOKENS.md`, `docs/BRAND_TYPOGRAPHY.md` e `docs/UI_PRIMITIVES.md`, aplicar a identidade à página técnica sem inventar ações ou fluxos e validar composição responsiva/acessibilidade em browser quando houver infraestrutura disponível.

Não iniciar Auth, convites, catálogo, biblioteca, banco ou qualquer feature do incremento funcional seguinte.
