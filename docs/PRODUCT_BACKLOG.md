# Product Backlog

**Status:** Incrementos 0 e 1 concluídos; Incremento 2 em andamento com US-AUTH-008 no gate live final.  
**Plano vigente:** `docs/INCREMENT_2_PLAN.md`

## Convenções

Prioridades: P0 núcleo/segurança, P1 antes do beta, P2 importante, P3 expansão social, P4 futuro.  
Estados: A FAZER, PRONTA, EM ANDAMENTO, EM REVISÃO, CONCLUÍDA, BLOQUEADA.

---

# Incremento 0 — Fundação executável

**Estado:** CONCLUÍDO  
**Evidência:** `docs/INCREMENT_0_VALIDATION.md`

# Incremento 1 — Fundação visual

**Estado:** CONCLUÍDO  
**Evidência:** `docs/INCREMENT_1_VALIDATION.md`

# Incremento 2 — Acesso controlado / EPIC-02

**Estado:** EM ANDAMENTO  
**Plano:** `docs/INCREMENT_2_PLAN.md`

| Story | Estado | Issue/PR | Evidência |
|---|---|---|---|
| US-AUTH-001 — Fundação Neon Auth e sessão | CONCLUÍDA | #43/#44 | `US_AUTH_001_VERIFICATION.md` |
| US-AUTH-002 — Papéis/autorização/bootstrap | CONCLUÍDA | #45/#46 | `US_AUTH_002_VERIFICATION.md` |
| US-AUTH-003 — Convites/solicitações/auditoria | CONCLUÍDA | #47/#48 | `US_AUTH_003_VERIFICATION.md` |
| US-AUTH-004 — E-mail Auth non-production | CONCLUÍDA | #49/#50 | `US_AUTH_004_VERIFICATION.md` |
| US-AUTH-005 — Cadastro controlado + OTP | CONCLUÍDA | #51/#52 | `US_AUTH_005_VERIFICATION.md` |
| US-AUTH-006 — Login/logout + proteção de sessão | CONCLUÍDA | #53/#54 | `US_AUTH_006_VERIFICATION.md` |
| US-AUTH-007 — Recovery + gestão/revogação de sessões | CONCLUÍDA | #55/#56 | `US_AUTH_007_VERIFICATION.md` |
| US-AUTH-008 — Auditoria integrada + validação final | EM ANDAMENTO | #57/#58 | `US_AUTH_008_VERIFICATION.md` |

## US-AUTH-008 — estado atual

**Prioridade:** P1  
**Capacidades:** CAP-04, CAP-35

Entregue tecnicamente:

- auditoria de segurança Auth persistente e sanitizada;
- migration `000008_auth_security_audit.sql`;
- contratos e testes adversariais;
- CI/PostgreSQL 18 verdes;
- gate Neon isolado verde;
- promoção de `000008` para a baseline non-production com paridade de schema e sem fixtures.

Pendente para conclusão:

- uma única Preview manual Vercel da PR #58;
- matriz live acumulada de signup/OTP, login/logout, recovery/reset, senha, sessões, autorização, acesso direto e auditoria;
- evidência final e decisão de encerramento do Incremento 2.

## Regra de execução

- deployment não é consequência de push/PR/merge;
- a IA não executa deployment;
- US-AUTH-008 é o ponto deliberado de validação live acumulada;
- Production Neon, Data API e o incremento seguinte não devem ser antecipados.

# Próxima ação operacional

> Depois do CI verde da ref candidata, publicar manualmente uma única Preview Vercel da branch `feat/us-auth-008-audit-integrated-validation` e retomar US-AUTH-008 para executar a matriz live final.
