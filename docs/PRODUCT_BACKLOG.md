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

Entregue e verde:

- auditoria Auth persistente/sanitizada;
- migration `000008_auth_security_audit.sql`;
- testes adversariais;
- Neon isolated + promoção baseline non-production;
- CI #232 após a correção live: PASS.

A matriz live já provou signup controlado, OTP, login, proteção privada, múltiplas sessões, negação de IDOR e revogação individual. Ela encontrou uma falha material na revogação coletiva: o provider retornava sucesso sem invalidar a sessão remota.

A PR #58 foi corrigida para revogar explicitamente cada sessão remota server-side, preservando a atual e sem expor bearer token. O contrato automatizado foi reforçado e o CI passou.

Pendente para conclusão:

- Preview manual atualizada da ref corrente da PR #58, pois a RC anterior é imutável e contém o código defeituoso;
- reexecução/conclusão da matriz live com revogação coletiva, recovery/reset, password change, logout e auditoria final;
- evidência final e merge se todos os gates passarem.

## Regra de execução

- deployment não é consequência automática de push/PR/merge;
- a IA não executa deployment;
- US-AUTH-008 é o ponto deliberado de validação live acumulada;
- uma nova RC só é exigida agora porque o próprio gate encontrou um bug e o código foi alterado;
- Production Neon, Data API e o incremento seguinte não devem ser antecipados.

# Próxima ação operacional

> Publicar manualmente uma Preview Vercel da ref corrente da branch `feat/us-auth-008-audit-integrated-validation`; quando ficar `READY`, retomar a matriz live imediatamente.
