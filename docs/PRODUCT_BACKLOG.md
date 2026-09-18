# Product Backlog

**Status:** Incrementos 0, 1 e 2 concluídos. Incremento 3 / EPIC-03 em execução.  
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

**Estado:** EM ANDAMENTO / US-PRIV-005 PRONTA  
**Plano:** `docs/INCREMENT_3_PLAN.md`  
**Capacidades:** CAP-03, CAP-05, CAP-33  
**Refino:** OPS-007 / Issue #59

| Story | Estado | Issue/PR | Cobertura principal | Evidência |
|---|---|---|---|---|
| US-PRIV-001 - Perfil básico user-scoped + Data API/RLS | CONCLUÍDA | #61/#62 | CAP-03, fundação CAP-05 | `US_PRIV_001_VERIFICATION.md` |
| US-PRIV-002 - Personalização segura do perfil | CONCLUÍDA | #63/#64 | CAP-03 | `US_PRIV_002_VERIFICATION.md` |
| US-PRIV-003 - Rota pública + visibilidade | CONCLUÍDA | #65/#66 | CAP-03, CAP-05 | `US_PRIV_003_VERIFICATION.md` |
| US-PRIV-004 - Bloqueio com efeito real | CONCLUÍDA | #67/#68 | CAP-05 | `US_PRIV_004_VERIFICATION.md` |
| US-PRIV-005 - Desativação e reativação | PRONTA | - | CAP-33 | - |
| US-PRIV-006 - Solicitação/cancelamento + export de encerramento | A FAZER | - | CAP-33 | - |
| US-PRIV-007 - Finalização segura da exclusão | A FAZER | - | CAP-33 | - |
| US-PRIV-008 - Validação integrada + fechamento | A FAZER | - | CAP-03, CAP-05, CAP-33 | - |

## Fechamento de US-PRIV-001

```text
Issue #61: closed/completed
PR #62: merged
Feature head: ec644c1495644a74a281f08848224c43cc60daf7
Merge: 8aeb90cdc3b9b017aee3cefcd4e60b35f22d2758
CI final PR #279 / 35241013997: SUCCESS
CI pós-merge main #280 / 35241229260: SUCCESS
PostgreSQL 18 + verify:db: PASS
Live JWT/Data API/RLS #11 / 35013092108: SUCCESS
Baseline promotion #1 / 35239947088: SUCCESS
Baseline migrations: 000001-000010
Baseline Data API: active / somente caleida_profile
Schema diff isolated vs baseline: vazio
```

A matriz live provou duas identidades A/B e anônimo, ownership, leitura/alteração cruzada, forged ownership, transferência de ownership, DELETE negado e cleanup. A baseline possui somente `SELECT`, `INSERT` e `UPDATE` para `authenticated` na tabela de perfil, sem grants de tabela para `anonymous`/`PUBLIC` e sem policy/grant de `DELETE`.

## Limites do Incremento 3

Incluído neste incremento:

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

## Fechamento de US-PRIV-002

```text
Issue #63: closed/completed
PR #64: merged
Feature head final: 510f4ee461b9976d8f8311dbe3d9a9557c46cdd8
Merge: d19be4e881da6f8e3ba54a50ecef1c67fb1160e3
CI final PR #289 / 35351088749 / job 105619133550: SUCCESS
CI pós-merge main #290 / 35351301592 / job 105619831900: SUCCESS
PostgreSQL 18 + verify:db: PASS
Neon isolated: verify-us-priv-002 / br-proud-wind-awycp0sd: PASS
Baseline migrations: 000001-000011
000011 checksum: 4773504fe2296e7ce141e8efcb027efd2218f2fd5c5598585bd97f5a4f55f95f
Schema diff isolated vs baseline: vazio
```

A Story adicionou somente biografia, token de destaque, links HTTPS e categorias culturais favoritas, preservando RLS, ownership e grants mínimos.

# Próxima ação operacional

> Promover US-PRIV-005 como próxima Story limitada: criar Issue e branch próprias e implementar somente desativação/reativação reversíveis. Não antecipar solicitação ou finalização de exclusão.

## Fechamento de US-PRIV-003

```text
Issue #65: closed/completed
PR #66: merged
Feature head final: ed821cf9bcf5ee77b9fbec57ba75b19c014d4458
Merge: 8541324800708eaecaff17c9492ef072142672a5
CI final PR #296 / 35355383381 / job 105633487565: SUCCESS
CI pós-merge main #297 / 35355615237 / job 105634118124: SUCCESS
PostgreSQL 18 + verify:db: PASS
Neon isolated: verify-us-priv-003 / br-noisy-firefly-aw06x1br: PASS
Baseline migrations: 000001-000012
000012 checksum: d8a1f4f7f973e12490cf205bd8ec96ce50c55e4dbc5dd09bb978f16dcfdf3713
Schema diff isolated vs baseline: vazio
```

A Story publicou somente perfis `public`, manteve `only_me`, `followers` e `connections` privados para terceiros e limitou `anonymous` às seis colunas deliberadamente públicas.


## Fechamento de US-PRIV-004

```text
Issue #67: closed/completed
PR #68: merged
Feature head final: 874cb989aec13848c48901ac351980d870f0f935
Merge: 4eaa0b44dbe76354ea86f590b22a3acab157353d
CI final PR #303 / 35361184117 / job 105652550427: SUCCESS
CI pós-merge main #304 / 35361379171 / job 105653192533: SUCCESS
PostgreSQL 18 + verify:db: PASS
Neon isolated: verify-us-priv-004 / br-curly-fog-aw1c1hpo: PASS
Baseline migrations: 000001-000013
Schema diff isolated vs baseline: vazio
```
