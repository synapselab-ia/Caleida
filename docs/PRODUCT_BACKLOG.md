# Product Backlog

**Status:** Incrementos 0 e 1 concluídos; Incremento 2 em andamento com US-AUTH-007 concluída  
**Último incremento detalhado:** `docs/INCREMENT_2_PLAN.md`  
**Próxima ação operacional:** `US-AUTH-008 — Consolidar auditoria e validar Incremento 2`

## Convenções

Prioridades: `P0` núcleo/segurança, `P1` antes do beta, `P2` importante, `P3` expansão social, `P4` futuro.

Estados: `A FAZER`, `PRONTA`, `EM ANDAMENTO`, `EM REVISÃO`, `CONCLUÍDA`, `BLOQUEADA`.

---

# Incremento 0 — Fundação executável

**Estado:** CONCLUÍDO  
**Evidência:** `docs/INCREMENT_0_VALIDATION.md`

# Incremento 1 — Fundação visual

**Estado:** CONCLUÍDO  
**Plano:** `docs/INCREMENT_1_PLAN.md`  
**Evidência:** `docs/INCREMENT_1_VALIDATION.md`

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
- **Evidência:** `docs/US_AUTH_006_VERIFICATION.md`

### US-AUTH-007 — Recuperação de senha e gestão/revogação de sessões

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Issue/PR:** #55 / #56
- **Merge:** `31ec6e2238a7b0bdaff7506ac0e9ed51179f3322`
- **Capacidades:** CAP-01, CAP-35
- **Resultado:** recovery anti-enumeração; reset por token; mudança autenticada de senha; consulta/revogação de sessões próprias; token de sessão server-only; cache de dados de sessão reduzido a 1 s.
- **Contrato:** `docs/SESSION_SECURITY.md`
- **Evidência:** `docs/US_AUTH_007_VERIFICATION.md`
- **Gates:** CI final #222 PASS; CI pós-merge #223 PASS; PostgreSQL 18 + `verify:db` PASS; Neon-specific isolado sem drift; browser/live deferred para US-AUTH-008.
- **Limitação explícita:** reset por e-mail não é declarado como revogação automática de sessões existentes porque o Managed Neon observado não expõe `revokeSessionsOnPasswordReset`; medir na matriz live final.

### US-AUTH-008 — Consolidar auditoria e validar Incremento 2

- **Prioridade:** P1
- **Estado:** PRONTA
- **Capacidades:** CAP-04, CAP-35
- **Dependências:** US-AUTH-001 a US-AUTH-007 concluídas
- **Resultado esperado:** consolidar auditoria sem secrets, executar matriz adversarial integrada e produzir evidência de encerramento do Incremento 2.
- **Browser/live:** validar conjuntamente signup/OTP, login/logout, recovery/reset, alteração de senha, sessão/revogação, autorização, acesso direto e ausência de flash privado.
- **Deployment:** se runtime público for material, usar uma única release candidate manual; a IA não executa deployment Vercel.

## Regra de execução

Browser real e deployment são distintos. `US-AUTH-008` é o ponto de validação live integrada acumulada do Incremento 2.

# Próxima ação operacional

> Criar Issue e branch limitadas a `US-AUTH-008 — Consolidar auditoria e validar Incremento 2`, recuperar a matriz integrada e executar somente essa Story.

Não antecipar o incremento seguinte, Production Neon, Data API ou deployment Vercel.
