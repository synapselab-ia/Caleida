# US-PRIV-001 - Verificação do perfil básico user-scoped

**Estado:** `BLOCKED / MANUAL_ACTION_REQUIRED`  
**Issue:** `#61` - aberta  
**PR:** `#62` - aberta  
**Branch Git:** `feat/us-priv-001-profile-data-api-rls`  
**Branch Neon isolada:** `verify-us-priv-001 / br-silent-rain-aw4fqrhg`  
**Baseline Neon:** `main / br-restless-cherry-awpcwy6r`

## 1. Escopo implementado

A Story já materializa, sem antecipar Stories posteriores:

- migration `000009_profile_core.sql`;
- schema de produto `caleida_profile`, separado de `neon_auth`;
- tabela `caleida_profile.profiles` com ownership por UUID Auth;
- username normalizado, route-safe, case-insensitive unique e com nomes reservados bloqueados;
- `display_name` básico;
- visibilidade fixa/default `only_me` nesta Story;
- RLS habilitada e forçada desde a criação;
- policies somente para `SELECT`, `INSERT` e `UPDATE` do owner;
- nenhum grant/policy de `DELETE` para o caminho normal;
- wrapper `current_auth_user_id()` limitado à resolução de `auth.uid()`;
- grants mínimos ao papel `authenticated` sem abrir genericamente o schema `auth`;
- boundary server-only de Data API usando JWT da sessão, sem `DATABASE_URL` no CRUD normal;
- rota privada `/account/profile` para criar/editar username e nome de exibição;
- estados de perfil ausente, loading, erro, pending e sucesso;
- nenhum campo de formulário capaz de definir `auth_user_id` ou visibilidade;
- link de acesso à área de perfil em `/app`.

Avatar, banner, catálogo, favoritos, relações sociais, perfil público e ciclo de exclusão continuam fora do escopo.

## 2. Gate portável - PASS

A implementação atual passou no CI:

```text
CI #263
Run: 34981001267
Job: 104421003400
Conclusion: SUCCESS
```

Passaram:

- runtime Node/npm;
- migration manifest;
- lint;
- typecheck;
- testes de contrato;
- build Next.js;
- PostgreSQL 18;
- `npm run verify:db`.

O contrato adversarial cobre:

- `only_me` default;
- owner read/write;
- outro usuário sem leitura/alteração;
- tentativa de forged ownership negada;
- tentativa de transferência de ownership negada;
- `DELETE` negado;
- anônimo negado;
- username inválido/reservado negado.

## 3. Gate Neon isolado estrutural - PASS

Na branch `verify-us-priv-001`:

- Managed Better Auth está habilitado;
- Data API está ativa somente na branch isolada;
- somente `caleida_profile` foi exposto pela Data API;
- default grants amplos não foram utilizados;
- migration `000009_profile_core.sql` está aplicada e registrada no ledger com checksum canônico;
- sem JWT, `auth.uid()` resolve `NULL`;
- sem JWT, o papel `authenticated` enxerga zero perfis;
- `anonymous` não possui `SELECT` no perfil;
- `authenticated` não possui `DELETE`;
- não existe policy de `DELETE`.

A baseline non-production continua em `000001-000008` e sem Data API. Nenhuma promoção ocorreu.

## 4. Defeito encontrado no Neon real e correção - PASS

A primeira execução isolada mostrou que chamar `auth.uid()` diretamente sob `authenticated` falhava porque o papel não possui `USAGE` no schema gerenciado `auth`.

A correção não abriu o schema gerenciado. O Caleida passou a usar `caleida_profile.current_auth_user_id()` como wrapper `SECURITY DEFINER`, com superfície limitada a retornar o UUID de `auth.uid()` e `search_path` fixado em `pg_catalog`.

O teste portável foi ajustado para reproduzir esse boundary sem conceder `USAGE` em `auth` ao papel de aplicação.

## 5. Gate JWT/Data API live - BLOCKED

A Story exige evidência com duas identidades sintéticas reais A/B e anônimo atravessando Managed Better Auth, JWT, Data API e RLS. Owner/BYPASSRLS não substitui esse gate.

Foi preparado o probe descartável:

```text
Branch: probe/us-priv-001-live
Workflow: US-PRIV-001 live probe
Run #4: 34981435532
Job: 104422466974
```

Resultado atual:

- sintaxe do probe: PASS;
- preflight de `NEON_API_KEY`: FAIL-CLOSED porque o secret não existe no GitHub Actions;
- matriz JWT/Data API: SKIPPED pelo preflight;
- cleanup: SUCCESS;
- nenhum Auth URL, Data API URL, JWT, OTP, senha ou connection string foi persistido no Git ou emitido como evidência.

O probe já está preparado para, quando autorizado por secret em runtime:

1. descobrir endpoints branch-scoped sem versioná-los;
2. criar duas identidades Auth sintéticas;
3. obter OTPs e JWTs reais;
4. provar A vs B vs anônimo pela Data API;
5. provar ownership, leitura/alteração cruzada, forged ownership, transferência e `DELETE`;
6. limpar perfis e identidades sintéticas ao final.

## 6. Ação manual necessária

Configurar no repositório GitHub Actions um secret chamado:

```text
NEON_API_KEY
```

O valor deve ser uma chave Neon com acesso somente ao necessário no projeto non-production para o probe. A chave não deve ser enviada pelo chat nem versionada.

Depois da configuração, a próxima execução deve apenas rerodar o job live existente. Não é necessário recriar Issue, PR, branch Git, branch Neon, migration ou Data API isolada.

## 7. Promoção permanece proibida neste estado

Enquanto o gate live estiver bloqueado:

- não promover `000009` para a baseline Neon;
- não provisionar Data API na baseline;
- não mergear PR #62 como concluída;
- não iniciar US-PRIV-002;
- não criar Production Neon;
- não executar deployment Vercel.

Se o gate live passar, a sequência seguinte será promoção deliberada da migration/configuração para a baseline non-production, readback, CI final, reconciliação documental e merge da Story.

## 8. Browser

`SKIPPED` nesta etapa: não existe runtime isolado configurado para esta branch Neon e deployment Vercel é exclusivamente humano/manual. Esse skip não substitui nem reduz o gate obrigatório JWT/Data API/RLS.
