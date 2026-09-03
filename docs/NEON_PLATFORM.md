# Neon Platform — Caleida

**Status:** arquitetura canônica de plataforma após US-AUTH-004  
**Decisões relacionadas:** `ADR-004`, `ADR-005`, `ADR-008` e `ADR-009`  
**Project Design:** `PROJECT_DESIGN.md` + `PROJECT_DESIGN_PLATFORM_AMENDMENT.md`

## 1. Escopo

Este documento define como o Caleida usa Neon para Postgres e identidade e como separa SQL PostgreSQL portável de comportamento específico do serviço. O inventário remoto fica em `docs/NEON_NONPROD.md`; schema persistente de produto pertence às migrations versionadas no Git.

## 2. Topologia

```text
Next.js
  ├── Neon Auth / sessão
  │     └── provider de e-mail compartilhado em non-production
  │
  ├── operações server-side confiáveis
  │     ↓
  │   Postgres direto com least privilege
  │
  └── futuro browser/user data path
        ↓
      Neon Data API + JWT
        ↓
      PostgreSQL RLS

Storage de objetos: provider separado, ainda não escolhido
```

A Data API permanece futura e não é habilitada apenas por conveniência.

## 3. Projetos e branches

### Non-production

```text
caleida-nonprod
  └── main                  ← baseline integrada
      ├── verify/<task-id>  ← temporária quando necessária
      └── dev/<task-id>     ← temporária quando necessária
```

O branch Neon `main` não é a branch Git `main`.

Branches temporárias:

- existem somente quando um gate Neon-specific realmente exige isolamento;
- são derivadas da baseline apropriada;
- não se tornam ambientes permanentes;
- não autorizam experimentação destrutiva na baseline;
- são removidas depois da tarefa mediante autorização explícita quando a ferramenta classificar a exclusão como destrutiva.

Após US-AUTH-004 existe `verify-us-auth-004 / br-plain-pond-aw5f59ia`, criada durante a investigação inicial de SMTP externo. Ela permanece com provider de e-mail `shared`, nunca recebeu SMTP externo e tornou-se housekeeping não bloqueante. Sua exclusão exige autorização explícita.

### Production

`caleida-production` ainda não foi provisionado. Production será projeto separado e nunca serve como laboratório.

## 4. Migrations e verificação

Schema de produto segue `ADR-004`; verificação segue `ADR-008`.

```text
database/
  migrations/
  scripts/
  tests/
```

### PostgreSQL 18 descartável — gate primário

Obrigatório para SQL/constraints/RLS portáveis:

```text
migration versionada
  ↓
PostgreSQL 18 limpo
  ↓
aplicar migrations
  ↓
testes SQL/concorrência aplicáveis
  ↓
review
```

### Gate Neon-specific — somente quando aplicável

Exige branch Neon isolada quando a mudança depender de:

- Neon Auth/schema/helper/role gerenciado;
- Data API;
- `neon_superuser` ou permissões específicas;
- extensão específica do serviço;
- branching/compute/pooling/conexão Neon;
- outra diferença documentada contra PostgreSQL standalone.

A baseline nunca substitui esse ambiente de verificação.

### US-AUTH-003 como exemplo de `SKIPPED` correto

`000003_entry_control.sql` usa somente PostgreSQL portável e UUIDs opacos. Não consulta `neon_auth`, não usa helper/role gerenciado e não habilita Data API. Portanto:

- PostgreSQL 18: obrigatório e `PASS`;
- concorrência real com duas sessões PostgreSQL: `PASS`;
- Neon-specific: `SKIPPED`;
- nenhuma branch Neon foi criada apenas para duplicar o gate portável.

## 5. Neon Auth e autorização de produto

Managed Better Auth é a identidade canônica desde US-AUTH-001.

- identidade canônica: UUID de `neon_auth.user.id`;
- dados/sessão gerenciados permanecem em `neon_auth`;
- cada branch Auth possui endpoint isolado;
- endpoint real e cookie secret ficam fora do Git.

Desde US-AUTH-004, o contrato non-production de e-mail Auth é explícito:

- email/password habilitado;
- `email_provider.type=shared` na baseline;
- remetente gerenciado pelo Neon;
- `require_email_verification=false` até US-AUTH-005 provar o cadastro controlado de forma fail-closed;
- domínio próprio/SMTP/provedor externo ficam adiados até necessidade material.

Desde US-AUTH-002, papéis de produto são independentes do Admin Better Auth:

```text
proprietário
administrador
moderador
curador
usuário
```

Persistência:

- `caleida_auth.user_roles`;
- `caleida_audit.role_changes`.

Nenhuma senha/token/cookie é duplicada. O papel Admin do Better Auth não é automaticamente convertido em `administrador` Caleida.

## 6. Entrada controlada

