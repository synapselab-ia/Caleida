# Autorização de produto — US-AUTH-002

## Escopo

Este documento define a fundação de autorização de produto do Caleida criada em `US-AUTH-002`.

A autenticação continua pertencendo ao Neon Auth gerenciado. Esta Story não cria signup, login, convites, e-mail, Data API, Production ou qualquer superfície administrativa no browser.

## Separação entre identidade e autorização

O identificador canônico de identidade é o UUID de `neon_auth.user.id`.

O Caleida **não** usa `neon_auth.user.role` como papel de produto. Esse campo pertence ao plugin Admin do Better Auth e controla capacidades administrativas do provedor de autenticação, como gestão de usuários e sessões. Concedê-lo automaticamente a um `administrador` do Caleida ampliaria privilégios além de CAP-04.

Os papéis de produto são armazenados separadamente e não duplicam senha, e-mail ou outra credencial:

- `proprietário`;
- `administrador`;
- `moderador`;
- `curador`;
- `usuário`.

## Modelo persistente

Migration canônica: `database/migrations/000002_product_authorization.sql`.

### `caleida_auth.user_roles`

Mantém somente o UUID Neon Auth, papel, origem da concessão, ator que concedeu quando aplicável e timestamps.

Não existe e-mail, senha, token, cookie ou payload de sessão nessa tabela.

### `caleida_audit.role_changes`

Registra mudança válida de papel com:

- UUID do alvo;
- UUID do ator, quando existir;
- papel anterior;
- novo papel;
- origem (`bootstrap` ou `role_change`);
- motivo auditável limitado a 500 caracteres;
- timestamp.

A auditoria não registra secrets nem payload completo de autenticação.

## Política de mudança de papel

A política existe em duas fronteiras coerentes:

- servidor: `src/lib/auth/authorization.ts`;
- banco: `caleida_auth.change_user_role(...)`.

Regras atuais:

1. nenhuma identidade pode alterar o próprio papel;
2. `proprietário` pode alterar o papel de outra identidade para qualquer papel canônico;
3. `administrador` pode atribuir somente `usuário`, `curador` ou `moderador`;
4. `administrador` não pode alterar `proprietário` nem outro `administrador`;
5. `moderador`, `curador`, `usuário` ou identidade sem papel não podem alterar papéis;
6. mudança para o mesmo papel é idempotente e não cria novo evento de auditoria;
7. quando o diretório `neon_auth.user` está disponível, o banco rejeita ator/alvo inexistentes.

O UUID do ator usado por qualquer adaptação futura deve vir de `getServerSession()` no servidor. Nunca aceitar UUID de ator enviado pelo browser como prova de identidade.

Da mesma forma, o papel usado pela fronteira server-side deve vir da persistência confiável do Caleida. Campo de formulário, query string, cookie não assinado ou estado React não são fontes de autorização.

## Privilégios de banco

Os schemas `caleida_auth` e `caleida_audit`, suas tabelas e funções privilegiadas têm acesso de `PUBLIC` revogado.

`SECURITY DEFINER` é usado somente nas funções controladas, sempre com `search_path` fixo. Nenhum papel de runtime foi criado nesta Story porque ainda não existe endpoint de produto que necessite acesso ao banco.

Quando um adaptador runtime for introduzido, ele deve receber apenas os grants mínimos necessários e preservar a validação server-side. Credencial owner/BYPASSRLS nunca deve ser usada como prova de autorização de usuário.

## Vínculo com Neon Auth

`caleida_auth.managed_identity_exists(uuid)` consulta dinamicamente o diretório gerenciado quando `neon_auth.user` existe.

Esse desenho mantém a migration aplicável ao PostgreSQL 18 portável e, simultaneamente, permite um gate adicional no Neon real conforme ADR-008:

- PostgreSQL 18 prova schema, constraints, política e ACLs portáveis;
- Neon isolado prova que o UUID corresponde ao diretório Auth branch-scoped real.

Não existe foreign key direta para o schema gerenciado. Isso evita acoplamento estrutural à implementação interna do provedor; operações privilegiadas continuam validando o diretório quando ele está presente.

## Bootstrap inicial de proprietário

Comando operacional:

```text
npm run db:bootstrap-owner
```

Pré-condições:

- alvo `CALEIDA_DB_TARGET=neon-isolated` ou `baseline`;
- `CALEIDA_NEON_BRANCH_ID` coerente com o alvo;
- `DATABASE_URL_UNPOOLED` server-only;
- `CALEIDA_BOOTSTRAP_OWNER_USER_ID` contendo UUID de uma identidade Neon Auth **já existente**;
- `CALEIDA_BOOTSTRAP_REASON` explícito;
- `CALEIDA_ALLOW_OWNER_BOOTSTRAP=YES`.

O script não aceita e-mail/senha e não cria conta. A função de banco:

- exige diretório Neon Auth disponível;
- rejeita UUID inexistente;
- serializa a operação com advisory lock;
- só permite o bootstrap inicial enquanto não houver outro proprietário;
- é idempotente para a mesma identidade já proprietária;
- registra a concessão em auditoria.

A baseline non-production não recebe um proprietário enquanto não existir uma conta real apropriada. Criar conta apenas para satisfazer esta Story violaria os non-goals.

## Estado non-production após verificação

Depois dos gates PostgreSQL 18 e Neon-specific em `PASS`, a baseline `caleida-nonprod/main` recebeu deliberadamente a história canônica de migrations em ordem:

1. `000001_migration_ledger.sql`;
2. `000002_product_authorization.sql`.

O ledger remoto contém os mesmos checksums validados pelo runner. A promoção não executou bootstrap e não copiou fixtures da branch de verificação.

Estado confirmado da baseline após a promoção:

- zero usuários em `neon_auth.user`;
- zero registros em `caleida_auth.user_roles`;
- zero registros em `caleida_audit.role_changes`;
- Data API não provisionada.

A branch `verify-us-auth-002` permanece descartável até exclusão explicitamente autorizada; seus dados sintéticos não são estado de produto.

## Superfície deliberadamente ausente

US-AUTH-002 não cria endpoint HTTP, Server Action, formulário ou painel de administração. Isso impede fabricar uma UI antes de existir cadastro/login e antes de haver uma necessidade concreta de conexão runtime ao banco.

A primeira Story que expuser mutação de papel deve:

1. validar sessão server-side;
2. carregar o papel persistido por acesso server-side confiável;
3. executar `assertCanChangeProductRole()`;
4. chamar a operação de banco com UUID do ator derivado da sessão;
5. manter as negações do banco e a auditoria como defesa adicional.

## Verificação

Evidência detalhada: `docs/US_AUTH_002_VERIFICATION.md`.
