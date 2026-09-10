# Checkpoint — Caleida

**PROJECT_STATUS:** READY  
**CURRENT_PHASE:** Incremento 2 — Acesso controlado / EPIC-02 em andamento  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `US-AUTH-005 — Implementar cadastro controlado por convite ou aprovação`  
**LAST_COMPLETED_ISSUE:** `#51`  
**LAST_COMPLETED_PR:** `#52`  
**LAST_COMPLETED_MERGE:** `9abc3235623c3f7d37531eb94a60997960f526e1`  
**ACTIVE_TASK:** `US-AUTH-006 — Implementar login, logout e proteção de sessão`  
**ACTIVE_ISSUE:** `#53`  
**ACTIVE_BRANCH:** `feat/us-auth-006-session-protection`  
**ACTIVE_PR:** `#54`  
**NEXT_ACTION:** `Concluir a US-AUTH-006 com a evidência técnica já obtida, revalidar CI após a reconciliação documental, revisar/integrar a PR #54 e avançar o cursor sem exigir novo Preview Vercel.`  
**BLOCKERS:** none  
**ON_HOLD:** none  
**MANUAL_ACTION_REQUIRED:** none

## Comando de continuação

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

Recupere GitHub, Neon e Vercel quando materialmente aplicável. Não refaça Stories concluídas, não invente secrets e não execute deployment Vercel.

## Regra operacional corrigida em 10/09/2026

Preview Vercel não é gate obrigatório de Story. Browser real não deve transformar uma Story intermediária em `MANUAL_ACTION_REQUIRED` apenas porque existe UI.

Quando não houver runtime já disponível e os critérios puderem ser cobertos por CI, testes de contrato/integração, revisão server-side e gate Neon-specific, browser live deve ser registrado como `SKIPPED/deferred` e consolidado no fechamento do incremento/release.

No Incremento 2, `US-AUTH-008` é o ponto padrão para a matriz live integrada. Se essa matriz realmente exigir runtime público, usar uma única release candidate manual, e não Preview por Story.

Exceções continuam possíveis somente quando o critério de aceitação depender inerentemente de infraestrutura pública/externa impossível de validar de forma equivalente sem deployment.

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
US-AUTH-006 login/logout + proteção de sessão — EM ANDAMENTO (#53 / #54)
  ↓
US-AUTH-007 recuperação de senha + gestão/revogação de sessões
  ↓
US-AUTH-008 auditoria integrada + validação live do incremento
```

Plano detalhado: `docs/INCREMENT_2_PLAN.md`.

## US-AUTH-006 — estado recuperado

### Implementação

- login e logout via server actions e boundary Neon Auth;
- `/login` dinâmico e consciente da sessão no servidor;
- `/app` sob layout privado server-side;
- sessão ausente/inválida tratada de forma fail-closed;
- credenciais inválidas retornam mensagem genérica, sem enumeração do provider;
- conteúdo privado só é retornado após validação server-side;
- formulário possui estados pending/error acessíveis;
- logout não declara sucesso quando o provider falha;
- nenhum `localStorage`, `sessionStorage` ou cookie client-side é autoridade de sessão.

### GitHub / CI

```text
Issue #53: OPEN
PR #54: OPEN / draft durante reconciliação
Commit funcional inicial: 525c8fe9fe80bcc6b19c9ac36f532d3dd31cc4c8
Correção de contrato visual: df3923a68b30c7e2dfacd1d1ab6e6d5dc3dcd8dc
CI inicial #206 / 34475743349: FAIL por testes visuais históricos incompatíveis com o novo login real
CI corrigido #207 / 34476422464: SUCCESS
Job #102868179449: install + npm run verify + PostgreSQL 18 + npm run verify:db — PASS
```

O primeiro CI não revelou falha do fluxo Auth: os dois testes antigos ainda proibiam qualquer `href`/interação na home. O contrato foi atualizado sem relaxar os guardrails de UI.

### Neon isolated gate

```text
Projeto: caleida-nonprod / patient-glade-95136440
Baseline: main / br-restless-cherry-awpcwy6r
Branch US-AUTH-006: verify-us-auth-006 / br-cold-block-aww00k4o
Provider: Better Auth
Email/password: enabled
Usuários Auth: 0
Sessões Auth: 0
Accounts Auth: 0
Schema diff vs baseline: vazio
```

A Story não introduz migration nem mudança de schema. Configuração/isolamento do Managed Better Auth na branch de verificação foram confirmados. A baseline não foi usada como laboratório destrutivo.

### Browser/live

`SKIPPED/deferred` nesta Story pela política revisada. Não existe requisito material de infraestrutura pública exclusivo da US-AUTH-006 que justifique pedir outro deployment manual. Login/logout/sessão serão exercitados de forma integrada na `US-AUTH-008`, juntamente com recuperação, autorização e auditoria.

Isso não é `PASS` fictício: é deferimento canônico explícito do gate live para a Story de validação integrada.

## Housekeeping não bloqueante

As branches Neon abaixo continuam existentes porque exclusão é destrutiva e exige autorização específica:

```text
verify-us-auth-004 / br-plain-pond-aw5f59ia
verify-us-auth-005 / br-small-river-aww0rtxo
verify-us-auth-006 / br-cold-block-aww00k4o
```

Não removê-las automaticamente.

## Invariantes vigentes

- convite/aprovação é o gate de entrada;
- confirmação de e-mail complementa, não substitui, autorização;
- secrets permanecem server-only;
- baseline Neon não é laboratório destrutivo;
- sem Production Neon;
- sem deployment Vercel pela IA;
- Preview não é gate obrigatório de Story;
- Data API permanece fora do escopo atual;
- não antecipar US-AUTH-007/008 durante US-AUTH-006.
