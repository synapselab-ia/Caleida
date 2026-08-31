# ADR-001 — Catálogo global separado da biblioteca pessoal

**Status:** Accepted  
**Data:** 2026-08-03  
**Migrado para ADR em:** 2026-08-31  
**Supersedes:** none  
**Superseded by:** none

## Contexto

O Caleida precisa representar obras compartilhadas por toda a plataforma e, ao mesmo tempo, preservar status, progresso, notas, resenhas, favoritos e demais dados individuais de cada usuário.

Duplicar a obra inteira para cada usuário criaria inconsistência de metadados, dificultaria curadoria e tornaria mesclagens/correções perigosas para dados pessoais.

## Decisão

Cada obra possui um registro global compartilhado no catálogo. A experiência individual é armazenada em uma relação separada entre usuário e obra.

Dados globais não são duplicados por usuário. Dados pessoais não pertencem ao registro global da obra.

## Consequências

- uma obra pode estar em qualquer quantidade de bibliotecas pessoais sem ser duplicada no catálogo;
- remover uma entrada pessoal não exclui a obra global;
- exclusão/mesclagem de obra global deve preservar relações pessoais;
- curadoria de metadados globais pode evoluir sem sobrescrever progresso, nota ou resenha do usuário;
- o schema futuro deve impor unicidade e integridade coerentes com essa separação.

## Relações

- Origem histórica: `DEC-002`.
- Project Design: princípios `PR-01`, `PR-02` e seção de modelo central.
- Arquitetura: `docs/ARCHITECTURE.md`.
