# Changelog

Mudanças relevantes do Caleida. Evidências detalhadas de cada entrega ficam nos documentos de validação/verificação e nos Issues/PRs associados.

## [Não lançado]

### Plataforma e protocolo

- Criado o protocolo canônico v2 em `00_SYSTEM/`, com Source of Truth, AI Work Protocol, Verification Protocol e Deployment Policy.
- `docs/EXECUTION_PLAN.md`, `docs/CHECKPOINT.md`, `docs/PRODUCT_BACKLOG.md` e planos de incremento permitem retomada sem memória de chat.
- ADRs tornaram-se a autoridade arquitetural; `docs/DECISIONS.md` permanece como histórico legado.
- `ADR-004` fixou migrations versionadas para mudanças persistentes de banco.
- `ADR-005` formalizou Neon como plataforma canônica de dados/identidade.
- `ADR-006` manteve Object Storage desacoplado e adiado.
- `ADR-007` tornou deployment Vercel exclusivamente humano/manual; IA e CI não publicam.
- `ADR-008` separou PostgreSQL 18 descartável como gate primário de SQL portável e branch Neon isolada apenas para comportamento Neon-specific.
- `ADR-009` selecionou Resend como transporte transacional non-production, com REST server-only para o app e SMTP customizado planejado para Neon Auth.

### Incremento 0 — Fundação executável

- Next.js 16.3.3 / React 19.2.8 / TypeScript strict / Tailwind CSS 4.
- Node 24.20.0 e npm 11.19.0 fixados com lockfile reproduzível.
- Ambiente local, lint/typecheck/test/build e guias operacionais versionados.
- Projeto Neon `caleida-nonprod` em PostgreSQL 18, branch baseline `main`.
- Fundação de migrations em `database/` com ledger/checksums, runner Node + `psql` e testes SQL.
- `npm run verify` e `npm run verify:db` como gates canônicos.
- CI permanente com PostgreSQL 18 e nenhum CD.
- `vercel.json` desabilita Git deployments automáticos; nenhuma release foi executada por IA.
- Ciclo Issue → branch → CI → PR → review → merge → CI main validado em `docs/INCREMENT_0_VALIDATION.md`.

### Incremento 1 — Fundação visual

