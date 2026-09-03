# Verificação — US-AUTH-002

**Story:** `US-AUTH-002 — Materializar papéis, autorização e bootstrap administrativo`  
**Issue:** `#45`  
**PR:** `#46`  
**Branch Git:** `feat/us-auth-002-authorization-bootstrap`

## Escopo verificado

- papéis de produto separados do papel Admin do Better Auth;
- migration versionada de autorização/auditoria;
- política server-only;
- negações adversariais no banco;
- bootstrap inicial por identidade Neon Auth existente;
- ACLs sem acesso público;
- promoção deliberada das migrations canônicas à baseline non-production;
- nenhuma superfície client-side ou Data API adicionada.

## Neon-specific

Branch descartável:

```text
name: verify-us-auth-002
id: br-weathered-shape-awp7ckqa
parent: br-restless-cherry-awpcwy6r
project: patient-glade-95136440
PostgreSQL: 18
Auth: Managed Better Auth branch-scoped
```

O SQL de `database/migrations/000002_product_authorization.sql` foi aplicado na branch isolada antes de qualquer promoção à baseline.

Foram criadas três identidades sintéticas somente nessa branch descartável para o gate. Seus valores não são persistidos nesta documentação e nenhuma identidade foi criada na baseline.

Resultados:

- migration SQL: `PASS`;
- Managed Better Auth herdado/branch-scoped: `PASS`;
- UUID existente no diretório `neon_auth.user`: `PASS`;
- UUID inexistente: `PASS — rejeitável/detectado`;
- bootstrap inicial: `PASS`;
- bootstrap repetido da mesma identidade: `PASS — idempotente`;
- proprietário concedendo `administrador` a outra identidade: `PASS`;
- administrador concedendo `moderador`: `PASS`;
- usuário tentando autopromoção: `PASS — DENIED`;
- administrador tentando conceder `administrador`: `PASS — DENIED`;
- auditoria dos eventos válidos: `PASS`;
- acesso direto/EXECUTE para papel não privilegiado: `PASS — ausente`.

## CI PostgreSQL 18

### Run inicial — `33765866322`

Head: `b8f84ee8db2c59de8f377c4b4f40933f2e6c538a`.

- `npm ci`: `PASS`;
- `npm run verify`: `PASS`;
- servidor PostgreSQL 18: `PASS`;
- migrations `000001` e `000002`: `PASS`;
- testes SQL `000001`/`000002`: `PASS`;
- teste `000003_product_authorization.sql`: `FAIL` no check de ACL porque `has_*_privilege('PUBLIC', ...)` interpreta `PUBLIC` como nome de role e PostgreSQL 18 não possui role com esse nome.

A falha foi do teste, não da migration ou da política. O teste foi corrigido sem relaxar o ACL: passou a criar um role `NOLOGIN` sem privilégios e verificar schema/tabelas/funções contra esse role real.

### Run corrigido — `33766333312`

Head: `2b5c20d47137e880c7c535b04a025d532d6e685b`.

- runtime Node/npm pinado: `PASS`;
- `npm ci`: `PASS`, auditoria npm com zero vulnerabilidades;
- `npm run verify`: `PASS`;
- testes Node: `49/49 PASS`;
- build Next.js: `PASS`;
- servidor PostgreSQL 18: `PASS`;
- `npm run verify:db`: `PASS`;
- migration `000001_migration_ledger.sql`: `PASS`;
- migration `000002_product_authorization.sql`: `PASS`;
- teste `000001_migration_baseline.sql`: `PASS`;
- teste `000002_postgres_18.sql`: `PASS`;
- teste `000003_product_authorization.sql`: `PASS`.

Checksums canônicos validados pelo runner:

```text
000001_migration_ledger.sql        4d9a403d6bd074faeca04bf3e714fd8066e5e9f3ae7358bbc0f27a1faf2f14c2
000002_product_authorization.sql   0ba6981b583ac8ed693a2a6b6eabc0c84d12678bdf9953e845a239d6b48493c8
```

Os warnings transitivos do pacote beta Neon Auth continuam upstream e não alteraram os gates; o Caleida não passou a declarar/importar Auth UI diretamente.

## Promoção para baseline non-production

Antes da promoção, `caleida-nonprod/main` possuía Managed Better Auth, mas ainda não possuía `caleida_internal.schema_migrations`. Isso refletia o estado real: US-AUTH-001 havia promovido o recurso gerenciado Auth, porém as migrations versionadas do repositório ainda não tinham sido aplicadas à baseline.

Depois de todos os gates PostgreSQL e Neon-specific em `PASS`, a história canônica foi promovida deliberadamente em ordem:

1. `000001_migration_ledger.sql`;
2. `000002_product_authorization.sql`.

O ledger remoto foi conferido depois da operação e contém exatamente os dois nomes e checksums validados pelo CI.

Estado pós-promoção:

- baseline `main`: `ready`;
- Managed Better Auth: habilitado;
- `caleida_internal.schema_migrations`: `000001` + `000002` com checksums canônicos;
- `caleida_auth.user_roles`: `0` registros;
- `caleida_audit.role_changes`: `0` registros;
- `neon_auth.user`: `0` usuários na baseline;
- lookup de UUID inexistente pelo helper gerenciado: `false`;
- Neon Data API: não provisionada.

Nenhum proprietário foi bootstrapado na baseline. Criar uma conta persistente apenas para concluir a Story seria contrário aos non-goals; o bootstrap fica pronto para uma identidade real futura e exige confirmação operacional explícita.

## Gates complementares

- coerência CAP-04 / CAP-35 / ADR-004 / ADR-005 / ADR-008: `PASS`;
- autorização crítica server-side + banco: `PASS` por contrato e testes adversariais;
- separação do papel Admin Better Auth e papéis de produto: `PASS`;
- auditoria de mudança de papel sem senha/token/secret: `PASS`;
- secrets reais no Git/Issue/PR/docs: `PASS — nenhum`;
- browser real: `SKIPPED — não existe fluxo/UI funcional nesta Story`;
- Data API: `SKIPPED/NON-GOAL`;
- Production Neon: `SKIPPED/NON-GOAL`;
- deployment Vercel: `SKIPPED/PROIBIDO` conforme ADR-007.

## Limpeza

A branch Neon descartável `verify-us-auth-002` (`br-weathered-shape-awp7ckqa`) ainda existe e contém apenas dados sintéticos do gate. Sua exclusão é destrutiva no conector e exige nova autorização explícita do usuário; autorizações dadas para branches anteriores não são reutilizadas.

Nenhuma nova branch Neon descartável deve ser aberta para US-AUTH-003 enquanto essa limpeza estiver pendente.
