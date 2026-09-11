# Execution Plan — Caleida

**Estado:** Incremento 2 em execução; US-AUTH-008 em `MANUAL_ACTION_REQUIRED` para o gate live final.  
**Fonte de execução:** `docs/CHECKPOINT.md`  
**Plano detalhado do incremento:** `docs/INCREMENT_2_PLAN.md`

## 1. Regras de execução vigentes

- uma Story limitada por vez;
- migrations persistentes somente em `database/migrations/`;
- PostgreSQL 18 descartável é o gate portável padrão;
- branch Neon isolada é adicional quando a mudança depende de Neon Auth/semântica gerenciada;
- deployment Vercel é exclusivamente humano/manual conforme ADR-007;
- Preview não é gate por Story intermediária;
- US-AUTH-008 concentra a matriz browser/live acumulada do Incremento 2;
- nenhum secret, senha, token, cookie, Auth URL ou connection string é persistido em Git/docs/issues/logs;
- Production Neon e Data API permanecem fora do escopo.

## 2. Incrementos concluídos

```text
Incremento 0 — Fundação executável — CONCLUÍDO
Incremento 1 — Fundação visual — CONCLUÍDO
```

## 3. Incremento 2 — Acesso controlado / EPIC-02

Ordem integrada:

```text
US-AUTH-001 — Neon Auth + sessão                         CONCLUÍDA (#43/#44)
US-AUTH-002 — papéis/autorização + bootstrap             CONCLUÍDA (#45/#46)
US-AUTH-003 — convites/solicitações + auditoria           CONCLUÍDA (#47/#48)
US-AUTH-004 — e-mail Auth non-production                  CONCLUÍDA (#49/#50)
US-AUTH-005 — cadastro controlado + confirmação OTP       CONCLUÍDA (#51/#52)
US-AUTH-006 — login/logout + proteção de sessão           CONCLUÍDA (#53/#54)
US-AUTH-007 — recovery + gestão/revogação de sessões      CONCLUÍDA (#55/#56)
US-AUTH-008 — auditoria integrada + validação final       EM ANDAMENTO (#57/#58)
```

## 4. US-AUTH-008 — estado real

**Issue:** #57  
**PR:** #58 (draft)  
**Branch:** `feat/us-auth-008-audit-integrated-validation`  
**Prioridade:** P1  
**Capacidades:** CAP-04, CAP-35

### Entrega implementada

- migration `000008_auth_security_audit.sql`;
- tabela privada `caleida_audit.auth_security_events`;
- writer server-only e parametrizado;
- eventos controlados para login/logout/recovery/reset/senha/sessões/proxy Auth;
- auditoria sem e-mail, senha, token, cookie, payload completo ou secret;
- recovery preserva anti-enumeração também na auditoria;
- proxy Auth audita somente operação/status, sem consumir request body;
- testes adversariais de schema/ACLs/contratos.

### Gates técnicos

```text
Head funcional: f093df971207793fcd7a25edcf135707f65973b0
CI #229 / 34601223118 / job 103268721995: SUCCESS
npm run verify: PASS
PostgreSQL 18 + npm run verify:db: PASS
```

### Gate Neon-specific

Branch isolada:

```text
verify-us-auth-008 / br-delicate-meadow-aw1u62kn / ready
```

Resultado:

- baseline inicial da branch: migrations `000001`–`000007`;
- `000008` aplicada com checksum versionado correto;
- teste SQL de auditoria: PASS;
- ACL adversarial: PASS;
- cleanup final: zero eventos de auditoria e zero usuários/sessões/accounts/verificações Auth;
- diff antes da promoção: somente estruturas esperadas de `auth_security_events`.

### Promoção non-production

Depois dos gates acima, `000008` foi promovida para a baseline Neon `main / br-restless-cherry-awpcwy6r`.

Readback final:

```text
ledger: 000001–000008
auth_security_events: 0
auth users/sessions/accounts/verifications: 0
schema diff verify-us-auth-008 vs baseline: vazio
```

## 5. Gate live consolidado — pendente

O último deployment Vercel observado continua sendo o Preview da US-AUTH-005. Ele não contém login/logout, recovery/sessões ou auditoria atuais.

Portanto a validação final requer uma **única release candidate Preview** da PR #58. A IA não executa essa publicação.

### Pré-condição

O CI do commit que registra o checkpoint/manual action deve estar verde antes da publicação.

### Ação humana única

No Vercel Dashboard, projeto `caleida`, criar manualmente um deployment Preview usando a branch:

```text
feat/us-auth-008-audit-integrated-validation
```

Não promover para Production.

### Matriz a executar após READY

- acesso anônimo direto e ausência de flash privado;
- login válido/inválido e logout;
- recovery existente/inexistente sem enumeração;
- reset válido/inválido/expirado/reutilizado;
- senha antiga/nova após reset;
- callback same-origin;
- cenário multi-sessão;
- revogação individual e das demais sessões;
- revalidação remota após ~1 s;
- mudança autenticada de senha com `revokeOtherSessions`;
- comportamento real de sessões existentes após reset por e-mail;
- signup + OTP integrado;
- autorização/adversariais aplicáveis;
- auditoria persistente sem secrets;
- console/runtime sem erro crítico.

## 6. Critério de encerramento

US-AUTH-008 somente vira `CONCLUÍDA` quando:

1. a Preview manual da RC existir e estiver `READY`;
2. a matriz live for executada com evidência real;
3. o comportamento de reset/sessões for registrado sem suposição;
4. auditoria live for comprovada sem dados sensíveis;
5. PR #58 tiver CI/review aceitáveis;
6. a evidência final for registrada em `docs/US_AUTH_008_VERIFICATION.md`;
7. a Story for integrada e o Incremento 2 puder ser avaliado como `CONCLUÍDO`.

## 7. NEXT_ACTION

> Publicar manualmente uma única Preview Vercel da branch `feat/us-auth-008-audit-integrated-validation` depois do CI verde e, quando estiver `READY`, retomar US-AUTH-008 para executar a matriz live integrada. Não criar Production, Data API ou novo incremento antes desse fechamento.
