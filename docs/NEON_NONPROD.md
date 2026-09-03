# Neon Non-Production — Caleida

**Status:** provisionado; Neon Auth habilitado na baseline após US-AUTH-001  
**Data de referência:** 2026-09-02  
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

Os IDs acima identificam recursos e **não são credenciais**. Senhas, connection strings, Auth URLs e API keys nunca devem ser registradas neste arquivo.

## 2. Papel do branch `main`

No projeto Neon `caleida-nonprod`, o branch `main` é a baseline canônica de non-production/staging.

Ele não deve ser confundido com a branch Git `main`.

Responsabilidades:

- receber somente mudanças persistentes aprovadas depois dos gates aplicáveis;
- representar o estado integrado de non-production;
- servir de referência para branches descartáveis quando um gate Neon-specific exigir isolamento no serviço;
- nunca receber experimentos destrutivos diretamente.

A baseline possui Neon Auth gerenciado desde `US-AUTH-001`, mas continua sem schema funcional de produto, Data API e dados reais de beta.

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

## 4. Estado do conector Neon

Em `US-PLAT-005`, as rotas de criação de branch/migration temporária apresentaram incompatibilidade camelCase/snake_case e ficaram registradas como limitação operacional daquela sessão.

Em `US-AUTH-001`, a criação de branch voltou a funcionar pela ação corrente do conector quando usada sem compute inicial. O fluxo verificado foi:

1. criar branch isolada sem compute;
2. criar endpoint read-write próprio;
3. provisionar Neon Auth Better Auth somente na branch isolada;
4. comprovar o schema gerenciado `neon_auth`;
5. manter a baseline sem Auth durante a experimentação;
6. somente após CI e gate Neon-specific em PASS, provisionar Neon Auth deliberadamente na baseline non-production.

A baseline nunca foi usada como laboratório para contornar o isolamento.

## 5. Credenciais, Auth e connection strings

Nenhum valor real é versionado.

Contrato atual:

- `DATABASE_URL` — conexão pooled para runtime server-side futuro quando apropriado;
- `DATABASE_URL_UNPOOLED` — conexão PostgreSQL direta usada pelo tooling;
- `CALEIDA_DB_TARGET=ephemeral` — gate primário PostgreSQL descartável;
- `CALEIDA_DB_TARGET=neon-isolated` + `CALEIDA_NEON_BRANCH_ID` — gate Neon-specific em branch descartável;
- `CALEIDA_DB_TARGET=baseline` + branch ID canônico + `CALEIDA_ALLOW_BASELINE_MIGRATIONS=YES` — promoção deliberada de migrations para a baseline;
- `NEON_AUTH_BASE_URL` — endpoint Auth branch-scoped do ambiente correspondente, mantido fora do Git;
- `NEON_AUTH_COOKIE_SECRET` — secret server-only de assinatura do cache de sessão, mantido fora do Git.

Neon API key, connection strings, Auth URLs reais, cookie secrets e credenciais owner/admin continuam fora do Git e do browser.

## 6. Estado após US-AUTH-001

A baseline non-production passou a possuir:

- Neon Auth gerenciado com provider `better_auth`;
- schema gerenciado `neon_auth` no database `neondb`;
- endpoint Auth branch-scoped administrado pelo Neon;
- integração de aplicação versionada em `src/lib/auth/server.ts` e `src/app/api/auth/[...path]/route.ts`.

Deliberadamente **não** existem ainda:

- usuários reais ou usuários remotos de teste do Caleida;
- Neon Data API habilitada para o produto;
- Object Storage;
- projeto Neon de Production;
- schema funcional/tabelas/RLS de produto;
- papéis de produto;
- convites/lista de espera;
- SMTP/e-mail/OAuth;
- projeto/deployment Vercel do Caleida.

A branch de verificação de `US-AUTH-001` é:

```text
verify-us-auth-001
br-snowy-hall-aw9uv2gn
```

Ela permanece apenas como recurso descartável pendente de remoção segura após o fechamento da Story; sua exclusão exige autorização explícita quando a ferramenta classificar a ação como destrutiva.

## 7. Production

`caleida-production` **não existe por decisão deliberada nesta fase**.

Production será um projeto Neon separado quando uma Story futura exigir ambiente real de produção. Non-production não deve compartilhar secrets, usuários ou dados reais com Production.
