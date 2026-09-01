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
- `.env.example` formalizado como contrato seguro;
- gates locais e troubleshooting documentados;
- nenhum serviço remoto foi conectado.

## Verificação

Em runner GitHub Actions descartável:

- Node `24.20.0`: `PASS`;
- npm `11.19.0`: `PASS`;
- `npm ci`: `PASS`;
- `npm run dev` + resposta HTTP local: `PASS`;
- lint/typecheck/test/build: `PASS`;
- secrets: `PASS — nenhum`;
- Neon/Vercel/deployment: `SKIPPED — fora do escopo`.

---

# US-PLAT-004 — Configurar a fundação Neon de desenvolvimento

**Estado:** CONCLUÍDO  
**Backlog:** `US-PLAT-004` / EPIC-00  
**Issue:** `#14`

## Resultado

- criado o projeto Neon `caleida-nonprod`;
- PostgreSQL 18 em `aws-us-east-1`;
- branch default Neon `main` adotada como baseline canônica non-production/staging;
- `docs/NEON_NONPROD.md` registra o recurso remoto;
- Production, Neon Auth, Data API, Object Storage e schema de produto permaneceram não provisionados.

## Estado remoto

```text
Projeto: caleida-nonprod
Project ID: patient-glade-95136440
Região: aws-us-east-1
PostgreSQL: 18
Baseline branch: main
Branch ID: br-restless-cherry-awpcwy6r
Database default: neondb
```

---

# US-PLAT-005 — Definir migrations, testes de banco e RLS

**Estado:** CONCLUÍDO  
**Backlog:** `US-PLAT-005` / EPIC-00  
**Issue:** `#16`  
**PR:** `#19`

## Resultado

- criado `database/migrations/` com convenção sequencial e migration técnica inicial;
- criado `database/tests/` com testes executáveis de baseline e versão PostgreSQL;
- criado runner Node + `psql`, sem ORM/dependência npm adicional;
- ledger interno `caleida_internal.schema_migrations` registra filename/checksum/data de aplicação;
- SHA-256 detecta migration histórica alterada;
- `db:migrations:check`, `db:migrate` e `db:test` integram o contrato do repositório;
- guardrails distinguem `ephemeral`, `neon-isolated` e promoção explícita `baseline`;
- baseline Neon não pode ser usada como alvo de teste;
- contrato futuro de testes RLS cobre owner, non-owner, anonymous e ownership forjado;
- nenhuma entidade funcional do produto foi antecipada.

## ADR-008

- SQL/RLS PostgreSQL portável usa PostgreSQL descartável da mesma versão major do Neon como gate primário;
- comportamento específico do Neon exige gate adicional em branch Neon isolada quando aplicável;
- Neon permanece plataforma canônica conforme `ADR-005`;
- indisponibilidade de branching Neon não autoriza usar a baseline `main` como laboratório.

## Verificação

Em GitHub Actions descartável com `postgres:18`:

- PostgreSQL server 18.x: `PASS`;
- `npm ci`: `PASS`;
- `npm run db:migrations:check`: `PASS`;
- primeira aplicação de migrations: `PASS`;
- testes SQL: `PASS`;
- segunda aplicação sem duplicar ledger: `PASS`;
- drop/recreate + migrations + testes desde zero: `PASS`;
- lint/typecheck/test/build: `PASS`;
- secrets reais: `PASS — nenhum`;
- Neon-specific gate: `SKIPPED — migration técnica usa somente primitives PostgreSQL portáveis`;
- Production/Vercel/deployment: `SKIPPED — fora do escopo`.

---

# US-PLAT-006 — Configurar validações automatizadas

**Estado:** CONCLUÍDO  
**Backlog:** `US-PLAT-006` / EPIC-00  
**Issue:** `#20`  
**PR:** `#21`

## Resultado

- criado `npm run verify` como entrada canônica de verificação padrão;
- ordem do gate: `db:migrations:check → lint → typecheck → test → build`;
- criado `npm run verify:db` como gate integrado separado: `db:migrate → db:test`;
- teste `tests/verification-contract.test.mjs` fixa o contrato e a ordem dos comandos;
- nenhuma dependência ou alteração de lockfile foi necessária;
- nenhum workflow permanente foi criado nessa Story.

## Verificação

- `npm ci`: `PASS`;
- `npm run verify`: `PASS`;
- PostgreSQL server 18.x: `PASS`;
- `npm run verify:db`: `PASS`;
- Vercel/deployment: `SKIPPED — fora do escopo`.

---

# US-PLAT-007 — Configurar integração contínua

**Estado:** CONCLUÍDO  
**Backlog:** `US-PLAT-007` / EPIC-00  
**Issue:** `#22`  
**PR:** `#23`

## Resultado

- criado `.github/workflows/ci.yml` como CI permanente;
- triggers: pull requests para `main` e pushes integrados na `main`;
- `permissions: contents: read` como única permissão do `GITHUB_TOKEN`;
- `actions/checkout@v7` e `actions/setup-node@v7`;
- Node lido de `.nvmrc` e contrato npm `11.19.0` verificado;
- `npm ci` + `npm run verify` executados;
- service container `postgres:18` provisionado sem credencial Neon;
- versão major do servidor PostgreSQL verificada antes do gate de banco;
- `npm run verify:db` executado com `CALEIDA_DB_TARGET=ephemeral`;
- `tests/ci-contract.test.mjs` protege comandos, PostgreSQL, permissões e ausência de superfície de deployment;
- `docs/CI.md` documenta o contrato operacional;
- nenhum cache foi adicionado sem benefício demonstrado;
- nenhum secret externo ou CD foi introduzido.

