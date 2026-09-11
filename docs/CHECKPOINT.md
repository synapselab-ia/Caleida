# Checkpoint — Caleida

**PROJECT_STATUS:** READY  
**CURRENT_PHASE:** Incremento 2 — Acesso controlado / EPIC-02 em andamento  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `US-AUTH-006 — Implementar login, logout e proteção de sessão`  
**LAST_COMPLETED_ISSUE:** `#53`  
**LAST_COMPLETED_PR:** `#54`  
**LAST_COMPLETED_MERGE:** `b585234a159a73dfec89e1d4cb866201dcfdef34`  
**ACTIVE_TASK:** `US-AUTH-007 — Recuperação de senha e gestão/revogação de sessões`  
**ACTIVE_ISSUE:** `#55`  
**ACTIVE_BRANCH:** `feat/us-auth-007-password-session-management`  
**ACTIVE_PR:** `#56`  
**NEXT_ACTION:** `Finalizar US-AUTH-007: revalidar CI após documentação de fechamento, revisar diff/threads e integrar a PR #56; depois do merge saudável, promover somente US-AUTH-008.`  
**BLOCKERS:** none  
**ON_HOLD:** none  
**MANUAL_ACTION_REQUIRED:** none

## Comando de continuação

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

Recupere GitHub/Neon quando materialmente aplicável. Não refaça Stories concluídas, não invente secrets e não execute deployment Vercel.

## Regra operacional vigente

Preview Vercel não é gate obrigatório de Story. Browser real não transforma Story intermediária em `MANUAL_ACTION_REQUIRED` apenas porque existe UI.

Se CI, testes de contrato/integração, revisão server-side e gate Neon-specific cobrirem os critérios materiais, browser live é `SKIPPED/deferred` e retorna na validação integrada do incremento.

No Incremento 2, `US-AUTH-008` concentra a matriz live. Se runtime público for material, usar uma única release candidate manual.

Autoridades: `00_SYSTEM/DEPLOYMENT_POLICY.md` e `00_SYSTEM/VERIFICATION_PROTOCOL.md`.

## Incrementos concluídos

- Incremento 0 — fundação executável: **CONCLUÍDO** (`docs/INCREMENT_0_VALIDATION.md`).
- Incremento 1 — fundação visual / EPIC-01: **CONCLUÍDO** (`docs/INCREMENT_1_VALIDATION.md`).

## Incremento 2 — cursor atual

```text
US-AUTH-001 fundação Neon Auth + sessão — CONCLUÍDA (#43 / #44)
  ↓
US-AUTH-002 papéis/autorização + bootstrap — CONCLUÍDA (#45 / #46)
  ↓
US-AUTH-003 convites/solicitações + auditoria — CONCLUÍDA (#47 / #48)
  ↓
US-AUTH-004 e-mail Auth non-production — CONCLUÍDA (#49 / #50)
  ↓
US-AUTH-005 cadastro controlado + confirmação de e-mail — CONCLUÍDA (#51 / #52)
  ↓
US-AUTH-006 login/logout + proteção de sessão — CONCLUÍDA (#53 / #54)
  ↓
US-AUTH-007 recuperação de senha + gestão/revogação de sessões — EM REVISÃO (#55 / #56)
  ↓
US-AUTH-008 auditoria integrada + validação live do incremento
```

Plano detalhado: `docs/INCREMENT_2_PLAN.md`.

## US-AUTH-007 — estado atual

### Implementação

- `/forgot-password` com resposta anti-enumeração;
- callback de recovery derivado de origem same-origin validada;
- `/reset-password` usando token do provider sem persistência em logs/docs;
- alteração autenticada de senha exige senha atual e usa `revokeOtherSessions: true`;
- `/account/security` sob o boundary privado existente;
- listagem das próprias sessões sem expor session token;
- revogação individual recebe apenas `session.id`, valida ownership e resolve bearer token somente no servidor;
- sessão corrente pode ser encerrada via `signOut()`;
- cache de dados de sessão reduzido de 300 s para 1 s;
- nenhuma migration/schema adicional criado.

### GitHub / CI

```text
Issue #55: OPEN
PR #56: OPEN / draft durante fechamento
Branch: feat/us-auth-007-password-session-management
Head funcional: df745df9a05232372e8a1e1b269bc5502499503b
CI #221 / run 34519793813 / job 103014162360: SUCCESS
npm run verify: PASS
PostgreSQL 18 + verify:db: PASS
```

### Neon isolated gate

```text
Projeto: caleida-nonprod / patient-glade-95136440
Baseline: main / br-restless-cherry-awpcwy6r
Branch US-AUTH-007: verify-us-auth-007 / br-wandering-mountain-awjnqqps / ready
Provider: Better Auth
Email/password: enabled
Require email verification: true / OTP
Email provider: shared Neon
Auth users: 0
Auth sessions: 0
Auth accounts: 0
Auth verifications: 0
Schema diff vs baseline: vazio
```

A configuração gerenciada `email_and_password` observada não expõe `revokeSessionsOnPasswordReset`. Portanto reset por e-mail não é declarado como revogação automática de sessões existentes; alteração autenticada e controles de sessão fornecem revogação explícita. A matriz live de US-AUTH-008 medirá o comportamento real.

### Browser/live

```text
US-AUTH-007 browser/live: SKIPPED/deferred para US-AUTH-008
Preview Vercel adicional: NÃO REQUERIDO
MANUAL_ACTION_REQUIRED: none
```

Contrato: `docs/SESSION_SECURITY.md`.  
Evidência: `docs/US_AUTH_007_VERIFICATION.md`.

## Housekeeping Neon não bloqueante

```text
verify-us-auth-004 / br-plain-pond-aw5f59ia
verify-us-auth-005 / br-small-river-aww0rtxo
verify-us-auth-006 / br-cold-block-aww00k4o
verify-us-auth-007 / br-wandering-mountain-awjnqqps
```

Não remover automaticamente; exclusão de branch é destrutiva e exige autorização explícita.

## Invariantes vigentes

- convite/aprovação continua sendo gate de entrada;
- confirmação de e-mail complementa autorização;
- secrets e bearer tokens permanecem server-only;
- baseline Neon não é laboratório destrutivo;
- sem Production Neon;
- sem deployment Vercel pela IA;
- Preview não é gate obrigatório por Story;
- Data API permanece fora do escopo atual;
- não antecipar US-AUTH-008 antes do merge de US-AUTH-007.
