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

**Estado:** CONCLUÍDO APÓS INTEGRAÇÃO  
**Backlog:** `US-DS-001` / EPIC-01  
**Incremento:** 1 — Fundação visual  
**Prioridade:** P0  
**Issue:** `#33`  
**PR:** `#34`

## Resultado

- `src/app/globals.css` passou a conter a paleta canônica do Project Design em `@theme`;
- aliases semânticos foram criados para background, surface, surface-raised, border, text-primary, text-muted, accent e focus;
- `@theme inline` conecta aliases runtime ao namespace de cores do Tailwind CSS 4;
- light/dark seguem `prefers-color-scheme` sem JavaScript, cookie, localStorage ou theme switch persistido;
- `color-scheme` acompanha a preferência do sistema;
- categorias recebem tokens próprios;
- Manhua/coral = `#D9685B`, Série/ciano = `#278EAF` e Anime/verde-azulado = `#278F83` foram documentados em `docs/DESIGN_TOKENS.md`;
- accent/focus dark = `#A994FF`, tint acessível derivado do violeta canônico, sem substituir `--color-brand-violet`;
- `tests/design-tokens-contract.test.mjs` calcula contraste a partir dos tokens e protege ambos os temas;
- não houve dependência npm, componente, tela funcional, migration, secret ou infraestrutura.

## Verificação

- documentação oficial corrente do Tailwind CSS 4 para `@theme`/`@theme inline`: verificada em 02/09/2026;
- CI inicial da PR #34, run `33645092044`: `PASS` para `npm run verify`, PostgreSQL 18 e `npm run verify:db`;
- contraste light: texto principal `>= 14.72:1`, muted `>= 4.90:1`, accent `>= 4.57:1`;
- contraste dark: texto principal `>= 14.77:1`, muted `>= 6.73:1`, accent `>= 6.44:1`;
- focus: `>= 3:1` contra background/surfaces suportadas;
- banco/Neon-specific: `SKIPPED — nenhuma mudança de dados ou comportamento gerenciado do Neon`;
- Vercel deployment: `SKIPPED/PROIBIDO — release permanece humana/manual`;
- CI do head documental final da PR deve estar `PASS` antes do merge; evidência pós-merge fica registrada em #33/#34.

---

# US-DS-002 — Integrar tipografia e assinatura de marca

**Estado:** CONCLUÍDO APÓS INTEGRAÇÃO  
**Backlog:** `US-DS-002` / EPIC-01  
**Incremento:** 1 — Fundação visual  
**Prioridade:** P0  
**Issue:** `#35`  
**PR:** `#36`

## Resultado

- `src/app/fonts.ts` centraliza Manrope e Newsreader por `next/font/google`;
- Manrope é a tipografia padrão da interface;
- Newsreader possui papel editorial separado para resenhas, citações e retrospectivas;
- `src/app/layout.tsx` instala as variáveis tipográficas no layout raiz;
- `src/app/globals.css` expõe `font-sans` e `font-editorial`, preservando integralmente os tokens de US-DS-001;
- `docs/BRAND_TYPOGRAPHY.md` documenta carregamento, fallbacks, rendering, papel editorial e regras de uso da marca;
- `src/components/brand/CaleidaLogo.tsx` integra somente o ativo `public/brand/caleida-logo-horizontal.png` por `next/image`, usando caminho público, caixa responsiva estável, `fill` e `object-contain`;
- `public/brand/README.md` foi reconciliado com o inventário real e mantém versões clara/escura, símbolo, favicon, vetores e ícones como pendências;
- `tests/brand-typography-contract.test.mjs` protege fontes, tokens tipográficos, ativo oficial e ausência de variantes fabricadas;
- `src/app/page.tsx` permaneceu sem redesign; aplicação da identidade à base continua reservada a US-DS-004;
- nenhuma dependência npm, migration, banco, Auth, Data API, RLS, Storage, workflow CI ou deployment foi adicionada.

## Verificação

- documentação oficial corrente do Next.js para `next/font`: revalidada em 02/09/2026;
- run inicial da PR #36 `33653117310`: `FAIL` legítimo no typecheck por import estático do PNG fora de `src/`;
- a causa foi corrigida usando caminho público no `next/image`, sem relaxar teste, TypeScript ou CI;
- run corrigido da PR #36 `33653441581`, head `f6db6b5237ae77ac1597bc5889c8acf21204792d`: `PASS`;
- `npm run verify`: `PASS`;
- PostgreSQL 18 + `npm run verify:db`: `PASS`;
- dependências/package-lock: `PASS — nenhuma alteração`;
- banco/Neon-specific: `SKIPPED — nenhuma mudança de dados ou comportamento gerenciado do Neon`;
- consulta/mutação remota Neon: `SKIPPED — não aplicável ao escopo visual`;
- verificação visual em browser: `SKIPPED — o logo não é aplicado à página base nesta Story e composição visual pertence a US-DS-004`;
- Vercel deployment: `SKIPPED/PROIBIDO — release permanece humana/manual`;
- CI do head documental final da PR deve estar `PASS` antes do merge; evidência pós-merge deve ficar registrada em #35/#36.

---

# US-DS-003 — Criar primitivos acessíveis essenciais

**Estado:** CONCLUÍDO APÓS INTEGRAÇÃO  
**Backlog:** `US-DS-003` / EPIC-01  
**Incremento:** 1 — Fundação visual  
**Prioridade:** P0  
**Issue:** `#37`  
**PR:** `#38`

