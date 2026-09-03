# Checkpoint — Caleida

**PROJECT_STATUS:** MANUAL_ACTION_REQUIRED  
**CURRENT_PHASE:** Incremento 2 — Acesso controlado / EPIC-02 em andamento  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `US-AUTH-002 — Materializar papéis, autorização e bootstrap administrativo`  
**LAST_COMPLETED_ISSUE:** `#45`  
**LAST_COMPLETED_PR:** `#46`  
**ACTIVE_TASK:** none  
**ACTIVE_ISSUE:** none  
**ACTIVE_BRANCH:** none  
**ACTIVE_PR:** none  
**NEXT_ACTION:** `US-AUTH-003 — Modelar convites, solicitações de acesso e auditoria de entrada`  
**BLOCKERS:** `não criar nova branch Neon descartável para US-AUTH-003 enquanto verify-us-auth-002 permanecer pendente de limpeza`  
**ON_HOLD:** none  
**MANUAL_ACTION_REQUIRED:** `autorizar explicitamente a exclusão da branch Neon descartável verify-us-auth-002 (br-weathered-shape-awp7ckqa)`

## Comando de continuação

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

Recupere o estado real no GitHub e Neon antes de agir. Não refaça Stories concluídas. A autorização destrutiva dada para branches Neon anteriores não se aplica a `verify-us-auth-002`.

## Incrementos concluídos

### Incremento 0 — Fundação executável

**CONCLUÍDO.** Evidência: `docs/INCREMENT_0_VALIDATION.md`.

### Incremento 1 — Fundação visual / EPIC-01

**CONCLUÍDO.** Evidência: `docs/INCREMENT_1_VALIDATION.md`.

## Incremento 2 — estado atual

```text
US-AUTH-001 fundação Neon Auth + sessão — CONCLUÍDA (#43 / #44)
  ↓
US-AUTH-002 papéis/autorização + bootstrap administrativo — CONCLUÍDA (#45 / #46)
  ↓
US-AUTH-003 convites/solicitações + auditoria de entrada — PRÓXIMA
  ↓
US-AUTH-004 e-mail transacional non-production
  ↓
US-AUTH-005 cadastro controlado + confirmação de e-mail
  ↓
US-AUTH-006 login/logout + proteção de sessão
  ↓
US-AUTH-007 recuperação de senha + gestão/revogação de sessões
  ↓
US-AUTH-008 auditoria integrada + validação do incremento
```

Plano detalhado: `docs/INCREMENT_2_PLAN.md`.

## US-AUTH-001 — estado integrado

```text
Issue: #43
PR: #44
Merge: 538cffcc831b91de2aecb9715a3584cac1536d88
CI técnico corrigido: 33679442415 — PASS
CI pós-merge main: 33753190237 — PASS
```

Resultado relevante:

- Managed Better Auth habilitado na baseline `caleida-nonprod/main`;
- boundary server-only/fail-closed e handler catch-all integrados;
- nenhuma conta real criada pela Story;
- Data API/Production/deployment não introduzidos;
- branch descartável `verify-us-auth-001` removida posteriormente mediante autorização explícita.

Evidência: `docs/US_AUTH_001_VERIFICATION.md`.

## US-AUTH-002 — resultado candidato à integração

### GitHub

```text
Issue: #45
Branch: feat/us-auth-002-authorization-bootstrap
PR: #46
Baseline Git de partida: 538cffcc831b91de2aecb9715a3584cac1536d88
Head técnico/documental antes da reconciliação final: 2b5c20d47137e880c7c535b04a025d532d6e685b
CI corrigido: 33766333312 — PASS
```

O primeiro CI da PR (`33765866322`) falhou legitimamente somente no novo teste SQL de ACL: `has_*_privilege('PUBLIC', ...)` tentou resolver `PUBLIC` como role concreta no PostgreSQL 18. A migration já havia aplicado corretamente. O teste foi corrigido para usar um role `NOLOGIN` real sem privilégios, sem relaxar ACL ou autorização.

