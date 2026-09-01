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
- operações incompatíveis com transação exigirão uma decisão explícita antes de serem introduzidas;
- não executar migration manualmente apenas pelo Console e depois tentar reconstruir o Git.

A primeira migration cria apenas `caleida_internal.schema_migrations`, infraestrutura técnica do mecanismo. Ela não modela catálogo, biblioteca, perfil ou outra entidade do produto.

## Tooling

O runner usa Node.js do projeto e `psql` disponível no `PATH`. Para tarefas de banco, use PostgreSQL client 18.x, compatível com o projeto Neon atual.

Comandos:

```bash
npm run db:migrations:check
npm run db:migrate
npm run db:test
```

`db:migrations:check` é offline e não requer conexão.

`db:migrate` exige:

```text
DATABASE_URL_UNPOOLED=<direct connection string>
CALEIDA_DB_TARGET=isolated
```

A connection string nunca deve ser versionada.

Promoção deliberada para a baseline non-production exige dois sinais explícitos:

```text
CALEIDA_DB_TARGET=baseline
CALEIDA_ALLOW_BASELINE_MIGRATIONS=YES
```

Esse segundo guardrail existe para impedir que um comando de teste atinja a baseline por engano.

`db:test` aceita somente `CALEIDA_DB_TARGET=isolated`.

## Branching Neon

Fluxo obrigatório para alteração estrutural:

```text
Git migration
→ branch Neon verify/<task-id>
→ db:migrate
→ db:test
→ inspeção/schema diff quando aplicável
→ review
→ promoção explícita para baseline non-production
→ remoção da branch descartável
```

Nunca use o branch Neon baseline `main` como laboratório destrutivo.

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

Quando Neon Auth/Data API forem implementados, os helpers de identidade e roles devem ser revalidados na documentação oficial vigente antes dos testes.

## Secrets

Não versionar:

- `DATABASE_URL`;
- `DATABASE_URL_UNPOOLED`;
- passwords;
- Neon API keys;
- tokens/JWTs reais.

IDs públicos de projeto/branch podem ser documentados quando necessários ao inventário operacional; credenciais não.
