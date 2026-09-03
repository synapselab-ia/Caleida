# Checkpoint — Caleida

**PROJECT_STATUS:** MANUAL_ACTION_REQUIRED  
**CURRENT_PHASE:** Incremento 2 — Acesso controlado / EPIC-02 em andamento  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `US-AUTH-001 — Materializar fundação Neon Auth isolada e contrato de sessão`  
**LAST_COMPLETED_ISSUE:** `#43`  
**LAST_COMPLETED_PR:** `#44`  
**ACTIVE_TASK:** none  
**ACTIVE_ISSUE:** none  
**ACTIVE_BRANCH:** none  
**ACTIVE_PR:** none  
**NEXT_ACTION:** `US-AUTH-002 — Materializar papéis, autorização e bootstrap administrativo`  
**BLOCKERS:** `US-AUTH-002 não deve abrir nova branch Neon isolada enquanto verify-us-auth-001 não for removida`  
**ON_HOLD:** none  
**MANUAL_ACTION_REQUIRED:** `autorizar explicitamente a exclusão da branch Neon descartável verify-us-auth-001 (br-snowy-hall-aw9uv2gn)`

## Comando de continuação

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

Recupere o estado real no GitHub e Neon antes de agir. Não refaça Stories concluídas e resolva a ação manual pendente antes de criar novo ambiente Neon isolado.

## Incrementos concluídos

### Incremento 0 — Fundação executável

**CONCLUÍDO.** Evidência: `docs/INCREMENT_0_VALIDATION.md`.

### Incremento 1 — Fundação visual / EPIC-01

**CONCLUÍDO.** Evidência: `docs/INCREMENT_1_VALIDATION.md`.

## Incremento 2 — estado atual

```text
US-AUTH-001 fundação Neon Auth + sessão — CONCLUÍDA (#43 / #44)
  ↓
US-AUTH-002 papéis/autorização + bootstrap administrativo — PRÓXIMA
  ↓
US-AUTH-003 convites/solicitações + auditoria de entrada
  ↓
US-AUTH-004 e-mail transacional non-production
  ↓
US-AUTH-005 cadastro controlado + confirmação de e-mail
  ↓
US-AUTH-006 login/logout + proteção de sessão
  ↓
US-AUTH-007 recuperação de senha + gestão/revogação de sessões
  ↓
US-AUTH-008 auditoria integrada + validação do incremento
```

Plano detalhado: `docs/INCREMENT_2_PLAN.md`.

## US-AUTH-001 — resultado integrado

### GitHub

```text
Issue: #43
Branch: feat/us-auth-001-neon-auth-foundation
PR: #44
Baseline de partida: 42f5c8245f7b92eefaf3b9bc9ce06d84851eb7c8
Head técnico corrigido: d289e9bdde563b8161e2603a9fccc4df50a081c7
CI técnico: 33679442415 — PASS
Head documental pré-fechamento: 56089bde529f5d6914bc6b756db51374a582ec76
CI desse head: 33680234236 — PASS
```

O primeiro CI da PR (`33679115854`) falhou legitimamente no typecheck porque o handler Neon Auth corrente exige `request` e o contexto catch-all. A implementação foi corrigida sem relaxar gates; o run intermediário foi cancelado por novo head e não conta como evidência de PASS.

### Implementação

- `@neondatabase/auth@0.5.0-beta` fixado exatamente;
- lockfile reproduzível;
- fronteira server-only/lazy/fail-closed em `src/lib/auth/server.ts`;
- handler GET/POST em `src/app/api/auth/[...path]/route.ts` com encaminhamento do contexto catch-all;
- `NEON_AUTH_BASE_URL` e `NEON_AUTH_COOKIE_SECRET` documentados sem valores;
- `sessionDataTtl` fixado em 300 segundos;
- teste de contrato/regressão em `tests/auth-foundation-contract.test.mjs`;
- contrato técnico em `docs/AUTH_FOUNDATION.md`.

### Neon-specific

Estado inicial:

- `caleida-nonprod/main` / `br-restless-cherry-awpcwy6r` em PostgreSQL 18;
- Neon Auth desabilitado na baseline;
- nenhuma branch descartável existente.

Gate realizado:

```text
Branch: verify-us-auth-001
Branch ID: br-snowy-hall-aw9uv2gn
Parent: br-restless-cherry-awpcwy6r
Auth provider: better_auth
Auth schema: neon_auth
```

A baseline foi relida durante a experimentação e permaneceu sem Auth. Depois dos gates técnicos em PASS, Neon Auth Better Auth foi promovido deliberadamente para a baseline non-production e `get_auth`/inspeção do branch confirmaram o schema gerenciado `neon_auth`.

Estado atual confirmado em 03/09/2026:

- baseline `main`: `ready`, Neon Auth Better Auth habilitado;
- branch descartável `verify-us-auth-001`: ainda existe e está `ready`;
- Neon Data API: não provisionada;
- usuários remotos do Caleida: nenhum criado pela Story;
- schema/RLS funcional de produto: inexistente;
- Production Neon: não provisionada;
- deployment Vercel: não executado.

## Verificação de US-AUTH-001

- coerência CAP-01 / ADR-005 / ADR-008: `PASS`;
- SDK/API Neon Auth corrente revalidada durante a Story: `PASS`;
- `npm ci`: `PASS`;
- `npm run verify`: `PASS`;
- PostgreSQL 18 + `npm run verify:db`: `PASS`;
- gate Neon-specific isolado: `PASS`;
- baseline preservada durante experimentação: `PASS`;
- promoção deliberada Auth non-production após gates: `PASS`;
- configuração/session fail-closed: `PASS` por contrato/typecheck/test/build;
- secrets reais no Git/PR/docs: `PASS — nenhum`;
- usuário/Data API/schema funcional/SMTP/OAuth/Production: `PASS — nenhum criado`;
- browser real: `SKIPPED — não existe fluxo/UI funcional nesta Story e nenhuma superfície foi fabricada apenas para teste`;
- deployment Vercel: `SKIPPED/PROIBIDO` conforme `ADR-007`;
- branch Neon descartável: `MANUAL_ACTION_REQUIRED — exclusão destrutiva exige autorização explícita`;
- CI pós-merge da `main`: deve ser confirmado após integração de #44 e registrado na discussão da Issue/PR se não puder ser materializado neste mesmo commit.

Evidência detalhada: `docs/US_AUTH_001_VERIFICATION.md`.

## Próxima ação — US-AUTH-002

Executar somente:

> `US-AUTH-002 — Materializar papéis, autorização e bootstrap administrativo`

Antes de criar a branch Neon isolada dessa Story:

1. obter autorização explícita do usuário para apagar `verify-us-auth-001`;
2. remover a branch descartável;
3. confirmar que `caleida-nonprod/main` continua saudável com Neon Auth habilitado;
4. então abrir Issue/branch Git limitadas para US-AUTH-002 e seguir `docs/INCREMENT_2_PLAN.md`.

Não antecipar convites, cadastro, e-mail, Data API, login/logout ou Production dentro de US-AUTH-002.