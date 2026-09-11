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

NEXT_ACTION: Publicar manualmente uma única Preview Vercel da ref atual da PR #58 e, após o deployment ficar READY, retomar esta Story para executar a matriz live integrada do Incremento 2 e coletar a evidência final.

BLOCKERS: nenhum bloqueio técnico; a continuidade do gate live depende da release manual prevista por ADR-007
MANUAL_ACTION_REQUIRED: criar uma Preview manual do projeto Vercel caleida usando a branch feat/us-auth-008-audit-integrated-validation; não promover para Production
ON_HOLD: none
```

A ação manual só deve ocorrer depois que o CI do commit que contém este checkpoint estiver verde. A IA não executa Preview, Production, promote, redeploy ou rollback.

## Estado GitHub recuperado

- Issue `#57` aberta;
- PR `#58` aberta em draft e mergeável;
- head funcional antes desta reconciliação documental: `f093df971207793fcd7a25edcf135707f65973b0`;
- CI `#229` / run `34601223118` / job `103268721995`: `SUCCESS`;
- `main`: `6ba68307ae34db8f4878d2d9c14fcb11e635cf3b`;
- nenhum review/comment bloqueante observado.

## Entrega técnica da US-AUTH-008

Implementado na PR #58:

- migration append-only `000008_auth_security_audit.sql`;
- `caleida_audit.auth_security_events` com metadados mínimos controlados;
- auditoria server-only de login, logout, recovery, reset, mudança de senha e revogação de sessões;
- auditoria de POST do proxy Auth sem ler request body;
- recovery continua anti-enumeração também na persistência de auditoria;
- nenhum e-mail, senha, token, cookie, Auth URL, connection string ou payload arbitrário é aceito pelo contrato da tabela/writer;
- testes de contrato e PostgreSQL atualizados sem remover gates históricos.

## Gates executados

### CI / PostgreSQL 18 — PASS

No head funcional `f093df9...`:

```text
npm run verify: PASS
lint/typecheck/test/build: PASS
PostgreSQL 18: PASS
npm run verify:db: PASS
migration 000008: PASS
SQL audit test + testes concorrentes: PASS
CI #229: SUCCESS
```

Os CIs intermediários que falharam identificaram apenas contratos/ordenação de testes e foram corrigidos sem relaxar segurança.

### Neon isolated — PASS

```text
Project: caleida-nonprod / patient-glade-95136440
Baseline parent: main / br-restless-cherry-awpcwy6r
Verification branch: verify-us-auth-008 / br-delicate-meadow-aw1u62kn / ready
```

Readback antes da migration: ledger `000001`–`000007`.

Após aplicar `000008`:

```text
checksum: 4f2ab39dd53413c522648ce7021a0051a163b009486c5dd6e7fcf1e2f81460b8
SQL adversarial audit test: PASS
auth_security_events após cleanup: 0
auth users/sessions/accounts/verifications: 0
schema diff vs baseline antes da promoção: somente tabela/sequence/índices esperados
```

### Promoção baseline non-production — PASS

A migration `000008` foi promovida deliberadamente para `main / br-restless-cherry-awpcwy6r` somente após CI/PG18 e Neon isolated PASS.

Readback:

```text
ledger baseline: 000001–000008
checksum 000008: correto
auth_security_events: 0
auth users/sessions/accounts/verifications: 0
schema diff verify-us-auth-008 vs main: vazio
```

Nenhuma fixture foi transportada para a baseline.

## Vercel / gate live

O projeto Vercel `caleida` existe. O deployment mais recente ainda é `dpl_8WN2sKEEL6ex3vKt11vmYX9ZGvoN`, `READY`, baseado na US-AUTH-005. Ele não contém US-AUTH-006/007/008 e não serve para o gate live final.

Por isso US-AUTH-008 chegou ao único ponto em que uma nova publicação é materialmente necessária. Conforme ADR-007 e a política de deployment, deve existir **uma única Preview manual** da PR #58, não um deploy por Story/subfluxo.

A release deve ser Preview/non-production e usar exclusivamente os recursos/secrets non-production já configurados para o projeto. Production Neon continua inexistente e não deve ser criada nesta Story.

## Matriz live pendente após a Preview

A retomada deve validar, na mesma RC:

1. visitante/anônimo em `/app` e `/account/security` → redirecionado sem flash privado;
2. login válido e credencial inválida com feedback genérico;
3. logout invalida o acesso privado;
4. recovery para conta existente e inexistente sem enumeração;
5. reset válido, inválido/expirado e reutilização de token;
6. senha antiga versus nova após reset;
7. trusted origin do callback de recovery;
8. duas sessões independentes e metadados seguros na área de segurança;
9. revogação individual e perda de acesso remoto após a janela aproximada de 1 s;
10. alteração autenticada de senha revoga as demais sessões e preserva a corrente;
11. efeito real do reset por e-mail sobre sessões existentes, sem presumir configuração indisponível;
12. tentativas adversariais de sessão/ownership/autorização aplicáveis;
13. signup/OTP integrado, reutilizando a metodologia segura da US-AUTH-005;
14. persistência dos eventos críticos na auditoria sem secrets e sem payloads sensíveis;
15. ausência de erros críticos de console/runtime nos caminhos exercitados.

Nenhum OTP, recovery token, senha, cookie, session token ou e-mail temporário deve ser persistido na documentação.

## Housekeeping

Branches Neon temporárias atuais:

```text
verify-us-auth-004 / br-plain-pond-aw5f59ia
verify-us-auth-005 / br-small-river-aww0rtxo
verify-us-auth-006 / br-cold-block-aww00k4o
verify-us-auth-007 / br-wandering-mountain-awjnqqps
verify-us-auth-008 / br-delicate-meadow-aw1u62kn
```

Exclusão é destrutiva e exige autorização explícita do usuário; não é blocker da Story.
