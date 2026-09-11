# Execution Plan — Caleida

**Estado:** Incremento 2 em execução; US-AUTH-008 em `MANUAL_ACTION_REQUIRED` para revalidar em RC atualizada a correção encontrada pelo gate live.  
**Fonte de execução:** `docs/CHECKPOINT.md`  
**Plano detalhado:** `docs/INCREMENT_2_PLAN.md`

## 1. Regras vigentes

- uma Story limitada por vez;
- migrations persistentes somente em `database/migrations/`;
- PostgreSQL 18 descartável é o gate portável padrão;
- branch Neon isolada complementa mudanças que dependem de Neon Auth/semântica gerenciada;
- deployment Vercel é exclusivamente humano/manual conforme ADR-007;
- Preview não é gate por Story intermediária;
- US-AUTH-008 concentra a matriz browser/live acumulada do Incremento 2;
- nenhum secret, senha, OTP, recovery token, session token, cookie, Auth URL ou connection string é persistido em Git/docs/issues;
- Production Neon e Data API continuam fora do escopo.

## 2. Incrementos concluídos

```text
Incremento 0 — Fundação executável — CONCLUÍDO
Incremento 1 — Fundação visual — CONCLUÍDO
```

## 3. Incremento 2 — Acesso controlado / EPIC-02

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

## 4. US-AUTH-008 — gates concluídos

Entregue:

- migration `000008_auth_security_audit.sql`;
- tabela privada `caleida_audit.auth_security_events`;
- auditoria server-only para eventos críticos Auth;
- recovery anti-enumeração também na auditoria;
- proxy Auth auditado sem leitura do request body;
- testes adversariais de schema/ACL/contratos.

Gates:

```text
Neon isolated verify-us-auth-008: PASS
promoção 000008 para baseline non-production: PASS
schema diff pós-promoção: vazio
CI da correção live: #232 / 34616208433 / job 103318914704: SUCCESS
```

## 5. Matriz live — resultado parcial

Uma única RC Preview foi criada manualmente e exercitada. O runtime comprovou:

- redirect anônimo sem flash privado;
- signup controlado e bloqueio do não autorizado;
- OTP real;
- login autenticado;
- múltiplas sessões;
- IDOR de session id negado;
- revogação individual remota efetiva após revalidação do cache.

A matriz também cumpriu sua função de encontrar um defeito material: a operação coletiva `revokeOtherSessions()` respondia sucesso sem invalidar a sessão remota.

A correção foi aplicada na PR #58 no head funcional `9366069ded22a9f1aed444e86153ab1a11db53b2`:

- listagem server-side das sessões;
- filtro pelo usuário autenticado;
- preservação da sessão corrente;
- revogação explícita de cada sessão remota com o token mantido exclusivamente no servidor;
- falha fechada se o provider rejeitar a listagem/revogação;
- contrato automatizado reforçado.

O CI #232 passou integralmente após a correção.

## 6. Por que existe nova ação manual

A Preview já testada é imutável e contém o código anterior à correção encontrada pelo próprio live gate. Ela não pode provar o comportamento do novo head.

Portanto é materialmente necessária **uma Preview manual atualizada da ref corrente da PR #58**. Isso não altera a política consolidada: não é um deploy por Story, mas a reexecução do release-candidate gate após correção de um bug real encontrado nesse mesmo gate.

Não criar Production e não criar Preview separado por subfluxo.

## 7. Matriz a concluir na RC atualizada

Reexecutar o fluxo integrado e exigir PASS para:

- proteção privada anônima;
- signup/OTP;
- login válido/inválido;
- sessões múltiplas e metadados seguros;
- IDOR de session id;
- revogação individual;
- revogação de todas as outras sessões preservando a corrente;
- recovery existente/inexistente indistinguível;
- origin divergente sem callback inseguro;
- reset válido e replay negado;
- senha antiga/nova após reset;
- medição do efeito do reset sobre sessões existentes;
- password change autenticado revogando demais sessões;
- logout;
- auditoria live sem dados sensíveis;
- ausência de erro crítico/5xx nos caminhos exercitados.

## 8. Critério de encerramento

US-AUTH-008 somente vira `CONCLUÍDA` quando:

1. RC atualizada existir em Preview/non-production;
2. matriz live completa passar;
3. comportamento reset/sessões estiver registrado sem suposição;
4. auditoria live for comprovada sem secrets;
5. PR #58 tiver CI/review aceitáveis;
6. evidência final estiver registrada;
7. Story for integrada e o Incremento 2 puder ser declarado concluído.

## 9. NEXT_ACTION

> Publicar manualmente uma Preview Vercel da ref corrente da PR #58, já com a correção de revogação coletiva e os docs atuais. Quando estiver `READY`, retomar imediatamente a matriz live; não criar Production, Data API ou novo incremento antes do fechamento.
