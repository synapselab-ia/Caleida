# Execution Plan — Caleida

**Status:** roadmap operacional canônico  
**Regra:** uma `NEXT_ACTION` limitada por vez  
**Roadmap de produto:** `docs/PRODUCT_BACKLOG.md`

Este documento transforma o backlog em tarefas executáveis. Evidências detalhadas ficam nos documentos de verificação e Issues/PRs indicados.

---

# Operações canônicas concluídas

- `OPS-001` — protocolo canônico v2: **CONCLUÍDO**.
- `OPS-002` — pivot Supabase → Neon: **CONCLUÍDO**.
- `OPS-003` — deployment Vercel exclusivamente humano/manual: **CONCLUÍDO**.
- `OPS-004` — ADRs como autoridade arquitetural: **CONCLUÍDO**.
- `OPS-005` — refino do Incremento 1: **CONCLUÍDO** (#31).
- `OPS-006` — refino do EPIC-02: **CONCLUÍDO** (#41/#42).

# Incremento 0

**Estado:** CONCLUÍDO — `docs/INCREMENT_0_VALIDATION.md`.

# Incremento 1

**Estado:** CONCLUÍDO — `docs/INCREMENT_1_VALIDATION.md`.

```text
US-DS-001 — CONCLUÍDA (#33/#34)
US-DS-002 — CONCLUÍDA (#35/#36)
US-DS-003 — CONCLUÍDA (#37/#38)
US-DS-004 — CONCLUÍDA (#39/#40)
```

---

# Incremento 2 — Acesso controlado / EPIC-02

**Estado:** EM ANDAMENTO; US-AUTH-004 aguarda configuração/teste live isolados  
**Plano:** `docs/INCREMENT_2_PLAN.md`

## US-AUTH-001 — Fundação Neon Auth e sessão

**Estado:** CONCLUÍDA — #43/#44  
**Evidência:** `docs/US_AUTH_001_VERIFICATION.md`

Managed Better Auth + boundary server-only/fail-closed. CI pós-merge `33753190237`: PASS.

## US-AUTH-002 — Papéis, autorização e bootstrap

**Estado:** CONCLUÍDA — #45/#46  
**Evidência:** `docs/US_AUTH_002_VERIFICATION.md`

Cinco papéis Caleida, autorização server/banco, auditoria e bootstrap owner controlado. CI pós-merge `33770088254`: PASS.

## US-AUTH-003 — Entrada controlada

**Estado:** CONCLUÍDA — #47/#48  
**Evidência:** `docs/US_AUTH_003_VERIFICATION.md`

Migration `000003`, convites digest-only, solicitações, auditoria e concorrência serializada.

```text
Merge: 3cecfaf6eef357ece3096873d6847e334510db94
CI final PR: 33773066584 — PASS
CI pós-merge main: 33773379852 — PASS
```

## US-AUTH-004 — E-mail transacional non-production

**Estado:** EM ANDAMENTO / MANUAL_ACTION_REQUIRED  
**Issue:** `#49`  
**PR:** `#50`  
**Git branch:** `feat/us-auth-004-transactional-email`  
**Neon gate branch:** `verify-us-auth-004 / br-plain-pond-aw5f59ia`  
**Decisão:** `ADR-009`  
**Contrato:** `docs/EMAIL_TRANSPORT.md`  
**Evidência:** `docs/US_AUTH_004_VERIFICATION.md`

### Decisão e implementação

Resend foi selecionado após revalidação oficial e comparação com Brevo, Mailgun e SES.

Implementado:

- `src/lib/email/server.ts` server-only via `fetch` nativo;
- `RESEND_API_KEY` somente server-side com `sending_access`;
- idempotência obrigatória;
- rede/429/5xx recuperáveis;
- erros sanitizados;
- transporte sem acesso ao banco/convites;
- `.env.example`, ADR-009, contrato e evidência versionados.

### CI técnico

```text
Run: 33786184072
Head técnico: 9de864fd17a515207e123cfb3cb88344a83f08fe
npm ci: PASS / 0 vulnerabilidades reportadas
npm run verify: PASS
Node tests: 60/60 PASS
build: PASS
PostgreSQL 18 + verify:db: PASS
```

Nenhuma migration nova.

### Gate Neon-specific preparado

Criada `verify-us-auth-004` a partir da baseline `main`.

Confirmado após criação:

```text
state: ready
Auth provider: Better Auth
Email provider: shared Neon
Require email verification: false
```

A baseline não foi alterada. A branch existe somente para provar SMTP Resend isoladamente.

### Próxima ação obrigatória

Fora do Git/chat:

1. criar/usar conta Resend non-production;
2. verificar domínio/subdomínio com SPF/DKIM;
3. criar API key `sending_access`, limitada ao domínio quando possível;
4. armazenar a chave em superfície segura;
5. no Neon Console, selecionar **`verify-us-auth-004`**;
6. configurar SMTP Resend somente nessa branch (`smtp.resend.com`, usuário `resend`, secret e remetente verificado);
7. manter `require_email_verification=false`;
8. executar teste de envio para endereço controlado;
9. informar no chat apenas que **o SMTP da branch `verify-us-auth-004` foi configurado e o teste passou**, sem expor API key/senha/connection string/Auth URL.

Depois da confirmação:

1. revalidar a branch com secrets redigidos;
2. confirmar baseline ainda em provider compartilhado;
3. registrar PASS do gate isolado;
4. promover SMTP deliberadamente para baseline por superfície segura;
5. revalidar baseline;
6. solicitar autorização explícita antes de `delete_branch` de `verify-us-auth-004`;
7. executar CI final do head;
8. review e merge #50;
9. confirmar fechamento #49 e CI pós-merge;
10. só então promover US-AUTH-005.

### Non-goals

- signup/login/logout/OAuth;
- `require_email_verification=true` nesta Story;
- fila/outbox sem necessidade demonstrada;
- Production Neon;
- deployment Vercel.

---

# Próxima ação única

> `US-AUTH-004 — configurar e provar Resend/SMTP na branch Neon isolada verify-us-auth-004 sem expor secrets`.

US-AUTH-005 não é promovida enquanto #49/#50 estiverem abertas.

# Contrato de execução

1. recuperar estado canônico + remoto;
2. executar somente a `NEXT_ACTION`;
3. manter Issue/branch/PR limitadas;
4. verificar antes de concluir;
5. registrar decisões materiais em ADR;
6. nunca versionar/expor secret;
7. nunca executar deployment Vercel;
8. deixar exatamente uma próxima ação.
