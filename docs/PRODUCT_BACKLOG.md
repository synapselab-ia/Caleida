# Product Backlog

**Status:** Incrementos 0 e 1 concluídos; Incremento 2 em andamento com US-AUTH-004 bloqueada apenas pelo gate live externo  
**Último incremento detalhado:** `docs/INCREMENT_2_PLAN.md`  
**Próxima ação operacional:** `US-AUTH-004 — concluir gate live Resend/Neon Auth non-production`

## Convenções

Prioridades: `P0` núcleo/segurança, `P1` antes do beta, `P2` importante, `P3` expansão social, `P4` futuro.

Estados: `A FAZER`, `PRONTA`, `EM ANDAMENTO`, `EM REVISÃO`, `CONCLUÍDA`, `BLOQUEADA`.

---

# Incremento 0 — Fundação executável

**Estado:** CONCLUÍDO  
**Evidência:** `docs/INCREMENT_0_VALIDATION.md`

- US-PLAT-001 a US-PLAT-010: **CONCLUÍDAS**.
- Resultado: aplicação executável, documentação recuperável, Neon non-production, migrations/testes, CI sem CD, ambientes separados e Vercel preparado somente para release manual.

# Incremento 1 — Fundação visual

**Estado:** CONCLUÍDO  
**Evidência:** `docs/INCREMENT_1_VALIDATION.md`

- `US-DS-001` — tokens/temas — **CONCLUÍDA** (#33/#34);
- `US-DS-002` — tipografia/marca — **CONCLUÍDA** (#35/#36);
- `US-DS-003` — primitivos acessíveis — **CONCLUÍDA** (#37/#38);
- `US-DS-004` — fundação responsiva — **CONCLUÍDA** (#39/#40).

---

# Incremento 2 — Acesso controlado / EPIC-02

**Plano:** `docs/INCREMENT_2_PLAN.md`  
**Refino:** OPS-006 / #41 / #42

## Objetivo

Entregar contas e acesso seguro para o beta fechado separando Auth, autorização, entrada controlada, e-mail, cadastro, login/sessão e auditoria em unidades verificáveis.

### US-AUTH-001 — Fundação Neon Auth e sessão

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Issue/PR:** #43/#44
- **Capacidade:** CAP-01
- **Resultado:** Managed Better Auth + boundary server-only/fail-closed.
- **Evidência:** `docs/US_AUTH_001_VERIFICATION.md`.

### US-AUTH-002 — Papéis, autorização e bootstrap

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Issue/PR:** #45/#46
- **Capacidades:** CAP-04, CAP-35
- **Resultado:** cinco papéis Caleida, autorização crítica no servidor/banco, auditoria e bootstrap owner controlado.
- **Evidência:** `docs/US_AUTH_002_VERIFICATION.md`.

### US-AUTH-003 — Convites, solicitações e auditoria de entrada

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Issue/PR:** #47/#48
- **Capacidades:** CAP-02, CAP-35
- **Resultado:** migration `000003`; digest-only de convite, capacidade/validade/destinatário, solicitações, auditoria e concorrência serializada.
- **CI pós-merge:** `33773379852` — PASS.
- **Evidência:** `docs/US_AUTH_003_VERIFICATION.md`.
- **Contrato:** `docs/ENTRY_CONTROL.md`.

### US-AUTH-004 — E-mail transacional non-production

- **Prioridade:** P0
- **Estado:** EM ANDAMENTO / MANUAL_ACTION_REQUIRED
- **Issue/PR:** #49/#50
- **Branch:** `feat/us-auth-004-transactional-email`
- **Capacidades:** CAP-01, CAP-02
- **Decisão:** `ADR-009 — Resend como transporte transacional non-production`
- **Contrato:** `docs/EMAIL_TRANSPORT.md`
- **Evidência:** `docs/US_AUTH_004_VERIFICATION.md`

**Já realizado:**

- provedores/preços/limites/regiões/privacidade revalidados em fontes oficiais;
- Resend selecionado após comparação com Brevo, Mailgun e SES;
- boundary `src/lib/email/server.ts` server-only via `fetch` nativo;
- API key somente server-side `sending_access`;
- idempotência obrigatória;
- falhas rede/429/5xx recuperáveis e sanitizadas;
- transporte não acessa banco nem consome convite;
- variáveis documentadas sem valores;
- CI `33786184072`: 60/60 testes + build + PostgreSQL 18/verify:db em PASS.

**Pendência real:**

- conta/domínio/remetente Resend non-production;
- API key real guardada fora do Git/chat;
- SMTP Resend configurado no Neon Auth por superfície segura;
- prova live com secrets redigidos.

US-AUTH-004 permanece aberta até esse gate. Não promover a Story seguinte por conveniência.

### US-AUTH-005 — Cadastro controlado por convite ou aprovação

- **Prioridade:** P0
- **Estado:** A FAZER / BLOQUEADA por US-AUTH-004
- **Capacidades:** CAP-01, CAP-02
- **Resultado esperado:** signup sem autorização negado inclusive fora da UI; confirmação de e-mail e vínculo/consumo seguro do mecanismo de entrada.

### US-AUTH-006 — Login, logout e proteção de sessão

- **Prioridade:** P0
- **Estado:** A FAZER
- **Capacidade:** CAP-01

### US-AUTH-007 — Recuperação de senha e gestão/revogação de sessões

- **Prioridade:** P0
- **Estado:** A FAZER
- **Capacidades:** CAP-01, CAP-35

### US-AUTH-008 — Consolidar auditoria e validar Incremento 2

- **Prioridade:** P1
- **Estado:** A FAZER
- **Capacidades:** CAP-04, CAP-35

## Regra de execução

Não antecipar Stories seguintes. Mudança persistente usa migration + PostgreSQL 18; dependência real de Neon usa gate isolado conforme ADR-008. Secrets nunca entram no Git/chat e deployment Vercel nunca é executado pela IA.

# Próxima ação operacional

> `US-AUTH-004 — concluir gate live Resend/Neon Auth non-production sem expor secrets`.