A reconciliação documental final dispara novo CI da PR. O run final e o CI pós-merge devem ser registrados na discussão da PR/Issue depois de executados; não é necessário alterar novamente este arquivo apenas para materializar IDs de runs.

### Implementação

- `database/migrations/000002_product_authorization.sql` cria `caleida_auth.user_roles` e `caleida_audit.role_changes`;
- papéis de produto: `proprietário`, `administrador`, `moderador`, `curador`, `usuário`;
- papel Admin de Better Auth permanece separado dos papéis Caleida;
- identidade é vinculada por UUID `neon_auth.user.id`, sem duplicar senha/e-mail/token;
- funções de leitura/bootstrap/mudança de papel usam `SECURITY DEFINER` com `search_path` fixo e grants públicos revogados;
- `src/lib/auth/authorization.ts` é fronteira server-only coerente com as regras do banco;
- autopromoção é negada;
- administrador só atribui `usuário`, `curador` ou `moderador` e não altera proprietário/outro administrador;
- bootstrap inicial aceita somente identidade Auth existente, exige motivo auditável + confirmação separada e é idempotente;
- nenhuma UI, endpoint administrativo ou Data API foi fabricada nesta Story.

### Gates

- coerência CAP-04 / CAP-35 / ADR-004 / ADR-005 / ADR-008: `PASS`;
- `npm ci`: `PASS`;
- `npm run verify`: `PASS`;
- testes Node: `49/49 PASS`;
- build: `PASS`;
- PostgreSQL 18 + `npm run verify:db`: `PASS`;
- gate Neon-specific em `verify-us-auth-002`: `PASS`;
- casos adversariais de autopromoção/ação administrativa indevida: `PASS — DENIED`;
- auditoria sem secrets: `PASS`;
- browser real: `SKIPPED — não existe fluxo/UI funcional`;
- Data API: `SKIPPED/NON-GOAL`;
- Production Neon: `SKIPPED/NON-GOAL`;
- deployment Vercel: `SKIPPED/PROIBIDO` conforme `ADR-007`.

Evidência detalhada: `docs/US_AUTH_002_VERIFICATION.md`.

## Neon non-production — estado confirmado após promoção

```text
Projeto: caleida-nonprod
Project ID: patient-glade-95136440
PostgreSQL: 18
Baseline: main / br-restless-cherry-awpcwy6r
Baseline state: ready
Managed Better Auth: habilitado
Disposable atual: verify-us-auth-002 / br-weathered-shape-awp7ckqa / ready
```

A baseline não possuía ledger de migrations antes de US-AUTH-002. Depois dos gates em PASS, a história canônica foi promovida deliberadamente em ordem:

```text
000001_migration_ledger.sql
  checksum 4d9a403d6bd074faeca04bf3e714fd8066e5e9f3ae7358bbc0f27a1faf2f14c2
000002_product_authorization.sql
  checksum 0ba6981b583ac8ed693a2a6b6eabc0c84d12678bdf9953e845a239d6b48493c8
```

Estado de dados pós-promoção:

- `neon_auth.user`: `0` usuários;
- `caleida_auth.user_roles`: `0` registros;
- `caleida_audit.role_changes`: `0` registros;
- lookup de UUID inexistente no diretório Auth: `false`;
- Neon Data API: não provisionada;
- Production Neon: não provisionada.

Nenhum proprietário foi bootstrapado na baseline porque não existe uma identidade real apropriada. Criar usuário sintético persistente para encerrar a Story seria contrário aos non-goals.

## Próxima ação — US-AUTH-003

Executar somente:

> `US-AUTH-003 — Modelar convites, solicitações de acesso e auditoria de entrada`

Antes de criar outra branch Neon descartável:

1. obter nova autorização explícita do usuário para apagar `verify-us-auth-002`;
2. remover somente `br-weathered-shape-awp7ckqa`;
3. confirmar que `caleida-nonprod/main` continua `ready`, com Auth e migrations `000001/000002` íntegros;
4. então seguir a necessidade real de gate Neon-specific de US-AUTH-003.

Não antecipar envio de e-mail, signup, login/logout, OAuth, Production Neon ou deployment Vercel dentro de US-AUTH-003.
