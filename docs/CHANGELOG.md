# Changelog

Todas as mudanças relevantes do Caleida serão registradas neste arquivo.

## [Não lançado]

### Adicionado

- Repositório, Project Design v1.0 e identidade visual inicial.
- Protocolo canônico v2 em `00_SYSTEM/`.
- `docs/EXECUTION_PLAN.md` e `docs/CHECKPOINT.md`.
- Amendments de plataforma e deployment.
- `docs/NEON_PLATFORM.md` para a plataforma Neon.
- `docs/NEON_NONPROD.md` como inventário operacional da fundação Neon non-production realmente provisionada.
- `docs/LOCAL_DEVELOPMENT.md` como guia canônico de setup local, execução, gates e troubleshooting.
- `docs/CI.md` como contrato operacional da integração contínua permanente.
- `docs/VERCEL_RELEASE.md` como runbook de release Vercel exclusivamente humana/manual.
- `docs/ENVIRONMENTS.md` como contrato canônico de configuração para local, non-production/staging e Production.
- `docs/INCREMENT_0_VALIDATION.md` como evidência verificável do ciclo técnico de entrega e encerramento do Incremento 0.
- `docs/INCREMENT_1_PLAN.md` como plano operacional de `EPIC-01 — Identidade e design system`, com quatro Stories pequenas e porta de saída explícita.
- `docs/INCREMENT_1_VALIDATION.md` como evidência de encerramento técnico da fundação visual.
- `docs/INCREMENT_2_PLAN.md` como plano operacional de `EPIC-02 — Contas e autenticação`, decomposto em oito Stories de acesso controlado com gates de segurança e Neon-specific explícitos.
- `docs/DESIGN_TOKENS.md` como contrato canônico de cores, temas e categorias materializado em US-DS-001.
- `docs/BRAND_TYPOGRAPHY.md` como contrato canônico de tipografia e assinatura de marca materializado em US-DS-002.
- `docs/UI_PRIMITIVES.md` como contrato canônico de botão, form-field e feedback acessíveis materializado em US-DS-003.
- `docs/adr/README.md` como índice canônico de Architecture Decision Records.
- `docs/adr/TEMPLATE.md` como formato mínimo de ADR.
- `ADR-001` — catálogo global separado da biblioteca pessoal.
- `ADR-002` — stack técnica original, preservada como histórica/superseded em partes.
- `ADR-003` — Supabase Free temporário, preservado como superseded.
- `ADR-004` — mudanças de banco somente por migrations.
- `ADR-005` — Neon como plataforma canônica de dados/identidade.
- `ADR-006` — Object Storage desacoplado e decisão adiada.
- `ADR-007` — deployment Vercel exclusivamente humano/manual.
- `ADR-008` — PostgreSQL efêmero como gate primário de migrations/RLS portáveis, com gate Neon adicional quando houver dependência do serviço.
- Fundação Next.js 16.3.3 com React 19.2.8, App Router, TypeScript strict e Tailwind CSS 4.
- Runtime Node 24.20.0, npm 11.19.0 e `package-lock.json` canônico.
- Scripts `dev`, `lint`, `typecheck`, `test` e `build` e smoke test mínimo com `node:test`.
- Projeto Neon `caleida-nonprod` em `aws-us-east-1`, PostgreSQL 18, para desenvolvimento/staging integrado.
- `database/migrations/` com migration ledger técnico versionado.
- `database/scripts/` com validação, migration runner e test runner usando Node + `psql`.
- `database/tests/` com prova da baseline de migrations e exigência de PostgreSQL 18.x.
- Scripts `db:migrations:check`, `db:migrate` e `db:test`.
- `npm run verify` como entrada canônica para manifesto de migrations, lint, typecheck, testes e build.
- `npm run verify:db` como entrada separada para aplicar migrations e executar testes SQL em ambiente de banco apropriado.
- `tests/verification-contract.test.mjs` para fixar a ordem e separação dos gates canônicos.
- `.github/workflows/ci.yml` como workflow permanente de CI em PRs para `main` e pushes na `main`.
- `tests/ci-contract.test.mjs` para proteger permissões, comandos, PostgreSQL 18 e ausência de superfície de deployment no CI.
- `vercel.json` com `git.deploymentEnabled: false` para impedir Git deployments automáticos enquanto `ADR-007` estiver vigente.
- `tests/vercel-config-contract.test.mjs` para proteger o guardrail Vercel e impedir retorno à chave legada `github`.
- `tests/environment-contract.test.mjs` para proteger o contrato de variáveis, `.gitignore`, ausência de secrets públicos e CI sem repository secrets/CD.
- `tests/design-tokens-contract.test.mjs` para proteger paleta, aliases semânticos, light/dark, categorias e contraste WCAG aplicável.
- `tests/brand-typography-contract.test.mjs` para proteger Manrope/Newsreader, tokens tipográficos, uso do logo horizontal oficial e pendências reais de variantes.
- `tests/ui-primitives-contract.test.mjs` para proteger HTML nativo, foco, estados, relações ARIA, live-region roles e ausência de biblioteca externa.
- `tests/base-visual-foundation-contract.test.mjs` para proteger composição semântica/mobile-first, temas, categorias, logo e ausência de fluxo falso em US-DS-004.
- `src/app/fonts.ts` como integração centralizada das fontes de referência do Caleida via `next/font`.
- `src/components/brand/CaleidaLogo.tsx` como integração responsiva do único ativo horizontal oficial existente.
- `src/components/ui/Button.tsx`, `FormField.tsx` e `Feedback.tsx` como conjunto mínimo de primitivos acessíveis da fundação visual.

