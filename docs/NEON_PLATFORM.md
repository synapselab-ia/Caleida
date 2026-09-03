# Neon Platform — Caleida

**Status:** arquitetura canônica de plataforma após US-AUTH-002  
**Decisões relacionadas:** `ADR-005` e `ADR-008`  
**Project Design:** `PROJECT_DESIGN.md` + `PROJECT_DESIGN_PLATFORM_AMENDMENT.md`

## 1. Escopo

Este documento define como o Caleida utilizará Neon para banco, identidade, API de dados, RLS e ambientes. Recursos remotos existentes são registrados em `NEON_NONPROD.md`; schema persistente de produto pertence às migrations versionadas no Git. Schemas gerenciados pelo serviço, como `neon_auth`, pertencem à integração Neon Auth e não substituem migrations de produto.

## 2. Topologia planejada

```text
GitHub
  ↓
Next.js
  ├── browser / user session
  │     ↓
  │  Neon Auth
  │     ↓ JWT
  │  Neon Data API
  │     ↓
  │  PostgreSQL RLS
  │     ↓
  │  Neon Postgres
  │
  └── server trusted operations
        ↓
      direct Postgres connection
      (server-only, least privilege)

Storage de objetos: provider separado, ainda não escolhido
```

## 3. Projetos e branches

### Non-production

O projeto dedicado existe desde `US-PLAT-004`:

```text
caleida-nonprod
  └── main                  ← baseline canônica non-production/staging
      ├── verify/<task-id>  ← temporária, quando necessária
      └── dev/<task-id>     ← temporária, quando necessária
```

O branch Neon `main` não é a branch Git `main`.

A baseline `main` foi adotada como estado integrado de non-production porque é o branch default criado pelo Neon. Um branch adicional chamado `staging` não é necessário apenas para duplicar a mesma função.

Branches temporárias devem ser curtas, resetáveis e removidas ao fim da tarefa. Alterações Neon-specific e verificações destrutivas que realmente dependam do serviço não devem ser experimentadas diretamente na baseline.

O estado remoto e os IDs não sensíveis são registrados em `docs/NEON_NONPROD.md`.

### Production

Projeto Neon separado, ainda não provisionado nesta fase:

```text
caleida-production
  └── production
```

Production não serve como ambiente de teste destrutivo.

A separação por projeto é intencional para reduzir blast radius e impedir mistura acidental de secrets, usuários e dados reais com homologação.

## 4. Migrations e verificação

Schema de produto é propriedade do Git e segue `ADR-004`. O ambiente de verificação segue `ADR-008`.

Layout canônico:

```text
database/
  migrations/
  scripts/
  tests/
```

Cada alteração persistente de produto deve poder ser reconstruída a partir da sequência de migrations.

### Gate primário — PostgreSQL 18 descartável

Para SQL, constraints e RLS que dependam apenas de comportamento PostgreSQL portável:

```text
migration no Git
  ↓
PostgreSQL 18 descartável
  ↓
aplicar migrations desde banco limpo
  ↓
testes de banco/RLS aplicáveis
  ↓
reconstrução/segunda aplicação quando necessário
  ↓
review
```

Esse gate não exige credencial Neon e não depende do plano de controle de branching do provedor.

### Gate adicional — Neon

Branch Neon descartável continua necessária quando a mudança depender de comportamento específico do Neon, como:

- papéis/permissões gerenciados pelo Neon;
- `neon_superuser`;
- extensões cujo suporte seja específico do serviço;
- Neon Auth, Data API, schemas/helpers gerenciados;
- comportamento de branching, compute, pooling ou conexão específico do Neon;
- outras diferenças documentadas entre Neon e PostgreSQL standalone.

Fluxo adicional quando aplicável:

```text
gates PostgreSQL portáveis em PASS
  ↓
branch Neon verify/<task-id>
  ↓
verificação Neon-specific
  ↓
review
  ↓
promoção deliberada para baseline non-production
```

Se branching Neon estiver indisponível, somente a mudança que **necessita** desse gate adicional fica `BLOCKED`. A baseline `main` não é usada como laboratório para contornar indisponibilidade do serviço.

A versão major do PostgreSQL descartável deve acompanhar a versão major do projeto Neon. Em `US-AUTH-002`, ambos permanecem PostgreSQL 18.

Não introduzir ORM apenas para administrar migrations.

