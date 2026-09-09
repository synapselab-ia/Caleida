# Checkpoint — Caleida

**PROJECT_STATUS:** READY_FOR_REVIEW  
**CURRENT_PHASE:** Incremento 2 — Acesso controlado / EPIC-02 em andamento  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `US-AUTH-004 — Validar e-mail Auth non-production`  
**LAST_COMPLETED_ISSUE:** `#49`  
**LAST_COMPLETED_PR:** `#50`  
**ACTIVE_TASK:** `US-AUTH-005 — Implementar cadastro controlado por convite ou aprovação`  
**ACTIVE_ISSUE:** `#51`  
**ACTIVE_BRANCH:** `feat/us-auth-005-controlled-signup`  
**ACTIVE_PR:** `#52`  
**NEXT_ACTION:** `Executar a revisão final da PR #52, confirmar CI verde no head final e integrar a US-AUTH-005. Após a integração, atualizar o checkpoint integrado e promover US-AUTH-006 — login/logout + proteção de sessão — como única próxima ação.`  
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
US-AUTH-005 cadastro controlado + confirmação de e-mail — GATES PASS / PRONTA PARA INTEGRAÇÃO (#51 / #52)
  ↓
US-AUTH-006 login/logout + proteção de sessão — NÃO INICIAR ANTES DO MERGE DA #52
  ↓
US-AUTH-007 recuperação de senha + gestão/revogação de sessões
  ↓
US-AUTH-008 auditoria integrada + validação do incremento
```

Plano detalhado: `docs/INCREMENT_2_PLAN.md`. Evidência consolidada: `docs/US_AUTH_005_VERIFICATION.md`.

## US-AUTH-005 — estado técnico final antes da integração

### Implementação

A Story contém o fluxo fail-closed de cadastro por convite ou solicitação aprovada, webhook `user.before_create`/`user.created`, permits curtos, rate limiting, auditoria e confirmação obrigatória de e-mail.

Migrations versionadas:

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

### Gates live — PASS

Em `verify-us-auth-005 / br-small-river-aww0rtxo` foram comprovados:

- signup direto sem autorização → negado;
- solicitação aprovada → permitido e vinculado;
- convites inválido/expirado/revogado/esgotado → negados;
- e-mail divergente → negado;
- convite válido → consumido uma vez e vinculado;
- assinatura/timestamp inválidos → HTTP 401;
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
#198 / 34396625071 — PASS após fechamento dos gates
```

As provas temporárias foram removidas da árvore após coleta de evidência.

### Baseline Neon — PROMOVIDA / PASS

```text
main / br-restless-cherry-awpcwy6r
ledger: 000001–000007
schema vs verify-us-auth-005: diff vazio
```

Readback pós-promoção confirmou zero fixtures:

```text
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

### Runtime

O Preview Vercel real mostrou que a plataforma seleciona patches dentro do Node 24. `package.json` declara `24.x`; `.nvmrc` e CI continuam em `24.20.0` para reprodutibilidade.

O SHA funcional do Preview é `5ada76e8eb68679c181a6d5c3c7c8d5db1794786`. Entre esse SHA e o head posterior, somente documentação e `package.json` mudaram; nenhum código funcional de Auth/webhook foi alterado depois das provas live.

## Invariantes vigentes

- convite/aprovação é o gate de entrada;
- confirmação de e-mail complementa, não substitui, autorização;
- secrets permanecem server-only;
- baseline Neon não é laboratório;
- sem Production Neon;
- sem deployment Vercel pela IA;
- Data API permanece fora do escopo;
- não iniciar US-AUTH-006 antes de integrar a PR #52;
- exclusão das branches Neon de verificação requer autorização destrutiva específica e não faz parte desta ação.