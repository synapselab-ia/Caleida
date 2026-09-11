# Incremento 2 — Acesso controlado / EPIC-02

**Status:** EM ANDAMENTO — US-AUTH-008 aguarda revalidação da correção encontrada na matriz live final  
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

## 4. Estado integrado

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
- cache de sessão limitado a aproximadamente 1 segundo para revalidação rápida.

### Auditoria

Migration `000008_auth_security_audit.sql` adiciona `caleida_audit.auth_security_events` com apenas tipo, ator opcional, outcome, reason code e timestamp.

Não há colunas de e-mail, senha, OTP, token, cookie, Auth URL ou payload completo.

## 5. Gates concluídos

### CI/PostgreSQL 18 — PASS

Após a correção encontrada pelo live gate:

```text
Head funcional: 9366069ded22a9f1aed444e86153ab1a11db53b2
CI #232 / run 34616208433 / job 103318914704: SUCCESS
npm run verify: PASS
PostgreSQL 18 + npm run verify:db: PASS
```

### Neon isolated/baseline — PASS

```text
verify-us-auth-008 / br-delicate-meadow-aw1u62kn
baseline main / br-restless-cherry-awpcwy6r
```

- migration `000008` e teste SQL/ACL: PASS;
- promoção `000008` para baseline non-production: PASS;
- checksum correto;
- diff final verify-us-auth-008 vs baseline: vazio.

## 6. Gate live acumulado — estado real

A primeira RC Preview da PR #58 foi criada manualmente e usada para a matriz real.

Já passaram:

1. acesso anônimo e ausência de flash privado;
2. signup sem autorização negado;
3. signup autorizado aceito;
4. usuário não confirmado não autentica;
5. OTP real recebido/confirmado;
6. login autenticado e acesso `/app`;
7. duas sessões independentes;
8. tentativa de revogar session id alheio negada;
9. revogação individual remota efetiva após a janela de cache.

A matriz encontrou um defeito material na etapa seguinte: a chamada coletiva `revokeOtherSessions()` retornava sucesso sem remover a sessão remota no Managed Auth.

A PR foi corrigida para usar listagem server-side + `revokeSession()` explícito em cada sessão remota, preservando a atual. O token permanece exclusivamente no servidor. O CI #232 passou após a correção.

## 7. Revalidação necessária

A RC anterior é imutável e não contém o fix. Por isso uma **Preview manual atualizada** da ref corrente da PR #58 é necessária para fechar o mesmo gate final.

Na nova RC, reexecutar e concluir:

- proteção anônima;
- signup/OTP/login;
- revogação individual e coletiva;
- recovery existente/inexistente indistinguível;
- trusted/same-origin e origem divergente;
- reset válido + replay negado;
- senha antiga/nova após reset;
- comportamento real das sessões existentes após reset;
- mudança autenticada de senha revogando demais sessões;
- logout;
- readback final da auditoria sem secrets;
- ausência de erros críticos/5xx.

Não publicar Production e não criar Preview separado por subfluxo.

## 8. Housekeeping

Branches/fixtures temporárias non-production não são fonte canônica de schema. Sua exclusão é destrutiva e exige autorização explícita; a existência delas não bloqueia o Incremento.

## 9. Próxima ação

> Publicar manualmente uma Preview Vercel da ref corrente da branch `feat/us-auth-008-audit-integrated-validation`. Quando ficar `READY`, retomar imediatamente a matriz live para concluir US-AUTH-008 e decidir o fechamento do Incremento 2.