## 5. Neon Auth e autorização de produto

Neon Auth é a solução inicial de identidade e está habilitado na baseline non-production desde `US-AUTH-001`.

Características relevantes para o Caleida:

- baseado em Better Auth e operado como serviço gerenciado;
- dados de identidade e sessão no schema gerenciado `neon_auth`;
- Auth acompanha branches do banco;
- cada branch possui endpoint de Auth isolado;
- integração futura com Data API por JWT;
- SDK e configuração devem ser lidos da documentação oficial corrente durante implementação.

A fundação versionada usa o SDK oficial `@neondatabase/auth` e uma fronteira server-only no Next.js. O endpoint Auth e o cookie secret reais permanecem fora do Git.

A partir de `US-AUTH-002`, autorização de produto é deliberadamente separada do papel Admin do Better Auth:

- identidade canônica: UUID de `neon_auth.user.id`;
- papéis de produto: `proprietário`, `administrador`, `moderador`, `curador`, `usuário`;
- persistência: `caleida_auth.user_roles`;
- auditoria de mudança de papel: `caleida_audit.role_changes`;
- nenhuma senha, e-mail, token ou cookie é duplicado no schema de autorização;
- a autorização crítica existe no servidor e no banco, não apenas na interface.

`neon_auth.user.role` permanece sob semântica do plugin Admin do Better Auth e não é automaticamente mapeado para o papel `administrador` do Caleida.

Não existe foreign key estrutural para o schema gerenciado; operações privilegiadas validam a identidade gerenciada quando esse diretório está presente. Isso preserva o gate PostgreSQL portável sem transformar detalhes internos do provedor em schema canônico do produto.

## 6. Neon Data API

A Data API é o caminho preferencial para operações normais sob contexto do usuário quando acesso direto ao banco a partir da aplicação não for necessário.

Ela continua **não habilitada** após `US-AUTH-002`, porque a Story não expõe CRUD user-scoped nem endpoint de produto que justifique essa superfície.

Guardrails quando for adotada:

- RLS obrigatória em tabelas privadas expostas;
- JWT deve representar a sessão real do usuário;
- `authenticated` é apenas papel de autenticação, não ownership;
- políticas devem comparar identidade com ownership/visibilidade real;
- o helper de identidade deve seguir a API oficial vigente;
- `anonymous` recebe somente acesso explicitamente público;
- grants e RLS são controles separados e ambos devem ser considerados.

Políticas dependentes de identidade/roles específicos de Neon Auth/Data API exigem o gate Neon adicional definido no `ADR-008`.

## 7. Conexão direta ao Postgres

Permitida apenas em contextos server-side confiáveis, como:

- migrations;
- manutenção;
- jobs administrativos explícitos;
- operações que não devam passar pela Data API e tenham autorização própria comprovada.

Regras:

- connection string é secret;
- nunca usar credencial privilegiada no browser;
- não usar owner/BYPASSRLS para CRUD comum;
- testes de autorização devem usar papéis equivalentes aos usuários reais.

`DATABASE_URL_UNPOOLED` é o contrato do tooling para uma conexão PostgreSQL direta, seja no banco efêmero de testes ou no Neon quando aplicável. `DATABASE_URL` permanece reservado ao runtime server-side pooled futuro.

O bootstrap inicial de proprietário introduzido em `US-AUTH-002` é uma operação server-only explícita. Ele aceita somente UUID de uma identidade Neon Auth já existente, exige motivo auditável e confirmação separada e não cria conta.

## 8. RLS

RLS faz parte do contrato do produto.

Testes mínimos futuros para tabelas user-scoped:

- owner consegue operação permitida;
- non-owner com ID válido falha;
- payload com ownership forjado falha;
- tentativa de transferência de ownership falha;
- anônimo falha em dados privados;
- políticas públicas concedem somente o que o Project Design permite;
- papel administrativo não é inferido por dados editáveis pelo usuário.

RLS puramente PostgreSQL pode ser provada no gate efêmero. RLS acoplada a Neon Auth/Data API também exige gate Neon-specific.

As tabelas de autorização/auditoria de `US-AUTH-002` não foram expostas à Data API e possuem grants públicos revogados; não foi fabricada RLS sem uma superfície de runtime que a exigisse.

## 9. Storage

Object Storage não faz parte da plataforma canônica nesta fase conforme `ADR-006`.

