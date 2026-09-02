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
- CI permanente do head final da PR: `PASS` antes do merge.

---

# US-PLAT-009 — Separar variáveis por ambiente

**Estado:** CONCLUÍDO  
**Backlog:** `US-PLAT-009` / EPIC-00  
**Issue:** `#26`  
**PR:** `#27`

## Resultado

- criado `docs/ENVIRONMENTS.md` como contrato canônico de configuração;
- local, non-production/staging e Production foram separados explicitamente;
- Vercel Development/local mapeia para recursos locais/descartáveis/non-production;
- Vercel Preview futuro representa publicação non-production/staging e não pode receber secrets Production;
- Vercel Production futuro exige recursos/secrets Production dedicados;
- `.env.example` passou a ser deliberadamente não executável, com somente declarações comentadas e documentação;
- `DATABASE_URL` foi classificada como conexão pooled server-only de runtime futuro;
- `DATABASE_URL_UNPOOLED` permanece conexão direta server-only do tooling;
- `CALEIDA_DB_TARGET`, `CALEIDA_NEON_BRANCH_ID` e `CALEIDA_ALLOW_BASELINE_MIGRATIONS` foram documentados conforme comportamento realmente implementado;
- `baseline` permanece exclusivamente non-production;
- o tooling atual não possui alvo de migration Production e nenhum alvo fictício foi criado;
- nenhuma variável `NEXT_PUBLIC_*` é necessária nesta fase e secrets permanecem proibidos nesse namespace;
- criado `tests/environment-contract.test.mjs` para proteger `.env.example`, `.gitignore`, exposição pública e ausência de repository secrets/CD na CI;
- `docs/LOCAL_DEVELOPMENT.md` e `docs/VERCEL_RELEASE.md` foram reconciliados com o novo contrato;
- nenhum recurso/secret Neon ou Vercel foi criado ou alterado.

## Estado externo

Neon verificado em 01/09/2026:

```text
caleida-nonprod
PostgreSQL 18
baseline main / br-restless-cherry-awpcwy6r
```

- projeto `caleida-production`: ausente;
- Neon Auth/Data API/Object Storage: não implementados nesta Story.

Vercel verificada em 01/09/2026:

- nenhum projeto Caleida conectado;
- nenhuma variável Caleida remota configurada;
- nenhum Preview/Production executado.

## Verificação

Na PR #27, head de implementação `5b91c07d665b73a249a07665612bd4548fa888a1`, run `33549192981`:

- Node/npm pinados: `PASS`;
- `npm ci`: `PASS`;
- `npm run verify`: `PASS`;
- teste de contrato de ambientes: `PASS`;
- PostgreSQL server 18.x: `PASS`;
- `npm run verify:db`: `PASS`;
- `.env.example` sem assignments ativos: `PASS`;
- `.gitignore` mantém `.env*` ignorado exceto `.env.example`: `PASS`;
- variáveis sensíveis em `NEXT_PUBLIC_*`: `PASS — ausentes`;
- CI com repository secrets externos: `PASS — ausentes`;
- CI/CD/deployment surface: `PASS — ausente`;
- diff sem migration, dependência ou workflow alterado: `PASS`;
- gate Neon-specific: `SKIPPED — Story não depende de comportamento gerenciado do Neon`;
- deployment Vercel: `SKIPPED/PROIBIDO — nenhum deployment executado`;
- CI permanente do head documental final da PR: `PASS` antes do merge.

---

# US-PLAT-010 — Validar o ciclo técnico de entrega

**Estado:** CONCLUÍDO  
**Backlog:** `US-PLAT-010` / EPIC-00  
**Issue:** `#28`  
**PR:** `#29`  
**Tipo:** auditoria/validação final do Incremento 0 sem feature artificial

## Resultado

- a própria Story percorreu `Issue → branch → documentação mínima → CI → PR → review → merge → CI main`;
- head final da PR `935a7fb742b78bba0df97169366b4c7ce806977d` foi revisado sem finding bloqueante;
- CI da PR, run `33560189535`: `PASS`;
- merge squash ocorreu somente com o head verificado, gerando `4e0367957dc61b955e7b748244d50272b9209223`;
- CI pós-merge da `main`, run `33560364513`: `PASS`;
- `npm run verify`, PostgreSQL 18 e `npm run verify:db` passaram na PR e na `main`;
- diff da validação permaneceu documental, sem migration, dependência, código de produto ou workflow alterado;
- nenhum secret/token/connection string foi introduzido;
- gate Neon-specific: `SKIPPED — Story não depende de comportamento gerenciado do Neon`;
- Neon permaneceu somente com `caleida-nonprod/main`, PostgreSQL 18, sem recurso novo;
- Vercel foi inspecionada antes, durante e depois do merge e permaneceu sem projeto Caleida;
- nenhum Preview/Production/promote/rollback/redeploy foi executado;
- `docs/INCREMENT_0_VALIDATION.md` registra a evidência detalhada;
- o Incremento 0 foi tecnicamente validado e encerrado.

