# Ambientes e variáveis — Caleida

**Status:** contrato operacional canônico após US-AUTH-004  
**Decisões relacionadas:** `ADR-005`, `ADR-007`, `ADR-009`  
**Plataforma:** `docs/NEON_PLATFORM.md`  
**E-mail:** `docs/EMAIL_TRANSPORT.md`  
**Release:** `docs/VERCEL_RELEASE.md`

Este documento define como configuração e secrets devem ser separados entre desenvolvimento local, non-production/staging e Production. Ele documenta **nomes, escopos e regras**; valores reais permanecem fora do Git.

## 1. Princípio central

Os ambientes do Caleida não compartilham credenciais por conveniência.

```text
local
  ↓ somente recursos descartáveis ou non-production
non-production / staging
  ↓ isolado de Production
Production
  ↓ projeto/segredos próprios, quando provisionados
```

Regras obrigatórias:

- nunca usar credencial Production em desenvolvimento local, CI, Preview ou staging;
- nunca usar credencial non-production como substituto de uma futura credencial Production;
- nenhum secret, token, senha ou connection string é versionado;
- variáveis server-only nunca recebem prefixo `NEXT_PUBLIC_`;
- qualquer nova variável deve ser classificada neste contrato ou em documentação de domínio aplicável antes de depender dela operacionalmente.

## 2. Estado real após US-AUTH-004

### Neon

Existe somente o projeto non-production:

```text
Projeto: caleida-nonprod
Project ID: patient-glade-95136440
PostgreSQL: 18
Baseline: main
Branch ID: br-restless-cherry-awpcwy6r
Managed Better Auth: habilitado
Email provider Auth: shared Neon
Require email verification: false
Migrations: 000001 + 000002 + 000003
Data API: não provisionada
```

A baseline non-production possui a fundação Auth, autorização/auditoria e entrada controlada das Stories US-AUTH-001 a 003. O readback de US-AUTH-004 confirmou que o provedor de e-mail compartilhado do Neon Auth já atende o ambiente de desenvolvimento/non-production, portanto não existe configuração Resend/SMTP própria no contrato atual.

Existe também a branch temporária:

```text
verify-us-auth-004 / br-plain-pond-aw5f59ia / ready
```

Ela foi criada durante a investigação de SMTP antes da decisão final de manter o provider compartilhado. Não contém configuração externa e tornou-se desnecessária. Sua exclusão exige autorização explícita por ser ação destrutiva e não bloqueia a próxima Story.

O projeto Neon Production **não está provisionado**. Portanto não existe connection string, endpoint Auth, cookie secret, domínio/remetente ou provedor de e-mail Production canônico.

Neon Data API e Object Storage continuam não implementados para o produto.

### Vercel

Nenhum deployment Caleida é criado por IA. Quando o projeto Vercel existir/for usado por ação humana deliberada, os escopos devem ser mapeados assim:

| Caleida | Vercel | Dados permitidos |
|---|---|---|
| desenvolvimento local | Development/local `.env.local` | somente recursos locais, descartáveis ou non-production |
| non-production/staging | Preview manual | somente Neon non-production/branches isoladas e demais credenciais non-production |
| Production | Production manual | somente recursos Production dedicados |

Configurar variável Vercel não autoriza deployment.

## 3. Contrato de arquivos locais

`.env.example` é o único arquivo `.env*` versionado e contém apenas declarações comentadas/documentação.

`.gitignore` mantém:

```text
.env*
!.env.example
```

Uso local:

```text
.env.local
.env.*.local
```

Esses arquivos ficam fora do Git.

O build e o CI padrão continuam funcionando sem variável externa porque a fronteira Auth é lazy e não inicializa o SDK durante build sem operação Auth real.

## 4. Classificação das variáveis atuais

| Variável | Classe | Escopo atual | Regra |
|---|---|---|---|
| `DATABASE_URL` | secret server-only | runtime futuro | conexão pooled; ainda não consumida pelo runtime normal |
| `DATABASE_URL_UNPOOLED` | secret server-only | tooling de banco | migrations/testes/bootstrap; nunca browser |
| `CALEIDA_DB_TARGET` | controle não secreto | tooling de banco | aceita somente alvos implementados pelo runner |
| `CALEIDA_NEON_BRANCH_ID` | identificador não secreto | tooling Neon | vincula comando ao branch esperado |
| `CALEIDA_ALLOW_BASELINE_MIGRATIONS` | confirmação não secreta | promoção non-production | exigida para migration deliberada na baseline |
| `NEON_AUTH_BASE_URL` | configuração server-only | Auth branch-scoped | endpoint do ambiente correspondente |
| `NEON_AUTH_COOKIE_SECRET` | secret server-only | Auth | mínimo de 32 caracteres; nunca browser/Git |
| `CALEIDA_BOOTSTRAP_OWNER_USER_ID` | identificador operacional | bootstrap owner | UUID de identidade Neon Auth existente |
| `CALEIDA_BOOTSTRAP_REASON` | metadado operacional | bootstrap owner | motivo auditável; sem secret |
| `CALEIDA_ALLOW_OWNER_BOOTSTRAP` | confirmação | bootstrap owner | deve ser `YES` em operação deliberada |
| `NEXT_PUBLIC_*` | público | nenhum atualmente | somente dado intencionalmente público |

Não existem no contrato atual `RESEND_API_KEY`, credencial SMTP ou remetente próprio. Um provedor externo será introduzido somente por Story/ADR futuros quando houver requisito material.

## 5. Desenvolvimento local

### Aplicação sem exercício de Auth

`npm run build`, lint, typecheck e testes não exigem variáveis Auth externas.

### Aplicação exercitando Neon Auth

Quando uma operação Auth real for exercitada localmente:

