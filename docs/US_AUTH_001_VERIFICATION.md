# US-AUTH-001 — Evidência de verificação

**Estado:** EM VERIFICAÇÃO  
**Issue:** #43  
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
- nenhuma branch temporária existente.

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

`get_auth` confirmou Auth Better Auth branch-scoped na branch isolada. Nenhuma URL real, connection string, senha ou cookie secret é persistida neste documento.

A baseline não foi usada como laboratório e continua sem Auth durante a verificação inicial.

## Dependência

`@neondatabase/auth` foi fixado em `0.5.0-beta`, versão corrente revalidada em 02/09/2026. O lockfile foi regenerado com Node 24.20.0/npm 11.19.0 e o runner confirmou a resolução exata da versão.

Um workflow branch-only foi usado exclusivamente para gerar o lockfile reproduzível porque a sessão não possui registry npm local. Ele foi removido antes da PR e não altera o CI permanente.

## Contrato implementado

- `src/lib/auth/server.ts` — fábrica lazy server-only e `getServerSession()`;
- `src/app/api/auth/[...path]/route.ts` — proxy oficial GET/POST;
- `.env.example` — somente nomes/placeholders;
- `tests/auth-foundation-contract.test.mjs` — guardrails estáticos;
- `docs/AUTH_FOUNDATION.md` — contrato técnico e cache de sessão.

Não foram criados client Auth, Auth UI do produto, `proxy.ts`, signup/signin/logout funcional, usuários, convites, papéis, Data API, SMTP, OAuth, schema/RLS de produto, Production Neon ou deployment.

## Gates pendentes antes do merge

- `npm ci` + `npm run verify` em CI de PR;
- PostgreSQL 18 + `npm run verify:db` em CI de PR;
- revisão do diff;
- decisão deliberada de promoção da fundação Auth para a baseline non-production somente depois dos gates;
- CI pós-merge da `main`.
