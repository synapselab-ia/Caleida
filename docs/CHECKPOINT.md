# Checkpoint — Caleida

**PROJECT_STATUS:** MANUAL_ACTION_REQUIRED  
**CURRENT_PHASE:** Incremento 2 — Acesso controlado / EPIC-02 em andamento  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `US-AUTH-004 — Validar e-mail Auth non-production`  
**LAST_COMPLETED_ISSUE:** `#49`  
**LAST_COMPLETED_PR:** `#50`  
**ACTIVE_TASK:** `US-AUTH-005 — Implementar cadastro controlado por convite ou aprovação`  
**ACTIVE_ISSUE:** `#51`  
**ACTIVE_BRANCH:** `feat/us-auth-005-controlled-signup`  
**ACTIVE_PR:** `#52 (draft)`  
**NEXT_ACTION:** `Promover deliberadamente as migrations 000004–000007 para a baseline Neon main / br-restless-cherry-awpcwy6r, reproduzir requireEmailVerification=true + sendVerificationEmailOnSignUp=true na baseline, executar readback de ledger/schema/Auth e então retomar a finalização da PR #52.`  
**BLOCKERS:** `promoção da baseline é mudança persistente e exige autorização explícita antes da execução`  
**ON_HOLD:** none  
**MANUAL_ACTION_REQUIRED:** `autorizar a promoção 000004–000007 e a configuração Auth correspondente na baseline non-production; não envolve Vercel/PowerShell`

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
US-AUTH-005 cadastro controlado — GATES LIVE PASS / PROMOÇÃO BASELINE PENDENTE (#51 / #52 draft)
  ↓
US-AUTH-006 login/logout + proteção de sessão — NÃO INICIAR
  ↓
US-AUTH-007 recuperação de senha + gestão/revogação de sessões
  ↓
US-AUTH-008 auditoria integrada + validação do incremento
```

Plano detalhado: `docs/INCREMENT_2_PLAN.md`. Evidência consolidada: `docs/US_AUTH_005_VERIFICATION.md`.

## US-AUTH-005 — estado técnico atual

### Implementação

A Story contém o fluxo fail-closed de cadastro por convite ou solicitação aprovada, webhook `user.before_create`/`user.created`, permits curtos, rate limiting e auditoria.

Migrations aprovadas na branch isolada:

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

### Branch Neon isolada

```text
verify-us-auth-005 / br-small-river-aww0rtxo / ready
ledger: 000001–000007
```

O gate live comprovou:

- signup direto sem autorização → negado;
- aprovação válida → permitido e vinculado;
- convites inválido/expirado/revogado/esgotado → negados;
- e-mail divergente → negado;
- convite válido → consumido uma vez e vinculado;
- assinatura/timestamp inválidos → 401;
- confirmação obrigatória de e-mail → ativa;
- usuário não verificado → sign-in negado;
- OTP real recebido e consumido → PASS;
- usuário confirmado → `emailVerified=true` e sign-in permitido.

CI live relevante:

```text
#181 — PASS
#182 — PASS
#183 — PASS
#184 — PASS
#190 — PASS
#194 / 34395716742 — PASS ponta a ponta do OTP + gate PostgreSQL
```

As provas temporárias foram removidas da árvore após coleta de evidência.

### Auth isolado

```text
email/password: enabled
allow_sign_up: true
requireEmailVerification: true
sendVerificationEmailOnSignUp: true
emailVerificationMethod: otp
email provider: shared Neon
```

### Runtime

O Preview Vercel real mostrou que a plataforma seleciona patches do Node 24 e só garante `24.x`. `package.json` foi alinhado a `24.x`; `.nvmrc` e CI continuam em `24.20.0` para reprodutibilidade. O CI da correção deve permanecer verde antes da promoção.

### Baseline preservada

Readback mais recente:

```text
main / br-restless-cherry-awpcwy6r
ledger: 000001 + 000002 + 000003
```

Nenhuma migration US-AUTH-005 nem a nova exigência de verificação de e-mail foram promovidas à baseline.

## Único gate restante

A próxima ação é uma mudança persistente na baseline non-production. Aplicar `000004`–`000007` e reproduzir a configuração Auth comprovada exige autorização explícita antes da execução. Depois disso, executar readback final e fechar a Story/PR se todos os gates permanecerem verdes.

## Invariantes vigentes

- convite/aprovação é o gate de entrada;
- confirmação de e-mail complementa, não substitui, autorização;
- secrets permanecem server-only;
- baseline Neon não é laboratório;
- sem Production Neon;
- sem deployment Vercel pela IA;
- não iniciar US-AUTH-006 antes de concluir US-AUTH-005.
