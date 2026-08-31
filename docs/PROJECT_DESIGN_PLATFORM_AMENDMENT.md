# Caleida — Project Design Platform Amendment v1.1

**Data:** 31 de agosto de 2026  
**Status:** Aprovado  
**Aplica-se a:** `docs/PROJECT_DESIGN.md` v1.0  
**Escopo:** somente decisões de plataforma, ambientes, banco, autenticação, RLS e Storage

Este documento integra o Project Design do Caleida e deve ser lido junto com `docs/PROJECT_DESIGN.md`.

Ele não altera visão de produto, taxonomia, capacidades, modelo de catálogo/biblioteca, privacidade, roadmap funcional ou requisitos não funcionais. Seu objetivo é substituir as premissas técnicas específicas de Supabase que ficaram obsoletas antes do início da implementação.

## 1. Regra de supersessão

Quando este amendment e `docs/PROJECT_DESIGN.md` divergirem sobre provedor ou operação de infraestrutura, este amendment prevalece dentro do seu escopo.

Ficam historicamente preservadas, mas deixam de ser decisões ativas:

- a referência de stack que nomeia Supabase como plataforma canônica;
- a decisão central de utilizar Supabase Free como infraestrutura temporária;
- as partes da seção 13 que definem Supabase Postgres/Auth/Storage;
- as seções 14 a 17 quando tratam especificamente de limites, ambientes, CLI, branching, backups, Auth, SMTP, Storage, Realtime e migração de plano do Supabase;
- referências a `supabase/migrations/`, `supabase/seed.sql` e Supabase local;
- referências do EPIC-00 e do Incremento 0 que tornam Supabase local parte obrigatória da fundação;
- o gate de abertura pública que cita dependência operacional do Supabase Free.

As referências técnicas originais permanecem úteis como registro histórico de como o Project Design v1.0 foi concebido em 03/08/2026.

A política de deployment/Vercel não é redefinida por este amendment; ela continua governada por `00_SYSTEM/DEPLOYMENT_POLICY.md` até a conclusão de `OPS-003`.

## 2. Plataforma canônica a partir de OPS-002

A stack de referência passa a ser:

| Camada | Tecnologia/decisão | Papel |
|---|---|---|
| Código e execução | GitHub | Repositório, Issues, branches, PRs, Actions e documentação. |
| Aplicação | Next.js + React + TypeScript | Interface, rotas server-side, integrações e composição do produto. |
| Interface | Tailwind CSS + tokens próprios | Design system, temas, responsividade e consistência. |
| Hosting | Vercel | Destino de hosting, sujeito à política canônica de deployment controlado. |
| Banco | Neon Postgres | Persistência relacional, constraints, índices e migrations. |
| Identidade | Neon Auth | Autenticação gerenciada baseada em Better Auth, com identidade no schema `neon_auth`. |
| API de dados | Neon Data API | Acesso HTTP/PostgREST-compatible autenticado por JWT para operações normais do produto. |
| Autorização | PostgreSQL RLS | Isolamento e políticas de acesso no banco. |
| Arquivos | Provedor desacoplado, ainda não escolhido | Conteúdo próprio como avatar/banner; decisão adiada para Story própria. |

## 3. Motivo do pivot

A mudança é realizada antes da implementação técnica porque:

- o Caleida ainda não possui aplicação, migrations, schema ou Auth implementado;
- o Supabase Free continua limitado a dois projetos ativos por usuário Owner/Admin;
- o Neon Free atualmente oferece margem muito maior para múltiplos projetos e branching;
- Neon Auth e Neon Data API permitem manter autenticação, JWT e RLS próximos do Postgres;
- branches do Neon permitem ambientes descartáveis de verificação sem usar Production como laboratório;
- o princípio PR-11 do Project Design exige que infraestrutura permaneça substituível.

O pivot não implica promessa de operação pública indefinidamente no plano Free. Capacidade, custos, restore/backup, egress, observabilidade e SLA devem ser reavaliados antes do beta e da abertura pública.

## 4. Topologia de ambientes

### 4.1 Desenvolvimento da aplicação

A aplicação pode ser executada localmente, mas a verificação integrada de banco/Auth/Data API deve usar ambiente Neon não produtivo.

Dados de desenvolvimento e teste devem ser fictícios ou anonimizados.

### 4.2 Neon Non-Production

Será utilizado um projeto Neon dedicado a ambientes não produtivos.

Esse projeto conterá:

- uma branch canônica de staging/homologação;
- branches curtas e descartáveis para migrations, testes de RLS, integração e experimentos controlados;
- Neon Auth/Data API configurados somente quando a Story correspondente exigir.

Branches temporárias devem ser resetadas ou removidas ao fim da verificação e nunca ser tratadas como fonte de verdade de schema.

### 4.3 Neon Production

Production utilizará projeto Neon separado do projeto non-production.

Objetivos:

- reduzir blast radius;
- impedir que reset/branching de desenvolvimento afete o beta real;
- manter secrets, usuários e dados de Production isolados;
- permitir que migrations verificadas sejam promovidas a partir do Git.

Production não recebe testes destrutivos.

## 5. Banco e migrations

A história canônica de schema será versionada no repositório em:

```text
database/migrations/*.sql
```

Testes executáveis de banco ficarão em:

