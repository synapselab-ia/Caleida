# Checkpoint — Caleida

**Status operacional:** `MANUAL_ACTION_REQUIRED`  
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
ACTIVE_PR: #58 (draft)

NEXT_ACTION: Publicar manualmente uma Preview Vercel atualizada da ref corrente da PR #58 e retomar a matriz live integrada para revalidar a correção de revogação coletiva e completar recovery/reset/password-change/logout/auditoria.

BLOCKERS: a RC já exercitada é imutável e contém a implementação anterior à correção encontrada pelo próprio gate live
MANUAL_ACTION_REQUIRED: criar uma Preview manual/non-production da ref corrente da branch feat/us-auth-008-audit-integrated-validation; não promover para Production
ON_HOLD: none
```

A IA não executa Preview, Production, promote, redeploy ou rollback conforme ADR-007.

## Estado real recuperado

- Issue `#57`: aberta;
- PR `#58`: aberta em draft e mergeável antes da última atualização documental;
- reviews/threads bloqueantes observados: nenhum;
- correção funcional mais recente: `9366069ded22a9f1aed444e86153ab1a11db53b2`;
- CI `#232` / run `34616208433` / job `103318914704`: `SUCCESS`;
- runtime contract, `npm run verify`, PostgreSQL 18 e `npm run verify:db`: PASS.

## Gates US-AUTH-008

### Implementação/auditoria — PASS

- migration `000008_auth_security_audit.sql`;
- `caleida_audit.auth_security_events` com metadados mínimos controlados;
- writer server-only e parametrizado;
- sem e-mail, senha, OTP, recovery token, session token, cookie ou payload arbitrário;
- recovery continua anti-enumeração também na auditoria.

### Neon isolated e baseline — PASS

```text
Project: caleida-nonprod / patient-glade-95136440
Baseline: main / br-restless-cherry-awpcwy6r
Verification: verify-us-auth-008 / br-delicate-meadow-aw1u62kn
```

- `000008` aplicada/testada na branch isolada;
- SQL adversarial/ACL: PASS;
- promoção para baseline non-production: PASS;
- checksum correto;
- diff verify-us-auth-008 vs baseline após promoção: vazio.

### Matriz live — PARCIAL, com defeito encontrado e corrigido

RC exercitada:

```text
dpl_91NQikXRxHEKFMVxE52JRJBNWbjC
Preview / non-production
```

Confirmado no runtime real:

- visitante em `/app` → redirect sem flash privado;
- signup não autorizado → negado;
- signup autorizado → aceito;
- login antes do OTP → negado;
- OTP real → recebido e confirmado;
- login server action → sucesso;
- duas sessões independentes;
- IDOR de session id → negado;
- revogação individual remota → efetiva após revalidação do cache.

Run que revelou o defeito:

```text
Probe run #9
Run ID: 34615577700
Job ID: 103316542470
```

Falha real: `revokeOtherSessions()` retornava sucesso, mas a sessão remota permanecia válida e presente no Managed Auth.

Correção já integrada na PR #58:

- listar sessões server-side;
- preservar a sessão corrente;
- revogar explicitamente cada sessão remota por `revokeSession({ token })`;
- token nunca sai do servidor;
- contrato reforçado;
- CI #232 verde.

A Preview anterior não contém essa correção e não pode ser usada como evidência final.

## Ambiente Preview

A RC reutiliza a configuração histórica Preview vinculada à branch Neon `verify-us-auth-005 / br-small-river-aww0rtxo`. Para o gate atual foram alinhados nessa branch non-production:

- migration `000008`;
- trusted origin da RC atual.

A mailbox `mail.tm` falhou em entregar OTP apesar da geração no Neon. A probe descartável passou a usar GrabMail; OTP real foi então recebido e validado. Nenhum endereço temporário/OTP foi persistido nesta documentação.

## Housekeeping

Branches Neon temporárias continuam existentes e não bloqueiam a Story:

```text
verify-us-auth-004 / br-plain-pond-aw5f59ia
verify-us-auth-005 / br-small-river-aww0rtxo
verify-us-auth-006 / br-cold-block-aww00k4o
verify-us-auth-007 / br-wandering-mountain-awjnqqps
verify-us-auth-008 / br-delicate-meadow-aw1u62kn
```

Exclusão/limpeza destrutiva exige autorização explícita do usuário.
