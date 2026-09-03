# Ambientes e variáveis — Caleida

**Status:** contrato operacional canônico de configuração após US-AUTH-004  
**Decisões relacionadas:** `ADR-005`, `ADR-007` e `ADR-009`  
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

A baseline non-production possui Managed Better Auth, o migration ledger, a fundação de autorização/auditoria e o modelo de entrada controlada promovidos pelas Stories anteriores. O readback de US-AUTH-004 confirmou que o provedor de e-mail compartilhado do Neon Auth já atende desenvolvimento/non-production; não existe configuração SMTP externa no contrato atual.

A branch `verify-us-auth-001` foi removida após autorização explícita. A branch `verify-us-auth-002` também foi removida após autorização explícita. Existe temporariamente `verify-us-auth-004` (`br-plain-pond-aw5f59ia`), criada durante a investigação inicial de SMTP. Ela permanece com provider `shared`, não contém configuração externa e sua eventual exclusão exige nova autorização explícita; isso não bloqueia US-AUTH-005.

O projeto Neon Production **não está provisionado**. Portanto não existe connection string, endpoint Auth, cookie secret, domínio/remetente ou configuração de e-mail Production canônicos para registrar, configurar ou simular.

Neon Data API e Object Storage continuam não implementados para o produto.

### Vercel

Nenhum projeto/deployment Caleida foi criado como consequência destas Stories. Quando o projeto Vercel existir por ação humana deliberada, os escopos da plataforma devem ser mapeados assim:

| Caleida | Vercel | Dados permitidos |
|---|---|---|
| desenvolvimento local | Development/local `.env.local` | somente recursos locais, descartáveis ou non-production |
| non-production/staging | Preview | somente Neon non-production/branches isoladas e demais credenciais non-production |
| Production | Production | somente recursos Production dedicados |

O termo canônico `non-production/staging` não exige Vercel Custom Environment. Enquanto não houver decisão posterior, um Preview manual futuro representa o ambiente publicado não produtivo.

## 3. Contrato de arquivos locais

`.env.example` é o único arquivo `.env*` versionado e contém apenas declarações comentadas/documentação.

`.gitignore` mantém:

```text
.env*
!.env.example
```

Uso local futuro:

```text
.env.local              ← valores locais/non-production, nunca Production
.env.*.local            ← também permanece fora do Git quando criado por tooling/framework
```

O build e o CI padrão continuam funcionando sem variável externa porque a fronteira Auth é lazy e não inicializa o SDK durante build sem uma operação Auth real.

Para exercer Auth localmente, a configuração deve apontar somente para non-production/branch apropriada e permanecer em arquivo ignorado ou secret store equivalente.

## 4. Classificação das variáveis atuais

| Variável | Classe | Escopo atual | Regra |
|---|---|---|---|
| `DATABASE_URL` | secret server-only | runtime futuro | conexão pooled; ainda não é consumida pelo runtime normal da aplicação |
| `DATABASE_URL_UNPOOLED` | secret server-only | tooling de banco | conexão direta para migrations/testes/bootstrap; nunca browser |
| `CALEIDA_DB_TARGET` | controle não secreto | tooling de banco | aceita somente os alvos implementados pelo runner |
| `CALEIDA_NEON_BRANCH_ID` | identificador não secreto | tooling Neon | vincula o comando ao branch esperado; não concede acesso sozinho |
| `CALEIDA_ALLOW_BASELINE_MIGRATIONS` | confirmação não secreta | promoção non-production | só existe para ação deliberada de migrations na baseline |
| `NEON_AUTH_BASE_URL` | configuração server-only | Auth branch-scoped | endpoint Auth do ambiente em uso; não versionar valor real nem reutilizar entre ambientes |
| `NEON_AUTH_COOKIE_SECRET` | secret server-only | assinatura do cache de sessão | mínimo de 32 caracteres; nunca browser/Git/log persistente |
| `CALEIDA_BOOTSTRAP_OWNER_USER_ID` | identificador operacional não secreto | bootstrap owner non-production | deve ser UUID de identidade Neon Auth já existente; nunca e-mail/senha |
| `CALEIDA_BOOTSTRAP_REASON` | metadado operacional | bootstrap owner | motivo auditável entre 1 e 500 caracteres; não incluir secret/payload sensível |
| `CALEIDA_ALLOW_OWNER_BOOTSTRAP` | confirmação não secreta | bootstrap owner | deve ser exatamente `YES` no processo deliberado que executa o bootstrap |
| `NEXT_PUBLIC_*` | público | nenhum atualmente | só pode ser criado para dado intencionalmente público |

