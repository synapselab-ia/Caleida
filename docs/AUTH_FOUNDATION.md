# Fundação Neon Auth — Caleida

**Status:** contrato técnico implementado em `US-AUTH-001`  
**Capacidade:** CAP-01  
**Plataforma:** `ADR-005` + `docs/NEON_PLATFORM.md`  
**Ambientes:** `docs/ENVIRONMENTS.md`

## 1. Escopo

Esta Story materializa somente a fronteira técnica de identidade/sessão. Ela não cria telas ou jornadas de cadastro/login e não modela convites, papéis, Data API, e-mail ou schema funcional de produto.

O SDK oficial fica fixado em:

```text
@neondatabase/auth 0.5.0-beta
```

A fixação exata é deliberada porque a linha atual permanece beta e pode introduzir mudanças incompatíveis entre versões menores.

## 2. Estado Neon verificado

A baseline canônica non-production é:

```text
Projeto: caleida-nonprod
Project ID: patient-glade-95136440
Baseline: main
Branch ID: br-restless-cherry-awpcwy6r
PostgreSQL: 18
Auth provider: better_auth
Auth schema: neon_auth
```

Para o gate Neon-specific de US-AUTH-001 foi criada uma branch descartável isolada:

```text
Branch: verify-us-auth-001
Branch ID: br-snowy-hall-aw9uv2gn
Parent: br-restless-cherry-awpcwy6r
Compute: ep-curly-leaf-awe7kn8q
Auth provider: better_auth
Auth schema: neon_auth
```

IDs de recurso não são credenciais. Nenhuma connection string, senha, cookie secret ou Auth URL real é registrada no Git.

Sequência aplicada:

1. antes da Story, `get_auth` na baseline retornava Auth não habilitado;
2. o provisionamento inicial ocorreu exclusivamente na branch descartável;
3. o schema gerenciado `neon_auth` foi verificado na branch isolada;
4. a baseline foi relida e continuava sem Auth durante a experimentação;
5. o código corrigido passou `npm run verify`, PostgreSQL 18 e `verify:db`;
6. somente então Neon Auth Better Auth foi provisionado deliberadamente na baseline non-production;
7. o schema `neon_auth` foi confirmado na baseline depois da promoção.

Nenhum usuário foi criado para realizar esse gate.

## 3. Integração Next.js

A API oficial corrente para Next.js usa:

```text
createNeonAuth()
auth.handler()
auth.getSession()
```

O Caleida materializa isso em:

```text
src/lib/auth/server.ts
src/app/api/auth/[...path]/route.ts
```

A fronteira é deliberadamente server-only.

`createServerAuth()` é lazy: configuração é lida somente quando uma operação Auth é executada. Isso preserva `npm run build` e o CI padrão sem exigir secrets externos quando nenhuma chamada Auth ocorre durante o build.

O handler catch-all corrente do SDK recebe dois argumentos: request e contexto com `params: Promise<{ path: string[] }>`. A rota do Caleida encaminha ambos explicitamente. O primeiro CI da PR detectou corretamente a omissão do contexto por typecheck; a correção foi feita sem relaxar gates e um teste de regressão passou a proteger essa assinatura.

A rota proxy expõe apenas `GET` e `POST` nesta Story. Nenhum client SDK, Auth UI do produto ou `proxy.ts` é criado porque ainda não existe fluxo ou rota privada real a proteger.

## 4. Fail-closed

A criação da fronteira Auth falha explicitamente quando:

- `NEON_AUTH_BASE_URL` está ausente;
- a URL é inválida;
- a URL não usa HTTPS;
- `NEON_AUTH_COOKIE_SECRET` está ausente;
- o cookie secret possui menos de 32 caracteres.

`getServerSession()` não converte erro do provedor em sessão válida. Falha de validação lança erro sanitizado, sem ecoar token, cookie ou configuração.

A presença de cookie no request nunca é tratada como prova de autorização; sessão é resolvida pelo SDK server-side.

## 5. Cache de sessão

O SDK atual assina um cache de dados de sessão em cookie. O Caleida fixa nesta fundação:

```text
sessionDataTtl = 300 segundos
```

Esse TTL não equivale ao TTL do token de sessão. Ele limita por quanto tempo dados de sessão podem ser reutilizados antes de nova validação upstream.

Consequência: `US-AUTH-007` deve medir e aprovar explicitamente a semântica de revogação; não pode assumir invalidação instantânea enquanto o cache estiver vigente.

## 6. Variáveis

Somente nomes/propósitos são versionados:

| Variável | Classe | Regra |
|---|---|---|
| `NEON_AUTH_BASE_URL` | configuração server-side branch-scoped | endpoint do Auth do ambiente correspondente; nunca reutilizar Production/non-production |
| `NEON_AUTH_COOKIE_SECRET` | secret server-only | 32+ caracteres aleatórios; nunca `NEXT_PUBLIC_*`, Git, Issue ou log persistente |

`.env.example` contém apenas declarações comentadas/placeholders seguros.

Production Neon continua inexistente; nenhum valor Production é criado ou simulado.

## 7. Gate Neon-specific

A prova desta Story cobriu:

- branch filha separada da baseline;
- compute read-write próprio;
- Neon Auth Better Auth provisionado na branch isolada;
- schema gerenciado `neon_auth` disponível pelo serviço;
- endpoint Auth branch-scoped distinto da baseline;
- baseline não usada como laboratório;
- promoção deliberada à baseline somente depois dos gates técnicos;
- confirmação pós-promoção do Auth/schema gerenciado na baseline.

A branch descartável permanece pendente de remoção segura porque a ferramenta classifica exclusão de branch como ação destrutiva que exige autorização explícita.

## 8. Dependência beta e observações de instalação

O `npm ci` da Story resolveu o SDK exato e terminou com auditoria de zero vulnerabilidades conhecidas, mas o pacote corrente traz dependências transitivas de Auth UI/Better Auth que emitem warnings de peer dependency e depreciação em pacotes internos de e-mail.

O Caleida não declara nem importa `@neondatabase/auth-ui` diretamente nesta Story. Esses warnings são tratados como risco upstream da versão beta e devem ser reavaliados antes de ampliar a superfície de Auth ou atualizar o SDK.

## 9. Non-goals preservados

US-AUTH-001 não implementa:

- signup/signin/logout funcional;
- client Auth ou Auth UI do produto;
- convite/lista de espera;
- papéis/autorização de produto;
- Data API;
- migrations/RLS de produto;
- SMTP/e-mail;
- OAuth;
- usuários remotos de teste;
- Production Neon;
- Preview/Production Vercel.

## 10. Referências correntes revalidadas

Em 02/09/2026 foram revalidados:

- Neon Auth Next.js SDK — `packages/auth/NEXT-JS.md` no repositório oficial `neondatabase/neon-js`;
- implementação corrente de `createNeonAuth()` e do handler catch-all no mesmo repositório;
- validação corrente do cookie secret;
- documentação oficial Neon Auth/branchable identity;
- Next.js 16 — `proxy.ts` como convenção atual, sem tratá-lo como substituto de autorização server-side.

Revalidar novamente o SDK antes das Stories que criarem signup/login, OAuth, e-mail ou gestão/revogação de sessões.