## Critérios de aceite

1. Issue/branch/PR reais: `PASS`;
2. CI permanente da PR: `PASS`;
3. diff limitado: `PASS`;
4. sem secret real: `PASS`;
5. sem deployment Vercel automático: `PASS`;
6. gate Neon-specific aplicado somente quando necessário: `PASS` (`SKIPPED` com motivo);
7. PR revisada e mergeada com head verificado: `PASS`;
8. CI pós-merge da `main`: `PASS`;
9. documentação canônica reconciliada com uma única próxima ação: `PASS`.

---

# OPS-005 — Refinar o Incremento 1 (EPIC-01 — Identidade e design system)

**Estado:** CONCLUÍDO APÓS INTEGRAÇÃO  
**Issue:** `#31`  
**Tipo:** planejamento/refino; nenhuma implementação de produto

## Resultado refinado

- criado `docs/INCREMENT_1_PLAN.md` como plano detalhado da fundação visual;
- o Incremento 1 operacional foi limitado a EPIC-01, sem alterar o incremento funcional de acesso controlado definido no Project Design;
- EPIC-01 foi decomposto em quatro Stories pequenas e ordenadas;
- a implementação atual foi inspecionada: `globals.css` ainda sem tokens, layout/page mínimos e logo horizontal oficial já presente em `public/brand`;
- NFR-01 responsividade e NFR-02 acessibilidade/WCAG 2.2 AA foram mantidos como requisitos transversais;
- não surgiu decisão arquitetural material que exija novo ADR;
- banco/Neon, Auth, Storage, Vercel deployment e features funcionais ficaram fora do escopo;
- exatamente uma próxima Story foi promovida: `US-DS-001`.

## Stories do incremento

1. `US-DS-001 — Materializar tokens de cor e temas base` — P0;
2. `US-DS-002 — Integrar tipografia e assinatura de marca` — P0;
3. `US-DS-003 — Criar primitivos acessíveis essenciais` — P0;
4. `US-DS-004 — Consolidar fundação responsiva e aplicar identidade à base` — P1.

Detalhamento, dependências e porta de saída: `docs/INCREMENT_1_PLAN.md`.

---

# US-DS-001 — Materializar tokens de cor e temas base

**Estado:** NEXT_ACTION  
**Backlog:** `US-DS-001` / EPIC-01  
**Incremento:** 1 — Fundação visual  
**Prioridade:** P0

## Objetivo

Codificar a paleta e os temas aprovados pelo Project Design como tokens CSS semânticos reutilizáveis, estabelecendo a primeira camada executável do design system sem criar componentes ou lógica de produto.

## Inspecionar antes de editar

1. Project Design §§21–27 e `docs/INCREMENT_1_PLAN.md`;
2. `src/app/globals.css`, `layout.tsx` e `page.tsx`;
3. configuração efetiva do Tailwind CSS 4 e `package.json`;
4. documentação oficial corrente do Tailwind CSS 4 para CSS-first theme variables quando a implementação depender dela;
5. comportamento atual de `color-scheme`/`prefers-color-scheme` no browser;
6. testes existentes e contrato de CI.

## Escopo esperado

- materializar uma camada canônica de tokens CSS para valores de marca e superfícies já aprovados;
- criar aliases semânticos para background, surfaces, border, text, accent e focus;
- representar temas claro/escuro e respeitar preferência do sistema sem JavaScript nesta Story;
- criar tokens de cores de categoria; valores ainda não hex-especificados pelo Project Design devem ser escolhidos/documentados com coerência visual e contraste;
- adicionar teste/contrato automatizado proporcional que proteja os tokens essenciais;
- manter a alteração independente de banco, Auth, Storage e deployment.

## Critérios de aceite

1. valores de marca e superfícies do Project Design existem em uma camada única de tokens;
2. aliases semânticos mínimos existem para `background`, `surface`, `surface-raised`, `border`, `text-primary`, `text-muted`, `accent` e `focus`;
3. light/dark funcionam pela preferência do sistema sem theme switch persistido ou JavaScript;
4. cores de categoria possuem tokens e nunca são tratadas como único identificador conceitual;
5. pares normais de texto/superfície atendem WCAG 2.2 AA quando aplicável;
6. não é adicionada dependência npm, componente, tela funcional, migration ou secret;
7. teste automatizado protege os tokens canônicos e os dois temas;
8. `npm run verify` e CI da PR: `PASS`;
9. banco/Neon-specific: `SKIPPED — nenhuma mudança de dados ou comportamento gerenciado do Neon`;
10. Vercel deployment: `SKIPPED/PROIBIDO — release permanece humana/manual`.

## Non-goals

- integrar Manrope/Newsreader;
- completar logo/favicon/variantes de marca;
- criar componentes de UI;
- redesenhar integralmente a página inicial;
- persistir preferência de tema;
- implementar Auth ou qualquer Story de EPIC-02.

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
