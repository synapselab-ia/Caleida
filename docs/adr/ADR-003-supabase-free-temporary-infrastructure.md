# ADR-003 — Supabase Free como infraestrutura temporária

**Status:** Superseded  
**Data:** 2026-08-03  
**Migrado para ADR em:** 2026-08-31  
**Supersedes:** none  
**Superseded by:** `ADR-005`

## Contexto

O desenho inicial previa Supabase Free para desenvolvimento, staging e beta fechado, com Supabase local no desenvolvimento. A escolha antecedeu qualquer implementação real de schema, Auth ou infraestrutura do Caleida.

## Decisão original

Utilizar Supabase Free como infraestrutura temporária até que capacidade/custos exigissem evolução de plano ou plataforma.

## Motivo da supersessão

Antes do início da implementação, o limite operacional do Supabase Free e a disponibilidade de Neon Postgres/Auth/Data API/branching tornaram mais adequado mudar a plataforma sem custo de migração.

Nenhum recurso Supabase do Caleida precisou ser migrado.

## Consequências históricas

- referências a Supabase local, Postgres/Auth/Storage e limites do Free no Project Design v1.0 são históricas quando abrangidas pelo amendment de plataforma;
- trabalho novo deve seguir `ADR-005` e `docs/NEON_PLATFORM.md`;
- este ADR não autoriza reintroduzir Supabase sem nova decisão arquitetural.

## Relações

- Origem histórica: `DEC-004`.
- Superseded por `ADR-005`.
- Amendment: `docs/PROJECT_DESIGN_PLATFORM_AMENDMENT.md`.