US-AUTH-003 adiciona a fundação persistente do beta fechado:

- `caleida_access.invitations`;
- `caleida_access.invitation_uses`;
- `caleida_access.access_requests`;
- `caleida_audit.entry_events`.

Características:

- token de convite persistido somente como digest;
- convite único ou reutilizável com capacidade explícita;
- validade e destinatário opcional;
- consumo serializado no PostgreSQL com row lock;
- solicitação de acesso com decisão/arquivamento auditáveis;
- futuro vínculo à conta modelado sem criar identidade antecipadamente;
- acesso público revogado por padrão.

Contrato detalhado: `docs/ENTRY_CONTROL.md`.

Essas tabelas não são expostas à Data API e nenhuma RLS foi fabricada sem uma superfície runtime real.

## 7. Neon Data API

Permanece não provisionada após US-AUTH-004.

Quando for realmente necessária:

- tabelas privadas expostas exigem RLS;
- JWT deve representar sessão real;
- `authenticated` não significa ownership;
- grants e RLS são controles diferentes;
- helpers de identidade devem seguir documentação oficial corrente;
- políticas acopladas a identidade Neon exigem gate Neon-specific.

## 8. Conexão direta ao Postgres

Permitida somente server-side em contextos confiáveis, como:

- migrations;
- manutenção;
- bootstrap administrativo explícito;
- operações privilegiadas com autorização própria.

Regras:

- connection string é secret;
- credencial privilegiada nunca vai para browser;
- owner/BYPASSRLS não substitui autorização do usuário;
- runtime futuro recebe somente least privilege necessário.

`DATABASE_URL_UNPOOLED` é o contrato do tooling. `DATABASE_URL` permanece reservado ao runtime pooled futuro.

## 9. RLS

RLS faz parte da arquitetura quando dados privados forem expostos sob contexto de usuário.

Testes futuros devem cobrir owner/non-owner, ID válido de terceiro, ownership forjado, anônimo, transferência indevida e papel administrativo não inferido por dados editáveis.

US-AUTH-002 e US-AUTH-003 mantiveram suas tabelas privadas com grants públicos revogados e sem Data API; portanto não criaram políticas RLS artificiais.

## 10. Secrets e ambientes

Nunca versionar:

- `DATABASE_URL`;
- `DATABASE_URL_UNPOOLED`;
- Neon API keys;
- Auth URLs reais;
- `NEON_AUTH_COOKIE_SECRET`;
- OAuth client secrets;
- futuros secrets de e-mail/Storage.

`.env.example` documenta somente nomes e placeholders seguros. US-AUTH-004 não adicionou secret de e-mail porque o provider compartilhado do Neon Auth não exige credencial adicional do Caleida.

## 11. Estado integrado da baseline

`caleida-nonprod/main` possui atualmente:

```text
Managed Better Auth
Email provider Auth: shared Neon
Require email verification: false
000001_migration_ledger.sql
000002_product_authorization.sql
000003_entry_control.sql
```

A sequência representa:

1. ledger de migrations;
2. autorização de produto e auditoria de papel;
3. entrada controlada e auditoria de convites/solicitações;
4. transporte Auth non-production fornecido pelo serviço gerenciado, sem nova migration.

Estado de dados confirmado após US-AUTH-003 e não alterado por US-AUTH-004:

```text
Auth users: 0
Product roles: 0
Role changes: 0
Invitations: 0
Invitation uses: 0
Access requests: 0
Entry events: 0
```

Nenhum fixture foi promovido.

## 12. Histórico de evolução

- `US-PLAT-004`: criou `caleida-nonprod` / PostgreSQL 18 / baseline `main`.
- `US-PLAT-005`: criou o sistema de migrations/testes e formalizou ADR-008.
- `US-AUTH-001`: provou e promoveu Managed Better Auth.
- `US-AUTH-002`: provou autorização ligada à identidade Neon em branch isolada; promoveu `000001/000002`; branch de verificação posteriormente removida com autorização explícita.
- `US-AUTH-003`: provou `000003` em PostgreSQL 18, incluindo concorrência real; gate Neon-specific corretamente `SKIPPED`; promoveu somente schema, sem dados.
- `US-AUTH-004`: confirmou provider de e-mail `shared` do Neon Auth como suficiente para non-production; retirou SMTP externo do escopo e manteve `require_email_verification=false` até o gate de cadastro controlado.

## 13. Storage, backup e Production

Object Storage continua fora da plataforma canônica nesta fase conforme ADR-006.

Antes do beta, estratégia de backup/restore deve definir retenção, RPO/RTO e teste de recuperação. Branching/time travel não substituem backup.

Production Neon permanece inexistente e deverá ser projeto separado. A estratégia de e-mail deve ser reavaliada antes de abertura pública/Production. Nenhum deployment Vercel foi executado por IA.