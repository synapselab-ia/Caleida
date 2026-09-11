# Product Backlog

**Status:** Incrementos 0 e 1 concluídos; Incremento 2 em andamento com US-AUTH-007 em revisão  
**Último incremento detalhado:** `docs/INCREMENT_2_PLAN.md`  
**Próxima ação operacional:** concluir US-AUTH-007 na PR #56

## Convenções

Prioridades: `P0` núcleo/segurança, `P1` antes do beta, `P2` importante, `P3` expansão social, `P4` futuro.

Estados: `A FAZER`, `PRONTA`, `EM ANDAMENTO`, `EM REVISÃO`, `CONCLUÍDA`, `BLOQUEADA`.

---

# Incremento 0 — Fundação executável

**Estado:** CONCLUÍDO  
**Evidência:** `docs/INCREMENT_0_VALIDATION.md`

EPIC-00 concluiu aplicação executável, ambiente reproduzível, Neon/PostgreSQL 18, migrations/testes, CI sem CD, hosting Vercel preparado para release manual e ciclo GitHub canônico.

# Incremento 1 — Fundação visual

**Estado:** CONCLUÍDO  
**Plano:** `docs/INCREMENT_1_PLAN.md`  
**Evidência:** `docs/INCREMENT_1_VALIDATION.md`

- `US-DS-001` — tokens/temas — **CONCLUÍDA** (#33 / #34);
- `US-DS-002` — tipografia/marca — **CONCLUÍDA** (#35 / #36);
- `US-DS-003` — primitivos acessíveis — **CONCLUÍDA** (#37 / #38);
- `US-DS-004` — fundação responsiva — **CONCLUÍDA** (#39 / #40).

---

# Incremento 2 — Acesso controlado / EPIC-02

**Plano:** `docs/INCREMENT_2_PLAN.md`  
**Refino:** OPS-006 / #41 / #42

## Objetivo

Entregar contas e acesso seguro para o beta fechado separando identidade gerenciada, autorização, entrada controlada, e-mail, cadastro, login/sessão, recovery e auditoria.

### US-AUTH-001 — Fundação Neon Auth e contrato de sessão

- **Estado:** CONCLUÍDA
- **Issue/PR:** #43 / #44
- **Capacidade:** CAP-01
- **Evidência:** `docs/US_AUTH_001_VERIFICATION.md`

### US-AUTH-002 — Papéis, autorização e bootstrap administrativo

- **Estado:** CONCLUÍDA
- **Issue/PR:** #45 / #46
- **Capacidades:** CAP-04, CAP-35
- **Evidência:** `docs/US_AUTH_002_VERIFICATION.md`

### US-AUTH-003 — Convites, solicitações e auditoria de entrada

- **Estado:** CONCLUÍDA
- **Issue/PR:** #47 / #48
- **Capacidades:** CAP-02, CAP-35
- **Evidência:** `docs/US_AUTH_003_VERIFICATION.md`

### US-AUTH-004 — E-mail Auth non-production

- **Estado:** CONCLUÍDA
- **Issue/PR:** #49 / #50
- **Capacidade:** CAP-01
- **Evidência:** `docs/US_AUTH_004_VERIFICATION.md`
- **Decisão:** ADR-009

### US-AUTH-005 — Cadastro controlado por convite/aprovação

- **Estado:** CONCLUÍDA
- **Issue/PR:** #51 / #52
- **Merge:** `9abc3235623c3f7d37531eb94a60997960f526e1`
- **Capacidades:** CAP-01, CAP-02
- **Evidência:** `docs/US_AUTH_005_VERIFICATION.md`

### US-AUTH-006 — Login, logout e proteção de sessão

- **Estado:** CONCLUÍDA
- **Issue/PR:** #53 / #54
- **Merge:** `b585234a159a73dfec89e1d4cb866201dcfdef34`
- **Capacidade:** CAP-01
- **Resultado:** login/logout server-side, `/app` privado, acesso direto fail-closed e UX acessível.
- **Gates:** CI/PG18/Neon-specific PASS; browser live deferred para US-AUTH-008.
- **Evidência:** `docs/US_AUTH_006_VERIFICATION.md`

### US-AUTH-007 — Recuperação de senha e gestão/revogação de sessões

- **Prioridade:** P0
- **Estado:** EM REVISÃO
- **Issue:** #55
- **PR:** #56
- **Capacidades:** CAP-01, CAP-35
- **Dependências:** US-AUTH-004 e US-AUTH-006 concluídas
- **Implementado:** recovery anti-enumeração; reset por token do provider; alteração autenticada com revogação das demais sessões; consulta/revogação de sessões próprias; session token server-only; cache de dados de sessão reduzido a 1 s.
- **Contrato:** `docs/SESSION_SECURITY.md`
- **Evidência:** `docs/US_AUTH_007_VERIFICATION.md`
- **Gates atuais:** CI #221 PASS; PostgreSQL 18 + `verify:db` PASS; Neon-specific isolado sem drift; browser/live deferred para US-AUTH-008.
- **Limitação explícita:** reset por e-mail não é declarado como revogação automática de sessões existentes porque o Managed Neon observado não expõe `revokeSessionsOnPasswordReset`; a matriz live final deve medir o comportamento real.
- **Preview Vercel:** não é gate desta Story.

### US-AUTH-008 — Consolidar auditoria e validar Incremento 2

- **Prioridade:** P1
- **Estado:** A FAZER
- **Capacidades:** CAP-04, CAP-35
- **Dependência:** US-AUTH-001 a 007 integradas
- **Resultado esperado:** consolidar eventos de auditoria sem secrets, executar matriz adversarial integrada e produzir evidência de encerramento do incremento.
- **Browser/live:** validar conjuntamente signup/OTP, login/logout, recovery/reset, alteração de senha, sessão/revogação, autorização e acesso direto.
- **Deployment:** se runtime público for material, usar uma única release candidate manual em vez de Preview por Story.

## Regra de execução

Browser real e deployment são distintos. Ausência de Preview manual não bloqueia Story comum quando CI/testes/integração/Neon-specific cobrem os critérios; o gate live acumulado retorna no fechamento do incremento.

# Próxima ação operacional

> Finalizar a revisão/integração da US-AUTH-007 na PR #56. Após merge e CI saudável em `main`, promover somente US-AUTH-008.

Não antecipar US-AUTH-008 antes do merge, Production ou deployment Vercel pela IA.
