# Neon Non-Production — Caleida

**Status:** provisionado; Auth e fundação de autorização integrados na baseline  
**Data de referência:** 2026-09-03  
**Projeto relacionado:** `docs/NEON_PLATFORM.md`  
**Decisões:** `ADR-004`, `ADR-005` e `ADR-008`

## 1. Recurso remoto canônico

A fundação Neon non-production do Caleida existe na organização conectada.

```text
Projeto: caleida-nonprod
Project ID: patient-glade-95136440
Região: aws-us-east-1
PostgreSQL: 18
Branch baseline: main
Branch ID: br-restless-cherry-awpcwy6r
Database default: neondb
```

Os IDs acima identificam recursos e **não são credenciais**. Senhas, connection strings, Auth URLs e API keys nunca devem ser registradas neste arquivo.

## 2. Papel do branch `main`

No projeto Neon `caleida-nonprod`, o branch `main` é a baseline canônica de non-production/staging.

Ele não deve ser confundido com a branch Git `main`.

Responsabilidades:

- receber somente mudanças persistentes aprovadas depois dos gates aplicáveis;
- representar o estado integrado de non-production;
- servir de referência para branches descartáveis quando um gate Neon-specific exigir isolamento no serviço;
- nunca receber experimentos destrutivos diretamente.

A baseline possui Neon Auth gerenciado desde `US-AUTH-001` e, após os gates de `US-AUTH-002`, também possui a história de migrations `000001`/`000002`, a fundação de papéis de produto e a tabela de auditoria correspondente. Nenhum usuário, proprietário ou papel foi criado na baseline durante essas Stories.

## 3. Convenção de branches temporárias

Quando necessárias, use branches curtas e descartáveis:

```text
verify/<task-id>
dev/<task-id>
```

Regras:

- derivar da baseline non-production adequada;
- usar branch isolada para testes que dependam de comportamento específico do Neon;
- remover a branch após a tarefa;
- não usar Production como parent operacional de testes;
- não manter branches temporárias como ambientes permanentes.

Branches Neon continuam úteis para integração e compatibilidade do serviço, mas `ADR-008` não as torna requisito para provar SQL PostgreSQL portável.

## 4. Estado do conector Neon

Em `US-PLAT-005`, as rotas de criação de branch/migration temporária apresentaram incompatibilidade camelCase/snake_case e ficaram registradas como limitação operacional daquela sessão.

Em `US-AUTH-001`, a criação de branch voltou a funcionar pela ação corrente do conector e o isolamento Auth foi comprovado antes da promoção à baseline.

Em `US-AUTH-002`, o fluxo corrente permitiu criar diretamente a branch `verify-us-auth-002`, herdar Managed Better Auth branch-scoped, aplicar a migration versionada e executar os casos Neon-specific com identidades sintéticas apenas no ambiente descartável.

A baseline não foi usada como laboratório em nenhuma das duas Stories.

## 5. Credenciais, Auth e connection strings

Nenhum valor real é versionado.

Contrato atual:

- `DATABASE_URL` — conexão pooled para runtime server-side futuro quando apropriado;
- `DATABASE_URL_UNPOOLED` — conexão PostgreSQL direta usada pelo tooling;
- `CALEIDA_DB_TARGET=ephemeral` — gate primário PostgreSQL descartável;
- `CALEIDA_DB_TARGET=neon-isolated` + `CALEIDA_NEON_BRANCH_ID` — gate Neon-specific em branch descartável;
- `CALEIDA_DB_TARGET=baseline` + branch ID canônico + `CALEIDA_ALLOW_BASELINE_MIGRATIONS=YES` — promoção deliberada de migrations para a baseline;
- `NEON_AUTH_BASE_URL` — endpoint Auth branch-scoped do ambiente correspondente, mantido fora do Git;
- `NEON_AUTH_COOKIE_SECRET` — secret server-only de assinatura do cache de sessão, mantido fora do Git;
- `CALEIDA_BOOTSTRAP_OWNER_USER_ID` — UUID de uma identidade Neon Auth já existente quando bootstrap real for necessário;
- `CALEIDA_BOOTSTRAP_REASON` — motivo auditável da operação;
- `CALEIDA_ALLOW_OWNER_BOOTSTRAP=YES` — confirmação operacional separada exigida para bootstrap.

Neon API key, connection strings, Auth URLs reais, cookie secrets e credenciais owner/admin continuam fora do Git e do browser.

## 6. Estado integrado após US-AUTH-002

A baseline non-production possui:

- Neon Auth gerenciado com provider `better_auth`;
- schema gerenciado `neon_auth` no database `neondb`;
- endpoint Auth branch-scoped administrado pelo Neon;
- migration ledger `caleida_internal.schema_migrations`;
- migration `000001_migration_ledger.sql` aplicada com checksum canônico;
- migration `000002_product_authorization.sql` aplicada com checksum canônico;
- `caleida_auth.user_roles` para autorização de produto vinculada por UUID Auth;
- `caleida_audit.role_changes` para auditoria mínima de mudanças de papel;
- funções controladas de leitura/bootstrap/mudança de papel com grants públicos revogados;
- integração de aplicação server-only versionada em `src/lib/auth/server.ts` e `src/lib/auth/authorization.ts`.

Estado de dados confirmado depois da promoção:

```text
neon_auth.user: 0 usuários
caleida_auth.user_roles: 0 registros
caleida_audit.role_changes: 0 registros
Neon Data API: não provisionada
```

Deliberadamente **não** existem ainda:

- conta real do beta ou proprietário bootstrapado;
- Neon Data API habilitada para o produto;
- Object Storage;
- projeto Neon de Production;
- convites/lista de espera;
- SMTP/e-mail/OAuth;
- projeto/deployment Vercel do Caleida.

A branch `verify-us-auth-001` foi removida após autorização explícita do usuário.

A branch de verificação atual é:

```text
verify-us-auth-002
br-weathered-shape-awp7ckqa
```

Ela contém somente dados sintéticos do gate de `US-AUTH-002` e permanece pendente de exclusão explícita. A autorização destrutiva dada para uma branch anterior não se transfere para esta.

Nenhuma nova branch Neon descartável deve ser aberta para a Story seguinte enquanto `verify-us-auth-002` permanecer pendente de limpeza.

## 7. Production

`caleida-production` **não existe por decisão deliberada nesta fase**.

Production será um projeto Neon separado quando uma Story futura exigir ambiente real de produção. Non-production não deve compartilhar secrets, usuários ou dados reais com Production.
