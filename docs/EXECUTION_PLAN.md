# Execution Plan - Caleida

**Estado:** Incremento 3 em execução; US-PRIV-001 com gates funcionais/live em PASS e baseline non-production promovida, aguardando CI documental final e merge.  
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

Ordem planejada:

```text
US-PRIV-001 - perfil básico user-scoped + Data API/RLS       EM REVISÃO / GATES PASS
  ↓
US-PRIV-002 - personalização segura do perfil                A FAZER
  ↓
US-PRIV-003 - rota pública + visibilidade                     A FAZER
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

US-PRIV-002 só pode ser promovida após o merge de #62 e fechamento de #61.

## 4. US-PRIV-001 - estado técnico final

Implementação:

- migrations `000009_profile_core.sql` e `000010_profile_identity_claim_fix.sql`;
- perfil em `caleida_profile.profiles` com ownership UUID Auth imutável pelo payload;
- visibilidade default `only_me`;
- RLS habilitada e forçada;
- policies owner somente para `SELECT`, `INSERT` e `UPDATE`;
- nenhum `DELETE` normal;
- identidade derivada do `sub` em `request.jwt.claims`, fail-closed para claims ausentes/malformados;
- Data API server-only com JWT de sessão no CRUD normal, sem owner connection;
- `/account/profile` com setup/edição real de username e display name;
- nenhum avatar, banner, catálogo, favorito, relação social ou perfil público antecipado.

Gate portável:

```text
Head funcional: 14c5e5cf28901746c3dd1cc824c0e03d2f36d7b7
CI #278 / run 35012494049 / job 104527930487: SUCCESS
PostgreSQL 18 + verify:db: PASS
```

Gate live Neon isolado:

```text
Branch: verify-us-priv-001 / br-silent-rain-aw4fqrhg
Live probe run #11 / 35013092108 / job 104529657936: SUCCESS
A/B/anônimo via JWT + Data API + RLS: PASS
Cleanup sintético: PASS
```

Promoção baseline non-production:

```text
Baseline: main / br-restless-cherry-awpcwy6r
Ledger: 000001-000010
Data API: active
Schema exposto: caleida_profile
Promotion run #1 / 35239947088 / job 105265502696: SUCCESS
Schema diff isolated vs baseline: vazio
```

Readback confirmou RLS forçada, policies owner, `authenticated` somente com `SELECT/INSERT/UPDATE`, nenhum grant de tabela a `anonymous`/`PUBLIC` e nenhum `DELETE` normal.

## 5. Observação operacional de grants

A Data API cria o papel gerenciado `authenticated`. Na promoção desta Story, `000009` e `000010` já estavam aplicadas quando a Data API foi criada, então o bloco condicional de grants de `000009` não encontrou o papel durante a migration.

Depois do provisionamento foram reaplicados exatamente os grants codificados em `000009` e o readback ACL foi validado. Nenhum privilégio adicional foi introduzido.

Para ambientes novos, o serviço Data API deve existir antes da migration user-scoped que concede privilégios a seus papéis gerenciados, ou a promoção deve reaplicar exatamente os grants versionados após o provisionamento e obrigatoriamente fazer readback. Não usar grants ad hoc.

## 6. Limites deliberados

O Incremento 3 não antecipa dependências sem superfície real:

- avatar/banner ficam para EPIC-16/CAP-30, quando Storage for decidido;
- obras favoritas ficam após EPIC-04/CAP-06;
- followers/connections não são oferecidos como visibilidade funcional antes de EPIC-13;
- mute e restrição de interação ficam para EPIC-13;
- privacidade de biblioteca, avaliações, resenhas, coleções, metas e demais conteúdos nasce junto de cada domínio;
- exportação de encerramento de CAP-33 é limitada aos dados existentes; CAP-32/EPIC-17 continuará responsável pela portabilidade completa.

## 7. NEXT_ACTION

> Executar o CI final do head documental reconciliado da PR #62. Se permanecer em PASS, mergear #62 e fechar #61. Só depois reconciliar `main` promovendo US-PRIV-002 como próxima Story, sem iniciar sua implementação nesta execução.