Connection strings e cookie/session secrets são sempre secrets. Um branch/project ID ou UUID de identidade já conhecida é identificador, não credencial; uma URL Auth operacional é tratada como configuração de ambiente e permanece fora do Git por política do Caleida.

Não existem no contrato atual credenciais de Resend, SMTP customizado ou remetente próprio. Um provedor externo de e-mail só será introduzido quando uma Story futura demonstrar necessidade material.

## 5. Desenvolvimento local

### Aplicação sem exercício de Auth

`npm run build`, lint, typecheck e testes não exigem variáveis Auth externas.

### Aplicação exercitando Neon Auth

Quando uma operação Auth real for exercitada localmente:

```text
NEON_AUTH_BASE_URL=<auth-endpoint-nonprod-ou-branch-isolada>
NEON_AUTH_COOKIE_SECRET=<server-only-random-secret-32+-chars>
```

O desenvolvimento local deve apontar exclusivamente para:

- `caleida-nonprod/main` quando for apropriado usar a baseline integrada; ou
- branch/recurso descartável quando a mudança exigir isolamento.

Production é proibida para desenvolvimento local.

Mensagens de Auth usam o provider compartilhado configurado no próprio Neon Auth nesta fase; não existe secret adicional de e-mail no runtime do Caleida.

### Banco efêmero

O gate PostgreSQL portável continua usando:

```text
DATABASE_URL_UNPOOLED=<direct-ephemeral-postgres-connection>
CALEIDA_DB_TARGET=ephemeral
```

Esse ambiente é descartável e não usa credencial Neon.

## 6. Non-production / staging

### Neon Auth

A baseline `caleida-nonprod/main` possui Neon Auth habilitado.

Configuração de runtime Auth:

```text
NEON_AUTH_BASE_URL=<branch-scoped-auth-endpoint>
NEON_AUTH_COOKIE_SECRET=<server-only-random-secret-32+-chars>
```

Cada branch Auth deve usar seu próprio endpoint. Cookie secrets não são copiados para Production e nunca são prefixados com `NEXT_PUBLIC_`.

Readback de US-AUTH-004 confirmou:

```text
Auth provider: better_auth
Email/password: enabled
Email provider: shared
Sender: Neon Auth
Require email verification: false
```

O provider compartilhado é o transporte canônico de Auth em desenvolvimento/non-production enquanto adequado ao beta fechado. `require_email_verification` permanece `false` até US-AUTH-005 provar o cadastro controlado de forma fail-closed.

### Runtime futuro de banco

Quando o runtime realmente passar a consumir banco:

```text
DATABASE_URL=<pooled-nonprod-connection>
```

A connection string deve ser obtida do ambiente/branch non-production correspondente e armazenada somente no secret store ou arquivo local ignorado apropriado.

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

Migrations de produto já versionadas e verificadas podem usar:

```text
DATABASE_URL_UNPOOLED=<direct-nonprod-baseline-connection>
CALEIDA_DB_TARGET=baseline
CALEIDA_NEON_BRANCH_ID=br-restless-cherry-awpcwy6r
CALEIDA_ALLOW_BASELINE_MIGRATIONS=YES
```

Em `US-AUTH-002`, `000001` e `000002` foram promovidas à baseline somente depois dos gates PostgreSQL 18 e Neon-specific em PASS. `US-AUTH-003` promoveu `000003` após os gates aplicáveis.

Recursos gerenciados do Neon, como Neon Auth, seguem promoção deliberada própria depois do gate Neon-specific; não são tratados como migrations de produto.

Esse fluxo é non-production. Não deve ser reinterpretado como mecanismo de promoção Production.

### Bootstrap inicial de proprietário

Quando existir uma identidade real apropriada e o bootstrap inicial for necessário:

```text
DATABASE_URL_UNPOOLED=<direct-neon-connection>
CALEIDA_DB_TARGET=neon-isolated|baseline
CALEIDA_NEON_BRANCH_ID=<branch-id-coerente-com-o-alvo>
CALEIDA_BOOTSTRAP_OWNER_USER_ID=<existing-neon-auth-user-uuid>
CALEIDA_BOOTSTRAP_REASON=<auditable-reason>
CALEIDA_ALLOW_OWNER_BOOTSTRAP=YES
```

Regras:

