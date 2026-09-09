# Product Backlog

**Status:** Incrementos 0 e 1 concluídos; Incremento 2 em andamento com US-AUTH-005 concluída  
**Último incremento detalhado:** `docs/INCREMENT_2_PLAN.md`  
**Próxima ação operacional:** `US-AUTH-006 — Implementar login, logout e proteção de sessão`

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
- **Estado:** CONCLUÍDA
- **Issue:** #47
- **PR:** #48
- **Capacidades:** CAP-02, CAP-35
- **Resultado:** migration `000003_entry_control.sql`; convites únicos/reutilizáveis com validade, destinatário e limite; digest-only do token; solicitações com decisão/arquivamento; auditoria compacta; consumo concorrente serializado; migration promovida à baseline sem dados sintéticos.
- **Verificação:** CI técnico `33771989432` em PASS, incluindo PostgreSQL 18 e duas sessões concorrentes disputando convite de uso único.
- **Neon-specific:** `SKIPPED` corretamente, pois a Story usa somente PostgreSQL portável e não consulta `neon_auth`/Data API.
- **Evidência:** `docs/US_AUTH_003_VERIFICATION.md`.
- **Contrato:** `docs/ENTRY_CONTROL.md`.

### US-AUTH-004 — Validar e-mail Auth non-production

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Issue:** #49
- **PR:** #50
- **Capacidade:** CAP-01
- **Decisão:** `ADR-009 — E-mail compartilhado do Neon Auth em non-production`.
- **Resultado:** readback confirmou Better Auth com email/password habilitado e `email_provider.type=shared`; o provider compartilhado atende desenvolvimento/beta fechado inicial; SMTP/provedor externo foi adiado até existir requisito material.
- **Escopo corrigido:** adapter, testes, variáveis Resend, domínio próprio e SMTP customizado preparados inicialmente foram removidos antes do merge; nenhuma migration ou secret de e-mail foi introduzido.
- **Evidência:** `docs/US_AUTH_004_VERIFICATION.md`.
- **Contrato:** `docs/EMAIL_TRANSPORT.md`.
- **Housekeeping:** `verify-us-auth-004 / br-plain-pond-aw5f59ia` não contém SMTP externo; exclusão futura exige autorização explícita.

### US-AUTH-005 — Implementar cadastro controlado por convite ou aprovação

- **Prioridade:** P0
- **Estado:** CONCLUÍDA
- **Issue:** #51
- **PR:** #52
- **Merge:** `9abc3235623c3f7d37531eb94a60997960f526e1`
- **Capacidades:** CAP-01, CAP-02
- **Resultado:** signup direto sem autorização é negado inclusive fora da UI; convite/aprovação é consumido/vinculado de forma controlada; webhooks Neon são verificados; confirmação obrigatória de e-mail por OTP foi comprovada; migrations `000004`–`000007` e a configuração Auth foram promovidas à baseline non-production sem fixtures.
- **Verificação:** CI final da branch `#201 / 34398683426` em PASS, PostgreSQL 18 em PASS, matriz live e OTP ponta a ponta em PASS, schema baseline versus `verify-us-auth-005` sem diff.
- **Evidência:** `docs/US_AUTH_005_VERIFICATION.md`.
- **Housekeeping:** `verify-us-auth-005 / br-small-river-aww0rtxo` permanece somente porque exclusão exige autorização destrutiva específica.

### US-AUTH-006 — Implementar login, logout e proteção de sessão

- **Prioridade:** P0
- **Estado:** PRONTA
- **Capacidade:** CAP-01
- **Dependência:** US-AUTH-005 concluída
- **Resultado esperado:** login/logout e superfícies privadas protegidas por validação server-side, com estados acessíveis, sem enumeração indevida e sem flash de conteúdo privado.
- **Gates esperados:** `npm run verify`; browser real quando houver superfície; Neon-specific obrigatório quando o comportamento depender do Managed Better Auth; nenhuma Production/deployment pela IA.

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

> `US-AUTH-006 — Implementar login, logout e proteção de sessão`

Criar Issue e branch limitadas à Story antes de implementar. Não antecipar recuperação de senha, gestão avançada de sessões, Production ou deployment Vercel.