### Alterado

- `docs/DECISIONS.md` passou a ser índice/histórico legado e deixou de competir com ADRs arquiteturais.
- `00_SYSTEM/SOURCE_OF_TRUTH.md` passou a dar precedência explícita a ADRs `Accepted` para arquitetura.
- Novas decisões arquiteturais materiais passam a exigir ADR, com supersessão explícita em vez de reescrita histórica.
- Referências operacionais de deployment apontam `ADR-007` como decisão arquitetural canônica.
- `US-PLAT-001` foi concluída após `npm ci`, lint, typecheck, test e build em PASS.
- README passou a usar `docs/LOCAL_DEVELOPMENT.md` como referência completa para desenvolvimento local.
- `.env.example` agora é deliberadamente não executável e documenta somente nomes, classes e guardrails por ambiente, sem assignments ativos ou valores reais.
- `US-PLAT-003` foi concluída com verificação de runtime, instalação, dev server HTTP, lint, typecheck, test e build.
- O branch Neon default `main` de `caleida-nonprod` foi adotado como baseline canônica non-production/staging.
- A estratégia de verificação de banco foi separada em gate PostgreSQL portável e gate Neon-specific conforme `ADR-008`.
- `00_SYSTEM/VERIFICATION_PROTOCOL.md`, `README.md` e `docs/LOCAL_DEVELOPMENT.md` passaram a apontar os comandos `verify` e `verify:db` como entradas canônicas.
- `US-PLAT-006` foi concluída sem framework, dependência ou workflow CI permanente adicional.
- O Verification Protocol passou a reconhecer `.github/workflows/ci.yml` como CI permanente e `docs/CI.md` como contrato operacional.
- `US-PLAT-007` foi concluída com CI sem CD, permissões mínimas e PostgreSQL 18 descartável.
- `US-PLAT-008` foi concluída com hosting Vercel preparado para release manual, sem conexão/importação do projeto e sem deployment.
- `US-PLAT-009` foi concluída com separação explícita entre local, non-production/staging e Production, sem provisionar ou simular Production.
- `docs/LOCAL_DEVELOPMENT.md` e `docs/VERCEL_RELEASE.md` passaram a apontar `docs/ENVIRONMENTS.md` como contrato de configuração.
- `US-PLAT-010` foi concluída com validação do ciclo real `Issue → branch → CI → PR → review → merge → CI main`, sem feature artificial ou deployment.
- O Incremento 0 foi encerrado após a PR #29, CI da PR `33560189535` e CI integrada da `main` `33560364513` em PASS.
- `OPS-005` refinou a fundação visual em `US-DS-001` a `US-DS-004`, sem implementar UI e sem alterar arquitetura.
- `US-DS-001` materializou a paleta e os temas aprovados em `src/app/globals.css` usando `@theme`, aliases semânticos, `@theme inline` e `prefers-color-scheme` sem JavaScript.
- As categorias sem hexadecimal explícito no Project Design passam a usar Manhua/coral `#D9685B`, Série/ciano `#278EAF` e Anime/verde-azulado `#278F83`, com uso restrito a pista visual auxiliar.
- O accent/focus do tema escuro usa `#A994FF` para preservar contraste sem alterar o violeta canônico `#7457E8`.
- `US-DS-002` integrou Manrope como fonte global de interface e Newsreader como família editorial explícita, ambas por `next/font` com fallbacks e variáveis CSS reutilizáveis.
- `public/brand/README.md` agora reflete que `caleida-logo-horizontal.png` é o único ativo de marca disponível e mantém versão clara/escura, símbolo, favicon, vetores e ícones como pendências reais.
- O logo horizontal oficial passou a ter componente responsivo via `next/image`, sem filtros, recoloração, recorte ou fabricação de variantes.
- `US-DS-003` criou os três primitivos mínimos com semântica HTML nativa, relações acessíveis explícitas, foco visível e live-region roles proporcionais, sem montar fluxo funcional.
- `US-DS-004` aplicou a identidade à página técnica com composição editorial mobile-first, sete categorias rotuladas, assinatura geométrica estática e nenhum fluxo funcional falso.
- `CaleidaLogo` passou a usar wrapper `block`/`shrink-0` e alinhamento `object-left`, garantindo caixa responsiva real para `next/image fill` sem alterar o PNG oficial.
- O Incremento 1 / EPIC-01 passa a ser tratado como concluído após os gates finais de #40; o próximo horizonte é EPIC-02, mas somente via refino `OPS-006` antes de qualquer implementação de Auth.
- `docs/EXECUTION_PLAN.md`, `docs/PRODUCT_BACKLOG.md`, `docs/INCREMENT_1_PLAN.md` e `docs/CHECKPOINT.md` passam a promover `OPS-006 — Refinar o próximo incremento funcional (EPIC-02 — Contas e autenticação)` como única próxima ação.
- `OPS-006` refinou EPIC-02 em oito Stories ordenadas de acesso controlado, separando fundação Neon Auth, autorização/papéis, entrada controlada, e-mail, cadastro, login/sessão, recuperação/revogação e auditoria.
- `docs/EXECUTION_PLAN.md`, `docs/PRODUCT_BACKLOG.md` e `docs/CHECKPOINT.md` passam a promover somente `US-AUTH-001 — Materializar fundação Neon Auth isolada e contrato de sessão` como próxima ação.