```text
NEON_AUTH_BASE_URL=<auth-endpoint-nonprod-ou-branch-isolada>
NEON_AUTH_COOKIE_SECRET=<server-only-random-secret-32+-chars>
```

O desenvolvimento local deve apontar exclusivamente para `caleida-nonprod` ou recurso descartável apropriado. Production é proibida para desenvolvimento local.

O envio de mensagens de Auth usa o provider compartilhado configurado no próprio Neon Auth; não há secret adicional de e-mail no runtime do Caleida nesta fase.

### Banco efêmero

```text
DATABASE_URL_UNPOOLED=<direct-ephemeral-postgres-connection>
CALEIDA_DB_TARGET=ephemeral
```

Esse é o gate PostgreSQL 18 portável.

## 6. Non-production / staging

### Neon Auth

A baseline `caleida-nonprod/main` possui Neon Auth habilitado.

Configuração de runtime Auth:

```text
NEON_AUTH_BASE_URL=<branch-scoped-auth-endpoint>
NEON_AUTH_COOKIE_SECRET=<server-only-random-secret-32+-chars>
```

Readback de 03/09/2026:

```text
Auth provider: better_auth
Email/password: enabled
Email provider: shared
Sender: Neon Auth
Require email verification: false
```

O provider compartilhado é o transporte canônico de Auth para desenvolvimento/non-production enquanto adequado ao beta fechado.

`require_email_verification` permanece `false` até US-AUTH-005 conectar o cadastro controlado ao fluxo de confirmação de forma fail-closed.

### Runtime futuro de banco

Quando o runtime realmente passar a consumir banco:

```text
DATABASE_URL=<pooled-nonprod-connection>
```

A connection string deve ser armazenada somente em secret store/arquivo local ignorado apropriado.

### Gate Neon-specific isolado

Quando uma mudança depender de comportamento específico do Neon:

```text
DATABASE_URL_UNPOOLED=<direct-disposable-neon-branch-connection>
CALEIDA_DB_TARGET=neon-isolated
CALEIDA_NEON_BRANCH_ID=<disposable-neon-branch-id>
NEON_AUTH_BASE_URL=<disposable-branch-auth-endpoint>    # quando Auth fizer parte do gate
NEON_AUTH_COOKIE_SECRET=<isolated-server-only-secret>  # quando Auth fizer parte do gate
```

A baseline `main` não pode ser usada como branch `neon-isolated`.

### Promoção deliberada da baseline non-production

Migrations versionadas e verificadas podem usar:

```text
DATABASE_URL_UNPOOLED=<direct-nonprod-baseline-connection>
CALEIDA_DB_TARGET=baseline
CALEIDA_NEON_BRANCH_ID=br-restless-cherry-awpcwy6r
CALEIDA_ALLOW_BASELINE_MIGRATIONS=YES
```

Esse fluxo não é mecanismo de promoção Production.

### Bootstrap inicial de proprietário

Quando existir identidade real apropriada:

```text
DATABASE_URL_UNPOOLED=<direct-neon-connection>
CALEIDA_DB_TARGET=neon-isolated|baseline
CALEIDA_NEON_BRANCH_ID=<branch-id-coerente-com-o-alvo>
CALEIDA_BOOTSTRAP_OWNER_USER_ID=<existing-neon-auth-user-uuid>
CALEIDA_BOOTSTRAP_REASON=<auditable-reason>
CALEIDA_ALLOW_OWNER_BOOTSTRAP=YES
```

O script não cria conta nem aceita e-mail/senha. Nenhum bootstrap foi executado na baseline porque ainda não existe usuário real apropriado.

## 7. Production

Production exige projeto Neon separado conforme `ADR-005`, mas ele ainda não existe.

Até uma Story explícita provisionar e proteger esse ambiente:

- não existe `DATABASE_URL`/`DATABASE_URL_UNPOOLED` Production canônica;
- não existe `NEON_AUTH_BASE_URL`/cookie secret Production canônico;
- não existe domínio/remetente/provedor de e-mail Production aprovado;
- não existe alvo `CALEIDA_DB_TARGET` Production;
- não se reutiliza non-production para simular Production.

Antes de abertura pública/Production, a estratégia de e-mail deve ser reavaliada; o provider compartilhado do Neon não é declarado solução definitiva de Production.

## 8. Exposição ao browser

São proibidos em `NEXT_PUBLIC_*`:

- URLs/credenciais de banco privadas;
- senhas/tokens Neon;
- `NEON_AUTH_COOKIE_SECRET`;
- OAuth client secrets;
- Vercel tokens;
- credenciais futuras de Storage/e-mail/APIs privadas.

O Caleida não necessita nenhuma variável `NEXT_PUBLIC_*` nesta fase.

## 9. Vercel — configuração futura de secrets

Quando uma release manual realmente exigir variáveis:

- Development recebe apenas configuração adequada a local/non-production;
- Preview recebe somente non-production;
- Production recebe somente recursos Production dedicados;
- nunca copiar o conjunto Production inteiro para Preview.

Configurar variável não autoriza deployment. Release continua regida por `ADR-007`.

## 10. CI

O CI permanente usa somente PostgreSQL 18 efêmero e valores locais do workflow para os gates padrão.

Ele não depende de:

- connection string Neon;
- Neon API key;
- Vercel token;
- Auth endpoint/secret;
- secret externo de e-mail.

A integração Auth é lazy para permitir `npm run verify` sem credenciais externas. CI continua sem CD.

## 11. Revalidação futura

Revalidar documentação corrente quando uma Story efetivamente alterar:

- Vercel;
- Neon Production;
- Data API;
- OAuth;
- limites/comportamento do e-mail compartilhado;
- provedor SMTP externo;
- revogação de sessão.
