# ADR-002 — Stack técnica original

**Status:** Superseded  
**Supersession scope:** parcial  
**Data:** 2026-08-03  
**Migrado para ADR em:** 2026-08-31  
**Supersedes:** none  
**Superseded by:** `ADR-005` (dados/identidade) e `ADR-007` (deployment)

## Contexto

Na fundação documental inicial, o Caleida precisava de uma stack de referência para orientar backlog e arquitetura antes de existir código.

## Decisão original

A stack foi definida como GitHub, Codex, Next.js, React, TypeScript, Tailwind CSS, Vercel e Supabase. O modelo original também pressupunha Preview/Production Vercel ligados ao fluxo de branches/PRs.

## Estado após supersessões

- Next.js, React, TypeScript, Tailwind CSS, GitHub e Vercel como destino de hosting continuam compatíveis com a arquitetura vigente;
- Supabase como plataforma de dados/identidade foi substituído por Neon em `ADR-005`;
- deployment automático ligado a Git foi substituído por release humana/manual em `ADR-007`.

## Consequências históricas

Este ADR permanece para explicar a origem da arquitetura e por que documentos v1.0 contêm referências a Supabase e Preview automático. Ele não deve ser usado para restaurar componentes explicitamente superseded.

## Relações

- Origem histórica: `DEC-003`.
- Superseded parcialmente por `ADR-005` e `ADR-007`.
- Project Design histórico: `docs/PROJECT_DESIGN.md` v1.0.
- Amendments: `docs/PROJECT_DESIGN_PLATFORM_AMENDMENT.md` e `docs/PROJECT_DESIGN_DEPLOYMENT_AMENDMENT.md`.