## Verificação

Na PR #23, run permanente `33545687786`:

- sintaxe/workflow carregado pelo GitHub: `PASS`;
- service container PostgreSQL: `PASS`;
- checkout/setup Node: `PASS`;
- Node `24.20.0`: `PASS`;
- npm `11.19.0`: `PASS`;
- `npm ci`: `PASS`;
- `npm run verify`: `PASS`;
- PostgreSQL server 18.x: `PASS`;
- `npm run verify:db`: `PASS`;
- permissões: `PASS — contents: read`;
- secrets externos: `PASS — nenhum`;
- Vercel/deployment/CD: `PASS — ausente`.

---

# US-PLAT-008 — Preparar hosting Vercel para release manual

**Estado:** CONCLUÍDO  
**Backlog:** `US-PLAT-008` / EPIC-00  
**Issue:** `#24`  
**PR:** `#25`

## Resultado

- criado `vercel.json` com `$schema` oficial e `git.deploymentEnabled: false`;
- configuração revalidada contra documentação oficial Vercel corrente em 01/09/2026;
- criado `tests/vercel-config-contract.test.mjs` para proteger o guardrail e rejeitar a chave legada `github`;
- criado `docs/VERCEL_RELEASE.md` como runbook separado do CI;
- runbook registra pré-condições, fluxo manual, proibições de automação e tratamento de falha;
- alerta operacional documentado: o primeiro deployment de um projeto Vercel novo é Production mesmo sem `--prod`;
- `.vercel/` permanece ignorado;
- `.github/workflows/ci.yml` permaneceu sem Vercel, deploy hooks, tokens de publicação ou CD;
- nenhum projeto Caleida foi conectado/importado na Vercel;
- nenhum deployment Preview/Production foi executado;
- nenhuma mudança de banco, migration ou recurso Neon foi necessária.

## Verificação

Na PR #25:

- configuração `git.deploymentEnabled: false`: `PASS — coerente com documentação oficial corrente`;
- `github.enabled` legado: `PASS — ausente`;
- runbook de release manual: `PASS — somente usuário publica`;
- CI sem deployment surface: `PASS — protegido por teste existente`;
- secrets/tokens/deploy hooks: `PASS — nenhum introduzido`;
- Neon-specific gate: `SKIPPED — Story não toca Neon/banco`;
- deployment Vercel: `SKIPPED/PROIBIDO — nenhum deployment executado`;
- verificação local no runner da sessão: `BLOCKED — ambiente sem resolução de github.com`; CI permanente permanece gate autoritativo;
- CI permanente do head final da PR deve estar `PASS` antes do merge.

---

# US-PLAT-009 — Separar variáveis por ambiente

**Estado:** NEXT_ACTION  
**Backlog:** `US-PLAT-009` / EPIC-00  
**Tipo:** contrato/configuração de ambientes sem versionar secrets

## Objetivo

Definir e materializar a separação de configuração entre desenvolvimento local, non-production/staging e Production, mantendo valores sensíveis fora do Git e preservando o fluxo de release Vercel exclusivamente manual.

## Dependências

- `US-PLAT-008` concluída;
- `ADR-005` vigente para Neon;
- `ADR-007` vigente para release Vercel manual;
- `.env.example` existente como contrato seguro;
- `docs/VERCEL_RELEASE.md` existente como runbook de release.

## Inspecionar antes de editar

1. `.env.example`, `.gitignore`, documentação local e runbook Vercel;
2. variáveis realmente exigidas pelo código e tooling atual;
3. estado real dos projetos/ambientes Vercel e Neon quando aplicável, sem criar deployment;
4. documentação oficial corrente de Vercel/Neon para escopo, nomes e exposição de variáveis;
5. CI para garantir que secrets externos não sejam introduzidos sem necessidade.

## Escopo esperado

- separar contratos de variáveis para local, non-production/staging e Production;
- documentar quais variáveis são server-only e quais podem ser públicas;
- manter `.env.example` sem valores sensíveis;
- impedir reutilização acidental de credenciais Production em Preview/non-production;
- documentar onde o usuário configurará secrets externos quando uma futura release exigir;
- não criar valores fictícios que pareçam credenciais reais;
- não antecipar Auth/Data API/schema funcional que ainda não existe;
- não executar deployment.

## Critérios de aceite

1. existe contrato claro de variáveis por ambiente;
2. nenhum secret real está no Git;
3. nenhuma variável sensível usa `NEXT_PUBLIC_*`;
4. non-production e Production ficam explicitamente separados;
5. CI continua sem secrets externos desnecessários e sem CD;
6. documentação de desenvolvimento/release aponta o contrato correto;
7. checkpoint reflete o estado real.

## Verificação obrigatória

- `npm run verify` via CI permanente;
- revisar `.env.example`, `.gitignore` e documentação alterada;
- revisar diff por tokens, senhas, connection strings e IDs sensíveis indevidos;
- confirmar ausência de deployment/CD;
- usar gate Neon-specific somente se a Story passar a depender de comportamento gerenciado do Neon; caso contrário registrar `SKIPPED`.

## Non-goals

- implementar Neon Auth/Data API;
- criar schema funcional;
- provisionar Production Neon sem Story/autorização correspondente;
- escolher Object Storage;
- executar Preview/Production Vercel;
- adicionar CD.

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
