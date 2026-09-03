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
- `ADR-009` definiu o provider compartilhado do Neon Auth como transporte de e-mail para desenvolvimento/non-production enquanto adequado; SMTP/provedor externo foi adiado até existir necessidade real.

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
- nenhuma conta, Data API, e-mail customizado, OAuth customizado, Production ou deployment criada.

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

Verificado:

- CI final PR `33773066584`: PASS;
- merge `3cecfaf6eef357ece3096873d6847e334510db94`;
- CI pós-merge `33773379852`: PASS;
- concorrência: exatamente uma de duas sessões consumiu convite de capacidade 1;
- migration `000003` promovida à baseline sem fixtures;
- baseline permaneceu com contadores funcionais em zero;
- Neon-specific `SKIPPED` corretamente por ser SQL PostgreSQL portável.

#### US-AUTH-004 — E-mail Auth non-production (#49/#50)

Resultado final:

- readback remoto confirmou Better Auth saudável em `caleida-nonprod/main`;
- email/password está habilitado;
- `email_provider.type=shared` com remetente do Neon já fornece transporte non-production;
- `require_email_verification=false` permanece até US-AUTH-005;
- Resend, domínio próprio e SMTP customizado foram considerados inicialmente, mas removidos do escopo antes do merge por não existir requisito material nesta fase;
- `src/lib/email/server.ts`, testes e variáveis Resend preparados durante a investigação foram retirados do resultado final;
- `ADR-009` passou a registrar Neon shared email como decisão non-production e provedor externo como decisão futura;
- nenhuma migration, secret ou deployment foi introduzido.

A branch Neon `verify-us-auth-004 / br-plain-pond-aw5f59ia` foi criada durante a investigação inicial, herdou provider `shared` e nunca recebeu SMTP externo. Tornou-se housekeeping não bloqueante; exclusão futura exige autorização explícita.

### Estado de segurança e operação

- Secrets permanecem proibidos no Git/chat/browser.
- Banco persiste mudanças somente por migrations versionadas.
- PostgreSQL 18 descartável permanece gate primário para SQL portável.
- Baseline Neon `main` não é laboratório destrutivo.
- Neon Data API e Object Storage continuam não provisionados.
- `caleida-production` continua inexistente.
- Vercel continua sem deployment executado por IA e CI permanece sem CD.

### Próxima ação canônica

> `US-AUTH-005 — implementar cadastro controlado por convite ou aprovação`.
