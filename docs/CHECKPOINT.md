# Checkpoint — Caleida

**Status operacional:** `READY`  
**Fase:** Incremento 2 — Acesso controlado / EPIC-02 — CONCLUÍDO  
**Story ativa:** nenhuma

## Cursor

```text
LAST_COMPLETED_TASK: US-AUTH-008 — Consolidar auditoria e validar Incremento 2
LAST_COMPLETED_ISSUE: #57
LAST_COMPLETED_PR: #58
LAST_COMPLETED_MERGE: 84f7fecb018d6f4b6bc36817accef15f1976f05f

ACTIVE_TASK: none
ACTIVE_ISSUE: none
ACTIVE_BRANCH: none
ACTIVE_PR: none

NEXT_ACTION: Planejar o Incremento 3 — Perfis e privacidade / EPIC-03: criar o plano canônico limitado para CAP-03, CAP-05 e CAP-33, decompor em Stories pequenas com dependências e gates, sem iniciar implementação antes desse plano.

BLOCKERS: none
MANUAL_ACTION_REQUIRED: none
ON_HOLD: none
```

## Encerramento da US-AUTH-008 / Incremento 2

- PR `#58` integrada em `main`;
- merge SHA `84f7fecb018d6f4b6bc36817accef15f1976f05f`;
- Issue `#57` fechada como `completed`;
- head final pré-merge `1336de47bfcfb2d9678197c5532e9cfb255bdf9b`;
- CI pré-merge `#245` / run `34637332904`: `SUCCESS`;
- CI pós-merge `#246` / run `34850194033` / job `103995893357`: `SUCCESS`;
- runtime contract, `npm run verify`, PostgreSQL 18 e `npm run verify:db`: PASS;
- matriz live final run `#13` / `34636223750` / job `103384664571`: `SUCCESS`;
- auditoria live: PASS sem secrets;
- nenhuma Issue ou PR aberta após o merge.

## Resultado funcional consolidado

O Incremento 2 entrega Auth gerenciado, entrada controlada, OTP, login/logout, papéis/autorização, recovery/reset, gestão/revogação de sessões e auditoria de segurança sanitizada.

O gate live encontrou e comprovou a correção do defeito de revogação coletiva. O comportamento real observado do Managed Neon Auth ficou registrado: reset por e-mail altera a senha, mas não revoga automaticamente sessões existentes; mudança autenticada de senha revoga as demais sessões e preserva a corrente.

## Housekeeping

Branches Neon temporárias e fixtures sintéticas continuam existentes e não bloqueiam o projeto. Sua remoção é destrutiva e exige autorização explícita do usuário.

Production Neon e Data API continuam não provisionados. Deployment Vercel permanece exclusivamente humano/manual conforme ADR-007.
