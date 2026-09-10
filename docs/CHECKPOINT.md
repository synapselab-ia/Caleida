# Checkpoint — Caleida

**PROJECT_STATUS:** READY  
**CURRENT_PHASE:** Incremento 2 — Acesso controlado / EPIC-02 em andamento  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `US-AUTH-006 — Implementar login, logout e proteção de sessão`  
**LAST_COMPLETED_ISSUE:** `#53`  
**LAST_COMPLETED_PR:** `#54`  
**LAST_COMPLETED_MERGE:** `b585234a159a73dfec89e1d4cb866201dcfdef34`  
**ACTIVE_TASK:** none  
**ACTIVE_ISSUE:** none  
**ACTIVE_BRANCH:** none  
**ACTIVE_PR:** none  
**NEXT_ACTION:** `Promover US-AUTH-007 — implementar recuperação de senha e gestão/revogação de sessões: criar Issue e branch limitadas à Story, recuperar os contratos Auth/sessão integrados e executar seus gates sem exigir Preview Vercel intermediário.`  
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
US-AUTH-006 login/logout + proteção de sessão — CONCLUÍDA (#53 / #54)
  ↓
US-AUTH-007 recuperação de senha + gestão/revogação de sessões — PRÓXIMA
  ↓
US-AUTH-008 auditoria integrada + validação live do incremento
```

Plano detalhado: `docs/INCREMENT_2_PLAN.md`.

## US-AUTH-006 — encerramento integrado

### GitHub / CI

```text
Issue #53: CLOSED / completed
PR #54: MERGED
Merge: b585234a159a73dfec89e1d4cb866201dcfdef34
Head pré-merge: 2002a8430f2f5d136e817a396969b6c3fc88ef77
CI final da PR: #214 / 34500281605 — SUCCESS
Job: 102949095456 — SUCCESS
```

No CI final passaram instalação, `npm run verify`, build, PostgreSQL 18 e `npm run verify:db`.

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

A Story não introduziu migration nem mudança de schema. Configuração/isolamento do Managed Better Auth foram confirmados sem usar a baseline como laboratório destrutivo.

### Browser/live

`SKIPPED/deferred` para `US-AUTH-008` conforme política revisada. Nenhum Preview Vercel adicional foi necessário para concluir US-AUTH-006.

Evidência: `docs/US_AUTH_006_VERIFICATION.md`.

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
- não antecipar US-AUTH-008 durante US-AUTH-007.
