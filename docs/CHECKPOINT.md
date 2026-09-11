# Checkpoint — Caleida

**Status operacional:** `EM_REVISAO`  
**Fase:** Incremento 2 — Acesso controlado / EPIC-02  
**Story ativa:** `US-AUTH-008 — Consolidar auditoria e validar Incremento 2`

## Cursor

```text
LAST_COMPLETED_TASK: US-AUTH-007 — Recuperação de senha e gestão/revogação de sessões
LAST_COMPLETED_ISSUE: #55
LAST_COMPLETED_PR: #56
LAST_COMPLETED_MERGE: 31ec6e2238a7b0bdaff7506ac0e9ed51179f3322

ACTIVE_TASK: US-AUTH-008 — Consolidar auditoria e validar Incremento 2
ACTIVE_ISSUE: #57
ACTIVE_BRANCH: feat/us-auth-008-audit-integrated-validation
ACTIVE_PR: #58

NEXT_ACTION: Revisar/mergear a PR #58 no head 5fff744bc66014d630d16fb3faae5a977d3f597d, confirmar fechamento da Issue #57 e CI de main; só então promover o próximo planejamento canônico.

BLOCKERS: none
MANUAL_ACTION_REQUIRED: none
ON_HOLD: none
```

## Gates US-AUTH-008

### Implementação / banco — PASS

- migration `000008_auth_security_audit.sql`;
- `caleida_audit.auth_security_events` com metadados mínimos controlados;
- writer server-only e parametrizado;
- nenhum e-mail, senha, OTP, recovery token, session token, cookie, Auth URL, connection string ou payload arbitrário no contrato de auditoria;
- PostgreSQL 18 e `npm run verify:db`: PASS;
- Neon isolated `verify-us-auth-008 / br-delicate-meadow-aw1u62kn`: PASS;
- `000008` promovida para `main / br-restless-cherry-awpcwy6r` com checksum correto e diff final vazio.

### Correção encontrada pelo gate live — PASS

A primeira RC revelou que o atalho `revokeOtherSessions()` retornava sucesso sem invalidar a sessão remota. A PR foi corrigida para listar as sessões no servidor, preservar a atual e revogar explicitamente cada sessão remota com `revokeSession({ token })`, mantendo bearer tokens fora do cliente.

```text
Head funcional da correção: 9366069ded22a9f1aed444e86153ab1a11db53b2
CI #232 / run 34616208433 / job 103318914704: SUCCESS
```

### Release candidate final — PASS

```text
deployment: dpl_HqRV6x1Vn5f3GL69wGgy85UDVc9B
commit publicado: c85135418eec133d7e0a5dc8ad6ad816f2c39668
Preview / non-production / READY
```

A configuração Preview histórica continua ligada à branch Neon `verify-us-auth-005 / br-small-river-aww0rtxo`. O readback confirmou migrations `000001`–`000008`, inclusive checksum canônico de `000008`.

Matriz final:

```text
Probe run #13
Run ID: 34636223750
Job ID: 103384664571
Conclusion: SUCCESS
```

Comprovado no runtime real:

- acesso anônimo sem flash privado;
- signup controlado + OTP real;
- login/logout;
- IDOR de session id negado;
- revogação individual e coletiva efetivas;
- recovery inexistente/existente sem enumeração na resposta legítima;
- Origin divergente bloqueado pelo CSRF de Server Actions sem envio de recovery;
- reset válido, replay rejeitado e senha antiga rejeitada;
- reset por e-mail não revogou sessões já existentes no Managed Auth observado;
- mudança autenticada de senha revogou as demais sessões e preservou a corrente;
- auditoria live confirmou todos os eventos críticos esperados sem secrets.

### Head final da PR — PASS

```text
Head: 5fff744bc66014d630d16fb3faae5a977d3f597d
CI #244 / run 34637144474 / job 103387716565: SUCCESS
```

Runtime contract, `npm run verify`, PostgreSQL 18 e `npm run verify:db` passaram.

## Housekeeping

Branches Neon temporárias e fixtures sintéticas continuam existentes. Sua remoção é destrutiva e exige autorização explícita; isso não bloqueia o encerramento funcional da Story.