### Corrigido

- Eliminada a possibilidade de duas fontes concorrentes para decisões arquiteturais (`DECISIONS.md` × ADR).
- Preservadas explicitamente as escolhas históricas Supabase/stack original sem fazê-las governar trabalho novo.
- Resolvido o bloqueio de verificação da US-PLAT-001 sem introduzir CI permanente ou deployment.
- Eliminada dependência de contexto de chat para preparar e executar o ambiente local da aplicação.
- Topologia Neon documental reconciliada com o recurso remoto realmente provisionado, sem inventar branch `staging` inexistente.
- O runner de migrations deixou de passar uma URL completa via `PGDATABASE`; conexões passam por `psql --dbname` e a URL é redigida em mensagens de erro.
- A indisponibilidade do endpoint de branching Neon deixou de bloquear migrations que dependem apenas de comportamento PostgreSQL portável, sem reduzir gates Neon-specific.
- A ordem dos gates padrão deixou de depender de memória/documentação dispersa e passou a ser executável por um único comando versionado.
- PRs agora recebem um check permanente que executa os mesmos comandos canônicos provados localmente, sem duplicar a lógica dos gates no YAML.
- O risco de Git Integration publicar o Caleida automaticamente passou a ter guardrail versionado antes de qualquer conexão Vercel do projeto.
- `baseline` deixou explícito em todos os runbooks que representa somente a baseline Neon non-production e não é um caminho implícito para Production.
- O guia local deixou de referir a CI permanente como futura e passou a refletir o workflow já implementado.
- O estado canônico deixou de apontar US-PLAT-010 como pendente após sua validação e agora exige refino explícito antes de iniciar EPIC-01.
- O horizonte visual deixou de ser um épico amplo sem unidade executável e passou a possuir quatro Stories ordenadas.
- Cores de interface deixaram de depender apenas do `color-scheme` nativo e passaram a possuir aliases semânticos reutilizáveis e contrastes testados.
- O primeiro head da PR #36 deixou de importar o PNG de `public/brand` como módulo TypeScript fora de `src/`; após o typecheck detectar `TS2307`, o componente passou a usar o caminho público com caixa responsiva estável, preservando `next/image` e sem relaxar gates.
- O botão base deixou de aplicar hover a controles disabled; variantes usam `enabled:hover:*` e preservam o estado disabled nativo.
- O primeiro CI de #40 expôs que o contrato antigo do logo dependia da sequência literal de classes; o teste foi atualizado para exigir a caixa responsiva mais forte (`block`/`shrink-0`/`object-left`) sem relaxar os demais requisitos.
- O refino de EPIC-02 deixou explícito que ocultar signup na UI não satisfaz o beta fechado: a futura Story deve negar também a criação direta de conta sem convite válido ou solicitação aprovada.

