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
- `docs/adr/README.md` como índice canônico de Architecture Decision Records.
- `docs/adr/TEMPLATE.md` como formato mínimo de ADR.
- `ADR-001` — catálogo global separado da biblioteca pessoal.
- `ADR-002` — stack técnica original, preservada como histórica/superseded em partes.
- `ADR-003` — Supabase Free temporário, preservado como superseded.
- `ADR-004` — mudanças de banco somente por migrations.
- `ADR-005` — Neon como plataforma canônica de dados/identidade.
- `ADR-006` — Object Storage desacoplado e decisão adiada.
- `ADR-007` — deployment Vercel exclusivamente humano/manual.
- Fundação Next.js 16.3.3 com React 19.2.8, App Router, TypeScript strict e Tailwind CSS 4.
- Runtime Node 24.20.0, npm 11.19.0 e `package-lock.json` canônico.
- Scripts `dev`, `lint`, `typecheck`, `test` e `build` e smoke test mínimo com `node:test`.
- Projeto Neon `caleida-nonprod` em `aws-us-east-1`, PostgreSQL 18, para desenvolvimento/staging integrado.

### Alterado

- `docs/DECISIONS.md` passou a ser índice/histórico legado e deixou de competir com ADRs arquiteturais.
- `00_SYSTEM/SOURCE_OF_TRUTH.md` passou a dar precedência explícita a ADRs `Accepted` para arquitetura.
- `AGENTS.md` e `AI_WORK_PROTOCOL.md` passaram a ler índice/ADRs aplicáveis antes do registro legado.
- Novas decisões arquiteturais materiais passam a exigir ADR, com supersessão explícita em vez de reescrita histórica.
- Referências operacionais de deployment passam a apontar `ADR-007` como decisão arquitetural canônica.
- `US-PLAT-001` foi concluída após `npm ci`, lint, typecheck, test e build em PASS.
- README passou a usar `docs/LOCAL_DEVELOPMENT.md` como referência completa para desenvolvimento local.
- `.env.example` passou a explicitar o contrato seguro de futuras variáveis e o caráter público de `NEXT_PUBLIC_*`.
- `.env.example` reserva `DATABASE_URL` e `DATABASE_URL_UNPOOLED` apenas como nomes/placeholder para tooling Neon futuro, sem valores reais.
- `US-PLAT-003` foi concluída com verificação de runtime, instalação, dev server HTTP, lint, typecheck, test e build.
- O branch Neon default `main` de `caleida-nonprod` foi adotado como baseline canônica non-production/staging.
- `docs/EXECUTION_PLAN.md` e `docs/CHECKPOINT.md` promovem `US-PLAT-005 — Definir migrations, testes de banco e RLS` como próxima ação.

### Corrigido

- Eliminada a possibilidade de duas fontes concorrentes para decisões arquiteturais (`DECISIONS.md` × ADR).
- Preservadas explicitamente as escolhas históricas Supabase/stack original sem fazê-las governar trabalho novo.
- Separadas decisões de produto/processo das decisões arquiteturais.
- Resolvido o bloqueio de verificação da US-PLAT-001 sem introduzir CI permanente ou deployment.
- Eliminada dependência de contexto de chat para preparar e executar o ambiente local da aplicação.
- Topologia Neon documental reconciliada com o recurso remote realmente provisionado, sem inventar branch `staging` inexistente.

### Segurança e operação

- Secrets continuam proibidos no Git.
- Banco continua regido por migrations e verificação isolada.
- Production e non-production Neon permanecem separados por decisão; Production ainda não foi provisionada.
- Deployment continua exclusivamente humano/manual; IA e CI não publicam.
- Nenhum token Vercel deve ser mantido no CI para publicação automática.
- Nenhum Neon Auth/Data API/Object Storage/schema de produto foi provisionado na US-PLAT-004.
- Nenhuma connection string, senha ou Neon API key foi versionada.

### Observação operacional

- OPS-002, OPS-003 e OPS-004 foram mudanças documentais/arquiteturais.
- As US-PLAT-001 e US-PLAT-003 usaram workflows GitHub Actions descartáveis somente para verificação; esses workflows não integram as Stories nem a `main`.
- A ação de criação de branches/SQL do conector Neon apresentou inconsistência de schema em US-PLAT-004; migrations destrutivas não podem usar a baseline `main` como workaround.
- A próxima ação canônica é `US-PLAT-005 — Definir migrations, testes de banco e RLS`.
