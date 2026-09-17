# US-PRIV-001 - Verificação do perfil básico user-scoped

**Estado:** `PASS / READY_TO_MERGE`  
**Issue:** `#61` - aberta  
**PR:** `#62` - aberta / mergeable  
**Branch Git:** `feat/us-priv-001-profile-data-api-rls`  
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

Head funcional validado antes desta reconciliação documental:

```text
Head: 14c5e5cf28901746c3dd1cc824c0e03d2f36d7b7
CI #278
Run: 35012494049
Job: 104527930487
Conclusion: SUCCESS
```

Passaram:

- runtime contract;
- migration manifest;
- lint;
- typecheck;
- testes de contrato;
- build Next.js;
- PostgreSQL 18;
- `npm run verify:db`.

O contrato portátil cobre claims ausentes/malformados, owner read/write, outro usuário sem leitura/alteração, forged ownership, transferência de ownership, DELETE negado, anônimo negado e username inválido/reservado.

## 3. Correções encontradas durante a prova Neon

### 3.1 Acesso direto a `auth.uid()`

A primeira prova estrutural mostrou que `authenticated` não possuía `USAGE` genérico no schema gerenciado `auth`, como desejado. Abrir esse schema seria privilégio excessivo.

A solução transitória isolou a resolução de identidade, mas a prova live posterior mostrou que o boundary correto da Data API já disponibiliza claims validados em `request.jwt.claims`.

### 3.2 Identidade final por claims validados

A migration `000010_profile_identity_claim_fix.sql` tornou `caleida_profile.current_auth_user_id()` `SECURITY INVOKER` e passou a:

1. ler `current_setting('request.jwt.claims', true)`;
2. interpretar JSON de forma fail-closed;
3. extrair somente `sub`;
4. aceitar somente UUID válido;
5. retornar `NULL` quando claims faltam ou são inválidos.

Assim, a policy não precisa de `USAGE` no schema gerenciado `auth` nem de função `SECURITY DEFINER` no estado final.

## 4. Gate JWT/Data API live - PASS

O secret `NEON_API_KEY` ficou disponível no runtime do Actions sem exposição do valor. O probe já existente foi rerodado e concluiu integralmente:

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

- `000009` foi promovida com checksum canônico;
- `000010` foi promovida com checksum canônico;
- Data API foi criada na baseline com Managed Better Auth;
- `add-default-grants` permaneceu falso;
- somente `caleida_profile` foi exposto;
- `db_anon_role = anonymous`;
- `jwt_role_claim_key = .role`;
- OpenAPI permaneceu desabilitado.

Promotion probe:

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

## 7. Segurança e secrets

Nenhum endpoint real, JWT, OTP, senha, API key, cookie ou connection string foi persistido em Git, docs ou Issue/PR.

O workflow de promoção suprimiu o JSON de endpoint dos logs e mascarou `NEON_API_KEY`.

Production Neon não foi criada. Nenhum deployment Vercel foi executado.

## 8. Browser

`SKIPPED`: não existe runtime isolado configurado para essa branch e deployment Vercel é exclusivamente humano/manual. Esse skip não substituiu os gates obrigatórios de Data API/RLS, que estão em PASS.

## 9. Resultado

Todos os critérios de segurança de dados necessários para US-PRIV-001 estão em PASS. Resta somente o CI do head documental reconciliado e, mantendo PASS, merge de PR #62 e fechamento de Issue #61.
