# ADR-006 — Object Storage desacoplado e decisão adiada

**Status:** Accepted  
**Data:** 2026-08-31  
**Supersedes:** none  
**Superseded by:** none

## Contexto

O produto futuramente precisará armazenar arquivos próprios, como avatar e banner, mas nenhum fluxo de upload existe no Incremento 0. Escolher o provedor junto com o banco criaria acoplamento prematuro sem benefício imediato.

Na decisão original, Neon Object Storage ainda estava em beta, reforçando a necessidade de adiar a escolha.

## Decisão

O Caleida não escolhe provedor de Object Storage antes da Story específica de arquivos/upload.

Até essa decisão:

- Object Storage não integra a plataforma canônica;
- nenhum bucket ou credencial é criado antecipadamente;
- capas externas continuam por URL quando permitido;
- metadados futuros de arquivos devem permanecer provider-independent;
- a futura Story deve reavaliar opções atuais, inclusive soluções S3-compatible e Neon Object Storage se estiver adequado naquele momento.

## Consequências

- reduz acoplamento prematuro;
- preserva substituibilidade de infraestrutura;
- posterga configuração, custo e superfície de segurança sem bloquear o Incremento 0;
- a decisão futura deverá considerar privacidade, autorização, lifecycle, backup, custo, regiões e maturidade operacional.

## Relações

- Origem histórica: `DEC-008`.
- Plataforma de dados: `ADR-005`.
- Amendment: `docs/PROJECT_DESIGN_PLATFORM_AMENDMENT.md`.

## Evidência externa

A maturidade do Neon Object Storage foi verificada em `OPS-002` em 2026-08-31. Seu estado deve ser revalidado quando a Story de Storage for executada.
