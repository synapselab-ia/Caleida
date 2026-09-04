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
**NEXT_ACTION:** `Criar manualmente um Preview HTTPS da branch feat/us-auth-005-controlled-signup apontado para verify-us-auth-005, configurar os webhooks user.before_create e user.created no Neon Auth dessa branch e executar o gate live de docs/US_AUTH_005_VERIFICATION.md; depois retomar a PR #52.`  
**BLOCKERS:** `gate Neon Auth live ainda não comprovado; sem HTTPS público Caleida disponível`  
**ON_HOLD:** none  
**MANUAL_ACTION_REQUIRED:** `deployment Preview Vercel e configuração branch-scoped dos webhooks Auth são ações humanas; não enviar secrets ao chat`

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
US-AUTH-005 cadastro controlado + confirmação — MANUAL_ACTION_REQUIRED (#51 / #52 draft)
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

```text
Issue: #51 / OPEN
PR: #52 / OPEN / DRAFT
Head técnico com gate portátil PASS: 7083d6d28041539e96c26fa4e88c56d019939a26
CI: 33878842417 / run #159 / SUCCESS
```

O gate portátil aprovou `npm run verify`, build, PostgreSQL 18 e `npm run verify:db`, incluindo os testes concorrentes versionados.

### Migrations da Story

```text
000004_controlled_signup.sql
633c913deeedae4eca32890268b9f47b03c67178a0fd9a6edf2e8f05f2890535

000005_controlled_signup_consume_fix.sql
c7211562a5aec011b5af8707f63c9db4171a379c1ee0897567c03f79059ab4f1
```

`000005` preserva o histórico append-only corrigindo, por substituição posterior da função, uma ambiguidade PL/pgSQL encontrada após `000004` já ter sido exercitada.

### Branch Neon isolada

```text
verify-us-auth-005 / br-small-river-aww0rtxo / ready
```

As migrations `000004` e `000005` foram aplicadas exclusivamente nessa branch e o readback confirmou ledger `000001`–`000005`, tabelas/funções novas presentes e zero fixtures:

```text
Auth users: 0
Invitations: 0
Invitation uses: 0
Access requests: 0
Signup permits: 0
Signup rate limits: 0
Auth webhook events: 0
```

Better Auth branch-scoped permanece:

```text
email/password: enabled
allow_sign_up: true
require_email_verification: false
email provider: shared Neon
```

### Baseline preservada

A baseline Neon continua em:

```text
main / br-restless-cherry-awpcwy6r
ledger: 000001 + 000002 + 000003
```

Nenhuma migration US-AUTH-005 foi promovida à baseline e nenhum estado Auth da baseline foi alterado.

## Gate live pendente

A Story exige provar que signup direto ao Neon Auth é negado fora da UI. Isso depende do webhook bloqueante `user.before_create` apontar para um endpoint HTTPS público real e do `user.created` finalizar o vínculo.

No estado verificado:

- não existe projeto/deployment Vercel do Caleida disponível para reutilização;
- ADR-007 proíbe deployment Vercel pela IA;
- o conector Neon disponível não expõe configuração de webhooks Auth;
- portanto o gate live não pode ser fabricado ou substituído por localhost.

A PR #52 deve permanecer draft e a Issue #51 aberta até esse gate passar. Não promover migrations para a baseline, não ativar `require_email_verification` e não iniciar US-AUTH-006 antes disso.

## US-AUTH-004 — resultado consolidado

A baseline já possui transporte de e-mail suficiente para desenvolvimento/non-production via Neon Auth:

```text
Projeto: caleida-nonprod
Baseline: main / br-restless-cherry-awpcwy6r / ready
Managed Better Auth: habilitado
Email/password: habilitado
Email provider: shared Neon
Require email verification: false
Data API: não provisionada
```

`ADR-009` mantém o provider compartilhado do Neon como canônico para esta fase.

### Housekeeping remanescente

```text
verify-us-auth-004 / br-plain-pond-aw5f59ia / ready
```

Essa branch não contém SMTP externo. Sua eventual exclusão exige autorização explícita e não deve ser confundida com a branch ativa `verify-us-auth-005`.

## Invariantes vigentes

- signup deve ser fail-closed fora da UI;
- convite/aprovação é o gate de entrada;
- confirmação de e-mail não substitui autorização;
- `require_email_verification` só pode ser ativado após a prova live do cadastro controlado;
- concorrência não pode exceder capacidade do convite;
- secrets permanecem server-only;
- baseline Neon não é laboratório;
- sem Production Neon;
- sem deployment Vercel pela IA.