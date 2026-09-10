# Product Backlog

**Status:** Incrementos 0 e 1 concluídos; Incremento 2 em andamento com US-AUTH-006 concluída  
**Último incremento detalhado:** `docs/INCREMENT_2_PLAN.md`  
**Próxima ação operacional:** `US-AUTH-007 — Recuperação de senha e gestão/revogação de sessões`

## Convenções

Prioridades: `P0` núcleo/segurança, `P1` antes do beta, `P2` importante, `P3` expansão social, `P4` futuro.

Estados: `A FAZER`, `PRONTA`, `EM ANDAMENTO`, `EM REVISÃO`, `CONCLUÍDA`, `BLOQUEADA`.

---

# Incremento 0 — Fundação executável

**Estado:** CONCLUÍDO  
**Evidência:** `docs/INCREMENT_0_VALIDATION.md`

## EPIC-00 — Fundação técnica

- `US-PLAT-001` — aplicação Next.js executável — **CONCLUÍDA**;
- `US-PLAT-002` — estrutura documental — **CONCLUÍDA**;
- `US-PLAT-003` — ambiente local reproduzível — **CONCLUÍDA**;
- `US-PLAT-004` — fundação Neon non-production — **CONCLUÍDA**;
- `US-PLAT-005` — migrations/testes/RLS e ADR-008 — **CONCLUÍDA**;
- `US-PLAT-006` — validações `verify`/`verify:db` — **CONCLUÍDA**;
- `US-PLAT-007` — CI permanente sem CD — **CONCLUÍDA**;
- `US-PLAT-008` — hosting Vercel preparado para release manual — **CONCLUÍDA**;
- `US-PLAT-009` — ambientes/variáveis separados — **CONCLUÍDA**;
- `US-PLAT-010` — ciclo Issue → branch → CI → PR → review → merge — **CONCLUÍDA**.

Deployment real não é gate técnico. Vercel permanece exclusivamente humano/manual.

---

# Incremento 1 — Fundação visual

**Estado:** CONCLUÍDO  
**Plano:** `docs/INCREMENT_1_PLAN.md`  
**Evidência:** `docs/INCREMENT_1_VALIDATION.md`

## EPIC-01 — Identidade e design system

- `US-DS-001` — tokens/temas — **CONCLUÍDA** (#33 / #34);
- `US-DS-002` — tipografia/marca — **CONCLUÍDA** (#35 / #36);
- `US-DS-003` — primitivos acessíveis — **CONCLUÍDA** (#37 / #38);
- `US-DS-004` — fundação responsiva aplicada — **CONCLUÍDA** (#39 / #40).

---

# Incremento 2 — Acesso controlado / EPIC-02

**Plano:** `docs/INCREMENT_2_PLAN.md`  
**Refino:** OPS-006 / Issue #41 / PR #42

## Objetivo

Entregar contas e acesso seguro para o beta fechado de forma incremental, separando Auth gerenciado, autorização/papéis, entrada controlada, e-mail, cadastro, login/sessão e auditoria.

### US-AUTH-001 — Fundação Neon Auth e contrato de sessão

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Issue/PR:** #43 / #44
- **Capacidade:** CAP-01
- **Evidência:** `docs/US_AUTH_001_VERIFICATION.md`

### US-AUTH-002 — Papéis, autorização e bootstrap administrativo

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Issue/PR:** #45 / #46
- **Capacidades:** CAP-04, CAP-35
- **Evidência:** `docs/US_AUTH_002_VERIFICATION.md`

### US-AUTH-003 — Convites, solicitações de acesso e auditoria de entrada

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Issue/PR:** #47 / #48
- **Capacidades:** CAP-02, CAP-35
- **Evidência:** `docs/US_AUTH_003_VERIFICATION.md`

### US-AUTH-004 — Validar e-mail Auth non-production

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Issue/PR:** #49 / #50
- **Capacidade:** CAP-01
- **Evidência:** `docs/US_AUTH_004_VERIFICATION.md`
- **Decisão:** `ADR-009 — E-mail compartilhado do Neon Auth em non-production`.

### US-AUTH-005 — Cadastro controlado por convite ou aprovação

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Issue/PR:** #51 / #52
- **Merge:** `9abc3235623c3f7d37531eb94a60997960f526e1`
- **Capacidades:** CAP-01, CAP-02
- **Evidência:** `docs/US_AUTH_005_VERIFICATION.md`

### US-AUTH-006 — Login, logout e proteção de sessão

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Issue/PR:** #53 / #54
- **Merge:** `b585234a159a73dfec89e1d4cb866201dcfdef34`
- **Capacidade:** CAP-01
- **Resultado:** login/logout server-side; `/login`; `/app` protegido por layout server-side; mensagem genérica para credenciais inválidas; estados pending/error acessíveis; testes de contrato de sessão/proteção.
- **Gates:** CI final `#214 / 34500281605` PASS; PostgreSQL 18 + `verify:db` PASS; Neon-specific estrutural/configuração PASS; browser live `SKIPPED/deferred` para US-AUTH-008.
- **Preview Vercel:** não foi gate e nenhum deployment adicional foi exigido.
- **Evidência:** `docs/US_AUTH_006_VERIFICATION.md`

### US-AUTH-007 — Recuperação de senha e gestão/revogação de sessões

- **Prioridade:** P0
- **Estado:** PRONTA
- **Capacidades:** CAP-01, CAP-35
- **Dependências:** US-AUTH-004 e US-AUTH-006 concluídas
- **Resultado esperado:** recuperação/alteração de senha e sessões consultáveis/revogáveis com semântica de cache explicitamente testada, sem enumeração ou vazamento de tokens/secrets.
- **Browser/live:** segue a política consolidada; não exigir Preview intermediário salvo dependência pública material impossível de validar de forma equivalente.

### US-AUTH-008 — Consolidar auditoria e validar Incremento 2

- **Prioridade:** P1
- **Estado:** A FAZER
- **Capacidades:** CAP-04, CAP-35
- **Resultado esperado:** matriz adversarial integrada, auditoria sem secrets, browser/live consolidado e evidência de encerramento do incremento.
- **Deployment:** se um runtime público for materialmente necessário para a matriz final, usar uma única release candidate manual em vez de Preview por Story.

## Regra de execução

Não antecipar Stories seguintes. Cada mudança persistente usa migration versionada e PostgreSQL 18; qualquer dependência real de Neon Auth/Data API exige gate Neon-specific conforme `ADR-008`.

Browser real e deployment são coisas distintas. Ausência de Preview manual não bloqueia Story comum quando CI/testes/integração disponíveis cobrem seus critérios; o gate live acumulado retorna no fechamento do incremento.

# Próxima ação operacional

> Criar Issue e branch limitadas a `US-AUTH-007 — Recuperação de senha e gestão/revogação de sessões` e executar somente essa Story sem exigir novo Preview Vercel intermediário.

Não antecipar US-AUTH-008, Production ou deployment Vercel.
