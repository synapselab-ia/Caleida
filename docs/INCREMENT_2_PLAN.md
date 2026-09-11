# Incremento 2 — Acesso controlado / EPIC-02

**Status:** EM ANDAMENTO; US-AUTH-007 concluída, US-AUTH-008 promovida  
**Origem:** `EPIC-02 — Contas e autenticação`  
**Capacidades:** CAP-01, CAP-02, CAP-04 e CAP-35  
**Prioridade:** P0/P1  
**Stories concluídas:** `US-AUTH-001` a `US-AUTH-007`  
**Próxima Story:** `US-AUTH-008 — Consolidar auditoria e validar Incremento 2`

## 1. Objetivo

Criar a fundação segura de identidade e entrada controlada do beta fechado, mantendo autenticação gerenciada, autorização, convites, e-mail, cadastro, sessão, recovery e auditoria em Stories separadas e verificáveis.

O incremento termina apenas quando:

- Neon Auth estiver integrado e reproduzível em non-production;
- cadastro só puder ocorrer por convite válido ou solicitação aprovada;
- confirmação de e-mail, login/logout e superfícies privadas estiverem protegidos;
- papéis administrativos forem verificados no servidor e no banco;
- recuperação de senha e gestão/revogação de sessões estiverem implementadas;
- eventos críticos de acesso estiverem auditados sem secrets;
- migrations/RLS aplicáveis forem versionadas e verificadas;
- comportamento Neon-specific for provado em branch isolada quando houver dependência real;
- a matriz adversarial/browser live integrada for executada no fechamento do incremento;
- nenhum deployment Vercel automático ou executado por IA ocorrer.

## 2. Arquitetura e gates

Decisões vigentes:

- `ADR-004`: mudanças persistentes de banco somente por migrations;
- `ADR-005`: Neon como plataforma canônica de dados/identidade;
- `ADR-007`: deployment Vercel exclusivamente humano/manual;
- `ADR-008`: PostgreSQL 18 descartável para SQL portável e branch Neon isolada para comportamento Neon-specific;
- `ADR-009`: provider compartilhado do Neon Auth atende desenvolvimento/non-production enquanto adequado.

### Browser e deployment

Browser real é evidência, não obrigação de Preview por Story. `US-AUTH-008` é a Story deliberadamente reservada para a validação live acumulada do incremento.

Se runtime público for necessário para essa matriz:

- preparar uma única release candidate;
- registrar `MANUAL_ACTION_REQUIRED` antes da publicação;
- o usuário executa manualmente a publicação;
- a IA inspeciona/valida depois da publicação;
- não criar Preview separado para cada subfluxo.

## 3. Estado integrado atual

```text
Projeto Neon: caleida-nonprod / patient-glade-95136440
PostgreSQL: 18
Baseline: main / br-restless-cherry-awpcwy6r / ready
Managed Better Auth: habilitado
Email/password: enabled
Require email verification: true
Email verification: OTP
Auth email provider: shared Neon
Session data cache TTL no app: 1 s
Data API: não provisionada
Production Neon: não provisionada
Deployment Vercel: exclusivamente humano/manual
```

Branches Neon de verificação são housekeeping e não podem ser excluídas automaticamente sem autorização específica.

## 4. Rastreamento de capacidades

| Capacidade | Cobertura principal |
|---|---|
| CAP-01 — Contas, autenticação e sessões | US-AUTH-001, 004, 005, 006 e 007 |
| CAP-02 — Convites e controle de entrada | US-AUTH-003 e 005 |
| CAP-04 — Papéis e permissões | US-AUTH-002 e 008 |
| CAP-35 — Auditoria | US-AUTH-002, 003, 007 e 008 |

## 5. Ordem das Stories

```text
US-AUTH-001 — fundação Neon Auth + sessão — CONCLUÍDA (#43 / #44)
  ↓
US-AUTH-002 — papéis/autorização + bootstrap — CONCLUÍDA (#45 / #46)
  ↓
US-AUTH-003 — convites/solicitações + auditoria — CONCLUÍDA (#47 / #48)
  ↓
US-AUTH-004 — e-mail Auth non-production — CONCLUÍDA (#49 / #50)
  ↓
US-AUTH-005 — cadastro controlado + confirmação de e-mail — CONCLUÍDA (#51 / #52)
  ↓
US-AUTH-006 — login/logout + proteção de sessão — CONCLUÍDA (#53 / #54)
  ↓
US-AUTH-007 — recovery + gestão/revogação de sessões — CONCLUÍDA (#55 / #56)
  ↓
US-AUTH-008 — auditoria integrada + validação live do incremento — NEXT_ACTION
```

