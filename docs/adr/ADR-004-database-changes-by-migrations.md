# ADR-004 — Mudanças de banco somente por migrations

**Status:** Accepted  
**Data:** 2026-08-03  
**Migrado para ADR em:** 2026-08-31  
**Supersedes:** none  
**Superseded by:** none

## Contexto

O Caleida precisa de schema reproduzível, auditável e recuperável. Alterações feitas apenas por dashboard/Console criariam estado oculto, dificultariam revisão e tornariam ambientes inconsistentes.

## Decisão

Toda alteração persistente de schema deve ser versionada por migration no Git.

Na arquitetura Neon vigente:

- migrations canônicas ficam em `database/migrations/`;
- testes de banco ficam em `database/tests/`;
- migrations aplicadas não são reescritas para alterar história;
- correções usam migration posterior;
- constraints, FKs, índices e RLS fazem parte da mudança quando aplicáveis;
- verificação destrutiva ocorre em branch Neon descartável, nunca em Production.

## Consequências

- o banco pode ser reconstruído desde baseline conhecida;
- review de código inclui mudanças estruturais;
- Console/dashboard não é fonte canônica de schema;
- migrations e testes tornam-se evidência de implementação;
- tooling deve permanecer simples e reproduzível, sem introduzir ORM apenas para migrations.

## Relações

- Origem histórica: `DEC-006`.
- Plataforma atual: `ADR-005` e `docs/NEON_PLATFORM.md`.
- Protocolo: `00_SYSTEM/VERIFICATION_PROTOCOL.md`.
