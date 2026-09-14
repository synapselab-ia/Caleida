# Product Backlog

**Status:** Incrementos 0, 1 e 2 concluídos. Incremento 3 / EPIC-03 refinado em OPS-007.  
**Plano vigente:** `docs/INCREMENT_3_PLAN.md`

## Convenções

Prioridades: P0 núcleo/segurança, P1 antes do beta, P2 importante, P3 expansão social, P4 futuro.  
Estados: A FAZER, PRONTA, EM ANDAMENTO, EM REVISÃO, CONCLUÍDA, BLOQUEADA.

---

# Incremento 0 - Fundação executável

**Estado:** CONCLUÍDO  
**Evidência:** `docs/INCREMENT_0_VALIDATION.md`

# Incremento 1 - Fundação visual

**Estado:** CONCLUÍDO  
**Evidência:** `docs/INCREMENT_1_VALIDATION.md`

# Incremento 2 - Acesso controlado / EPIC-02

**Estado:** CONCLUÍDO  
**Plano:** `docs/INCREMENT_2_PLAN.md`

| Story | Estado | Issue/PR | Evidência |
|---|---|---|---|
| US-AUTH-001 - Fundação Neon Auth e sessão | CONCLUÍDA | #43/#44 | `US_AUTH_001_VERIFICATION.md` |
| US-AUTH-002 - Papéis/autorização/bootstrap | CONCLUÍDA | #45/#46 | `US_AUTH_002_VERIFICATION.md` |
| US-AUTH-003 - Convites/solicitações/auditoria | CONCLUÍDA | #47/#48 | `US_AUTH_003_VERIFICATION.md` |
| US-AUTH-004 - E-mail Auth non-production | CONCLUÍDA | #49/#50 | `US_AUTH_004_VERIFICATION.md` |
| US-AUTH-005 - Cadastro controlado + OTP | CONCLUÍDA | #51/#52 | `US_AUTH_005_VERIFICATION.md` |
| US-AUTH-006 - Login/logout + proteção de sessão | CONCLUÍDA | #53/#54 | `US_AUTH_006_VERIFICATION.md` |
| US-AUTH-007 - Recovery + gestão/revogação de sessões | CONCLUÍDA | #55/#56 | `US_AUTH_007_VERIFICATION.md` |
| US-AUTH-008 - Auditoria integrada + validação final | CONCLUÍDA | #57/#58 | `US_AUTH_008_VERIFICATION.md` |

Fechamento do incremento:

```text
Merge US-AUTH-008: 84f7fecb018d6f4b6bc36817accef15f1976f05f
CI main #246 / 34850194033 / job 103995893357: SUCCESS
Live matrix #13 / 34636223750: SUCCESS
```

# Incremento 3 - Perfis e privacidade / EPIC-03

**Estado:** REFINADO  
**Plano:** `docs/INCREMENT_3_PLAN.md`  
**Capacidades:** CAP-03, CAP-05, CAP-33  
**Refino:** OPS-007 / Issue #59

| Story | Estado | Cobertura principal |
|---|---|---|
| US-PRIV-001 - Perfil básico user-scoped + Data API/RLS | PRONTA | CAP-03, fundação CAP-05 |
| US-PRIV-002 - Personalização segura do perfil | A FAZER | CAP-03 |
| US-PRIV-003 - Rota pública + visibilidade | A FAZER | CAP-03, CAP-05 |
| US-PRIV-004 - Bloqueio com efeito real | A FAZER | CAP-05 |
| US-PRIV-005 - Desativação e reativação | A FAZER | CAP-33 |
| US-PRIV-006 - Solicitação/cancelamento + export de encerramento | A FAZER | CAP-33 |
| US-PRIV-007 - Finalização segura da exclusão | A FAZER | CAP-33 |
| US-PRIV-008 - Validação integrada + fechamento | A FAZER | CAP-03, CAP-05, CAP-33 |

## Limites do Incremento 3

Incluído agora:

- perfil básico e personalização sem arquivos;
- visibilidade fail-closed;
- bloqueio com enforcement real;
- desativação reversível;
- exclusão em duas fases com cancelamento e export de encerramento;
- autorização server-side e banco desde o primeiro slice user-scoped.

Explicitamente adiado:

- avatar/banner e uploads: EPIC-16/CAP-30;
- obras favoritas: dependem de EPIC-04/CAP-06;
- followers/connections como opções funcionais: EPIC-13;
- mute/restrict: EPIC-13, quando existirem interações reais;
- privacidade de conteúdos ainda inexistentes: nasce com cada domínio;
- exportação completa/portabilidade: EPIC-17/CAP-32.

Esses adiamentos não contam como funcionalidade entregue e não devem gerar botões, opções ou estados falsos na interface.

# Próxima ação operacional

> Executar somente `US-PRIV-001 - Materializar perfil básico user-scoped com Data API e RLS`, conforme `docs/INCREMENT_3_PLAN.md`.
