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
**NEXT_ACTION:** `Na branch Neon isolada verify-us-auth-005, ativar a confirmação obrigatória de e-mail pela superfície oficial do Neon Auth e executar um signup autorizado com caixa de e-mail acessível para comprovar o fluxo de confirmação; depois promover 000004–000007 para a baseline somente se o gate passar e retomar a PR #52.`  
**BLOCKERS:** `require_email_verification continua false; a superfície Neon conectada nesta execução não expõe a alteração dessa configuração`  
**ON_HOLD:** none  
**MANUAL_ACTION_REQUIRED:** `alterar require_email_verification na branch verify-us-auth-005 pela superfície oficial do Neon Auth e concluir a confirmação usando uma caixa de e-mail acessível; não enviar secrets ao chat`

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
US-AUTH-005 cadastro controlado — GATE LIVE PASS / confirmação de e-mail PENDENTE (#51 / #52 draft)
  ↓
US-AUTH-006 login/logout + proteção de sessão — NÃO INICIAR
  ↓
US-AUTH-007 recuperação de senha + gestão/revogação de sessões
  ↓
US-AUTH-008 auditoria integrada + validação do incremento
```

Plano detalhado: `docs/INCREMENT_2_PLAN.md`. Evidência corrente: `docs/US_AUTH_005_VERIFICATION.md`.

## US-AUTH-005 — estado técnico atual

### Git / CI

O head funcional `5ada76e8eb68679c181a6d5c3c7c8d5db1794786` passou o gate portátil em CI `#180 / 34373402005`.

Provas live temporárias executadas pela CI e removidas da árvore depois da coleta de evidência:

```text
#181 / 34387804292 — signup direto sem autorização: SUCCESS
#182 / 34388232866 — solicitação aprovada: SUCCESS
#183 / 34388501646 — assinatura/timestamp inválidos: SUCCESS
#184 / 34388910697 — matriz live de convites: SUCCESS
```

### Migrations da Story

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

A branch contém fixtures e identidades exclusivamente de verificação live. Elas não foram promovidas à baseline.

Better Auth isolado:

```text
email/password: enabled
allow_sign_up: true
require_email_verification: false
email verification method: otp
email provider: shared Neon
webhook: enabled
```

Webhook branch-scoped comprovado:

```text
user.before_create
user.created
→ <Preview estável>/api/webhooks/neon-auth
```

### Preview Vercel

O Preview foi criado manualmente pelo usuário em conformidade com ADR-007 e está reutilizável:

```text
Project: caleida
Deployment: dpl_8WN2sKEEL6ex3vKt11vmYX9ZGvoN
State: READY
Git commit: 5ada76e8eb68679c181a6d5c3c7c8d5db1794786
Branch alias: caleida-git-feat-us-auth-005-55f705-synapselabia-8285s-projects.vercel.app
```

O alias estável também está cadastrado como trusted origin da branch Neon isolada.

### Gate live de entrada — PASS

Foi comprovado contra o serviço real:

- signup direto sem convite/aprovação → negado antes da criação do usuário;
- solicitação aprovada → `before_create allowed` e `user.created linked`;
- convite inexistente/expirado/revogado/esgotado → negado;
- e-mail divergente de convite restrito → negado;
- convite válido → permitido, consumido uma única vez e vinculado;
- assinatura inválida → HTTP 401;
- timestamp expirado → HTTP 401;
- logs observados permanecem sanitizados.

A concorrência/capacidade continua coberta pelos testes versionados PostgreSQL/CI.

### Baseline preservada

Readback posterior ao gate live confirmou:

```text
main / br-restless-cherry-awpcwy6r
ledger: 000001 + 000002 + 000003
```

Nenhuma migration da US-AUTH-005 foi promovida ainda.

## Único bloqueio restante

O Project Design exige confirmação de e-mail. O plano da Story proibia ativá-la antes da prova fail-closed; esse pré-requisito agora está satisfeito.

A superfície Neon conectada disponível neste chat consegue ler a configuração, mas não expõe a alteração de `require_email_verification`. Não editar `neon_auth.project_config` diretamente por SQL como workaround não documentado.

A PR #52 permanece draft e a Issue #51 aberta até a confirmação de e-mail ser comprovada, as migrations serem promovidas à baseline e o readback final passar.

## Invariantes vigentes

- convite/aprovação é o gate de entrada;
- confirmação de e-mail complementa, não substitui, autorização;
- secrets permanecem server-only;
- baseline Neon não é laboratório;
- sem Production Neon;
- sem deployment Vercel pela IA;
- não iniciar US-AUTH-006 antes de concluir US-AUTH-005.
