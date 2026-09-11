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
ACTIVE_PR: #58 (draft até o CI deste head final)

NEXT_ACTION: Executar o CI do head documental final da PR #58; se verde e sem review/thread bloqueante, marcar ready, integrar a PR, confirmar fechamento da Issue #57 e CI de main; só então promover o próximo planejamento canônico.

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

Preview manual/non-production:

```text
deployment: dpl_HqRV6x1Vn5f3GL69wGgy85UDVc9B
commit publicado: c85135418eec133d7e0a5dc8ad6ad816f2c39668
branch: feat/us-auth-008-audit-integrated-validation
state: READY
```

A configuração Preview histórica continua ligada à branch Neon `verify-us-auth-005 / br-small-river-aww0rtxo`. O readback confirmou que ela contém migrations `000001`–`000008`, inclusive o checksum canônico de `000008`, portanto o gate de auditoria live é válido nesse runtime.

Matriz final:

```text
Probe run #13
Run ID: 34636223750
Job ID: 103384664571
Conclusion: SUCCESS
```

Comprovado no runtime real:

- acesso anônimo sem flash privado;
- signup não autorizado negado e signup autorizado aceito;
- OTP real recebido e confirmado;
- login antes do OTP negado;
- login autenticado e acesso privado;
- IDOR de session id negado;
- revogação individual remota efetiva após revalidação;
- revogação coletiva efetiva preservando a sessão corrente;
- recovery inexistente com resposta genérica;
- Origin divergente rejeitado pelo CSRF de Server Actions antes da action e sem envio de recovery;
- recovery existente + link real;
- reset válido e replay do token rejeitado;
- senha antiga rejeitada e nova aceita;
- **reset por e-mail não revoga sessões já existentes no Managed Auth observado**;
- mudança autenticada de senha revoga as demais sessões e preserva a corrente;
- logout invalida a sessão atual.

### Auditoria live — PASS

Readback somente de campos não sensíveis confirmou, no intervalo do run #13, eventos para:

- `auth_proxy_post`;
- `login`;
- `logout`;
- `password_recovery_requested`;
- `password_reset` (success e replay denied);
- `password_changed`;
- `session_revoked` (remote success e target-not-owned denied);
- `other_sessions_revoked` success.

O único HTTP 500 do fluxo foi o request adversarial deliberado com `Origin: evil.example`, recusado pelo próprio Next.js como `Invalid Server Actions request`; nenhum e-mail foi disparado. Não houve falha 5xx não intencional nos caminhos funcionais validados.

## Housekeeping

Branches Neon temporárias e fixtures sintéticas continuam existentes. Sua remoção é destrutiva e exige autorização explícita; isso não bloqueia o encerramento funcional da Story.