A decisão futura deve verificar novamente maturidade, regiões, pricing, lifecycle, backup, privacidade, integração com Auth/RLS e compatibilidade S3 do provedor considerado.

Até essa decisão, o domínio de arquivos deve permanecer desacoplado do banco e do provedor.

## 10. Backups e recuperação

Branching e time travel não substituem a estratégia de backup do produto.

Antes do beta, uma Story própria deve definir:

- retenção exigida;
- dump lógico e/ou mecanismo gerenciado;
- recuperação de banco;
- recuperação do futuro Storage;
- teste periódico de restore;
- RPO/RTO compatíveis com a fase.

## 11. Secrets e ambientes

Nunca versionar:

- `DATABASE_URL`;
- `DATABASE_URL_UNPOOLED`;
- Neon API keys;
- Auth URLs reais quando classificadas como configuração de ambiente;
- `NEON_AUTH_COOKIE_SECRET`;
- OAuth client secrets;
- credenciais de Storage futuro.

Arquivos `.env.example` documentam somente nomes/finalidade e placeholders seguros.

## 12. Estado histórico de OPS-002

OPS-002 foi somente decisão e reconciliação documental.

Naquela tarefa:

- nenhum projeto Neon do Caleida foi criado;
- nenhum Auth/Data API foi provisionado;
- nenhuma migration foi criada;
- nenhum schema foi aplicado;
- nenhum secret foi gerado;
- nenhum deployment ocorreu.

## 13. Estado após US-PLAT-004

A infraestrutura mínima non-production passou a existir:

- projeto `caleida-nonprod` provisionado;
- PostgreSQL 18 em `aws-us-east-1`;
- branch default `main` adotada como baseline non-production/staging;
- nenhum schema de produto aplicado;
- naquele momento nenhum Neon Auth/Data API/Storage estava provisionado;
- Production continuava não provisionada;
- detalhes operacionais em `docs/NEON_NONPROD.md`.

## 14. Estado após US-PLAT-005

A fundação versionada de migrations/testes usa SQL + Node + `psql` e separa:

- gate primário reproduzível em PostgreSQL 18 descartável;
- gate adicional Neon quando houver dependência real do serviço.

Essa separação evita transformar indisponibilidade do conector de branching em bloqueio para SQL PostgreSQL portável, sem reduzir os gates de compatibilidade quando Neon-specific.

## 15. Estado após US-AUTH-001

A identidade gerenciada passou a existir em non-production com promoção deliberada depois de verificação isolada:

- branch descartável `verify-us-auth-001` comprovou branching, compute e Neon Auth Better Auth sem alterar a baseline durante experimentação;
- a baseline `main` recebeu Neon Auth somente após `npm run verify`, PostgreSQL 18/`verify:db` e gate Neon-specific em PASS;
- o schema `neon_auth` é gerenciado pelo Neon e não é uma migration de produto;
- nenhum usuário do Caleida foi criado;
- Data API continuou não habilitada para o produto;
- Production Neon continuou inexistente;
- nenhuma publicação Vercel ocorreu.

A integração da aplicação e a semântica de sessão estão documentadas em `docs/AUTH_FOUNDATION.md`.

## 16. Estado após US-AUTH-002

A fundação de autorização de produto foi materializada e promovida somente depois dos gates aplicáveis:

- `verify-us-auth-001` foi removida após autorização explícita;
- `verify-us-auth-002` foi criada a partir da baseline e herdou Better Auth branch-scoped;
- `000002_product_authorization.sql` foi provada no Neon com identidades sintéticas apenas na branch descartável;
- autopromoção e elevação administrativa indevida foram negadas;
- bootstrap inicial e idempotência foram provados sem criar usuário real na baseline;
- CI corrigido `33766333312` passou aplicação + PostgreSQL 18 + `verify:db`;
- a baseline recebeu `000001_migration_ledger.sql` e `000002_product_authorization.sql` em ordem, com os mesmos checksums validados pelo runner;
- a baseline continua com zero usuários Auth, zero papéis de produto e zero eventos de mudança de papel;
- Data API continua não provisionada;
- Production Neon continua inexistente;
- nenhum deployment Vercel ocorreu.

A semântica detalhada está em `docs/AUTHORIZATION.md` e a evidência em `docs/US_AUTH_002_VERIFICATION.md`.
