# Registro de decisões

Este documento registra decisões de produto e arquitetura que não devem ser alteradas silenciosamente.

---

## DEC-001 — Plataforma pública com beta fechado

**Data:** 03 de agosto de 2026  
**Status:** Aprovada

### Decisão

O Caleida será construído como plataforma pública multiusuário, mas seu lançamento inicial ocorrerá por convite ou aprovação administrativa.

### Consequências

- A arquitetura deve suportar múltiplas contas desde o início.
- Privacidade, moderação e isolamento não podem ser adicionados apenas no final.
- O beta controlará custos, estabilidade e crescimento antes da abertura pública.

---

## DEC-002 — Catálogo global e biblioteca pessoal separados

**Data:** 03 de agosto de 2026  
**Status:** Aprovada

### Decisão

Cada obra terá um registro global compartilhado. Status, progresso, nota, favorito, resenha e demais dados de consumo pertencerão à relação individual entre usuário e obra.

### Consequências

- Uma obra não deve ser duplicada por usuário.
- Exclusão de uma entrada pessoal não exclui o registro global.
- Mesclagens do catálogo devem preservar todos os dados pessoais relacionados.

---

## DEC-003 — Stack técnica de referência original

**Data:** 03 de agosto de 2026  
**Status:** SUPERSEDED por `DEC-007`

### Decisão histórica

A stack inicial foi definida como GitHub, Codex, Next.js, React, TypeScript, Tailwind CSS, Vercel e Supabase.

### Motivo da supersessão

Antes do início da implementação, a limitação de projetos gratuitos do Supabase e a evolução da plataforma Neon tornaram mais adequado adotar Neon para banco/identidade/Data API/RLS.

A decisão permanece registrada para preservar histórico; não deve ser usada como arquitetura ativa.

---

## DEC-004 — Supabase Free como infraestrutura temporária

**Data:** 03 de agosto de 2026  
**Status:** SUPERSEDED por `DEC-007`

### Decisão histórica

O plano gratuito do Supabase seria utilizado para desenvolvimento, staging e beta fechado controlado, com Supabase local para desenvolvimento.

### Motivo da supersessão

O Supabase Free continua limitado a dois projetos ativos por usuário Owner/Admin. O Caleida passa a utilizar Neon como plataforma canônica antes de qualquer schema ou integração Supabase ter sido implementada.

Nenhum recurso Supabase precisou ser migrado.

---

## DEC-005 — Desenvolvimento incremental por User Story

**Data:** 03 de agosto de 2026  
**Status:** Aprovada

### Decisão

O produto será construído por incrementos, épicos e User Stories pequenas e verificáveis.

### Consequências

- Cada tarefa deve possuir critérios de aceite e fora do escopo.
- Uma sessão de IA não deve receber a ordem de construir o produto completo.
- Cada entrega deve atualizar Checkpoint e documentação afetada.
- Funcionalidades futuras não devem ser antecipadas sem necessidade.

---

## DEC-006 — Mudanças de banco somente por migration

**Data:** 03 de agosto de 2026  
**Status:** Aprovada

### Decisão

Toda alteração estrutural do banco será versionada no repositório por meio de migrations.

### Consequências

- Alterações realizadas apenas pelo painel/Console não representam estado oficial.
- O banco deve poder ser reconstruído estruturalmente a partir do Git.
- RLS, constraints e índices fazem parte da mesma entrega da funcionalidade quando aplicáveis.
- Migrations aplicadas não são reescritas; correções usam nova migration.

---

## DEC-007 — Neon como plataforma canônica de dados e identidade

**Data:** 31 de agosto de 2026  
**Status:** Aprovada

### Contexto

O Caleida ainda não possui aplicação, migrations, schema de produto, Auth implementado ou banco hospedado. O Supabase Free possui limite atual de dois projetos ativos, enquanto o Neon Free oferece margem significativamente maior de projetos e branching. Neon Auth foi reconstruído sobre Better Auth com identidade branchable, e Neon Data API integra JWT com PostgreSQL RLS.

### Decisão

O Caleida adotará:

- Neon Postgres para persistência relacional;
- Neon Auth como solução inicial de autenticação;
- Neon Data API como caminho preferencial para CRUD normal sob contexto de usuário quando apropriado;
- PostgreSQL RLS como camada persistente de autorização;
- projeto Neon separado para Production;
- projeto Neon separado para non-production/staging;
- branches Neon descartáveis no projeto non-production para migrations, testes e verificação;
- migrations canônicas no repositório em `database/migrations/`;
- testes de banco em `database/tests/`.

### Consequências

- `DEC-003` e `DEC-004` tornam-se históricas/superseded.
- Referências ativas a Supabase Postgres/Auth/Storage/local deixam de governar a implementação.
- Production não será usada como laboratório de migration/RLS.
- JWT/RLS devem ser testados com identidade normal da aplicação, não com owner/BYPASSRLS.
- O helper de identidade e APIs exatas devem sempre seguir a documentação oficial corrente; em OPS-002, o Neon documenta `auth.user_id()` para RLS.
- Connection strings, API keys, cookie secrets e OAuth secrets permanecem fora do Git.
- A adoção do Neon Free não elimina gates de capacidade/custo antes do beta e da abertura pública.

### Evidência documental verificada em OPS-002

Em 31/08/2026, a documentação oficial consultada indicava:

- Neon Free com 100 projetos e 10 branches incluídas por projeto;
- Neon Auth disponível no Free e integrado ao schema `neon_auth`;
- Neon Data API com JWT e RLS;
- Supabase Free limitado a dois projetos ativos.

Esses limites são externos e devem ser revalidados antes de decisões financeiras/operacionais futuras.

---

## DEC-008 — Storage desacoplado e decisão adiada

**Data:** 31 de agosto de 2026  
**Status:** Aprovada

### Contexto

O produto precisará de armazenamento próprio para avatar, banner e outros arquivos, mas nenhum fluxo de upload existe no Incremento 0. Neon Object Storage foi disponibilizado em beta e ainda não deve ser tratado como dependência estável de produção sem nova avaliação.

### Decisão

O Caleida não escolherá provedor de Object Storage em OPS-002.

A camada de arquivos deve permanecer provider-independent até a Story correspondente. Naquele momento, a sessão deve verificar novamente Neon Object Storage e alternativas S3-compatible adequadas.

### Consequências

- Neon Object Storage não é dependência canônica nesta fase.
- Nenhum bucket ou credencial de Storage será criado antecipadamente.
- Capas externas continuam por URL quando permitido.
- Metadados de arquivos futuros devem ser modelados de forma que o provedor possa ser substituído.
- A escolha posterior exige avaliação de privacidade, autorização, lifecycle, backup, custo, regiões e maturidade do serviço.
