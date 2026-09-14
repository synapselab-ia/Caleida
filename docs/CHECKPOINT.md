# Checkpoint - Caleida

**Status operacional:** `READY`  
**Fase:** Incremento 3 - Perfis e privacidade / EPIC-03 - REFINADO  
**Story ativa:** nenhuma

## Cursor

```text
LAST_COMPLETED_TASK: OPS-007 - Refinar EPIC-03: Perfis e privacidade
LAST_COMPLETED_ISSUE: #59
LAST_COMPLETED_PR: #60
LAST_COMPLETED_MERGE: f8424916dc1ecff5276451bab9c636cbcc57dc32

ACTIVE_TASK: none
ACTIVE_ISSUE: none
ACTIVE_BRANCH: none
ACTIVE_PR: none

NEXT_ACTION: Executar somente US-PRIV-001 - Materializar perfil básico user-scoped com Data API e RLS, conforme docs/INCREMENT_3_PLAN.md. Criar a Issue/branch da Story antes de implementar e não antecipar US-PRIV-002, Storage, catálogo, relações sociais, Production Neon ou deployment Vercel.

BLOCKERS: none
MANUAL_ACTION_REQUIRED: none
ON_HOLD: none
```

## Encerramento de OPS-007

- Issue `#59` fechada como `completed` pelo merge;
- PR `#60` integrada em `main`;
- merge SHA `f8424916dc1ecff5276451bab9c636cbcc57dc32`;
- head final pré-merge `cdce0a3b5c772b21afe7b2cbfe14df9f20863c21`;
- CI da PR `#249` / run `34865945415` / job `104050019727`: `SUCCESS`;
- CI pós-merge `#250` / run `34866254670` / job `104050724959`: `SUCCESS`;
- diff final da PR limitado a seis arquivos em `docs/`;
- nenhuma migration, dependência, código funcional ou workflow alterado;
- browser: `SKIPPED`, pois OPS-007 é somente documental;
- gate Neon-specific: `SKIPPED`, pois nenhum recurso/configuração Neon foi alterado;
- deployment Vercel: não executado.

## Plano canônico do Incremento 3

Arquivo: `docs/INCREMENT_3_PLAN.md`.

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

Somente `US-PRIV-001` está promovida como próxima unidade executável.

## Decisões vigentes de EPIC-03

- perfil de produto separado da identidade `neon_auth`;
- primeiro domínio user-scoped deve provar Data API + JWT + grants mínimos + RLS;
- visibilidade default `only_me`;
- `followers` e `connections` não são opções funcionais antes de EPIC-13;
- bloqueio entra no Incremento 3 porque tem efeito verificável sobre perfil;
- mute/restrict ficam para EPIC-13 e não recebem UI/state sem efeito;
- avatar/banner ficam para EPIC-16/CAP-30 e não escolhem Storage antecipadamente;
- obras favoritas dependem do catálogo de EPIC-04;
- CAP-33 usa desativação reversível e exclusão em fases com janela inicial de 30 dias, cancelamento, export e finalização explícita;
- exclusão da identidade deve usar API oficial do provider, nunca DELETE direto no schema `neon_auth`;
- export de encerramento cobre dados existentes e não substitui CAP-32/EPIC-17.

## Estado Neon verificado em OPS-007

```text
Project: caleida-nonprod / patient-glade-95136440
PostgreSQL: 18
Baseline: main / br-restless-cherry-awpcwy6r / ready
Managed Better Auth: enabled
Migrations baseline: 000001-000008
Data API: não provisionada
Production Neon: não provisionada
Storage: não adotado
```

Branches Neon históricas de verificação continuam existentes e não bloqueiam o projeto. Sua remoção é destrutiva e exige autorização explícita do usuário.

## Próxima ação técnica

Executar somente:

> `US-PRIV-001 - Materializar perfil básico user-scoped com Data API e RLS`

A Story deve começar por revalidar documentação/versões correntes, criar Issue e branch Git, criar branch Neon isolada para a prova específica e falhar fechado se ownership por JWT/RLS não puder ser demonstrado sem credencial privilegiada.
