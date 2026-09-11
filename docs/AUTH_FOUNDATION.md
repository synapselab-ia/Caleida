# Fundação Neon Auth — Caleida

**Status:** contrato técnico evoluído até `US-AUTH-007`  
**Capacidade:** CAP-01  
**Plataforma:** `ADR-005` + `docs/NEON_PLATFORM.md`  
**Ambientes:** `docs/ENVIRONMENTS.md`  
**Sessões e senha:** `docs/SESSION_SECURITY.md`

## 1. Escopo

Managed Better Auth no Neon é a identidade canônica do Caleida. O produto não duplica senha, token de sessão ou credencial em schema próprio.

O SDK oficial permanece fixado em:

```text
@neondatabase/auth 0.5.0-beta
```

A fixação exata é deliberada porque a linha atual continua beta. Atualizações exigem nova leitura da documentação/implementação corrente e gates de regressão.

## 2. Estado Neon non-production

Baseline canônica:

```text
Projeto: caleida-nonprod
Project ID: patient-glade-95136440
Baseline: main / br-restless-cherry-awpcwy6r
PostgreSQL: 18
Auth provider: better_auth
Auth schema: neon_auth
Email/password: enabled
Require email verification: true
Email verification: OTP
Email provider: shared Neon
```

IDs de recurso não são credenciais. Auth URL, connection string, senha, cookie secret, recovery token e session token nunca são registrados no Git.

## 3. Integração Next.js

A fronteira server-only está em:

```text
src/lib/auth/server.ts
src/lib/auth/actions.ts
src/lib/auth/session-management.ts
src/app/api/auth/[...path]/route.ts
```

`createServerAuth()` é lazy: configuração real só é lida quando uma operação Auth é executada. Isso mantém build/CI portáveis sem exigir secrets externos durante compilação.

`getServerSession()` não converte erro do provider em sessão válida. Rotas privadas continuam protegidas no servidor antes de renderizar conteúdo privado.

## 4. Fail-closed e secrets

A fronteira Auth falha explicitamente quando:

- `NEON_AUTH_BASE_URL` está ausente, inválida ou não usa HTTPS;
- `NEON_AUTH_COOKIE_SECRET` está ausente ou possui menos de 32 caracteres.

A presença de cookie no request nunca é tratada como autorização suficiente. A aplicação não usa `localStorage`, `sessionStorage` ou cookie acessado por JavaScript como autoridade de autenticação.

## 5. Cache e revogação de sessão

O SDK assina um cache de dados da sessão separado do token de sessão. Até US-AUTH-006 o Caleida usava 300 segundos. US-AUTH-007 reduziu deliberadamente para:

```text
sessionDataTtl = 1 segundo
```

A implementação corrente do SDK aceita apenas TTL positivo; `0` é configuração inválida. Um segundo é o menor valor positivo usado pelo Caleida para limitar a janela em que uma rota comum pode reutilizar dados assinados antes de nova validação upstream.

Semântica vigente:

- operações sensíveis do Better Auth, como troca de senha e revogação, usam validação autoritativa do estado server-side na implementação upstream corrente;
- uma sessão revogada em outro dispositivo pode manter apenas o cache de dados já assinado por no máximo aproximadamente 1 segundo antes de nova validação do boundary normal;
- `signOut()` da sessão atual limpa o fluxo local imediatamente conforme resposta do provider;
- alteração autenticada de senha usa `revokeOtherSessions: true`;
- revogação individual resolve o bearer token somente no servidor a partir de um `session.id` opaco recebido da UI;
- session tokens nunca são serializados para os componentes do Caleida.

Contrato detalhado: `docs/SESSION_SECURITY.md`.

## 6. Recuperação e alteração de senha

US-AUTH-007 usa as superfícies oficiais do SDK corrente:

```text
requestPasswordReset()
resetPassword()
changePassword()
listSessions()
revokeSession()
revokeOtherSessions()
```

Regras do Caleida:

- solicitação de recuperação sempre apresenta resposta genérica, evitando enumeração de conta;
- callback de recuperação é derivado da origem same-origin validada pelo request; nenhuma URL pública fixa é versionada;
- token de recuperação é consumido pelo provider e não é registrado em logs/docs;
- nova senha deve possuir 8–128 caracteres no boundary do produto, além da validação do provider;
- alteração autenticada exige senha atual e encerra as demais sessões;
- consulta de sessões expõe apenas metadados não-bearer necessários à gestão.

A implementação Better Auth corrente usa token de reset de uso único e expiração padrão de uma hora. O reset só remove todas as sessões automaticamente quando a configuração server-side `revokeSessionsOnPasswordReset` está habilitada. O Managed Neon atual não expõe essa opção na configuração `email_and_password` observada pelo Caleida; portanto o produto **não afirma** que um reset por e-mail revoga automaticamente sessões pré-existentes. Sessões continuam explicitamente revogáveis pela área de segurança, e essa limitação entra na matriz live de `US-AUTH-008`.

## 7. Variáveis

Somente nomes/propósitos são versionados:

| Variável | Classe | Regra |
|---|---|---|
| `NEON_AUTH_BASE_URL` | configuração server-side branch-scoped | endpoint Auth do ambiente correspondente; nunca reutilizar Production/non-production |
| `NEON_AUTH_COOKIE_SECRET` | secret server-only | 32+ caracteres; nunca `NEXT_PUBLIC_*`, Git, Issue ou log persistente |

`.env.example` contém apenas nomes/placeholders seguros. O callback de recuperação não adiciona variável pública de origem: ele deriva a origem da requisição same-origin válida.

## 8. Gate Neon-specific

Mudanças que dependem do Managed Better Auth usam branch Neon isolada. Para US-AUTH-007:

```text
verify-us-auth-007 / br-wandering-mountain-awjnqqps
```

O readback confirmou provider Better Auth, email/password, verificação por OTP e provider de e-mail compartilhado. A branch iniciou sem usuários, sessões, accounts ou verificações e permaneceu sem drift de schema contra a baseline.

Branches de verificação não são removidas automaticamente porque exclusão é destrutiva e exige autorização explícita.

## 9. Browser/live

Preview Vercel não é gate por Story. US-AUTH-007 foi estruturada para ser verificável por CI, contratos server-side, leitura upstream corrente e branch Neon isolada.

A entrega real do link de recuperação, trusted origin de uma release candidate, login pós-reset e revogação multi-dispositivo entram na matriz integrada `US-AUTH-008`. Se essa matriz exigir runtime público, deve usar uma única release candidate manual conforme `00_SYSTEM/DEPLOYMENT_POLICY.md`.

## 10. Referências correntes revalidadas

Em 10/09/2026 foram revalidados:

- `@neondatabase/auth@0.5.0-beta` e `packages/auth/NEXT-JS.md` no repositório oficial `neondatabase/neon-js`;
- configuração de `sessionDataTtl` e validação de TTL positivo no SDK;
- endpoints de password/session do SDK;
- implementação corrente do Better Auth para reset, sessão autoritativa e revogação;
- configuração real do Managed Neon Auth em branch isolada.

Revalidar novamente antes de mudança de SDK, OAuth/MFA ou configuração gerenciada de segurança.
