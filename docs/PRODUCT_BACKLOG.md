# Product Backlog

**Status:** Incrementos 0, 1 e 2 concluídos. Próximo trabalho: planejamento do Incremento 3 / EPIC-03.  
**Plano concluído:** `docs/INCREMENT_2_PLAN.md`

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

**Estado:** CONCLUÍDO  
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
| US-AUTH-008 — Auditoria integrada + validação final | CONCLUÍDA | #57/#58 | `US_AUTH_008_VERIFICATION.md` |

Fechamento do incremento:

```text
Merge US-AUTH-008: 84f7fecb018d6f4b6bc36817accef15f1976f05f
CI main #246 / 34850194033 / job 103995893357: SUCCESS
Live matrix #13 / 34636223750: SUCCESS
```

O Incremento 2 encerra a fundação segura de contas, autenticação, autorização, entrada controlada, recovery, sessões e auditoria Auth.

# Próximo incremento — Perfis e privacidade / EPIC-03

**Estado:** A PLANEJAR  
**Capacidades:** CAP-03, CAP-05, CAP-33

Escopo de alto nível do Project Design:

- perfil e personalização;
- visibilidade e privacidade;
- bloqueio, silenciamento e restrições;
- ciclo de conta nos limites de CAP-33;
- autorização server-side e banco desde o desenho;
- sem antecipar comunidade, Storage ou catálogo além do necessário.

Nenhuma Story do Incremento 3 foi criada ainda.

# Próxima ação operacional

> Criar o plano canônico do Incremento 3 / EPIC-03, decompor CAP-03/CAP-05/CAP-33 em Stories limitadas e deixar somente a primeira Story como próxima unidade executável.
