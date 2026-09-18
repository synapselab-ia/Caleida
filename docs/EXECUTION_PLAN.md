# Execution Plan - Caleida

**Estado:** Incremento 3 em execução; US-PRIV-002 concluída e US-PRIV-003 pronta para promoção como próxima Story.  
**Fonte de execução:** `docs/CHECKPOINT.md`  
**Plano vigente:** `docs/INCREMENT_3_PLAN.md`

## 1. Regras vigentes

- uma Story limitada por vez;
- migrations persistentes somente em `database/migrations/`;
- PostgreSQL 18 descartável é o gate portável padrão;
- Neon isolado complementa mudanças dependentes de comportamento gerenciado;
- deployment Vercel é exclusivamente humano/manual conforme ADR-007;
- nenhum secret, senha, OTP, recovery token, session token, cookie, Auth URL ou connection string é persistido em Git/docs/issues;
- Production Neon e Storage não são criados sem Story/decisão própria;
- Data API só expõe schemas deliberadamente autorizados e deve operar com JWT + RLS no caminho normal;
- owner/BYPASSRLS não substitui evidência de autorização de usuário real.

## 2. Incrementos concluídos

```text
Incremento 0 - Fundação executável - CONCLUÍDO
Incremento 1 - Fundação visual - CONCLUÍDO
Incremento 2 - Acesso controlado / EPIC-02 - CONCLUÍDO
```

Fechamento do Incremento 2:

```text
PR #58: merged
Issue #57: closed/completed
Merge: 84f7fecb018d6f4b6bc36817accef15f1976f05f
CI pós-merge #246 / 34850194033: SUCCESS
Live matrix #13 / 34636223750: SUCCESS
```

## 3. Incremento 3 - Perfis e privacidade / EPIC-03

**Capacidades:** CAP-03, CAP-05 e CAP-33  
**Plano:** `docs/INCREMENT_3_PLAN.md`  
**Estado:** EM ANDAMENTO

Ordem vigente:

```text
US-PRIV-001 - perfil básico user-scoped + Data API/RLS       CONCLUÍDA
  ↓
US-PRIV-002 - personalização segura do perfil                CONCLUÍDA
  ↓
US-PRIV-003 - rota pública + visibilidade                     PRONTA / próxima ação
  ↓
US-PRIV-004 - bloqueio e contrato de exclusão social          A FAZER
  ↓
US-PRIV-005 - desativação e reativação da conta              A FAZER
  ↓
US-PRIV-006 - solicitação/cancelamento + export de encerramento A FAZER
  ↓
US-PRIV-007 - finalização segura da exclusão                  A FAZER
  ↓
US-PRIV-008 - validação integrada + fechamento                A FAZER
```

## 4. US-PRIV-001 - fechamento técnico

Implementação consolidada:

- migrations `000009_profile_core.sql` e `000010_profile_identity_claim_fix.sql`;
- perfil em `caleida_profile.profiles` com ownership UUID Auth imutável pelo payload;
- visibilidade default `only_me`;
- RLS habilitada e forçada;
- policies owner somente para `SELECT`, `INSERT` e `UPDATE`;
- nenhum `DELETE` normal;
- identidade derivada do `sub` em `request.jwt.claims`, fail-closed para claims ausentes/malformados;
- Data API server-only com JWT de sessão no CRUD normal, sem owner connection;
- `/account/profile` com setup/edição real de username e display name.

Evidência final:

```text
Feature head: ec644c1495644a74a281f08848224c43cc60daf7
CI final PR #279 / 35241013997 / job 105269156530: SUCCESS
Merge #62: 8aeb90cdc3b9b017aee3cefcd4e60b35f22d2758
Issue #61: closed/completed
CI pós-merge main #280 / 35241229260 / job 105269874527: SUCCESS
PostgreSQL 18 + verify:db: PASS
Live JWT/Data API/RLS #11 / 35013092108 / job 104529657936: SUCCESS
Baseline promotion #1 / 35239947088 / job 105265502696: SUCCESS
Baseline ledger: 000001-000010
Baseline Data API: active / somente caleida_profile
Schema diff isolated vs baseline: vazio
```

## 5. Observação operacional de grants

A Data API cria o papel gerenciado `authenticated`. Na promoção da US-PRIV-001, `000009` e `000010` já estavam aplicadas quando a Data API foi criada, então o bloco condicional de grants de `000009` não encontrou o papel durante a migration.

Depois do provisionamento foram reaplicados exatamente os grants codificados em `000009` e o readback ACL foi validado. Nenhum privilégio adicional foi introduzido.

Para ambientes novos, o serviço Data API deve existir antes da migration user-scoped que concede privilégios a seus papéis gerenciados, ou a promoção deve reaplicar exatamente os grants versionados após o provisionamento e obrigatoriamente fazer readback. Não usar grants ad hoc.

## 6. Escopo da próxima Story

US-PRIV-003 publica o perfil por username com visibilidade fail-closed, sem antecipar bloqueio ou relações sociais inexistentes.

Escopo permitido:

- criar rota pública por username;
- aplicar visibilidade no servidor e no banco;
- owner continua autorizado a consultar o próprio perfil;
- `public` pode ser lido conforme política;
- `only_me` não pode vazar para terceiros;
- `followers` e `connections` continuam estados canônicos fail-closed e não aparecem como opções funcionais enquanto as relações não existirem;
- acesso direto por UUID ou username obedece à mesma política;
- anônimo recebe somente colunas deliberadamente públicas;
- nenhuma policy concede `UPDATE` ou `DELETE` a anônimo;
- executar gate Neon-specific se a leitura pública usar `anonymous`/Data API.

Continuam fora do escopo:

- bloqueio, mute ou restrict;
- followers/connections funcionais;
- avatar/banner/upload/Storage;
- obras favoritas dependentes de catálogo;
- ciclo de desativação/exclusão;
- Production Neon;
- deployment Vercel pela IA.

## 7. NEXT_ACTION

> Promover US-PRIV-003 - Publicar perfil com visibilidade fail-closed como próxima Story limitada. Criar Issue e branch próprias a partir da `main` atual, reler `docs/INCREMENT_3_PLAN.md` e implementar somente rota pública por username e enforcement de visibilidade no servidor e no banco. Não antecipar US-PRIV-004.

## 8. Fechamento de US-PRIV-002

```text
Issue #63: closed/completed
PR #64: merged
Feature head final: 510f4ee461b9976d8f8311dbe3d9a9557c46cdd8
Merge: d19be4e881da6f8e3ba54a50ecef1c67fb1160e3
CI final PR #289 / 35351088749 / job 105619133550: SUCCESS
CI pós-merge main #290 / 35351301592 / job 105619831900: SUCCESS
PostgreSQL 18 + verify:db: PASS
Neon isolated: verify-us-priv-002 / br-proud-wind-awycp0sd / PASS
Baseline ledger: 000001-000011
000011 checksum: 4773504fe2296e7ce141e8efcb027efd2218f2fd5c5598585bd97f5a4f55f95f
Schema diff isolated vs baseline: vazio
Browser/live intermediário: SKIPPED/deferred conforme Verification Protocol
```
