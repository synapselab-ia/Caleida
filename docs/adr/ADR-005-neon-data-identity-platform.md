# ADR-005 — Neon como plataforma canônica de dados e identidade

**Status:** Accepted  
**Data:** 2026-08-31  
**Supersedes:** `ADR-003` e a parte Supabase de `ADR-002`  
**Superseded by:** none

## Contexto

Antes do bootstrap da aplicação, o Caleida ainda não possuía schema, migrations, Auth ou banco hospedado. Isso permitia trocar a plataforma sem migração de dados.

A arquitetura precisava manter Postgres, autenticação gerenciada, autorização por RLS, ambientes isolados e verificação descartável, evitando a restrição operacional que motivou a revisão do Supabase Free.

## Decisão

O Caleida adota:

- Neon Postgres para persistência relacional;
- Neon Auth como solução inicial de identidade;
- Neon Data API como caminho preferencial para CRUD normal sob contexto de usuário quando apropriado;
- PostgreSQL RLS como autorização persistente;
- projeto Neon separado para Production;
- projeto Neon separado para non-production/staging;
- branches Neon descartáveis no projeto non-production para migrations, testes e verificação;
- `database/migrations/` e `database/tests/` como layout canônico planejado.

Conexões privilegiadas ao Postgres ficam restritas a contextos server-side confiáveis, migrations/manutenção e least privilege.

## Consequências

- Supabase deixa de governar implementação nova;
- Production não é laboratório de migrations/RLS;
- JWT/RLS devem ser testados com identidade normal da aplicação;
- owner/BYPASSRLS não prova autorização de usuário;
- secrets e connection strings permanecem fora do Git;
- capacidade, preço, restore, SLA e limites externos devem ser revalidados antes de gates operacionais relevantes.

## Guardrails

- APIs, SDKs, helpers de identidade e limites do Neon devem ser verificados na documentação oficial corrente durante implementação;
- autenticação não substitui ownership/visibilidade em RLS;
- mudanças de schema seguem `ADR-004`.

## Relações

- Origem histórica: `DEC-007`.
- Supersedes `ADR-003` e parte de `ADR-002`.
- Amendment: `docs/PROJECT_DESIGN_PLATFORM_AMENDMENT.md`.
- Especificação: `docs/NEON_PLATFORM.md`.

## Evidência externa

A decisão foi validada contra documentação oficial Neon/Supabase em `OPS-002` em 2026-08-31. Dados externos devem ser revalidados na Story que efetivamente implementar cada integração.