- a identidade deve existir previamente no Neon Auth;
- o script não cria conta e não aceita e-mail/senha;
- a operação é server-only e auditável;
- `CALEIDA_ALLOW_BASELINE_MIGRATIONS` não substitui `CALEIDA_ALLOW_OWNER_BOOTSTRAP`; são confirmações de operações diferentes;
- nenhum bootstrap foi executado na baseline porque não existe usuário real apropriado.

## 7. Production

Production exige projeto Neon separado conforme `ADR-005`, mas ele ainda não existe.

Até uma Story explícita provisionar e proteger esse ambiente:

- não existe `DATABASE_URL` Production canônica;
- não existe `DATABASE_URL_UNPOOLED` Production canônica;
- não existe `NEON_AUTH_BASE_URL` Production canônica;
- não existe `NEON_AUTH_COOKIE_SECRET` Production canônico;
- não existe domínio/remetente/provedor de e-mail Production aprovado;
- não existe alvo `CALEIDA_DB_TARGET` Production no runner;
- não se reutiliza `baseline` para chegar a Production;
- nenhum valor fictício deve ser criado para aparentar que Production está configurada.

Uma futura Story que habilitar migrations/identidade em Production deve introduzir guardrails explícitos antes de qualquer operação real. A estratégia de e-mail também deve ser reavaliada antes de abertura pública/Production; o provider compartilhado do Neon não é declarado solução definitiva de Production.

## 8. Exposição ao browser

No Next.js, nomes `NEXT_PUBLIC_*` são destinados a valores públicos incorporados ao código do cliente. Portanto são proibidos para:

- `DATABASE_URL`;
- `DATABASE_URL_UNPOOLED`;
- senhas/tokens Neon;
- `NEON_AUTH_COOKIE_SECRET`;
- secrets de Neon Auth/Data API;
- OAuth client secrets;
- cookie/session secrets;
- Vercel tokens;
- credenciais futuras de Storage/e-mail/APIs privadas.

O Caleida não necessita nenhuma variável `NEXT_PUBLIC_*` nesta fase.

## 9. Vercel — configuração futura de secrets

Quando o usuário criar o projeto Vercel e uma release realmente exigir variáveis:

- Development deve receber somente configuração adequada a desenvolvimento/non-production;
- Preview deve receber somente configuração non-production;
- Production deve receber somente configuração Production dedicada;
- secrets devem usar os controles de proteção/sensibilidade disponíveis na plataforma quando aplicável;
- nunca copiar o conjunto Production inteiro para Preview apenas para fazer uma release funcionar.

Configurar variável Vercel não autoriza deployment. Release continua regida por `ADR-007` e `docs/VERCEL_RELEASE.md`.

Variáveis de sistema fornecidas automaticamente pela Vercel, como `VERCEL_ENV`, não fazem parte do contrato configurável do Caleida e não devem ser recriadas manualmente sem necessidade específica.

## 10. CI

O CI permanente usa somente um PostgreSQL 18 efêmero e valores locais do próprio workflow para esse container.

Ele não depende de:

- connection string Neon;
- Neon API key;
- Vercel token;
- Auth endpoint/secret;
- secret externo do repositório para executar os gates padrão;
- secret externo de e-mail.

A integração Auth é lazy para permitir que `npm run verify` prove lint/typecheck/test/build sem puxar credenciais externas para o CI padrão.

Uma Story futura só pode adicionar secret ao CI quando houver requisito técnico explícito e revisão de segurança correspondente. CI continua sem CD.

## 11. Fontes externas revalidadas

Em `US-PLAT-009` foram revalidados Vercel Environment Variables e o contrato Neon de URLs pooled/unpooled.

Em `US-AUTH-001`, em 02/09/2026, foram revalidados:

- SDK oficial Neon Auth para Next.js;
- `createNeonAuth()`, handler catch-all e `getSession()` server-side;
- requisito corrente de cookie secret com pelo menos 32 caracteres;
- cache de dados de sessão com TTL configurável;
- isolamento Auth branch-scoped do Neon.

Em `US-AUTH-002`, em 03/09/2026, a documentação oficial corrente do Managed Better Auth confirmou que o papel Admin do provedor governa APIs de gestão Auth e não deve ser confundido com os cinco papéis de produto do Caleida.

Em `US-AUTH-004`, em 03/09/2026, o readback remoto confirmou o provider compartilhado do Neon Auth em non-production. Revalidar limites/comportamento do e-mail compartilhado quando uma Story passar a depender deles operacionalmente.

Revalidar novamente a documentação corrente na Story que efetivamente configurar Vercel, Neon Production, Data API, OAuth, provedor externo de e-mail ou política de revogação de sessão.
