# US-PRIV-001 - Verificação do perfil básico user-scoped

**Estado:** `PASS / CONCLUÍDA`  
**Issue:** `#61` - closed / completed  
**PR:** `#62` - merged  
**Feature head:** `ec644c1495644a74a281f08848224c43cc60daf7`  
**Merge:** `8aeb90cdc3b9b017aee3cefcd4e60b35f22d2758`  
**Branch Neon isolada:** `verify-us-priv-001 / br-silent-rain-aw4fqrhg`  
**Baseline Neon:** `main / br-restless-cherry-awpcwy6r`

## 1. Escopo implementado

A Story materializa somente o primeiro domínio privado user-scoped:

- `000009_profile_core.sql` cria `caleida_profile.profiles`, constraints, RLS, policies e grants mínimos;
- `000010_profile_identity_claim_fix.sql` substitui a dependência de `auth.uid()` por leitura fail-closed do `sub` em `request.jwt.claims`;
- ownership é UUID Auth e não pode ser forjado ou transferido por payload;
- username é normalizado, route-safe, case-insensitive unique e possui nomes reservados bloqueados;
- `display_name` é o único outro campo editável nesta Story;
- perfil novo nasce `only_me`;
- RLS está habilitada e forçada;
- owner possui somente `SELECT`, `INSERT` e `UPDATE` no caminho normal;
- não existe policy/grant normal de `DELETE`;
- Data API usa JWT de sessão e RLS, sem `DATABASE_URL`/owner no CRUD normal;
- `/account/profile` oferece criação/edição real com estados de perfil ausente, loading, erro, pending e sucesso;
- nenhum campo de formulário controla `auth_user_id` ou visibilidade.

Avatar, banner, Storage, catálogo, favoritos, relações sociais, perfil público e ciclo de exclusão permanecem fora do escopo.

## 2. Gate portável - PASS

```text
Head funcional: 14c5e5cf28901746c3dd1cc824c0e03d2f36d7b7
CI funcional #278 / 35012494049 / job 104527930487: SUCCESS
Feature head final documental: ec644c1495644a74a281f08848224c43cc60daf7
CI final PR #279 / 35241013997 / job 105269156530: SUCCESS
```

Passaram runtime contract, migration manifest, lint, typecheck, testes de contrato, build Next.js, PostgreSQL 18 e `npm run verify:db`.

O contrato portátil cobre claims ausentes/malformados, owner read/write, outro usuário sem leitura/alteração, forged ownership, transferência de ownership, DELETE negado, anônimo negado e username inválido/reservado.

## 3. Correções encontradas durante a prova Neon

### 3.1 Acesso direto a `auth.uid()`

A primeira prova estrutural mostrou que `authenticated` não possuía `USAGE` genérico no schema gerenciado `auth`, como desejado. Abrir esse schema seria privilégio excessivo.

### 3.2 Identidade final por claims validados

A prova live mostrou que o boundary correto da Data API disponibiliza claims validados em `request.jwt.claims`. A migration `000010_profile_identity_claim_fix.sql` tornou `caleida_profile.current_auth_user_id()` `SECURITY INVOKER` e passou a:

1. ler `current_setting('request.jwt.claims', true)`;
2. interpretar JSON de forma fail-closed;
3. extrair somente `sub`;
4. aceitar somente UUID válido;
5. retornar `NULL` quando claims faltam ou são inválidos.

Assim, a policy não precisa de `USAGE` no schema gerenciado `auth` nem de função `SECURITY DEFINER` no estado final.

## 4. Gate JWT/Data API live - PASS

```text
Workflow: US-PRIV-001 live probe
Run #11: 35013092108
Job: 104529657936
Prepare isolated Neon fixtures: SUCCESS
Execute JWT, Data API and RLS matrix: SUCCESS
Cleanup synthetic fixtures: SUCCESS
```

A matriz atravessou Managed Better Auth, JWT, Data API e RLS com duas identidades sintéticas A/B e anônimo e cobriu:

- A cria/lê o próprio perfil;
- B não lê A;
- B não altera A;
- forged ownership é negado;
- transferência de ownership é negada;
- DELETE normal é negado;
- anônimo não lê perfil privado;
- fixtures de perfis e identidades são removidas ao final.

Owner/BYPASSRLS não participou da evidência user-scoped.

## 5. Promoção baseline non-production - PASS

Depois do gate live:

- `000009` e `000010` foram promovidas com checksums canônicos;
- Data API foi criada na baseline com Managed Better Auth;
- `add-default-grants` permaneceu falso;
- somente `caleida_profile` foi exposto;
- `db_anon_role = anonymous`;
- `jwt_role_claim_key = .role`;
- OpenAPI permaneceu desabilitado.

```text
Workflow: US-PRIV-001 baseline promotion
Run #1: 35239947088
Job: 105265502696
Canonical migration ledger: SUCCESS
Data API create/config readback: SUCCESS
```

Checksums na baseline:

```text
000009_profile_core.sql: 33f33c043c1a94b8ec4d5df3edd2a1fcb6c08d13abb3e128771687a576120de1
000010_profile_identity_claim_fix.sql: 4a47f6715566445bcbed2f56fb2a9a15d867c633e85e89375e487aaa3c1ec2be
```

## 6. Readback baseline - PASS

Readback direto no Neon confirmou:

- Data API `active`;
- somente `caleida_profile` em `db_schemas`;
- RLS habilitada e forçada em `caleida_profile.profiles`;
- policies somente `profiles_owner_insert`, `profiles_owner_select` e `profiles_owner_update`;
- `authenticated` com `INSERT`, `SELECT` e `UPDATE` na tabela;
- nenhum grant de tabela para `anonymous` ou `PUBLIC`;
- nenhum `DELETE` normal;
- diff de schema `verify-us-priv-001` versus baseline vazio.

A promoção revelou uma dependência de ordem: a Data API cria o papel gerenciado `authenticated`, enquanto `000009` concede privilégios somente se o papel já existir. Como as migrations foram promovidas antes do serviço, o bloco condicional inicialmente não concedeu ACL. Depois da criação da Data API foram reaplicados exatamente os grants já versionados em `000009`, sem privilégio novo, e o readback confirmou o estado esperado.

## 7. Merge e CI pós-merge - PASS

```text
PR #62: merged
Merge: 8aeb90cdc3b9b017aee3cefcd4e60b35f22d2758
Issue #61: closed/completed
CI main #280 / run 35241229260 / job 105269874527: SUCCESS
```

Após o fechamento não há Issue ou PR aberta no repositório.

## 8. Segurança e secrets

Nenhum endpoint real, JWT, OTP, senha, API key, cookie ou connection string foi persistido em Git, docs ou Issue/PR.

O workflow de promoção suprimiu o JSON de endpoint dos logs e mascarou `NEON_API_KEY`.

Production Neon não foi criada. Nenhum deployment Vercel foi executado.

## 9. Browser

`SKIPPED`: não existe runtime isolado configurado para essa branch e deployment Vercel é exclusivamente humano/manual. Esse skip não substituiu os gates obrigatórios de Data API/RLS, que estão em PASS.

## 10. Resultado

US-PRIV-001 está concluída. Código, CI, PostgreSQL 18, matriz live JWT/Data API/RLS, promoção/readback Neon, merge e CI pós-merge estão em PASS. A próxima Story canônica é US-PRIV-002, ainda não iniciada.
