# Checkpoint - Caleida

**Status operacional:** `IN_PROGRESS`  
**Fase:** OPS-007 - Refino do Incremento 3 / EPIC-03  
**Story ativa:** nenhuma Story de implementação

## Cursor

```text
LAST_COMPLETED_TASK: US-AUTH-008 - Consolidar auditoria e validar Incremento 2
LAST_COMPLETED_ISSUE: #57
LAST_COMPLETED_PR: #58
LAST_COMPLETED_MERGE: 84f7fecb018d6f4b6bc36817accef15f1976f05f

ACTIVE_TASK: OPS-007 - Refinar EPIC-03: Perfis e privacidade
ACTIVE_ISSUE: #59
ACTIVE_BRANCH: ops/007-refine-epic-03
ACTIVE_PR: #60

NEXT_ACTION: Concluir somente OPS-007: revisar o diff documental, exigir CI da PR #60 em PASS e integrar o refino. Após a integração, promover exclusivamente US-PRIV-001 conforme docs/INCREMENT_3_PLAN.md.

BLOCKERS: none
MANUAL_ACTION_REQUIRED: none
ON_HOLD: none
```

## Estado real de partida de OPS-007

### GitHub

```text
main: 9ea9f9253a0123eb491d8980fd252401b6ea8f10
CI main: #247 / 34851172467 / SUCCESS
Issues abertas antes de OPS-007: nenhuma
PRs abertas antes de OPS-007: nenhuma
Issue OPS-007: #59
PR OPS-007: #60
```

### Neon

```text
Project: caleida-nonprod / patient-glade-95136440
PostgreSQL: 18
Baseline: main / br-restless-cherry-awpcwy6r / ready
Managed Better Auth: enabled
Migrations baseline: 000001-000008
Data API: não provisionada
Production Neon: não provisionada
```

Branches Neon históricas de verificação continuam existentes e não bloqueiam o trabalho. Sua remoção é destrutiva e exige autorização explícita do usuário.

## Resultado planejado em OPS-007

Arquivo canônico criado: `docs/INCREMENT_3_PLAN.md`.

Ordem refinada:

```text
US-PRIV-001 - perfil básico user-scoped + Data API/RLS       PRONTA
  ↓
US-PRIV-002 - personalização segura do perfil                A FAZER
  ↓
US-PRIV-003 - rota pública + visibilidade                     A FAZER
  ↓
US-PRIV-004 - bloqueio com efeito real                        A FAZER
  ↓
US-PRIV-005 - desativação e reativação                        A FAZER
  ↓
US-PRIV-006 - solicitação/cancelamento + export               A FAZER
  ↓
US-PRIV-007 - finalização segura da exclusão                  A FAZER
  ↓
US-PRIV-008 - validação integrada + fechamento                A FAZER
```

## Decisões de escopo

- perfil de produto permanece separado da identidade `neon_auth`;
- primeiro domínio user-scoped deve provar Data API + JWT + grants mínimos + RLS;
- visibilidade default é `only_me`;
- `followers` e `connections` não aparecem como opção funcional antes de EPIC-13;
- bloqueio entra agora porque tem efeito real sobre leitura de perfil;
- mute/restrict ficam para EPIC-13, sem UI/state falso neste incremento;
- avatar/banner ficam para EPIC-16/CAP-30 e não escolhem Storage antecipadamente;
- obras favoritas dependem do catálogo de EPIC-04;
- CAP-33 usa desativação reversível e exclusão em fases com janela inicial de 30 dias, cancelamento, export e finalização explícita;
- exclusão gerenciada deve usar API oficial do provider, nunca DELETE direto no schema `neon_auth`.

## Revalidação corrente

A documentação oficial Neon revalidada em OPS-007 confirmou:

- Data API é branch-scoped e usa PostgreSQL para autorização;
- `GRANT` controla objetos e RLS controla linhas;
- JWT válido opera normalmente como papel `authenticated`;
- `authenticated` não substitui ownership;
- `auth.user_id()` extrai `sub` como texto e `auth.uid()` o interpreta como UUID;
- RLS habilitada sem policy bloqueia por padrão;
- Managed Better Auth continua devendo ser revalidado na Story destrutiva antes de exclusão final.

## Verificação de OPS-007

OPS-007 é exclusivamente documental.

- implementação funcional: nenhuma;
- migration/schema/RLS funcional: nenhuma alteração;
- dependências/package-lock: nenhuma alteração;
- Neon Data API/Storage/Production: nenhum recurso criado;
- conta real: nenhuma alteração;
- deployment Vercel: `SKIPPED/PROIBIDO` para IA;
- gate Neon-specific: `SKIPPED`, pois OPS-007 somente lê estado/documentação;
- browser: `SKIPPED`, pois não existe mudança visual/funcional;
- gate obrigatório antes do merge: CI da PR #60 em `SUCCESS`.