```text
database/tests/*
```

Regras:

- nenhuma alteração estrutural permanente existe somente no Neon Console;
- migrations já aplicadas não são reescritas para alterar história;
- correções usam migration posterior;
- constraints, FKs, índices e RLS fazem parte da entrega quando aplicáveis;
- o tooling exato de execução será definido na Story de fundação de banco, sem introduzir ORM apenas para migrations;
- SQL/pgTAP podem ser usados para contratos de integridade e autorização quando apropriado.

## 6. Autenticação e Data API

Neon Auth é a solução canônica inicial de identidade.

Princípios:

- usuários e sessões ficam no schema gerenciado `neon_auth`;
- Auth deve ser configurado por ambiente/branch;
- secrets de Auth e cookies nunca são versionados;
- APIs/SDKs exatos devem ser verificados na documentação oficial corrente na Story de implementação;
- configuração de OAuth e e-mail permanece uma responsabilidade explícita das Stories de acesso, não desta decisão.

A Neon Data API será o caminho preferencial para CRUD normal que precise chegar ao banco sob contexto de usuário.

Quando a Data API for utilizada:

- JWT de Neon Auth deve ser validado pela camada de dados;
- tabelas expostas devem possuir RLS apropriada;
- políticas devem usar o helper corrente documentado pelo Neon para identidade autenticada (`auth.user_id()` na documentação verificada em OPS-002);
- acesso `authenticated` não é autorização suficiente sem predicado de ownership/visibilidade;
- acesso anônimo deve existir apenas onde o produto definir conteúdo público.

Conexão direta privilegiada ao Postgres fica reservada a migrations, manutenção e operações server-side explicitamente confiáveis. Credencial owner/BYPASSRLS não deve ser usada para CRUD comum nem para provar autorização de usuário.

## 7. RLS

RLS continua requisito de produto e não detalhe de implementação.

Toda tabela privada ou user-scoped exposta à Data API deve possuir política explícita para:

- SELECT;
- INSERT;
- UPDATE;
- DELETE, quando permitido;
- ownership/visibilidade;
- prevenção de transferência indevida de ownership;
- comportamento de usuário anônimo;
- comportamento de usuário autenticado não proprietário;
- papéis administrativos quando necessários.

Testes devem exercer identidades normais da aplicação e casos adversariais de IDOR/BOLA.

## 8. Storage

O Caleida não adota um provedor de Object Storage nesta tarefa.

Motivos:

- a aplicação ainda não possui fluxo de upload;
- Neon Object Storage está em beta em agosto de 2026;
- o produto exige portabilidade e infraestrutura substituível;
- escolher Storage agora criaria acoplamento sem benefício para o Incremento 0.

A futura Story de arquivos deverá verificar novamente o estado do Neon Object Storage e comparar, no mínimo, opções S3-compatible adequadas. Se Neon Object Storage estiver estável e satisfizer segurança, privacidade, custo, backup e lifecycle, ele poderá ser adotado por decisão posterior.

Até lá:

- capas externas permanecem por URL quando permitido;
- metadados de objetos futuros devem ser modelados independentemente do provedor;
- nenhum bucket ou credencial de Storage é criado em OPS-002.

## 9. Planejamento do Free tier

Valores observados em documentação oficial em 31/08/2026 e sujeitos a mudança:

- Neon Free: até 100 projetos;
- 10 branches incluídas por projeto;
- 100 CU-hours mensais por projeto;
- 0,5 GB de storage de banco por projeto;
- 5 GB de egress incluído;
- Neon Auth até 60 mil MAU no Free;
- restore/time travel limitado no Free.

Esses números são sinais de capacidade para desenvolvimento e beta controlado, não requisitos permanentes nem promessas contratuais do Caleida.

Antes do beta real e da abertura pública, revalidar preços, limites, disponibilidade regional, SLA, backup/restore, Auth, Data API e qualquer Storage selecionado.

## 10. Gates atualizados

### Beta fechado

Permanece obrigatório:

- Production e non-production isolados;
- Auth e RLS testados;
- backup/restauração adequados à fase;
- monitoramento de consumo;
- secrets separados;
- mobile utilizável;
- ausência de erros críticos.

### Abertura pública

A abertura não depende mais de uma migração específica para fora do Supabase Free.

Ela exige que a infraestrutura vigente tenha:

- capacidade e custos formalmente revisados;
- plano/recursos compatíveis com disponibilidade e retenção necessárias;
- backup e recuperação comprovados;
- SMTP/e-mail, moderação e suporte dimensionados;
- testes de carga e auditoria de segurança;
- limites de gasto e observabilidade adequados.

## 11. Fontes oficiais verificadas em OPS-002

- Neon Pricing: https://neon.com/pricing
- Neon Auth / branchable identity: https://neon.com/blog/neon-auth-branchable-identity-in-your-database
- Neon RLS guide: https://neon.com/docs/guides/row-level-security
- Neon Auth SDK migration/current Next.js API: https://neon.com/docs/auth/migrate/from-auth-v0.1
- Neon Object Storage beta: https://neon.com/blog/building-neon-object-storage
- Supabase billing / Free projects: https://supabase.com/docs/guides/platform/billing-on-supabase

Informações externas devem ser revalidadas na Story que efetivamente implementar cada integração.
