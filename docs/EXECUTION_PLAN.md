# Execution Plan — Caleida

**Estado:** Incremento 2 concluído; nenhuma Story ativa.  
**Fonte de execução:** `docs/CHECKPOINT.md`

## 1. Regras vigentes

- uma Story limitada por vez;
- migrations persistentes somente em `database/migrations/`;
- PostgreSQL 18 descartável é o gate portável padrão;
- Neon isolado complementa mudanças dependentes de comportamento gerenciado;
- deployment Vercel é exclusivamente humano/manual conforme ADR-007;
- nenhum secret, senha, OTP, recovery token, session token, cookie, Auth URL ou connection string é persistido em Git/docs/issues;
- Production Neon, Data API e Storage não são criados sem Story/decisão própria.

## 2. Incrementos concluídos

```text
Incremento 0 — Fundação executável — CONCLUÍDO
Incremento 1 — Fundação visual — CONCLUÍDO
Incremento 2 — Acesso controlado / EPIC-02 — CONCLUÍDO
```

## 3. Incremento 2 — fechamento

```text
US-AUTH-001 — Neon Auth + sessão                         CONCLUÍDA (#43/#44)
US-AUTH-002 — papéis/autorização + bootstrap             CONCLUÍDA (#45/#46)
US-AUTH-003 — convites/solicitações + auditoria           CONCLUÍDA (#47/#48)
US-AUTH-004 — e-mail Auth non-production                  CONCLUÍDA (#49/#50)
US-AUTH-005 — cadastro controlado + confirmação OTP       CONCLUÍDA (#51/#52)
US-AUTH-006 — login/logout + proteção de sessão           CONCLUÍDA (#53/#54)
US-AUTH-007 — recovery + gestão/revogação de sessões      CONCLUÍDA (#55/#56)
US-AUTH-008 — auditoria integrada + validação final       CONCLUÍDA (#57/#58)
```

Fechamento verificável:

```text
PR #58: merged
Issue #57: closed/completed
Merge: 84f7fecb018d6f4b6bc36817accef15f1976f05f
CI pré-merge #245 / 34637332904: SUCCESS
CI pós-merge #246 / 34850194033 / job 103995893357: SUCCESS
Live matrix #13 / 34636223750 / job 103384664571: SUCCESS
```

## 4. Próximo incremento canônico

O mapa de épicos do Project Design define `EPIC-03 — Perfis e privacidade`, cobrindo `CAP-03`, `CAP-05` e `CAP-33`.

Esse incremento ainda **não foi iniciado**. Não existe Issue, branch ou PR ativa para ele.

Antes de implementar, a próxima unidade deve:

1. criar o plano canônico do Incremento 3;
2. delimitar o escopo real de perfil, visibilidade, bloqueio/restrições e ciclo de conta;
3. decompor o trabalho em Stories pequenas e ordenadas;
4. registrar dependências com Auth/autorização já concluídos;
5. definir migrations/RLS, testes adversariais, browser/live acumulado e critérios de saída;
6. decidir explicitamente o que fica fora do incremento para não antecipar camada social ou Storage.

## 5. NEXT_ACTION

> Planejar o Incremento 3 — Perfis e privacidade / EPIC-03. Criar o plano canônico para CAP-03, CAP-05 e CAP-33 e deixar exatamente uma primeira Story pronta; não iniciar implementação antes de concluir esse planejamento.
