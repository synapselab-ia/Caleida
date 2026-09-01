# Execution Plan — Caleida

**Status:** roadmap operacional canônico  
**Regra:** uma `NEXT_ACTION` limitada por vez  
**Roadmap de produto:** `docs/PRODUCT_BACKLOG.md`

Este documento transforma o backlog macro em tarefas executáveis.

---

# OPS-001 — Modernizar o protocolo canônico

**Estado:** CONCLUÍDO

Resultado: Source of Truth, AI Work Protocol, Verification Protocol, Deployment Policy, Execution Plan e Checkpoint tornaram o repositório recuperável sem memória de chat.

---

# OPS-002 — Formalizar o pivot Supabase → Neon

**Estado:** CONCLUÍDO

Resultado: plataforma Neon formalizada, ambientes isolados definidos, migrations/testes planejados em `database/`, Storage adiado e Project Design reconciliado por amendment.

---

# OPS-003 — Reconciliar a política de deployment

**Estado:** CONCLUÍDO

Resultado: deployment Vercel passou a ser exclusivamente humano/manual; CI ficou separada de CD; Project Design/backlog foram reconciliados.

---

# OPS-004 — Evoluir o registro de decisões para ADRs

**Estado:** CONCLUÍDO

Resultado: `docs/adr/` tornou-se autoridade arquitetural, decisões existentes foram migradas com supersessões preservadas e a primeira Story técnica foi refinada.

---

# US-PLAT-001 — Inicializar a aplicação web

**Estado:** CONCLUÍDO  
**Backlog:** `US-PLAT-001` / EPIC-00

## Resultado

- Next.js 16.3.3 / React 19.2.8;
- App Router em `src/app`;
- TypeScript strict;
- Tailwind CSS 4;
- Node 24.20.0 em `.nvmrc`;
- npm 11.19.0 e `package-lock.json` canônico;
- scripts reais `dev`, `lint`, `typecheck`, `test`, `build`;
- smoke test mínimo;
- README com comandos locais;
- nenhum domínio de produto ou infraestrutura externa.

## Verificação

Em runner GitHub Actions descartável, usando Node 24.20.0/npm 11.19.0:

- geração do lockfile: `PASS`;
- `npm ci`: `PASS`;
- `npm run lint`: `PASS`;
- `npm run typecheck`: `PASS`;
- `npm test`: `PASS`;
- `npm run build`: `PASS`.

---

# US-PLAT-003 — Configurar o ambiente local da aplicação

**Estado:** CONCLUÍDO  
**Backlog:** `US-PLAT-003` / EPIC-00

## Resultado

- criado `docs/LOCAL_DEVELOPMENT.md` como guia canônico de desenvolvimento local;
- README reduzido a entrada rápida e link para o guia completo;
- pré-requisitos Node `24.20.0` e npm `11.19.0` documentados e validados;
- fluxo clone limpo → `npm ci` → `npm run dev` documentado;
- `.env.example` formalizado como contrato seguro, sem variáveis fictícias nem secrets;
- regras para futuras variáveis server-side e `NEXT_PUBLIC_*` documentadas;
- gates locais e troubleshooting objetivo documentados;
- nenhum serviço remoto foi conectado.

## Verificação

Em runner GitHub Actions descartável:

- Node `24.20.0`: `PASS`;
- npm `11.19.0`: `PASS`;
- `npm ci`: `PASS`;
- `npm run dev` + resposta HTTP local: `PASS`;
- `npm run lint`: `PASS`;
- `npm run typecheck`: `PASS`;
- `npm test`: `PASS`;
- `npm run build`: `PASS`;
- secrets: `PASS — nenhum`;
- Neon/Vercel/deployment: `SKIPPED — fora do escopo`.

---

# US-PLAT-004 — Configurar a fundação Neon de desenvolvimento

**Estado:** CONCLUÍDO  
**Backlog:** `US-PLAT-004` / EPIC-00  
**Issue:** `#14`

## Resultado

- criado o projeto Neon `caleida-nonprod` na organização conectada;
- PostgreSQL 18 provisionado em `aws-us-east-1`;
- branch default Neon `main` adotada como baseline canônica non-production/staging;
- criado `docs/NEON_NONPROD.md` como inventário operacional do recurso remoto;
- convenção `verify/<task-id>` e `dev/<task-id>` documentada para branches descartáveis;
- `.env.example` passou a reservar, sem valores, `DATABASE_URL` e `DATABASE_URL_UNPOOLED` para tooling futuro;
- Production, Neon Auth, Data API, Object Storage e schema de produto permaneceram não provisionados.

## Estado remoto registrado

```text
Projeto: caleida-nonprod
Project ID: patient-glade-95136440
Região: aws-us-east-1
PostgreSQL: 18
Baseline branch: main
Branch ID: br-restless-cherry-awpcwy6r
Database default: neondb
```

IDs de recurso não são secrets. Nenhuma connection string, senha ou API key foi versionada.

## Verificação

Via Neon conectado:

- projeto `caleida-nonprod`: `PASS`;
- branch baseline `main`: `PASS`;
- PostgreSQL 18 / região esperada: `PASS`;
- nenhuma operação SQL/migration executada nesta Story: `PASS`;
- Production não provisionada: `PASS`;
- Auth/Data API/Storage não provisionados: `PASS`;
- secrets no Git: `PASS — nenhum`;
- branch adicional `staging`: `SKIPPED — baseline default main adotada como non-production/staging`;
- branch descartável de prova: `BLOCKED — ação de branching do conector apresenta inconsistência de schema e deve ser revalidada antes de migration destrutiva`.

