# Incremento 2 — Acesso controlado / EPIC-02

**Status:** EM ANDAMENTO — US-AUTH-008 aguarda a única release manual necessária para a matriz live final  
**Origem:** EPIC-02 — Contas e autenticação  
**Capacidades:** CAP-01, CAP-02, CAP-04, CAP-35  
**Prioridade:** P0/P1

## 1. Objetivo

Entregar a fundação segura de identidade e entrada controlada do beta fechado: autenticação gerenciada, autorização, convites/aprovação, confirmação de e-mail, login/logout, proteção de sessão, recovery, gestão/revogação de sessões e auditoria sem secrets.

O incremento só termina quando a matriz live integrada comprovar o comportamento acumulado das Stories 001–008.

## 2. Decisões e ambientes

```text
Neon project: caleida-nonprod / patient-glade-95136440
PostgreSQL: 18
Baseline: main / br-restless-cherry-awpcwy6r
Managed Better Auth: enabled
email/password: enabled
email verification: required / OTP
email provider: shared Neon
sessionDataTtl: 1 s
Data API: não provisionada
Production Neon: não provisionada
Vercel: deployment exclusivamente humano/manual
```

Decisões canônicas: ADR-004, ADR-005, ADR-007, ADR-008 e ADR-009.

## 3. Stories

```text
US-AUTH-001 — fundação Neon Auth + sessão                 CONCLUÍDA (#43/#44)
US-AUTH-002 — papéis/autorização + bootstrap              CONCLUÍDA (#45/#46)
US-AUTH-003 — convites/solicitações + auditoria            CONCLUÍDA (#47/#48)
US-AUTH-004 — e-mail Auth non-production                   CONCLUÍDA (#49/#50)
US-AUTH-005 — cadastro controlado + confirmação OTP        CONCLUÍDA (#51/#52)
US-AUTH-006 — login/logout + proteção de sessão            CONCLUÍDA (#53/#54)
US-AUTH-007 — recovery + gestão/revogação de sessões       CONCLUÍDA (#55/#56)
US-AUTH-008 — auditoria integrada + validação live final   EM ANDAMENTO (#57/#58)
```

Evidências individuais: `docs/US_AUTH_001_VERIFICATION.md` a `docs/US_AUTH_008_VERIFICATION.md`.

## 4. Estado integrado antes do gate live final

### Autenticação e entrada

- Managed Better Auth branch-scoped;
- signup fail-closed por convite válido ou solicitação aprovada;
- confirmação obrigatória por OTP;
- login/logout server-side;
- rotas privadas protegidas antes de retornar conteúdo;
- recovery com resposta pública anti-enumeração;
- reset por token do provider;
- mudança autenticada exige senha atual;
- listagem e revogação das próprias sessões sem expor bearer token;
- revogação remota revalidada após cache assinado de aproximadamente 1 segundo.

### Autorização

Papéis de produto permanecem separados do Admin Better Auth:

```text
proprietário
administrador
moderador
curador
usuário
```

Fronteiras server-side e banco preservam as negações adversariais já comprovadas nas Stories anteriores.

### Auditoria consolidada — US-AUTH-008

Migration `000008_auth_security_audit.sql` adiciona `caleida_audit.auth_security_events` com apenas:

- tipo de evento controlado;
- UUID opcional do ator;
- outcome controlado;
- reason code controlado;
- timestamp.

Não existem colunas de e-mail, senha, token, cookie, Auth URL ou payload completo.

Eventos cobertos:

```text
login
logout
password_recovery_requested
password_reset
password_changed
session_revoked
other_sessions_revoked
auth_proxy_post
```

## 5. Gates US-AUTH-008 já concluídos

### CI e PostgreSQL 18 — PASS

```text
Head funcional: f093df971207793fcd7a25edcf135707f65973b0
CI #229 / run 34601223118 / job 103268721995: SUCCESS
npm run verify: PASS
npm run verify:db: PASS
```

### Neon isolated — PASS

```text
verify-us-auth-008 / br-delicate-meadow-aw1u62kn / ready
```

- branch criada da baseline atual;
- readback inicial `000001`–`000007`;
- migration `000008` aplicada com checksum correto;
- teste SQL e ACL adversarial: PASS;
- zero fixtures após cleanup;
- zero usuários/sessões/accounts/verificações Auth.

### Promoção baseline — PASS

`000008` foi promovida deliberadamente para `main / br-restless-cherry-awpcwy6r` depois dos gates portável e Neon-specific.

Readback:

```text
migrations: 000001–000008
auth_security_events: 0
auth users/sessions/accounts/verifications: 0
schema diff verify-us-auth-008 vs main: vazio
```

## 6. Gate live acumulado — MANUAL_ACTION_REQUIRED

O deployment Vercel mais recente ainda corresponde à US-AUTH-005. Não possui US-AUTH-006/007/008.

É materialmente necessário criar **uma única Preview manual** da branch da PR #58 para validar, no mesmo runtime:

1. signup + OTP;
2. login válido/inválido e logout;
3. acesso direto anônimo e ausência de flash privado;
4. recovery existente/inexistente sem enumeração;
5. reset válido/inválido/expirado/reutilizado;
6. senha antiga/nova após reset;
7. trusted origin do recovery;
8. duas sessões independentes;
9. revogação individual/remota e janela de cache;
10. mudança autenticada revogando outras sessões;
11. efeito real do reset por e-mail sobre sessões existentes;
12. autorização/adversariais aplicáveis;
13. persistência de auditoria sem secrets;
14. console/runtime sem falha crítica.

A Preview é non-production. A IA não executa deployment e nenhuma publicação Production faz parte desta Story.

## 7. Housekeeping

Branches de verificação Neon não são fonte canônica de schema e sua exclusão exige autorização específica. A existência delas não bloqueia o Incremento.

## 8. Próxima ação

> Após o CI verde da ref candidata, o usuário publica manualmente uma única Preview Vercel da branch `feat/us-auth-008-audit-integrated-validation`. Quando ela estiver `READY`, retomar a US-AUTH-008 e executar a matriz live completa antes de decidir o encerramento do Incremento 2.
