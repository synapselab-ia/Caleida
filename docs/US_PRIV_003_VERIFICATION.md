# US-PRIV-003 - Verificação do perfil público com visibilidade fail-closed

**Estado:** `PASS / PRONTA PARA INTEGRAÇÃO`  
**Issue:** `#65` - open até o merge  
**PR:** `#66` - open  
**Branch Git:** `feat/us-priv-003-public-profile-visibility`  
**Branch Neon isolada:** `verify-us-priv-003 / br-noisy-firefly-aw06x1br`  
**Baseline Neon:** `main / br-restless-cherry-awpcwy6r`

## 1. Escopo implementado

A Story publica somente a superfície de perfil já existente, sem antecipar relações sociais ou bloqueio:

- rota pública dinâmica `/<username>`;
- owner pode escolher somente `public` ou `only_me`;
- `followers` e `connections` continuam valores canônicos do banco, mas são tratados como privados para terceiros e não aparecem como opções funcionais;
- owner autenticado continua podendo ler o próprio perfil em qualquer visibilidade;
- terceiros autenticados leem somente perfis `public`;
- `anonymous` lê somente perfis `public`;
- a projeção pública contém apenas `username`, `display_name`, `biography`, `accent_token`, `links` e `favorite_categories`;
- `auth_user_id`, `visibility`, `created_at` e `updated_at` não fazem parte da projeção pública;
- perfil inexistente e perfil não autorizado resolvem para ausência de linha e mesma superfície de not-found;
- nenhum INSERT/UPDATE/DELETE é concedido a `anonymous`.

Bloqueio, followers/connections funcionais, mute/restrict, avatar/banner, Storage, obras favoritas e ciclo de conta permanecem fora do escopo.

## 2. Revalidação externa

A documentação oficial corrente foi revalidada antes da implementação.

Contrato usado:

- Neon Data API continua compatível com PostgREST e aplica JWT + PostgreSQL RLS;
- `anonymous` continua sendo o papel configurável para requests sem JWT;
- grants PostgreSQL e policies RLS continuam sendo a camada persistente de autorização;
- Next.js App Router continua suportando rota dinâmica por segmento `[username]` e `params` assíncrono em Server Components.

Nenhuma mudança de arquitetura foi necessária e nenhum ADR novo foi criado.

## 3. Migration

Migration nova:

```text
database/migrations/000012_profile_public_visibility.sql
checksum: d8a1f4f7f973e12490cf205bd8ec96ce50c55e4dbc5dd09bb978f16dcfdf3713
```

A migration:

- adiciona somente a policy `profiles_public_select` para `SELECT` quando `visibility = 'public'`;
- preserva as policies owner existentes;
- remove qualquer grant amplo preexistente do papel `anonymous` antes de conceder o contrato atual;
- concede a `anonymous` somente `USAGE` no schema;
- concede SELECT por coluna somente nas seis colunas públicas;
- concede `EXECUTE` de `current_auth_user_id()` a `anonymous` porque a policy owner existente também participa da avaliação de SELECT;
- não concede INSERT, UPDATE ou DELETE a `anonymous`.

## 4. CI e PostgreSQL 18

```text
CI #292 / run 35354823796 / job 105631496653: SUCCESS
Verify runtime contract: SUCCESS
Install dependencies: SUCCESS
Verify application / npm run verify: SUCCESS
PostgreSQL 18 server check: SUCCESS
Verify database / npm run verify:db: SUCCESS
```

O gate portável cobre:

- owner lendo o próprio perfil privado;
- usuário autenticado diferente lendo perfil público;
- usuário autenticado diferente sem acesso a `only_me`, `followers` ou `connections`;
- anônimo lendo somente perfil público;
- anônimo sem leitura de perfis privados ou estados sociais reservados;
- projeção anônima limitada às seis colunas públicas;
- SELECT de `auth_user_id` e `visibility` negado a anônimo;
- INSERT, UPDATE e DELETE negados a anônimo;
- ausência de policy DELETE;
- nenhuma regressão nas migrations anteriores.

## 5. Gate Neon-specific

A migration foi aplicada primeiro em:

```text
verify-us-priv-003 / br-noisy-firefly-aw06x1br
```

Readback do serviço gerenciado confirmou:

- Data API `active`;
- `db_anon_role = anonymous`;
- somente `caleida_profile` exposto;
- OpenAPI desabilitado;
- RLS habilitada e forçada;
- policy nova exatamente `visibility = 'public'`;
- `anonymous` sem table-level privileges;
- `anonymous` com SELECT somente em:
  - `accent_token`;
  - `biography`;
  - `display_name`;
  - `favorite_categories`;
  - `links`;
  - `username`;
- `anonymous` possui somente o EXECUTE necessário de `current_auth_user_id()` para avaliação das policies existentes;
- `authenticated` continua com somente INSERT/SELECT/UPDATE na tabela.

Teste usando o papel gerenciado real:

```text
SET LOCAL ROLE anonymous + SELECT count/public columns: PASS
SELECT auth_user_id como anonymous: permission denied / PASS adversarial
```

Nenhum dado sintético persistente precisou ser criado na branch Neon para esta prova.

## 6. Promoção baseline non-production

Após CI e Neon isolated em PASS, `000012` foi aplicada deliberadamente à baseline:

```text
main / br-restless-cherry-awpcwy6r
```

Readback:

```text
000012_profile_public_visibility.sql
d8a1f4f7f973e12490cf205bd8ec96ce50c55e4dbc5dd09bb978f16dcfdf3713
```

Estado após promoção:

- baseline contém migrations `000001-000012`;
- RLS continua habilitada e forçada;
- policies owner permanecem intactas;
- policy pública existe somente para SELECT de linhas `public`;
- grants anônimos permanecem somente por coluna;
- Data API continua ativa e expondo somente `caleida_profile`;
- diff de schema `verify-us-priv-003` versus baseline: vazio.

## 7. Aplicação e interface

`src/lib/profile/data-api.ts` agora possui dois contratos separados:

- CRUD autenticado do próprio perfil, com JWT;
- leitura visível por username, usando JWT opcional e fallback anônimo fail-closed.

A projeção pública fixa evita solicitar ownership, visibility ou timestamps.

`/account/profile`:

- oferece somente `Público` e `Somente eu`;
- não oferece followers/connections como funcionalidade falsa;
- mostra link para `/<username>` quando o perfil está público.

`/<username>`:

- é Server Component dinâmica;
- não envia dados privados ao cliente antes da autorização;
- possui loading próprio;
- possui error boundary fail-closed;
- usa not-found idêntico para username inexistente e perfil não autorizado;
- renderiza somente campos da projeção pública.

## 8. Browser, HTTP externo e deployment

`SKIPPED/deferred` para browser real intermediário conforme o Verification Protocol.

Não existe Preview manual novo para esta branch e ADR-007 proíbe deployment pela IA. Os critérios de autorização foram cobertos pelas camadas que realmente impõem a regra: PostgreSQL 18, role gerenciado `anonymous`, ACL/RLS Neon e contratos server-side.

Uma tentativa de probe HTTP direto ao endpoint da Data API a partir do ambiente de execução não pôde ser concluída por indisponibilidade de resolução DNS externa. Esse probe não é registrado como PASS e não substitui os gates executados.

A validação live/browser acumulada permanece para US-PRIV-008 ou release candidate manual quando materialmente necessária.

Nenhum deployment Vercel foi executado.

## 9. Segurança e secrets

- nenhum endpoint Data API real foi persistido em Git/docs/Issue/PR;
- nenhum JWT, senha, OTP, cookie, API key ou connection string foi persistido;
- Production Neon não foi criada;
- `anonymous` não ganhou write privileges;
- `auth_user_id` não integra a projeção pública;
- Storage não foi provisionado.

## 10. Resultado

US-PRIV-003 possui implementação, CI/PostgreSQL 18, Neon-specific e promoção/readback da baseline em PASS.

A PR #66 pode ser integrada após o CI final do conjunto documental. Após merge e CI pós-merge, fechar a Issue #65 e promover somente US-PRIV-004 - Implementar bloqueio com efeito real.