O defeito do conector não impede encerrar a fundação: existe uma baseline non-production identificável e nenhum schema foi aplicado. Ele é, porém, precondição operacional para a próxima Story antes de qualquer migration/teste destrutivo.

---

# US-PLAT-005 — Definir migrations, testes de banco e RLS

**Estado:** NEXT_ACTION  
**Backlog:** `US-PLAT-005` / EPIC-00  
**Tipo:** fundação de schema/autorização

## Objetivo

Criar a infraestrutura versionada mínima para migrations, testes de banco e RLS, sem iniciar o schema funcional completo de catálogo/biblioteca.

Ao final, o Git deve conseguir representar e verificar uma baseline de banco reproduzível em branch Neon isolada.

## Dependências

- `US-PLAT-004` concluída;
- `ADR-004` — mudanças de banco somente por migrations;
- `ADR-005` — Neon como plataforma canônica;
- projeto `caleida-nonprod` existente;
- baseline Neon `main` existente;
- branching isolado precisa estar operacional antes de executar alteração destrutiva.

## Inspecionar antes de editar

1. documentação oficial Neon corrente para branching, connection strings e Postgres 18;
2. `docs/NEON_NONPROD.md` e `docs/NEON_PLATFORM.md`;
3. `ADR-004` e `ADR-005`;
4. estado remoto atual do projeto `caleida-nonprod`;
5. ação de branch do conector Neon — revalidar a inconsistência registrada em US-PLAT-004;
6. `package.json`, `.env.example` e política de secrets;
7. necessidade real de dependência npm para runner de migrations — preferir solução simples e reproduzível.

## Precondição de segurança

Antes de aplicar qualquer DDL de teste:

- criar uma branch Neon descartável;
- passar explicitamente o branch ID em toda operação de banco;
- não usar a baseline `main` como laboratório destrutivo;
- se a criação de branch isolada continuar indisponível, marcar a Story `BLOCKED` em vez de aplicar migration diretamente na baseline.

## Escopo esperado

- criar `database/migrations/`;
- criar `database/tests/`;
- definir convenção de nomes/ordem de migrations;
- definir runner reproduzível para aplicar migrations a uma URL de banco fornecida por ambiente;
- criar somente a baseline técnica mínima necessária para provar o pipeline de migrations/RLS;
- incluir teste(s) que provem reconstrução/estado esperado;
- estabelecer padrão para testes futuros de RLS: owner, non-owner, anonymous e payload forjado quando existirem tabelas user-scoped;
- manter connection strings fora do Git;
- aplicar/verificar somente em branch Neon descartável;
- promover para a baseline non-production somente se a mudança persistente estiver versionada e os gates passarem.

## Limite de domínio

Esta Story não deve antecipar modelagem completa de catálogo, biblioteca, perfil ou social.

Uma migration técnica mínima pode existir apenas para provar o mecanismo se tiver propósito claro e não congelar prematuramente entidades de produto.

## Segurança

- nenhuma credencial no Git, Issue, PR ou logs voluntários;
- owner/admin apenas para migrations/manutenção;
- owner/BYPASSRLS não conta como teste de autorização de usuário;
- RLS deve ser testada na camada de banco quando houver tabela exposta/user-scoped;
- nenhuma operação em Production;
- nenhuma Data API/Auth apenas para completar esta Story, salvo decisão técnica estritamente necessária e revalidada.

## Critérios de aceite

1. `database/migrations/` existe e possui convenção documentada;
2. `database/tests/` existe e possui runner/contrato reproduzível;
3. uma branch Neon descartável é usada para provar aplicação desde baseline conhecida;
4. nenhuma mudança estrutural existe apenas no Console;
5. testes aplicáveis passam;
6. connection strings/secrets não são versionados;
7. baseline non-production só recebe alteração persistente que esteja no Git;
8. documentação e Checkpoint refletem estado real;
9. Production/Vercel/deployment permanecem fora do escopo.

## Verificação obrigatória

- criar branch Neon descartável;
- aplicar migrations desde baseline conhecida;
- executar testes de banco;
- inspecionar schema/constraints/RLS aplicáveis;
- comparar/reconstruir quando necessário;
- limpar branch descartável ao final;
- executar gates de aplicação se dependências/scripts de app forem alterados;
- revisar diff e secrets.

## Non-goals

- schema funcional completo do produto;
- Neon Auth/Data API na aplicação;
- Object Storage;
- CI permanente (`US-PLAT-007`);
- Vercel/project/deployment;
- Production;
- feature de negócio.

---

# Contrato de execução

Para cada tarefa:

1. recuperar estado pelo protocolo;
2. confirmar `NEXT_ACTION`;
3. inspecionar repositório/documentação;
4. criar/usar Issue e branch limitadas;
5. implementar somente o necessário;
6. executar Verification Protocol;
7. revisar diff;
8. atualizar docs/ADRs quando aplicável;
9. atualizar Checkpoint;
10. abrir/revisar/mergear PR;
11. deixar uma única próxima ação.

Deployment segue `ADR-007` e nunca é consequência automática do fluxo.
