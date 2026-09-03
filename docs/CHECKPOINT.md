# Checkpoint — Caleida

**PROJECT_STATUS:** READY  
**CURRENT_PHASE:** Incremento 2 — Acesso controlado / EPIC-02 em andamento  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `US-AUTH-004 — Validar e-mail Auth non-production`  
**LAST_COMPLETED_ISSUE:** `#49`  
**LAST_COMPLETED_PR:** `#50`  
**ACTIVE_TASK:** none  
**ACTIVE_ISSUE:** none  
**ACTIVE_BRANCH:** none  
**ACTIVE_PR:** none  
**NEXT_ACTION:** `US-AUTH-005 — implementar cadastro controlado por convite ou aprovação`  
**BLOCKERS:** none  
**ON_HOLD:** none  
**MANUAL_ACTION_REQUIRED:** none

## Comando de continuação

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

Recupere GitHub e Neon antes de agir. Não refaça Stories concluídas, não invente secrets e não execute deployment Vercel.

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
US-AUTH-005 cadastro controlado + confirmação — PRÓXIMA
  ↓
US-AUTH-006 login/logout + proteção de sessão
  ↓
US-AUTH-007 recuperação de senha + gestão/revogação de sessões
  ↓
US-AUTH-008 auditoria integrada + validação do incremento
```

Plano detalhado: `docs/INCREMENT_2_PLAN.md`.

## US-AUTH-004 — resultado

A Story foi simplificada após readback do ambiente real. A baseline já possuía transporte de e-mail suficiente para desenvolvimento/non-production via Neon Auth:

```text
Projeto: caleida-nonprod
Baseline: main / br-restless-cherry-awpcwy6r / ready
Managed Better Auth: habilitado
Email/password: habilitado
Email provider: shared Neon
Sender: Neon Auth
Require email verification: false
Data API: não provisionada
```

`ADR-009` registra que o provider compartilhado do Neon é canônico para desenvolvimento e beta fechado enquanto adequado. Resend, SMTP customizado, domínio próprio e credenciais externas foram removidos do escopo por não existir requisito material nesta fase.

Nenhuma migration, secret ou deployment foi criado por US-AUTH-004.

### Branch Neon temporária remanescente

```text
verify-us-auth-004 / br-plain-pond-aw5f59ia / ready
```

Ela foi criada durante a investigação inicial de SMTP externo, mas nunca recebeu configuração externa. O readback confirmou `email_provider=shared` e `require_email_verification=false`, portanto não contém estado exclusivo necessário ao produto.

A branch é housekeeping não bloqueante. Sua exclusão futura exige autorização explícita porque `delete_branch` é destrutiva; isso não altera a `NEXT_ACTION` canônica.

## Baseline Neon — ledger integrado

```text
000001_migration_ledger.sql
4d9a403d6bd074faeca04bf3e714fd8066e5e9f3ae7358bbc0f27a1faf2f14c2

000002_product_authorization.sql
0ba6981b583ac8ed693a2a6b6eabc0c84d12678bdf9953e845a239d6b48493c8

000003_entry_control.sql
503700640a81cf41dfe56a0abe70fc581b9c64d8e9ad6585cbcb55d4751b7c5f
```

Contadores previamente confirmados em zero: Auth users, papéis, role_changes, convites, usos, solicitações e entry_events.

## Invariantes para US-AUTH-005

- signup deve ser fail-closed fora da UI;
- convite/aprovação é o gate de entrada; confirmação de e-mail não substitui autorização;
- `require_email_verification` só pode ser ativado quando o fluxo de cadastro controlado estiver comprovado;
- concorrência não pode exceder capacidade do convite;
- secrets permanecem server-only;
- sem Production Neon e sem deployment Vercel pela IA.
