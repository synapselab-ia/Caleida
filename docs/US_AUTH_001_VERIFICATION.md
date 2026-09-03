# US-AUTH-001 — Evidência de verificação

**Estado:** GATES TÉCNICOS PASS; fechamento documental/merge pendente  
**Issue:** #43  
**PR:** #44  
**Branch Git:** `feat/us-auth-001-neon-auth-foundation`

## Baseline de partida

```text
Git main: 42f5c8245f7b92eefaf3b9bc9ce06d84851eb7c8
CI main: 33669710979 — PASS
Issues abertas antes da Story: 0
PRs abertas antes da Story: 0
```

## Neon-specific

Estado inicial:

- `caleida-nonprod/main` (`br-restless-cherry-awpcwy6r`) em PostgreSQL 18;
- `get_auth` na baseline: Auth não habilitado;
- nenhuma branch Neon temporária existente.

Ambiente isolado criado:

```text
Branch: verify-us-auth-001
Branch ID: br-snowy-hall-aw9uv2gn
Parent: br-restless-cherry-awpcwy6r
State: ready
Compute: ep-curly-leaf-awe7kn8q
Auth provider: better_auth
Auth schema: neon_auth
```

`get_auth` e `describe_branch` confirmaram Auth Better Auth branch-scoped e o schema gerenciado `neon_auth` na branch isolada. O schema inclui as tabelas gerenciadas necessárias a identidade/sessão, sem criação de schema funcional do Caleida.

A baseline foi relida depois do gate isolado e **continuava com Auth desabilitado**, comprovando que a experimentação não contaminou `main`.

Depois dos gates de código em PASS, a configuração gerenciada foi promovida deliberadamente:

```text
Baseline: main / br-restless-cherry-awpcwy6r
Auth provider: better_auth
Auth schema: neon_auth
Promoção: 2026-09-02T20:30:51Z
```

`get_auth` e `describe_branch` confirmaram Neon Auth e o schema `neon_auth` na baseline após a promoção.

Nenhuma URL real, connection string, senha ou cookie secret é persistida neste documento.

## Dependência

`@neondatabase/auth` foi fixado em `0.5.0-beta`, versão corrente revalidada em 02/09/2026. O lockfile foi regenerado com Node 24.20.0/npm 11.19.0 e o runner confirmou a resolução exata da versão.

Um workflow branch-only foi usado exclusivamente para gerar o lockfile reproduzível porque a sessão não possui registry npm local. O primeiro push desse workflow encontrou corrida com novos commits da própria branch; a versão corrigida fez rebase antes do push, gerou o lockfile e foi removida antes da PR. O CI permanente não foi alterado.

No `npm ci` da PR, o SDK beta atual emitiu warnings de peer dependency/depreciação vindos de dependências transitivas de Auth UI/Better Auth. A instalação concluiu e a auditoria reportou zero vulnerabilidades conhecidas. O Caleida não declara/importa Auth UI diretamente nesta Story.

## Contrato implementado

- `package.json` / `package-lock.json` — SDK exato e instalação reproduzível;
- `src/lib/auth/server.ts` — fábrica lazy server-only, configuração fail-closed e `getServerSession()`;
- `src/app/api/auth/[...path]/route.ts` — proxy oficial GET/POST com encaminhamento do contexto catch-all;
- `.env.example` — somente nomes/placeholders;
- `tests/auth-foundation-contract.test.mjs` — guardrails estáticos e regressão da assinatura do handler;
- `docs/AUTH_FOUNDATION.md` — contrato técnico, cache de sessão e risco upstream beta;
- `docs/ENVIRONMENTS.md`, `docs/NEON_NONPROD.md` e `docs/NEON_PLATFORM.md` — estado remoto/configuração reconciliados.

Não foram criados client Auth, Auth UI do produto, `proxy.ts`, signup/signin/logout funcional, usuários, convites, papéis, Data API, SMTP, OAuth, schema/RLS de produto, Production Neon ou deployment.

## Histórico de CI da PR

### Run inicial — falha legítima

```text
Run: 33679115854
Head: a6949c171c4b3611369ae71981a5a52c22d71c38
npm ci: PASS
db:migrations:check: PASS
lint: PASS
typecheck: FAIL
```

Falha:

```text
route.ts: handler GET/POST esperava 2 argumentos, mas recebia apenas request
```

Causa: a implementação inicial não encaminhava o contexto `{ params }` exigido pelo handler catch-all corrente do SDK.

Correção:

- `route.ts` passou a receber `AuthRouteContext` com `params: Promise<{ path: string[] }>`;
- request e context são encaminhados para `handler().GET/POST`;
- teste de regressão foi adicionado;
- nenhum gate foi removido ou relaxado.

O run intermediário `33679409249` foi cancelado automaticamente ao surgir um head mais novo; ele não é usado como evidência de PASS.

### Head técnico corrigido — PASS

```text
Head: d289e9bdde563b8161e2603a9fccc4df50a081c7
Run: 33679442415
npm ci: PASS
npm run verify: PASS
PostgreSQL 18: PASS
npm run verify:db: PASS
```

O build passou sem `NEON_AUTH_BASE_URL`/`NEON_AUTH_COOKIE_SECRET` no CI, comprovando que a inicialização Auth é lazy e que o pipeline padrão continua sem secrets externos.

## Gates finais da Story

- coerência com CAP-01 / ADR-005 / ADR-008: `PASS`;
- SDK/API oficial corrente revalidada: `PASS`;
- branch Neon isolada: `PASS`;
- Neon Auth Better Auth + schema `neon_auth` isolado: `PASS`;
- baseline preservada durante experimentação: `PASS`;
- `npm ci`: `PASS`;
- `npm run verify`: `PASS`;
- PostgreSQL 18 + `npm run verify:db`: `PASS`;
- promoção deliberada do Neon Auth à baseline non-production: `PASS`;
- confirmação pós-promoção na baseline: `PASS`;
- secrets versionados/logados: `PASS — nenhum`;
- usuários/Data API/schema funcional/SMTP/OAuth/Production: `PASS — nenhum criado`;
- deployment Vercel: `SKIPPED/PROIBIDO` conforme ADR-007;
- browser real: `SKIPPED — não existe fluxo/UI funcional nesta Story e não será fabricada superfície apenas para teste`;
- remoção da branch Neon descartável: `PENDENTE DE AUTORIZAÇÃO EXPLÍCITA` porque a ação é destrutiva no conector;
- CI do head documental final da PR #44: pendente;
- review/diff final: pendente;
- merge e CI pós-merge da `main`: pendentes.
