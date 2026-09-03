# Changelog

Mudanças relevantes do Caleida. Evidências detalhadas de cada entrega ficam nos documentos de validação/verificação e nos Issues/PRs associados.

## [Não lançado]

### Plataforma e protocolo

- Criado o protocolo canônico v2 em `00_SYSTEM/`, com Source of Truth, AI Work Protocol, Verification Protocol e Deployment Policy.
- `docs/EXECUTION_PLAN.md`, `docs/CHECKPOINT.md`, `docs/PRODUCT_BACKLOG.md` e planos de incremento passaram a permitir retomada sem memória de chat.
- ADRs tornaram-se a autoridade arquitetural; `docs/DECISIONS.md` permanece apenas como histórico legado.
- `ADR-004` fixou migrations versionadas para mudanças persistentes de banco.
- `ADR-005` formalizou Neon como plataforma canônica de dados/identidade.
- `ADR-006` manteve Object Storage desacoplado e adiado.
- `ADR-007` tornou deployment Vercel exclusivamente humano/manual; IA e CI não publicam.
- `ADR-008` separou PostgreSQL 18 descartável como gate primário de SQL portável e branch Neon isolada apenas para comportamento Neon-specific.

### Incremento 0 — Fundação executável

- Next.js 16.3.3 / React 19.2.8 / TypeScript strict / Tailwind CSS 4.
- Node 24.20.0 e npm 11.19.0 fixados com lockfile reproduzível.
- Ambiente local, scripts de lint/typecheck/test/build e guias operacionais versionados.
- Projeto Neon `caleida-nonprod` provisionado em PostgreSQL 18, branch baseline `main`.
- Fundação de migrations em `database/` com ledger/checksums, runner Node + `psql` e testes SQL.
- `npm run verify` e `npm run verify:db` tornaram-se gates canônicos.
- CI permanente em `.github/workflows/ci.yml`, com permissões mínimas, PostgreSQL 18 e nenhum CD.
- `vercel.json` desabilita Git deployments automáticos; nenhuma release Caleida foi executada por IA.
- Ambientes e secrets separados em `docs/ENVIRONMENTS.md`.
- Ciclo Issue → branch → CI → PR → review → merge → CI main validado e encerrado em `docs/INCREMENT_0_VALIDATION.md`.

### Incremento 1 — Fundação visual

