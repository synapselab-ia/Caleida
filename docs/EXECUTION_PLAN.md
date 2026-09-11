# Execution Plan — Caleida

**Estado:** Incremento 2 em revisão final; US-AUTH-008 com gates técnicos e live em PASS, pendente apenas de integração da PR #58.  
**Fonte de execução:** `docs/CHECKPOINT.md`  
**Plano detalhado:** `docs/INCREMENT_2_PLAN.md`

## 1. Regras vigentes

- uma Story limitada por vez;
- migrations persistentes somente em `database/migrations/`;
- PostgreSQL 18 descartável é o gate portável padrão;
- branch Neon isolada complementa mudanças dependentes de Neon Auth/semântica gerenciada;
- deployment Vercel é exclusivamente humano/manual conforme ADR-007;
- Preview não é gate por Story intermediária;
- US-AUTH-008 concentra a matriz browser/live acumulada do Incremento 2;
- nenhum secret, senha, OTP, recovery token, session token, cookie, Auth URL ou connection string é persistido em Git/docs/issues;
- Production Neon e Data API continuam fora do escopo.

## 2. Incrementos

```text
Incremento 0 — Fundação executável — CONCLUÍDO
Incremento 1 — Fundação visual — CONCLUÍDO
Incremento 2 — Acesso controlado / EPIC-02 — EM REVISÃO FINAL
```

## 3. Incremento 2

```text
US-AUTH-001 — Neon Auth + sessão                         CONCLUÍDA (#43/#44)
US-AUTH-002 — papéis/autorização + bootstrap             CONCLUÍDA (#45/#46)
US-AUTH-003 — convites/solicitações + auditoria           CONCLUÍDA (#47/#48)
US-AUTH-004 — e-mail Auth non-production                  CONCLUÍDA (#49/#50)
US-AUTH-005 — cadastro controlado + confirmação OTP       CONCLUÍDA (#51/#52)
US-AUTH-006 — login/logout + proteção de sessão           CONCLUÍDA (#53/#54)
US-AUTH-007 — recovery + gestão/revogação de sessões      CONCLUÍDA (#55/#56)
US-AUTH-008 — auditoria integrada + validação final       EM REVISÃO (#57/#58)
```

## 4. US-AUTH-008 — gates

### Código / CI / PostgreSQL — PASS

- auditoria Auth persistente e sanitizada;
- migration `000008_auth_security_audit.sql`;
- testes de contrato e SQL adversarial;
- correção da revogação coletiva encontrada pelo gate live;
- CI #232 da correção: SUCCESS;
- PostgreSQL 18 + `verify:db`: PASS.

### Neon — PASS

- `verify-us-auth-008 / br-delicate-meadow-aw1u62kn`: PASS;
- promoção `000008` para a baseline non-production: PASS;
- checksum correto;
- diff final isolada vs baseline: vazio.

### Browser/live integrado — PASS

RC final:

```text
dpl_HqRV6x1Vn5f3GL69wGgy85UDVc9B
commit c85135418eec133d7e0a5dc8ad6ad816f2c39668
Preview / non-production / READY
```

Probe final:

```text
run #13 / 34636223750
job 103384664571
SUCCESS
```

A matriz comprovou signup/OTP, login/logout, proteção privada, recovery/reset, replay de token, trusted-origin/CSRF, multi-sessão, IDOR negado, revogação individual/coletiva, revalidação de cache, troca autenticada de senha e auditoria live sem secrets.

Comportamento medido do provider:

- reset por e-mail troca a senha, rejeita a senha antiga e invalida replay do recovery token;
- as sessões já existentes permaneceram ativas após o reset no Managed Auth observado;
- mudança autenticada de senha com a implementação atual revogou as demais sessões e preservou a corrente.

O request adversarial com Origin divergente foi recusado pelo Next.js antes da Server Action e não gerou e-mail de recovery. Esse `500 Invalid Server Actions request` é evidência do teste adversarial, não falha funcional do fluxo legítimo.

## 5. Critério de encerramento

Todos os gates materiais da US-AUTH-008 estão em PASS. Restam somente os gates de integração:

1. CI do head documental final da PR #58;
2. confirmar PR mergeável e ausência de review/thread bloqueante;
3. marcar ready;
4. integrar a PR com head esperado;
5. confirmar fechamento da Issue #57;
6. confirmar CI de `main`;
7. atualizar o checkpoint pós-merge com o SHA real e declarar Incremento 2 concluído.

## 6. NEXT_ACTION

> Finalizar a integração da PR #58. Não iniciar novo incremento antes de registrar o fechamento real da US-AUTH-008 e do Incremento 2 em `main`.