- US-DS-001 (#33/#34): tokens de cor, temas e contraste automatizado.
- US-DS-002 (#35/#36): Manrope/Newsreader e logo oficial via `next/image`.
- US-DS-003 (#37/#38): `Button`, `FormField`, `Feedback` acessíveis.
- US-DS-004 (#39/#40): fundação editorial/mobile-first sem fluxo falso.
- Incremento encerrado em `docs/INCREMENT_1_VALIDATION.md`.

### Incremento 2 — Acesso controlado

#### US-AUTH-001 — Neon Auth e sessão (#43/#44)

- `@neondatabase/auth@0.5.0-beta` pinado;
- `src/lib/auth/server.ts` server-only/lazy/fail-closed;
- handler Auth GET/POST catch-all;
- Managed Better Auth promovido à baseline somente depois dos gates;
- CI pós-merge `33753190237`: PASS;
- nenhuma conta, Data API, e-mail, OAuth, Production ou deployment criada.

#### US-AUTH-002 — Papéis e autorização (#45/#46)

- migration `000002_product_authorization.sql`;
- `caleida_auth.user_roles` e `caleida_audit.role_changes`;
- cinco papéis Caleida separados do Admin Better Auth;
- autorização crítica server-side + banco;
- bootstrap owner auditável por UUID Auth existente;
- matriz adversarial de autopromoção/elevação;
- migrations `000001/000002` promovidas à baseline;
- CI pós-merge `33770088254`: PASS;
- branch Neon temporária removida após autorização explícita.

#### US-AUTH-003 — Entrada controlada (#47/#48)

Adicionado:

- migration `000003_entry_control.sql`;
- `caleida_access.invitations`, `invitation_uses`, `access_requests`;
- `caleida_audit.entry_events`;
- digest-only de token de convite;
- validade, destinatário opcional, capacidade e estados canônicos;
- funções `SECURITY DEFINER` privadas por padrão;
- consumo de convite serializado por row lock;
- teste concorrente com duas sessões `psql`;
- `docs/ENTRY_CONTROL.md` e `docs/US_AUTH_003_VERIFICATION.md`.

Corrigido/verificado:

- CI inicial `33771618637` revelou apenas variável PL/pgSQL ambígua no teste; migration estava correta;
- teste corrigido sem relaxar regras;
- CI técnico `33771989432`: PASS;
- CI final PR `33773066584`: PASS;
- merge `3cecfaf6eef357ece3096873d6847e334510db94`;
- CI pós-merge `33773379852`: PASS;
- concorrência: exatamente uma de duas sessões consumiu convite de capacidade 1;
- migration `000003` promovida à baseline sem fixtures;
- baseline permaneceu com contadores funcionais em zero;
- Neon-specific `SKIPPED` corretamente por ser SQL PostgreSQL portável.

#### US-AUTH-004 — E-mail transacional non-production (#49/#50)

Adicionado/preparado:

- comparação corrente de Resend, Brevo, Mailgun e Amazon SES;
- `ADR-009-resend-transactional-email.md` selecionando Resend;
- `src/lib/email/server.ts` como boundary server-only via `fetch` nativo, sem SDK Resend;
- `tests/email-transport-contract.test.mjs` com cinco contratos de segurança/integração;
- `docs/EMAIL_TRANSPORT.md`;
- `docs/US_AUTH_004_VERIFICATION.md`;
- variáveis comentadas `RESEND_API_KEY`, `CALEIDA_EMAIL_FROM`, `CALEIDA_EMAIL_FROM_NAME` em `.env.example`;
- ambientes/arquitetura reconciliados com o transporte escolhido.

Guardrails:

- API key deve ser `sending_access`, preferencialmente limitada ao domínio;
- nenhum secret Resend usa `NEXT_PUBLIC_*` ou entra no Git/chat;
- envio da aplicação exige `Idempotency-Key`;
- rede, 429 e 5xx são recuperáveis; erro retornado é sanitizado;
- payload bruto do provedor não é propagado;
- boundary não acessa banco nem chama funções de convite;
- convite futuro só poderá mudar `criado → enviado` depois de confirmação do provedor;
- `require_email_verification` permanece `false` até US-AUTH-005;
- região São Paulo do Resend é roteamento, não residência de dados; metadados/logs/API permanecem nos EUA segundo fonte oficial corrente.

Verificação técnica:

- CI `33786184072` no primeiro head técnico: PASS;
- `npm ci`: PASS, 0 vulnerabilidades reportadas;
- `npm run verify`: PASS;
- testes Node: 60/60 PASS;
- build: PASS;
- PostgreSQL 18 + `npm run verify:db`: PASS;
- nenhuma migration nova.

Pendência deliberada:

- envio real e SMTP customizado do Neon Auth ainda não receberam PASS porque exigem conta Resend, domínio/remetente e credencial reais mantidos fora do Git/chat;
- PR #50 permanece aberta e US-AUTH-004 em `MANUAL_ACTION_REQUIRED` até esse gate live ser concluído;
- nenhuma conta Resend, DNS, secret, SMTP Neon, signup, Production ou deployment foi fabricado pela IA.

### Estado de segurança e operação

- Secrets permanecem proibidos no Git/chat/browser.
- Banco persiste mudanças somente por migrations versionadas.
- PostgreSQL 18 descartável permanece gate primário para SQL portável.
- Baseline Neon `main` não é laboratório destrutivo.
- Não existe branch Neon descartável pendente.
- Neon Data API e Object Storage continuam não provisionados.
- `caleida-production` continua inexistente.
- Vercel continua sem deployment executado por IA e CI permanece sem CD.

### Próxima ação canônica

> `US-AUTH-004 — concluir gate live Resend/Neon Auth non-production sem expor secrets`.

US-AUTH-005 não deve ser promovida enquanto #49/#50 estiverem abertas.