## 6. Stories concluídas 001–006

Detalhes e evidências permanecem em `docs/US_AUTH_001_VERIFICATION.md` a `docs/US_AUTH_006_VERIFICATION.md`.

Estado consolidado: identidade Managed Better Auth, autorização/papéis de produto separados, entrada controlada por convite/aprovação, e-mail compartilhado Neon, confirmação obrigatória por OTP, login/logout e boundary privado server-side.

## 7. US-AUTH-007 — Recuperação de senha e gestão/revogação de sessões

**Prioridade:** P0  
**Estado:** CONCLUÍDA  
**Issue/PR:** `#55 / #56`  
**Merge:** `31ec6e2238a7b0bdaff7506ac0e9ed51179f3322`  
**Capacidades:** CAP-01, CAP-35  
**Contrato:** `docs/SESSION_SECURITY.md`  
**Evidência:** `docs/US_AUTH_007_VERIFICATION.md`

### Resultado

- `/forgot-password` com resposta pública genérica;
- callback same-origin validado;
- `/reset-password` com token de uso único do provider;
- `/account/security` com alteração de senha e gestão das próprias sessões;
- alteração autenticada exige senha atual e revoga as demais sessões;
- listagem expõe metadados seguros, nunca bearer token;
- revogação individual usa ID opaco e resolve token somente server-side;
- cache de dados de sessão reduzido para 1 s;
- nenhum novo schema/migration de produto.

### Gates

```text
CI PR #222 / 34597671892 / job 103257145584: SUCCESS
Merge: 31ec6e2238a7b0bdaff7506ac0e9ed51179f3322
CI main #223 / 34597951573 / job 103258037267: SUCCESS
PostgreSQL 18 + verify:db: PASS
Neon verify-us-auth-007: ready / schema diff vazio
Browser/live: SKIPPED/deferred para US-AUTH-008
```

A configuração Managed Neon observada não expõe `revokeSessionsOnPasswordReset`; o comportamento live de reset + sessões deve ser medido na US-AUTH-008.

## 8. US-AUTH-008 — Consolidar auditoria e validar Incremento 2

**Prioridade:** P1  
**Estado:** PRONTA / NEXT_ACTION  
**Dependências:** US-AUTH-001 a US-AUTH-007 concluídas  
**Capacidades:** CAP-04, CAP-35

### Entrega esperada

- consolidar eventos críticos de autenticação/autorização sem senha/token/cookie/secret;
- revisar o contrato de auditoria existente e criar somente persistência necessária por migration versionada;
- executar matriz adversarial de autorização e sessão;
- validar live signup/OTP, login/logout, recovery/reset, alteração de senha e gestão/revogação de sessões;
- validar acesso direto e ausência de flash privado;
- medir revogação remota após a janela de cache de 1 s;
- validar trusted origin do recovery;
- produzir evidência final e decidir se o Incremento 2 pode ser marcado `CONCLUÍDO`.

### Matriz transversal mínima

1. visitante/anônimo;
2. usuário autenticado autorizado;
3. usuário autenticado não autorizado conhecendo ID válido;
4. manipulação de ID/ownership/papel;
5. acesso direto sem UI;
6. sessão inválida/revogada;
7. secret ausente/inválido;
8. papel comum tentando ação administrativa;
9. concorrência em alteração crítica quando aplicável;
10. ausência de vazamento durante loading/erro;
11. recovery válido/inválido/expirado/reutilizado;
12. senha antiga versus nova após reset;
13. revogação individual e das demais sessões em cenário multi-device.

## 9. Contrato de ambientes

Nomes versionados, valores reais proibidos:

```text
NEON_AUTH_BASE_URL
NEON_AUTH_COOKIE_SECRET
CALEIDA_BOOTSTRAP_OWNER_USER_ID
CALEIDA_BOOTSTRAP_REASON
CALEIDA_ALLOW_OWNER_BOOTSTRAP
```

Production Neon continua inexistente.

## 10. Próxima ação

> Criar Issue e branch limitadas a `US-AUTH-008 — Consolidar auditoria e validar Incremento 2`, recuperar os contratos de auditoria/Auth/autorização e executar somente essa Story. Solicitar uma única release candidate manual se e somente se o gate live exigir runtime público.
