# Product Backlog

**Status:** Incrementos 0 e 1 concluídos; Incremento 2 em revisão final, com todos os gates da US-AUTH-008 em PASS e integração da PR #58 pendente.  
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

**Estado:** EM REVISÃO FINAL  
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
| US-AUTH-008 — Auditoria integrada + validação final | EM REVISÃO | #57/#58 | `US_AUTH_008_VERIFICATION.md` |

## US-AUTH-008 — resultado

Entregue e validado:

- auditoria Auth persistente/sanitizada;
- migration `000008_auth_security_audit.sql`;
- testes adversariais;
- Neon isolated + promoção baseline non-production;
- bug de revogação coletiva encontrado pelo live gate e corrigido;
- CI #232 após a correção: PASS;
- Preview final `dpl_HqRV6x1Vn5f3GL69wGgy85UDVc9B`: READY;
- matriz live run #13 / `34636223750`: SUCCESS;
- readback de auditoria live: PASS.

A matriz comprovou signup/OTP, login/logout, proteção privada, recovery/reset, replay de token, CSRF/trusted origin, multi-sessão, negação de IDOR, revogação individual/coletiva, troca de senha e auditoria sem secrets.

Comportamento documentado do provider: reset por e-mail não revogou sessões existentes no ambiente gerenciado observado; mudança autenticada de senha revogou as demais sessões.

Pendente apenas:

- CI do head documental final;
- revisão/merge da PR #58;
- fechamento da Issue #57;
- CI de main;
- checkpoint pós-merge.

## Regra de execução

- deployment não é consequência automática de push/PR/merge;
- a IA não executa deployment;
- Production Neon e Data API continuam fora do escopo;
- branches/fixtures de verificação só podem ser limpas com autorização destrutiva explícita.

# Próxima ação operacional

> Finalizar a PR #58 e registrar o fechamento real do Incremento 2 em `main`. O próximo incremento deve ser definido canonicamente somente depois desse fechamento.
