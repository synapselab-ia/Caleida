# Product Backlog

**Status:** Incrementos 0 e 1 concluídos; Incremento 2 em andamento com US-AUTH-003 concluída  
**Último incremento detalhado:** `docs/INCREMENT_2_PLAN.md`  
**Próxima ação operacional:** `US-AUTH-004 — Selecionar e integrar e-mail transacional non-production`

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

Deployment real não é gate técnico. Vercel permanece exclusivamente humana/manual.

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

### US-AUTH-001 — Materializar fundação Neon Auth isolada e contrato de sessão

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Issue:** #43
- **PR:** #44
- **Capacidade:** CAP-01
- **Resultado:** SDK Neon Auth pinado, boundary server-only/lazy/fail-closed e Managed Better Auth promovido à baseline depois dos gates; nenhum usuário/Data API/Production/deployment criado.
- **Evidência:** `docs/US_AUTH_001_VERIFICATION.md`.

### US-AUTH-002 — Materializar papéis, autorização e bootstrap administrativo

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Issue:** #45
- **PR:** #46
- **Capacidades:** CAP-04, CAP-35
- **Resultado:** cinco papéis Caleida separados do Admin Better Auth; autorização crítica server-side + banco; auditoria mínima; bootstrap owner controlado; migrations `000001/000002` promovidas à baseline.
- **Evidência:** `docs/US_AUTH_002_VERIFICATION.md`.
- **Operação:** `verify-us-auth-002` foi removida em 03/09/2026 após autorização explícita do usuário.

### US-AUTH-003 — Modelar convites, solicitações de acesso e auditoria de entrada

- **Prioridade:** P0
- **Estado:** CONCLUÍDA APÓS INTEGRAÇÃO
- **Issue:** #47
- **PR:** #48
- **Capacidades:** CAP-02, CAP-35
- **Resultado:** migration `000003_entry_control.sql`; convites únicos/reutilizáveis com validade, destinatário e limite; digest-only do token; solicitações com decisão/arquivamento; auditoria compacta; consumo concorrente serializado; migration promovida à baseline sem dados sintéticos.
- **Verificação:** CI técnico `33771989432` em PASS, incluindo PostgreSQL 18 e duas sessões concorrentes disputando convite de uso único.
- **Neon-specific:** `SKIPPED` corretamente, pois a Story usa somente PostgreSQL portável e não consulta `neon_auth`/Data API.
- **Evidência:** `docs/US_AUTH_003_VERIFICATION.md`.
- **Contrato:** `docs/ENTRY_CONTROL.md`.

### US-AUTH-004 — Selecionar e integrar e-mail transacional non-production

- **Prioridade:** P0
- **Estado:** PRONTA
- **Capacidades:** CAP-01, CAP-02
- **Resultado esperado:** decisão documentada de provedor e transporte non-production para confirmação, convite e recuperação, com secrets server-only, comportamento recuperável e separação de ambientes.
- **Regra:** revalidar pricing/limites/privacidade correntes e registrar ADR se a escolha for material.

### US-AUTH-005 — Implementar cadastro controlado por convite ou aprovação

- **Prioridade:** P0
- **Estado:** A FAZER
- **Capacidades:** CAP-01, CAP-02
- **Resultado esperado:** signup direto sem autorização de entrada negado inclusive fora da UI; confirmação de e-mail e consumo/vínculo seguro do mecanismo de entrada.

### US-AUTH-006 — Implementar login, logout e proteção de sessão

- **Prioridade:** P0
- **Estado:** A FAZER
- **Capacidade:** CAP-01
- **Resultado esperado:** login/logout e superfícies privadas protegidas por validação server-side, com estados acessíveis e sem flash de conteúdo privado.

### US-AUTH-007 — Implementar recuperação de senha e gestão/revogação de sessões

- **Prioridade:** P0
- **Estado:** A FAZER
- **Capacidades:** CAP-01, CAP-35
- **Resultado esperado:** recuperação/alteração de senha e sessões consultáveis/revogáveis com semântica de cache explicitamente testada.

### US-AUTH-008 — Consolidar auditoria e validar Incremento 2

- **Prioridade:** P1
- **Estado:** A FAZER
- **Capacidades:** CAP-04, CAP-35
- **Resultado esperado:** matriz adversarial integrada, auditoria sem secrets e evidência de encerramento do incremento.

## Regra de execução

Não antecipar Stories seguintes. Cada mudança persistente usa migration versionada e PostgreSQL 18; qualquer dependência real de Neon Auth/Data API exige também gate Neon-specific conforme `ADR-008`.

# Próxima ação operacional

> `US-AUTH-004 — Selecionar e integrar e-mail transacional non-production`

Não antecipar signup/login/Production ou deployment Vercel dentro da Story.
