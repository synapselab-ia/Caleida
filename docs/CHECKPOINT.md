# Checkpoint — Caleida

**PROJECT_STATUS:** READY  
**CURRENT_PHASE:** Incremento 2 — Acesso controlado / EPIC-02 em andamento  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `US-AUTH-005 — Implementar cadastro controlado por convite ou aprovação`  
**LAST_COMPLETED_ISSUE:** `#51`  
**LAST_COMPLETED_PR:** `#52`  
**LAST_COMPLETED_MERGE:** `9abc3235623c3f7d37531eb94a60997960f526e1`  
**ACTIVE_TASK:** none  
**ACTIVE_ISSUE:** none  
**ACTIVE_BRANCH:** none  
**ACTIVE_PR:** none  
**NEXT_ACTION:** `Promover US-AUTH-006 — implementar login, logout e proteção de sessão: criar Issue e branch limitadas a essa Story, recuperar o contrato Auth/sessão integrado e executar somente seu escopo e gates canônicos.`  
**BLOCKERS:** none  
**ON_HOLD:** none  
**MANUAL_ACTION_REQUIRED:** none

## Comando de continuação

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

Recupere GitHub, Neon e Vercel antes de agir. Não refaça Stories concluídas, não invente secrets e não execute deployment Vercel.

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
US-AUTH-006 login/logout + proteção de sessão — PRÓXIMA
  ↓
US-AUTH-007 recuperação de senha + gestão/revogação de sessões
  ↓
US-AUTH-008 auditoria integrada + validação do incremento
```

Plano detalhado: `docs/INCREMENT_2_PLAN.md`.

## US-AUTH-005 — encerramento integrado

### GitHub

```text
Issue #51: CLOSED
PR #52: MERGED
Merge: 9abc3235623c3f7d37531eb94a60997960f526e1
CI final da branch: #201 / 34398683426 — SUCCESS
```

A PR foi revisada sem threads/reviews pendentes antes do merge.

### Baseline Neon — PASS

Projeto: `caleida-nonprod / patient-glade-95136440`  
Baseline: `main / br-restless-cherry-awpcwy6r`

```text
ledger: 000001–000007
schema vs verify-us-auth-005: diff vazio
auth_users: 0
product_roles: 0
invitations: 0
invitation_uses: 0
access_requests: 0
signup_permits: 0
auth_webhook_events: 0
```

Auth final da baseline:

```text
email/password: enabled
allow_sign_up: true
verify_email_on_sign_up: true
require_email_verification: true
email_verification_method: otp
auto_sign_in_after_verification: true
email provider: shared Neon
```

Checksums promovidos:

```text
000004_controlled_signup.sql
633c913deeedae4eca32890268b9f47b03c67178a0fd9a6edf2e8f05f2890535

000005_controlled_signup_consume_fix.sql
c7211562a5aec011b5af8707f63c9db4171a379c1ee0897567c03f79059ab4f1

000006_before_create_without_user_id.sql
5537735b38710032affbe600f5ce4f666da8532e6fc554953c526914357ed68b

000007_claim_signature_compatibility.sql
823d39d763c32736fa0df1f0d626647f8dd3009d56fe1262fa74cc91d67b02c6
```

Evidência consolidada: `docs/US_AUTH_005_VERIFICATION.md`.

### Gates live — PASS

No Preview Vercel manual + `verify-us-auth-005` foram comprovados:

- signup sem autorização negado fora da UI;
- solicitação aprovada permitida e vinculada;
- convites inválido/expirado/revogado/esgotado/e-mail divergente negados;
- convite válido consumido e vinculado;
- `user.before_create` sem user id suportado;
- `user.created` finalizando o vínculo;
- assinatura/timestamp inválidos rejeitados;
- usuário não verificado impedido de autenticar;
- OTP real recebido e validado;
- `emailVerified=true` e sign-in pós-verificação permitido.

### Vercel / runtime

O deployment de prova foi criado manualmente pelo usuário conforme ADR-007. A IA não executou deploy, promotion, redeploy, rollback ou hook.

`package.json` declara Node `24.x`; `.nvmrc` e CI permanecem fixos em `24.20.0`. O metadado raiz equivalente em `package-lock.json` ainda reflete o intervalo anterior; o grafo de dependências não mudou e `npm ci`/CI final passaram. Normalizar quando o lockfile for regenerado.

## Housekeeping não bloqueante

As branches Neon abaixo continuam existentes porque exclusão é destrutiva e exige autorização específica:

```text
verify-us-auth-004 / br-plain-pond-aw5f59ia
verify-us-auth-005 / br-small-river-aww0rtxo
```

Não removê-las automaticamente.

## Invariantes vigentes

- convite/aprovação é o gate de entrada;
- confirmação de e-mail complementa, não substitui, autorização;
- secrets permanecem server-only;
- baseline Neon não é laboratório destrutivo;
- sem Production Neon;
- sem deployment Vercel pela IA;
- Data API permanece fora do escopo atual;
- não antecipar US-AUTH-007/008 durante US-AUTH-006.