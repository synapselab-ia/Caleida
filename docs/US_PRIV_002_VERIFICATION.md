# US-PRIV-002 - Verificação da personalização segura do perfil

**Estado:** `PASS / PRONTA PARA INTEGRAÇÃO`  
**Issue:** `#63` - open até o merge  
**PR:** `#64` - open  
**Branch Git:** `feat/us-priv-002-profile-personalization`  
**Branch Neon isolada:** `verify-us-priv-002 / br-proud-wind-awycp0sd`  
**Baseline Neon:** `main / br-restless-cherry-awpcwy6r`

## 1. Escopo implementado

A Story amplia o perfil privado criado em US-PRIV-001 sem alterar o boundary de ownership:

- `biography`: opcional, normalizada por trim no servidor e limitada a 280 caracteres no servidor e no banco;
- `accent_token`: restrito a `violet`, `magenta`, `blue`, `green` e `amber`;
- `links`: até 5 URLs HTTPS, sem credenciais embutidas, normalizadas no servidor e limitadas a 512 caracteres cada;
- `favorite_categories`: até 3 valores únicos da taxonomia canônica `book | manga | manhwa | manhua | movie | series | anime`;
- os campos permanecem no registro `caleida_profile.profiles`;
- `auth_user_id` e `visibility` continuam fora do payload editável;
- RLS e policies owner de US-PRIV-001 foram preservadas sem expansão.

Não foram criados avatar, banner, upload, Storage, obras favoritas, perfil público, followers/connections, mute/restrict ou ciclo de conta.

## 2. Migration

Migration nova:

```text
database/migrations/000011_profile_personalization.sql
checksum: 4773504fe2296e7ce141e8efcb027efd2218f2fd5c5598585bd97f5a4f55f95f
```

Ela adiciona quatro colunas, cinco constraints e dois validadores `SECURITY INVOKER`.

As funções de validação não possuem `EXECUTE` para `PUBLIC`; o papel gerenciado `authenticated` recebe somente o `EXECUTE` necessário para avaliar as constraints. Nenhum grant de tabela adicional foi introduzido.

## 3. CI e PostgreSQL 18

Primeiro ciclo:

```text
CI #283 / run 35350388259 / job 105616855060: FAILURE
Verify application: SUCCESS
Verify database: FAILURE
```

A falha revelou que o papel sintético de `000010_profile_core_contract.mjs` não reproduzia os novos `EXECUTE` grants necessários para avaliar as constraints. O teste foi corrigido para espelhar o papel real `authenticated`, sem ampliar privilégios de produção.

Ciclo corrigido:

```text
CI #284 / run 35350619301 / job 105617610955: SUCCESS
Verify runtime contract: SUCCESS
Install dependencies: SUCCESS
Verify application: SUCCESS
PostgreSQL 18 server check: SUCCESS
Verify database / npm run verify:db: SUCCESS
```

O gate portável cobre:

- migrations desde a baseline limpa;
- biografia válida e excesso de tamanho;
- token permitido e token inválido;
- links HTTPS válidos;
- esquema não HTTPS;
- limite de quantidade de links;
- categorias válidas, desconhecidas e duplicadas;
- persistência e leitura pelo owner sintético;
- tentativa de UPDATE por outro usuário continuando sem efeito sob RLS.

## 4. Gate Neon isolado

A migration foi aplicada somente em `verify-us-priv-002` antes da promoção.

Readback confirmou:

- PostgreSQL 18;
- RLS habilitada e forçada em `caleida_profile.profiles`;
- policies permanecem somente `profiles_owner_insert`, `profiles_owner_select` e `profiles_owner_update`;
- `authenticated` permanece com somente `INSERT`, `SELECT` e `UPDATE` na tabela;
- `anonymous` permanece sem grant de tabela;
- validadores são `SECURITY INVOKER`;
- `authenticated` possui `EXECUTE` nos dois validadores;
- `PUBLIC` não possui `EXECUTE` nos validadores;
- Data API permanece `active`, expondo somente `caleida_profile`;
- OpenAPI permanece desabilitado;
- os validadores retornaram os resultados esperados para links/categorias válidos, duplicados e inválidos.

## 5. Promoção baseline non-production

Após CI e Neon isolated em PASS, `000011` foi aplicada à baseline `main / br-restless-cherry-awpcwy6r` em transação única, incluindo o ledger canônico.

Readback:

```text
000011_profile_personalization.sql
4773504fe2296e7ce141e8efcb027efd2218f2fd5c5598585bd97f5a4f55f95f
```

Estado após promoção:

- as quatro novas colunas e cinco constraints existem;
- RLS/policies continuam inalteradas;
- grants de tabela continuam restritos;
- Data API continua expondo somente `caleida_profile`;
- diff de schema `verify-us-priv-002` versus baseline: vazio.

## 6. Aplicação e interface

`src/lib/profile/actions.ts` valida e normaliza todos os campos antes de chamar o boundary de dados.

`src/lib/profile/data-api.ts` continua server-only, usa JWT da sessão e Data API, e não aceita ownership ou visibilidade no payload.

`/account/profile` agora oferece:

- biografia;
- escolha textual de token de destaque acompanhada de swatch decorativo;
- links HTTPS, um por linha;
- categorias culturais por checkboxes;
- estados existentes de loading, erro, pending e sucesso.

A seleção de cor não depende exclusivamente de cor para transmitir estado ou significado.

## 7. Browser e deployment

`SKIPPED/deferred`: não há runtime isolado publicado para a branch e deployment Vercel é exclusivamente humano/manual conforme ADR-007.

A Story não depende materialmente de callback externo, domínio público, webhook ou outro comportamento que exija deployment para validar seu contrato. O gate live acumulado permanece para o fechamento do incremento/release.

Nenhum deployment Vercel foi executado.

## 8. Segurança e secrets

- nenhum endpoint real, JWT, OTP, senha, API key, cookie ou connection string foi persistido;
- Production Neon não foi criada;
- `anonymous` não ganhou acesso à tabela;
- nenhuma policy pública foi criada;
- Storage não foi provisionado.

## 9. Resultado

US-PRIV-002 possui implementação, CI, PostgreSQL 18, Neon isolated e promoção/readback da baseline em PASS. A PR #64 pode ser integrada após o CI final do conjunto documental.

Após o merge, o fechamento operacional deve registrar merge, CI pós-merge, fechar a Issue #63 e promover somente US-PRIV-003 como próxima ação.
