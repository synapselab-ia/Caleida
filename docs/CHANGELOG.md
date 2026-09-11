# Changelog

Mudanças relevantes do Caleida. Evidências detalhadas ficam nos documentos de validação/verificação e nos Issues/PRs associados.

## [Não lançado]

### Plataforma e protocolo

- Protocolo canônico v2 em `00_SYSTEM/` com Source of Truth, AI Work Protocol, Verification Protocol e Deployment Policy.
- Neon formalizado como plataforma canônica de dados/identidade (`ADR-005`).
- Migrations versionadas são obrigatórias para mudanças persistentes (`ADR-004`).
- PostgreSQL 18 descartável é o gate primário para SQL portável; branch Neon isolada cobre comportamento Neon-specific (`ADR-008`).
- Vercel permanece exclusivamente humano/manual e CI não faz CD (`ADR-007`).
- Preview Vercel não é gate por Story; browser/live acumulado é consolidado no fechamento do incremento quando não houver dependência pública material intermediária.
- Provider compartilhado Neon Auth atende e-mail de desenvolvimento/non-production enquanto adequado (`ADR-009`).

### Incremento 0 — Fundação executável

- Next.js 16 / React 19 / TypeScript strict / Tailwind CSS 4.
- Node 24.x, npm 11.19.0, CI permanente sem CD.
- `caleida-nonprod` em Neon/PostgreSQL 18, migrations/testes em `database/`.
- `npm run verify` e `npm run verify:db` como gates canônicos.
- Vercel preparado para release manual, sem publicação por IA.
- Encerramento em `docs/INCREMENT_0_VALIDATION.md`.

### Incremento 1 — Fundação visual

- US-DS-001 (#33/#34): tokens e temas.
- US-DS-002 (#35/#36): tipografia e marca.
- US-DS-003 (#37/#38): primitivos acessíveis.
- US-DS-004 (#39/#40): fundação responsiva/mobile-first.
- Encerramento em `docs/INCREMENT_1_VALIDATION.md`.

### Incremento 2 — Acesso controlado

#### US-AUTH-001 — Neon Auth e sessão (#43/#44)

- `@neondatabase/auth@0.5.0-beta` pinado;
- boundary server-only/lazy/fail-closed e handler Auth;
- Managed Better Auth promovido à baseline non-production após gates;
- evidência em `docs/US_AUTH_001_VERIFICATION.md`.

#### US-AUTH-002 — Papéis e autorização (#45/#46)

- papéis de produto separados do Admin Better Auth;
- autorização server-side + banco e bootstrap owner controlado;
- migrations/autorização promovidas após PostgreSQL 18;
- evidência em `docs/US_AUTH_002_VERIFICATION.md`.

#### US-AUTH-003 — Entrada controlada (#47/#48)

- convites, solicitações de acesso e auditoria compacta;
- token de convite persistido somente como digest;
- consumo concorrente serializado e comprovado;
- evidência em `docs/US_AUTH_003_VERIFICATION.md`.

#### US-AUTH-004 — E-mail Auth non-production (#49/#50)

- provider compartilhado Neon confirmado;
- SMTP/provedor externo adiado até necessidade material;
- nenhum secret/adaptador externo incorporado;
- evidência em `docs/US_AUTH_004_VERIFICATION.md`.

#### US-AUTH-005 — Cadastro controlado + confirmação (#51/#52)

- signup fail-closed por convite/aprovação;
- webhooks Auth verificados e migrations `000004`–`000007` promovidas;
- confirmação obrigatória por OTP comprovada ponta a ponta;
- baseline permaneceu sem fixtures;
- merge `9abc3235623c3f7d37531eb94a60997960f526e1`;
- evidência em `docs/US_AUTH_005_VERIFICATION.md`.

#### US-AUTH-006 — Login/logout + proteção de sessão (#53/#54)

- login/logout por server actions;
- `/login` server-aware e `/app` sob boundary privado server-side;
- mensagem genérica para credenciais inválidas e ausência de flash estrutural de conteúdo privado;
- CI/PG18/Neon-specific PASS;
- browser/live deferred para US-AUTH-008 sem Preview por Story;
- merge `b585234a159a73dfec89e1d4cb866201dcfdef34`;
- evidência em `docs/US_AUTH_006_VERIFICATION.md`.

#### US-AUTH-007 — Recovery + gestão/revogação de sessões (#55/#56)

Em revisão:

- `/forgot-password` com resposta anti-enumeração;
- `/reset-password` usando recovery token do provider sem persistência em Git/logs;
- callback derivado de origem same-origin validada;
- alteração autenticada exige senha atual e revoga as demais sessões;
- `/account/security` lista somente metadados não-bearer;
- revogação individual recebe ID opaco e resolve session token apenas server-side;
- encerramento da sessão atual via `signOut()` e das demais via provider;
- `sessionDataTtl` reduzido de 300 s para 1 s;
- contrato em `docs/SESSION_SECURITY.md`;
- primeiro CI funcional #221 / `34519793813`: PASS incluindo build e PostgreSQL 18/`verify:db`;
- branch Neon `verify-us-auth-007` sem usuários/sessões/accounts/verificações e sem drift de schema;
- opção upstream `revokeSessionsOnPasswordReset` não aparece na configuração Managed Neon observada; por isso reset por e-mail não é documentado como revogação automática de sessões existentes;
- browser/live e recovery real ficam consolidados em US-AUTH-008, sem novo Preview intermediário;
- evidência em `docs/US_AUTH_007_VERIFICATION.md`.

### Estado operacional atual

- baseline Neon: `caleida-nonprod/main`, PostgreSQL 18, migrations `000001`–`000007`;
- Managed Better Auth: email/password habilitado, confirmação obrigatória por OTP, provider de e-mail shared Neon;
- Data API e Production Neon: não provisionadas;
- Vercel: deployment exclusivamente humano/manual;
- branches de verificação Neon permanecem housekeeping porque exclusão exige autorização explícita.

### Próxima ação canônica

> Finalizar revisão/CI documental e integrar a PR #56 da US-AUTH-007. Após merge saudável, promover somente US-AUTH-008 — auditoria integrada e validação do Incremento 2.
