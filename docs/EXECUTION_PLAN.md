# Execution Plan — Caleida

**Status:** roadmap operacional canônico  
**Regra:** uma `NEXT_ACTION` limitada por vez  
**Roadmap de produto:** `docs/PRODUCT_BACKLOG.md`

Este documento transforma o backlog macro em tarefas executáveis. Evidências detalhadas ficam nos documentos de validação/verificação e nos Issues/PRs indicados.

---

# Operações canônicas concluídas

- `OPS-001` — modernizar o protocolo canônico — **CONCLUÍDO**.
- `OPS-002` — formalizar o pivot Supabase → Neon — **CONCLUÍDO**.
- `OPS-003` — reconciliar a política de deployment — **CONCLUÍDO**; Vercel é exclusivamente humano/manual e CI permanece separada de CD.
- `OPS-004` — evoluir o registro de decisões para ADRs — **CONCLUÍDO**.
- `OPS-005` — refinar o Incremento 1 — **CONCLUÍDO** (`#31`).
- `OPS-006` — refinar EPIC-02 — **CONCLUÍDO** (`#41 / #42`), com plano em `docs/INCREMENT_2_PLAN.md`.

# Incremento 0 — Fundação executável

**Estado:** CONCLUÍDO  
**Evidência:** `docs/INCREMENT_0_VALIDATION.md`

# Incremento 1 — Fundação visual / EPIC-01

**Estado:** CONCLUÍDO  
**Plano:** `docs/INCREMENT_1_PLAN.md`  
**Evidência:** `docs/INCREMENT_1_VALIDATION.md`

# Incremento 2 — Acesso controlado / EPIC-02

**Estado:** EM ANDAMENTO  
**Plano:** `docs/INCREMENT_2_PLAN.md`

## Cursor

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

## US-AUTH-001 a US-AUTH-006

**Estado:** CONCLUÍDAS.  
Evidências: `docs/US_AUTH_001_VERIFICATION.md` a `docs/US_AUTH_006_VERIFICATION.md`.

Estado consolidado antes da US-AUTH-007: Managed Better Auth, papéis/autorização de produto separados, entrada controlada por convite/aprovação, confirmação obrigatória por OTP, login/logout e boundary privado server-side.

## US-AUTH-007 — Recuperação de senha e gestão/revogação de sessões

**Estado:** CONCLUÍDA  
**Issue/PR:** `#55 / #56`  
**Merge:** `31ec6e2238a7b0bdaff7506ac0e9ed51179f3322`  
**Capacidades:** CAP-01, CAP-35  
**Contrato:** `docs/SESSION_SECURITY.md`  
**Evidência:** `docs/US_AUTH_007_VERIFICATION.md`

### Resultado

- recovery em `/forgot-password` com resposta anti-enumeração;
- reset em `/reset-password` usando token do provider sem persistência em Git/logs;
- callback same-origin validado;
- alteração autenticada exige senha atual e revoga as outras sessões;
- `/account/security` lista metadados seguros e permite revogação das próprias sessões;
- session token permanece server-only;
- `sessionDataTtl` reduzido para 1 s;
- nenhuma migration/schema de produto adicional.

### Gates finais

```text
Head final: 2c139f817bfcb8c9b7e316e26c0fcb883d33ab71
CI PR #222 / 34597671892 / job 103257145584: SUCCESS
Merge: 31ec6e2238a7b0bdaff7506ac0e9ed51179f3322
CI main #223 / 34597951573 / job 103258037267: SUCCESS
PostgreSQL 18 + verify:db: PASS
Neon verify-us-auth-007: ready / schema diff vazio
Browser/live: SKIPPED/deferred para US-AUTH-008
Preview Vercel: não requerido
```

O Managed Neon observado não expõe `revokeSessionsOnPasswordReset`; reset por e-mail não é documentado como revogação automática de sessões existentes. A matriz live final deve medir o comportamento real.

## US-AUTH-008 — Consolidar auditoria e validar Incremento 2

**Estado:** NEXT_ACTION / PRONTA  
**Prioridade:** P1  
**Dependências:** US-AUTH-001 a US-AUTH-007 concluídas  
**Capacidades:** CAP-04, CAP-35

### Objetivo

Consolidar eventos críticos de autenticação/autorização sem secrets e executar a matriz adversarial integrada que encerra o Incremento 2.

### Escopo mínimo

- mapear eventos de auditoria necessários e persistir somente metadados mínimos não sensíveis;
- validar anon/authenticated/forbidden/direct URL/session revoked e ausência de vazamento;
- validar conjuntamente signup/OTP, login/logout, recovery/reset, mudança de senha e gestão/revogação de sessões;
- medir o efeito de revogação após a janela de cache de 1 s;
- validar trusted origin do callback de recovery;
- validar papéis/autorização de produto e tentativas adversariais relevantes;
- produzir evidência final do Incremento 2.

### Browser/live e release candidate

Browser/live é material nesta Story por ser o gate integrado acumulado. Antes de exigir publicação, verificar se existe runtime candidato atual adequado. Se for necessário novo runtime público:

1. preparar uma única release candidate;
2. registrar `MANUAL_ACTION_REQUIRED` no Checkpoint;
3. fornecer ao usuário somente o passo manual necessário;
4. a IA não executa Preview/Production/promote/redeploy/rollback;
5. após publicação humana, executar a matriz integrada e concluir a Story.

Não criar um Preview separado para cada subfluxo.

---

# Contrato de execução

Para cada tarefa:

1. recuperar estado pelo protocolo;
2. confirmar `NEXT_ACTION`;
3. inspecionar repositório/documentação/estado externo aplicável;
4. criar/usar Issue e branch limitadas;
5. implementar somente o necessário;
6. executar Verification Protocol proporcional ao escopo;
7. revisar diff/secrets;
8. atualizar docs/ADRs quando aplicável;
9. atualizar Checkpoint/Backlog/Changelog;
10. revisar/mergear PR quando gates materiais estiverem satisfeitos;
11. verificar CI pós-merge;
12. deixar uma única próxima ação.

## NEXT_ACTION vigente

> Criar Issue e branch limitadas a `US-AUTH-008 — consolidar auditoria e validar Incremento 2`, recuperar a matriz integrada e os contratos de auditoria/Auth/autorização existentes e executar somente essa Story. Solicitar uma única release candidate manual apenas se o gate live realmente depender de runtime público.

Não iniciar o incremento seguinte, Production Neon, Data API ou deployment Vercel durante US-AUTH-008.