- US-DS-001 (#33/#34): tokens de cor, temas light/dark e contraste automatizado.
- US-DS-002 (#35/#36): Manrope/Newsreader e logo horizontal oficial via `next/image`.
- US-DS-003 (#37/#38): `Button`, `FormField` e `Feedback` acessíveis sem biblioteca externa.
- US-DS-004 (#39/#40): fundação editorial/mobile-first aplicada sem fluxo funcional falso.
- Incremento encerrado em `docs/INCREMENT_1_VALIDATION.md`.

### Incremento 2 — Acesso controlado

#### US-AUTH-001 — Neon Auth e sessão (#43/#44)

Adicionado:

- `@neondatabase/auth@0.5.0-beta` pinado;
- `src/lib/auth/server.ts` como fronteira server-only/lazy/fail-closed;
- handler GET/POST em `src/app/api/auth/[...path]/route.ts`;
- `docs/AUTH_FOUNDATION.md` e `docs/US_AUTH_001_VERIFICATION.md`.

Operação/verificação:

- primeiro CI detectou corretamente assinatura incompleta do handler catch-all; implementação corrigida sem relaxar gate;
- PostgreSQL 18 e gate Neon-specific passaram;
- Managed Better Auth promovido deliberadamente para `caleida-nonprod/main`;
- CI pós-merge `33753190237`: PASS;
- nenhuma conta, Data API, e-mail, OAuth, Production ou deployment criada.

#### US-AUTH-002 — Papéis e autorização (#45/#46)

Adicionado:

- `database/migrations/000002_product_authorization.sql`;
- `caleida_auth.user_roles` e `caleida_audit.role_changes`;
- papéis `proprietário`, `administrador`, `moderador`, `curador`, `usuário` separados do Admin Better Auth;
- `src/lib/auth/authorization.ts`;
- bootstrap owner server-only e auditável por UUID Auth já existente;
- matriz adversarial de autopromoção/elevação administrativa;
- `docs/AUTHORIZATION.md` e `docs/US_AUTH_002_VERIFICATION.md`.

Operação/verificação:

- primeiro CI revelou erro do teste de ACL ao tratar `PUBLIC` como role concreta; teste corrigido usando role `NOLOGIN` real sem relaxar revogações;
- CI técnico `33766333312`: PASS;
- migrations `000001`/`000002` promovidas à baseline com checksums canônicos;
- CI final da PR `33769856492`: PASS;
- merge `f31328cc9405bb88d12064e85f6ba3906485f3bd`;
- CI pós-merge `33770088254`: PASS;
- baseline permaneceu sem usuários/papéis sintéticos;
- `verify-us-auth-002` removida em 03/09/2026 após autorização explícita do usuário.

#### US-AUTH-003 — Entrada controlada (#47/#48)

Adicionado:

- `database/migrations/000003_entry_control.sql`;
- schema `caleida_access`;
- `caleida_access.invitations` para convites únicos/reutilizáveis com validade, destinatário opcional, capacidade e estados `criado`, `enviado`, `utilizado`, `expirado`, `revogado`, `cancelado`;
- persistência somente do digest hexadecimal do token de convite, nunca token em texto puro;
- `caleida_access.invitation_uses` para usos numerados e vínculo futuro com conta;
- `caleida_access.access_requests` para `em_espera`, `aprovada`, `recusada`, `arquivada`;
- `caleida_audit.entry_events` para auditoria compacta sem senha/token/cookie/payload Auth;
- funções privadas `SECURITY DEFINER` com `search_path` fixo e grants públicos revogados;
- consumo de convite serializado por `SELECT ... FOR UPDATE`;
- `database/tests/000004_entry_control.sql` com estados, constraints, destinatário, expiração, revogação, solicitações e ACLs;
- `database/tests/000005_invitation_concurrency.mjs` com duas sessões `psql` independentes disputando o mesmo convite;
- suporte do runner de banco a testes `.mjs` numerados após testes SQL;
- `tests/entry-control-contract.test.mjs`;
- `docs/ENTRY_CONTROL.md` e `docs/US_AUTH_003_VERIFICATION.md`.

Corrigido:

- CI inicial `33771618637` expôs uma variável PL/pgSQL ambígua apenas no teste `000004_entry_control.sql`; a migration já aplicava corretamente;
- variáveis do teste foram renomeadas sem alterar ou relaxar a migration.

Verificação/operação:

- CI técnico corrigido `33771989432`: PASS para `npm ci`, `npm run verify`, 55/55 testes, build, PostgreSQL 18 e `npm run verify:db`;
- concorrência comprovada: exatamente uma de duas sessões consumiu convite de capacidade 1;
- checksum de `000003_entry_control.sql`: `503700640a81cf41dfe56a0abe70fc581b9c64d8e9ad6585cbcb55d4751b7c5f`;
- Neon-specific: SKIPPED corretamente por ausência de dependência de `neon_auth`, Data API, role/helper ou outra semântica específica do Neon;
- nenhuma branch Neon descartável foi criada para duplicar o gate PostgreSQL;
- migration `000003` promovida deliberadamente para `caleida-nonprod/main` sem fixtures;
- baseline pós-promoção: zero usuários Auth, papéis, convites, usos, solicitações e eventos de entrada;
- nenhuma UI, endpoint público, e-mail, signup, Data API, Production Neon ou deployment Vercel criada.

### Estado de segurança e operação

- Secrets permanecem proibidos no Git.
- `DATABASE_URL`, `DATABASE_URL_UNPOOLED` e `NEON_AUTH_COOKIE_SECRET` são server-only.
- Nenhum secret usa `NEXT_PUBLIC_*`.
- Banco persiste mudanças somente por migrations versionadas.
- PostgreSQL 18 descartável permanece o gate primário para SQL portável.
- Baseline Neon `main` não é laboratório destrutivo.
- Não existe branch Neon descartável pendente após US-AUTH-003.
- Neon Data API e Object Storage continuam não provisionados para o produto.
- `caleida-production` continua inexistente.
- Vercel continua sem deployment executado por IA e CI permanece sem CD.

### Próxima ação canônica

> `US-AUTH-004 — Selecionar e integrar e-mail transacional non-production`

A próxima Story deve revalidar provedores, pricing, limites, regiões e privacidade antes de escolher transporte; registrar ADR se a escolha for material; usar apenas non-production e secrets server-only; e não antecipar signup/login/Production/deployment.