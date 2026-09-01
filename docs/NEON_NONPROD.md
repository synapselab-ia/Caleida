# Neon Non-Production — Caleida

**Status:** provisionado  
**Data de referência:** 2026-09-01  
**Projeto relacionado:** `docs/NEON_PLATFORM.md`  
**Decisões:** `ADR-004`, `ADR-005` e `ADR-008`

## 1. Recurso remoto canônico

A fundação Neon non-production do Caleida existe na organização conectada.

```text
Projeto: caleida-nonprod
Project ID: patient-glade-95136440
Região: aws-us-east-1
PostgreSQL: 18
Branch baseline: main
Branch ID: br-restless-cherry-awpcwy6r
Database default: neondb
```

Os IDs acima identificam recursos e **não são credenciais**. Senhas, connection strings e API keys nunca devem ser registradas neste arquivo.

## 2. Papel do branch `main`

No projeto Neon `caleida-nonprod`, o branch `main` é a baseline canônica de non-production/staging.

Ele não deve ser confundido com a branch Git `main`.

Responsabilidades:

- receber somente mudanças persistentes de banco aprovadas e versionadas por migrations;
- representar o estado integrado de non-production;
- servir de referência para branches descartáveis quando um gate Neon-specific exigir isolamento no serviço;
- nunca receber experimentos destrutivos diretamente.

## 3. Convenção de branches temporárias

Quando necessárias, use branches curtas e descartáveis:

```text
verify/<task-id>
dev/<task-id>
```

Regras:

- derivar da baseline non-production adequada;
- usar branch isolada para testes que dependam de comportamento específico do Neon;
- remover a branch após a tarefa;
- não usar Production como parent operacional de testes;
- não manter branches temporárias como ambientes permanentes.

Branches Neon continuam úteis para integração e compatibilidade do serviço, mas `ADR-008` não as torna requisito para provar SQL PostgreSQL portável.

## 4. Estado do conector Neon em US-PLAT-005

A leitura/provisionamento do projeto funciona normalmente pelo conector Neon.

As rotas de criação de branch e de migration temporária apresentaram incompatibilidade entre o contrato público do wrapper e o backend:

- wrapper expõe parâmetros camelCase;
- backend rejeita essas chaves e solicita nomes snake_case;
- as chamadas falham antes de criar recurso ou executar DDL.

Foram testadas tanto a ação direta de criação de branch quanto a rota oficial de migration temporária; ambas falharam pela mesma incompatibilidade.

Consequências:

- nenhum DDL foi executado na baseline Neon `main`;
- nenhuma branch temporária foi criada por workaround;
- o problema do conector fica registrado como limitação de integração;
- ele só bloqueia futuras mudanças que realmente necessitem de gate Neon-specific.

A fundação de migrations PostgreSQL portáveis é verificada em PostgreSQL 18 descartável conforme `ADR-008`.

## 5. Credenciais e connection strings

Nenhum valor real é versionado.

Contrato atual:

- `DATABASE_URL` — conexão pooled para runtime server-side futuro quando apropriado;
- `DATABASE_URL_UNPOOLED` — conexão PostgreSQL direta usada pelo tooling;
- `CALEIDA_DB_TARGET=ephemeral` — gate primário PostgreSQL descartável;
- `CALEIDA_DB_TARGET=neon-isolated` + `CALEIDA_NEON_BRANCH_ID` — gate Neon-specific em branch descartável;
- `CALEIDA_DB_TARGET=baseline` + branch ID canônico + `CALEIDA_ALLOW_BASELINE_MIGRATIONS=YES` — promoção deliberada para a baseline.

Neon API key e credenciais owner/admin continuam fora do Git e do browser.

## 6. Serviços deliberadamente não provisionados

Ainda não foram provisionados:

- Neon Auth;
- Neon Data API;
- Object Storage;
- projeto Neon de Production;
- schema funcional/tabelas/RLS de produto;
- integração do Next.js com o banco;
- CI permanente;
- Vercel/deployment.

## 7. Production

`caleida-production` **não existe por decisão deliberada nesta fase**.

Production será um projeto Neon separado quando uma Story futura exigir ambiente real de produção. Non-production não deve compartilhar secrets, usuários ou dados reais com Production.
