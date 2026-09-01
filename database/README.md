# Banco de dados — Caleida

Este diretório é a fonte versionada para alterações persistentes de banco e testes associados.

## Estrutura

```text
database/
  migrations/
  scripts/
  tests/
```

## Migrations

Formato obrigatório:

```text
NNNNNN_descricao_em_snake_case.sql
```

Regras:

- sequência numérica de seis dígitos, crescente e nunca reutilizada;
- migrations aplicadas não são reescritas; correções usam novo arquivo;
- cada arquivo deve representar uma alteração persistente revisável;
- o runner calcula SHA-256 e falha se uma migration já registrada tiver checksum diferente;
- cada migration é executada em transação pelo runner;
- operações incompatíveis com transação exigem decisão explícita antes de serem introduzidas;
- não executar migration manualmente apenas pelo Console e depois tentar reconstruir o Git.

A primeira migration cria somente `caleida_internal.schema_migrations`, infraestrutura técnica do mecanismo. Ela não modela catálogo, biblioteca, perfil ou outra entidade do produto.

## Tooling

O runner usa Node.js do projeto e `psql` disponível no `PATH`.

Comandos:

```bash
npm run db:migrations:check
npm run db:migrate
npm run db:test
```

`db:migrations:check` é offline e não requer conexão.

`db:migrate` e `db:test` usam `DATABASE_URL_UNPOOLED` como contrato para uma conexão PostgreSQL direta. O valor nunca é versionado.

## Gate primário — PostgreSQL 18 descartável

Conforme `ADR-008`, migrations e RLS que dependam apenas de comportamento PostgreSQL portável devem ser provadas primeiro em um banco PostgreSQL 18 descartável.

Variáveis:

```text
DATABASE_URL_UNPOOLED=<direct-postgres-connection>
CALEIDA_DB_TARGET=ephemeral
```

Fluxo:

```text
Git migration
→ PostgreSQL 18 limpo/descartável
→ db:migrate
→ db:test
→ inspeção/reconstrução quando aplicável
→ review
```

Esse gate não usa credencial Neon e não depende de criação de branch pelo provedor.

O teste `000002_postgres_18.sql` garante que a suíte não rode silenciosamente contra outra versão major.

## Gate adicional — Neon isolado

Quando a mudança depender de comportamento específico do Neon, use branch Neon descartável e informe explicitamente seu ID:

```text
DATABASE_URL_UNPOOLED=<direct-neon-branch-connection>
CALEIDA_DB_TARGET=neon-isolated
CALEIDA_NEON_BRANCH_ID=<disposable-neon-branch-id>
```

Esse gate é obrigatório para mudanças que dependam, por exemplo, de Neon Auth/Data API, `neon_superuser`, extensões ou permissões específicas do serviço e outras diferenças documentadas do Neon.

A baseline Neon `main` nunca pode ser passada como `neon-isolated`.

Se o plano de controle/branching do Neon estiver indisponível, apenas a mudança que realmente depende desse gate adicional fica bloqueada; SQL PostgreSQL portável continua verificável no gate efêmero.

## Promoção para a baseline Neon non-production

Promoção deliberada exige:

```text
DATABASE_URL_UNPOOLED=<direct-neon-baseline-connection>
CALEIDA_DB_TARGET=baseline
CALEIDA_NEON_BRANCH_ID=br-restless-cherry-awpcwy6r
CALEIDA_ALLOW_BASELINE_MIGRATIONS=YES
```

Esse segundo guardrail impede que um comando de teste atinja a baseline por engano.

Uma promoção só deve ocorrer quando a migration estiver versionada, o gate PostgreSQL aplicável tiver passado e qualquer gate Neon-specific necessário também estiver em `PASS`.

`db:test` nunca aceita `baseline`.

## Contrato de testes RLS

Ainda não existe tabela user-scoped nesta Story, portanto não há política RLS funcional a inventar prematuramente.

Quando uma tabela privada/user-scoped for introduzida, seus testes de banco devem provar na camada PostgreSQL, no mínimo:

1. owner/autorizado consegue a operação prevista;
2. usuário autenticado não proprietário é negado mesmo conhecendo ID válido;
3. anônimo é negado em dado privado;
4. ownership forjado no payload não concede acesso;
5. transferência de ownership não autorizada falha;
6. papel `authenticated` sozinho não implica ownership;
7. credencial owner/BYPASSRLS não é usada como evidência desses casos.

RLS baseada apenas em primitives PostgreSQL pode ser testada no banco efêmero. Quando Neon Auth/Data API forem implementados, helpers de identidade, roles e grants específicos do serviço exigem verificação adicional no Neon.

## Secrets

Não versionar:

- `DATABASE_URL`;
- `DATABASE_URL_UNPOOLED`;
- passwords;
- Neon API keys;
- tokens/JWTs reais.

IDs públicos de projeto/branch podem ser documentados quando necessários ao inventário operacional; credenciais não.