## Resultado

- `src/components/ui/Button.tsx` usa `<button>` nativo, `type="button"` por padrão, variantes mínimas, hover somente em enabled, disabled nativo e `focus-visible` explícito;
- `src/components/ui/FormField.tsx` usa `<label>` + `<input>`, associa descrição/erro via `aria-describedby`, emite `aria-invalid` apenas em erro e mantém pistas textuais de obrigatório/falha;
- `src/components/ui/Feedback.tsx` distingue informação estática, status não urgente e alertas urgentes sem tornar toda mensagem uma live region;
- `docs/UI_PRIMITIVES.md` registra API, semântica, referências WAI/WCAG e limites;
- `tests/ui-primitives-contract.test.mjs` protege HTML nativo, foco, estados, relações ARIA, live-region roles e ausência de biblioteca externa;
- a página base permaneceu inalterada e nenhuma feature funcional foi criada;
- nenhuma dependência npm, migration, banco, Auth, Data API, RLS, Storage, workflow CI ou deployment foi adicionada.

## Verificação

- WAI/WCAG corrente para foco visível, non-text contrast, labels, `aria-describedby`, `aria-invalid` e status messages: revalidada em 02/09/2026;
- baseline `main` `1fda10cd786749b2d5c220144b25b3c08ca92c79`, CI `33654393286`: `PASS`;
- CI inicial da PR #38, head `3839651f980ae6c693572fc6f2b4bd8045910736`, run `33656150580`: `PASS`;
- `npm run verify`: `PASS`;
- PostgreSQL 18 + `npm run verify:db`: `PASS`, embora sem impacto semântico desta Story;
- dependências/package-lock: `PASS — nenhuma alteração`;
- banco/Neon-specific: `SKIPPED — Story visual sem mudança de dados ou comportamento gerenciado do Neon`;
- consulta/mutação remota Neon: `SKIPPED — não aplicável ao escopo`;
- verificação visual composta em browser: `SKIPPED — primitivos não são montados na página nesta Story; composição pertence a US-DS-004`;
- Vercel deployment: `SKIPPED/PROIBIDO — release permanece humana/manual`;
- CI do head documental final da PR deve estar `PASS` antes do merge; evidência pós-merge deve ficar registrada em #37/#38.

---

# US-DS-004 — Consolidar fundação responsiva e aplicar identidade à base

**Estado:** NEXT_ACTION  
**Backlog:** `US-DS-004` / EPIC-01  
**Incremento:** 1 — Fundação visual  
**Prioridade:** P1

## Objetivo

Provar a fundação visual já construída no layout raiz e na página técnica existente, com composição responsiva e acessível, sem criar fluxo, ação ou funcionalidade de produto que ainda não exista.

## Inspecionar antes de editar

1. `docs/PROJECT_DESIGN.md` §§21–27 e NFR-01/NFR-02;
2. `docs/INCREMENT_1_PLAN.md`;
3. `docs/DESIGN_TOKENS.md`, `docs/BRAND_TYPOGRAPHY.md` e `docs/UI_PRIMITIVES.md`;
4. `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css` e componentes existentes;
5. inventário real de `public/brand`;
6. testes existentes e contrato de CI;
7. documentação oficial corrente quando comportamento de Next.js/Tailwind depender dela;
8. browser real quando a infraestrutura de teste estiver disponível.

## Escopo esperado

- aplicar a identidade visual à página técnica base usando tokens, tipografia e o ativo oficial existente;
- criar composição semântica e responsiva para celular, tablet, notebook e desktop;
- usar os primitivos de US-DS-003 apenas quando houver uma necessidade semântica real, sem fabricar botões ou formulários falsos;
- preservar light/dark por preferência do sistema;
- evitar dependência de hover e respeitar `prefers-reduced-motion` caso qualquer movimento seja introduzido;
- adicionar teste/contrato proporcional à composição base;
- verificar foco/teclado, overflow e console em browser quando houver infraestrutura disponível;
- manter a Story independente de Auth, banco, Storage e deployment.

## Critérios de aceite

1. a página técnica apresenta o Caleida de forma coerente com a identidade aprovada, sem aparência de dashboard/streaming/loja e sem fluxo falso;
2. composição funciona em viewports representativos de celular, tablet, notebook e desktop sem rolagem horizontal indevida ou dependência de hover;
3. light/dark continuam funcionando pela preferência do sistema;
4. Manrope, papel editorial da Newsreader e logo horizontal são usados somente nos contextos semânticos previstos, sem fabricar variantes de marca;
5. primitivos acessíveis são usados somente quando semanticamente necessários e nenhum CTA inexistente é criado;
6. foco, teclado, contraste e redução de movimento permanecem coerentes com NFR-02;
7. browser real é verificado quando a infraestrutura disponível permitir; ausência de infraestrutura deve ser registrada como `SKIPPED` com motivo, nunca como `PASS`;
8. `npm run verify` e CI da PR: `PASS`;
9. banco/Neon-specific: `SKIPPED — Story visual sem mudança de dados`;
10. Vercel deployment: `SKIPPED/PROIBIDO — release permanece humana/manual`.

## Non-goals

- login, convite, conta, catálogo, biblioteca ou qualquer feature de domínio;
- novos componentes de design system além do necessário para composição semântica da base;
- novas variantes de logo, favicon ou app icon fabricados;
- persistência manual de tema;
- banco, Auth, Storage ou deployment.

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
