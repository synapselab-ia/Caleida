# Checkpoint — Caleida

**PROJECT_STATUS:** READY  
**CURRENT_PHASE:** Incremento 2 — Acesso controlado / EPIC-02 em andamento  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `US-AUTH-007 — Recuperação de senha e gestão/revogação de sessões`  
**LAST_COMPLETED_ISSUE:** `#55`  
**LAST_COMPLETED_PR:** `#56`  
**LAST_COMPLETED_MERGE:** `31ec6e2238a7b0bdaff7506ac0e9ed51179f3322`  
**ACTIVE_TASK:** none  
**ACTIVE_ISSUE:** none  
**ACTIVE_BRANCH:** none  
**ACTIVE_PR:** none  
**NEXT_ACTION:** `Promover US-AUTH-008 — consolidar auditoria e validar o Incremento 2: criar Issue e branch limitadas à Story, recuperar a matriz integrada de autenticação/autorização e executar seus gates, usando uma única release candidate manual somente se o browser/live realmente exigir runtime público.`  
**BLOCKERS:** none  
**ON_HOLD:** none  
**MANUAL_ACTION_REQUIRED:** none

## Comando de continuação

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

Recupere GitHub, Neon e Vercel somente quando materialmente aplicável. Não refaça Stories concluídas, não invente secrets e não execute deployment Vercel.

## Regra operacional vigente

Preview Vercel não é gate obrigatório por Story. Browser real e deployment são evidências/ações distintas.

No Incremento 2, `US-AUTH-008` concentra a matriz live integrada. Se runtime público for material, preparar uma única release candidate e registrar `MANUAL_ACTION_REQUIRED`; somente o usuário publica manualmente.

Autoridades: `00_SYSTEM/DEPLOYMENT_POLICY.md`, `00_SYSTEM/VERIFICATION_PROTOCOL.md` e `ADR-007`.

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
US-AUTH-007 recuperação de senha + gestão/revogação de sessões — CONCLUÍDA (#55 / #56)
  ↓
US-AUTH-008 auditoria integrada + validação live do incremento — NEXT_ACTION
```

Plano detalhado: `docs/INCREMENT_2_PLAN.md`.

## US-AUTH-007 — encerramento integrado

### GitHub / CI

```text
Issue #55: CLOSED / completed
PR #56: MERGED
Head final pré-merge: 2c139f817bfcb8c9b7e316e26c0fcb883d33ab71
CI final da PR: #222 / 34597671892 — SUCCESS
Job: 103257145584 — SUCCESS
Merge: 31ec6e2238a7b0bdaff7506ac0e9ed51179f3322
CI pós-merge: #223 / 34597951573 — SUCCESS
Job: 103258037267 — SUCCESS
```

Passaram `npm run verify`, lint, typecheck, testes, build, PostgreSQL 18 e `npm run verify:db`.

### Implementação

- `/forgot-password` com resposta anti-enumeração;
- callback de recovery derivado de origem same-origin validada;
- `/reset-password` usando token do provider sem persistência em Git/logs;
- alteração autenticada exige senha atual e usa `revokeOtherSessions: true`;
- `/account/security` sob o boundary privado server-side;
- listagem das próprias sessões sem expor bearer token;
- revogação individual recebe apenas `session.id`, valida ownership e resolve `session.token` somente no servidor;
- sessão corrente pode ser encerrada via `signOut()`;
- cache assinado de dados de sessão reduzido de 300 s para 1 s;
- nenhuma migration ou schema próprio de credenciais/sessões foi criado.

### Neon-specific

```text
Projeto: caleida-nonprod / patient-glade-95136440
Baseline: main / br-restless-cherry-awpcwy6r
Verificação: verify-us-auth-007 / br-wandering-mountain-awjnqqps / ready
Provider: Better Auth
Email/password: enabled
Require email verification: true / OTP
Email provider: shared Neon
Auth users/sessions/accounts/verifications: 0
Schema diff vs baseline: vazio
```

O Managed Neon observado não expõe `revokeSessionsOnPasswordReset`; portanto o Caleida não declara que reset por e-mail revoga automaticamente sessões pré-existentes. Essa semântica será medida no gate live integrado da US-AUTH-008.

### Browser/live

```text
US-AUTH-007 browser/live: SKIPPED/deferred para US-AUTH-008
Preview Vercel adicional: NÃO REQUERIDO
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
- secrets, recovery tokens e bearer/session tokens permanecem server-only;
- baseline Neon não é laboratório destrutivo;
- sem Production Neon;
- sem deployment Vercel pela IA;
- Data API permanece fora do escopo atual;
- não antecipar funcionalidades além da US-AUTH-008 durante seu fechamento do incremento.
