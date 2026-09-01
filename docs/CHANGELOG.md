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

### Alterado

- `docs/DECISIONS.md` passou a ser índice/histórico legado e deixou de competir com ADRs arquiteturais.
- `00_SYSTEM/SOURCE_OF_TRUTH.md` passou a dar precedência explícita a ADRs `Accepted` para arquitetura.
- Novas decisões arquiteturais materiais passam a exigir ADR, com supersessão explícita em vez de reescrita histórica.
- Referências operacionais de deployment apontam `ADR-007` como decisão arquitetural canônica.
- `US-PLAT-001` foi concluída após `npm ci`, lint, typecheck, test e build em PASS.
- README passou a usar `docs/LOCAL_DEVELOPMENT.md` como referência completa para desenvolvimento local.
- `.env.example` explicita somente nomes/contratos seguros e guardrails de banco, sem valores reais.
- `US-PLAT-003` foi concluída com verificação de runtime, instalação, dev server HTTP, lint, typecheck, test e build.
- O branch Neon default `main` de `caleida-nonprod` foi adotado como baseline canônica non-production/staging.
- A estratégia de verificação de banco foi separada em gate PostgreSQL portável e gate Neon-specific conforme `ADR-008`.
- `00_SYSTEM/VERIFICATION_PROTOCOL.md`, `README.md` e `docs/LOCAL_DEVELOPMENT.md` passaram a apontar os comandos `verify` e `verify:db` como entradas canônicas.
- `US-PLAT-006` foi concluída sem framework, dependência ou workflow CI permanente adicional.
- O Verification Protocol passou a reconhecer `.github/workflows/ci.yml` como CI permanente e `docs/CI.md` como contrato operacional.
- `US-PLAT-007` foi concluída com CI sem CD, permissões mínimas e PostgreSQL 18 descartável.
- `docs/EXECUTION_PLAN.md` e `docs/CHECKPOINT.md` promovem `US-PLAT-008 — Preparar hosting Vercel para release manual` como próxima ação.

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

### Segurança e operação

- Secrets continuam proibidos no Git.
- Banco continua regido por migrations versionadas e verificação isolada.
- PostgreSQL 18 descartável é o gate primário para SQL portável; branch Neon isolada continua obrigatória quando houver comportamento específico do Neon.
- A baseline Neon `main` não é usada como laboratório destrutivo.
- Production e non-production Neon permanecem separados por decisão; Production ainda não foi provisionada.
- Deployment continua exclusivamente humano/manual; IA e CI não publicam.
- O CI permanente usa somente `permissions: contents: read` e não necessita secrets externos.
- Nenhum token Vercel, deploy hook ou `id-token: write` foi introduzido no CI.
- Nenhum Neon Auth/Data API/Object Storage/schema funcional de produto foi provisionado na US-PLAT-007.
- Nenhuma connection string, senha ou Neon API key foi versionada.

### Observação operacional

- OPS-002, OPS-003 e OPS-004 foram mudanças documentais/arquiteturais.
- Workflows GitHub Actions usados em US-PLAT-001, US-PLAT-003, US-PLAT-005 e US-PLAT-006 foram descartáveis para verificação e não integram a `main`.
- Em US-PLAT-005, as rotas de branching/migration temporária do conector Neon apresentaram incompatibilidade camelCase/snake_case; a limitação fica registrada para gates Neon-specific futuros.
- A fundação de migrations foi provada em PostgreSQL 18 descartável com aplicação, testes, reaplicação do ledger e reconstrução do zero em PASS.
- Em US-PLAT-006, `npm ci`, `npm run verify` e `npm run verify:db` contra PostgreSQL 18 passaram em runner descartável.
- Em US-PLAT-007, o workflow permanente `CI` passou na PR #23 com runtime pinado, `npm ci`, `verify`, PostgreSQL 18 e `verify:db`.
- A próxima ação canônica é `US-PLAT-008 — Preparar hosting Vercel para release manual`.