### Segurança e operação

- Secrets continuam proibidos no Git.
- Banco continua regido por migrations versionadas e verificação isolada.
- PostgreSQL 18 descartável é o gate primário para SQL portável; branch Neon isolada continua obrigatória quando houver comportamento específico do Neon.
- A baseline Neon `main` não é usada como laboratório destrutivo.
- Production e non-production Neon permanecem separados por decisão; Production ainda não foi provisionada.
- `DATABASE_URL` e `DATABASE_URL_UNPOOLED` são server-only; nenhum secret de banco pode usar `NEXT_PUBLIC_*`.
- O tooling atual não possui alvo Production e nenhum alvo fictício foi criado em US-PLAT-009.
- Desenvolvimento local e futuro Preview não podem reutilizar credenciais Production; futura Production deve possuir recursos e secrets próprios.
- Deployment continua exclusivamente humano/manual; IA e CI não publicam.
- O CI permanente usa somente `permissions: contents: read`, PostgreSQL efêmero e não necessita repository secrets externos.
- Nenhum token Vercel, deploy hook ou `id-token: write` foi introduzido no CI.
- Git deployments Vercel ficam desabilitados por `vercel.json`; `.vercel/` permanece ignorado e não há Project Linking versionado.
- A Vercel foi verificada antes, durante e depois do merge de US-PLAT-010 e permaneceu sem projeto Caleida; nenhum Preview/Production foi executado.
- Neon permaneceu com apenas `caleida-nonprod/main`, PostgreSQL 18 e uma branch; `caleida-production` não foi provisionado.
- Nenhum Neon Auth/Data API/Object Storage/schema funcional de produto foi provisionado na US-PLAT-010.
- Gate Neon-specific de US-PLAT-010 foi `SKIPPED` porque a Story não alterou comportamento gerenciado do Neon; o gate PostgreSQL portável passou na PR e na `main`.
- `OPS-005` não cria nem altera banco, Neon, Storage, dependências, código de produto ou superfície de deployment.
- `US-DS-001` não altera migrations, Neon, Auth, Storage, variáveis de ambiente, dependências ou workflow CI; gate Neon-specific permanece `SKIPPED`.
- `US-DS-002` não altera migrations, Neon, Auth, Data API, RLS, Storage, variáveis de ambiente, dependências ou workflow CI; gate Neon-specific permanece `SKIPPED`.
- `US-DS-003` não altera migrations, Neon, Auth, Data API, RLS, Storage, variáveis de ambiente, dependências ou workflow CI; gate Neon-specific permanece `SKIPPED`.
- `US-DS-004` não altera migrations, Neon, Auth, Data API, RLS, Storage, variáveis de ambiente, dependências ou workflow CI; gate Neon-specific permanece `SKIPPED`.
- `OPS-006` não provisiona Neon Auth/Data API, não cria schema/RLS/usuário/SMTP/OAuth/secret, não cria Production Neon e não altera dependências ou código de produto.
- Os nomes `NEON_AUTH_BASE_URL` e `NEON_AUTH_COOKIE_SECRET` foram somente planejados/documentados; nenhum valor real foi criado ou versionado em OPS-006.
- Nenhuma connection string, senha, Neon API key ou Vercel token foi versionada.
- Browser real de US-DS-004 ficou `SKIPPED` porque a sessão não conseguiu obter checkout/dev server local; nenhum Preview/Production foi usado para contornar esse limite.

### Observação operacional

- OPS-002, OPS-003 e OPS-004 foram mudanças documentais/arquiteturais; OPS-005 e OPS-006 são refinos documentais de incrementos.
- Workflows GitHub Actions usados em US-PLAT-001, US-PLAT-003, US-PLAT-005 e US-PLAT-006 foram descartáveis para verificação e não integram a `main`.
- Em US-PLAT-005, as rotas de branching/migration temporária do conector Neon apresentaram incompatibilidade camelCase/snake_case; a limitação fica registrada para gates Neon-specific futuros.
- A fundação de migrations foi provada em PostgreSQL 18 descartável com aplicação, testes, reaplicação do ledger e reconstrução do zero em PASS.
- Em US-PLAT-006, `npm ci`, `npm run verify` e `npm run verify:db` contra PostgreSQL 18 passaram em runner descartável.
- Em US-PLAT-007, o workflow permanente `CI` passou na PR #23 com runtime pinado, `npm ci`, `verify`, PostgreSQL 18 e `verify:db`.
- Em US-PLAT-008, a documentação oficial Vercel foi revalidada em 01/09/2026: `git.deploymentEnabled: false` desabilita Git deployments e o primeiro deployment de um projeto novo é Production mesmo sem `--prod`.
- Em US-PLAT-009, Vercel Development/Preview/Production e o contrato Neon de `DATABASE_URL` pooled / `DATABASE_URL_UNPOOLED` direta foram revalidados contra documentação corrente.
- Na PR #27, o run `33549192981` passou `npm ci`, `npm run verify`, PostgreSQL 18 e `npm run verify:db` no head de implementação.
- Na PR #29, o run `33560189535` passou todos os gates no head final `935a7fb742b78bba0df97169366b4c7ce806977d`; a review técnica não encontrou finding bloqueante.
- O merge verificado de #29 gerou `4e0367957dc61b955e7b748244d50272b9209223`; o push correspondente na `main` passou no run `33560364513`.
- Em OPS-005, o estado Neon foi somente conferido e permaneceu `caleida-nonprod`, PostgreSQL 18, branch única `main`; nenhum gate Neon-specific se aplica ao refino.
- Na PR #34, o run inicial `33645092044` passou `npm run verify`, PostgreSQL 18 e `npm run verify:db`, incluindo o novo contrato de tokens e contraste.
- Na PR #36, o run inicial `33653117310` falhou corretamente no typecheck por `TS2307` no import estático do PNG; a implementação foi corrigida sem relaxar teste ou configuração.
- Na PR #36, o run corrigido `33653441581` passou `npm run verify`, PostgreSQL 18 e `npm run verify:db` no head `f6db6b5237ae77ac1597bc5889c8acf21204792d`.
- Na PR #38, o run inicial `33656150580` passou `npm run verify`, PostgreSQL 18 e `npm run verify:db`, incluindo o novo contrato de primitivos acessíveis.
- Na PR #40, o run inicial `33662849749` falhou somente no contrato legado do logo; lint, typecheck e os seis testes novos de US-DS-004 passaram.
- Após reconciliar o contrato responsivo do logo, o head técnico `a4198a7c7508ae9ede628c59455a64d00cd55d94` passou `npm run verify`, PostgreSQL 18 e `npm run verify:db` no run `33663025148`.
- Em OPS-006, a baseline integrada de partida `a42b8bdcd78293e797cdb6e2aff3e3cf02c495a2` passou no CI `33664145901`; o Neon foi somente lido e permaneceu `caleida-nonprod`, PostgreSQL 18, branch única `main`, sem Auth/Data API/Production.
- Em OPS-006, documentação oficial corrente confirmou o SDK Neon Auth Next.js com `createNeonAuth()`, configuração explícita de sessão e a limitação de não presumir plugins/handlers server-side customizados de Better Auth gerenciado.
- A próxima ação canônica após OPS-006 é `US-AUTH-001 — Materializar fundação Neon Auth isolada e contrato de sessão`.