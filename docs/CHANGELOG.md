# Changelog

Todas as mudanças relevantes do Caleida serão registradas neste arquivo.

## [Não lançado]

### Adicionado

- Repositório, Project Design v1.0 e identidade visual inicial.
- Protocolo canônico v2 em `00_SYSTEM/`.
- `docs/EXECUTION_PLAN.md` e `docs/CHECKPOINT.md`.
- Amendments de plataforma e deployment.
- `docs/NEON_PLATFORM.md` para a plataforma Neon.
- `docs/adr/README.md` como índice canônico de Architecture Decision Records.
- `docs/adr/TEMPLATE.md` como formato mínimo de ADR.
- `ADR-001` — catálogo global separado da biblioteca pessoal.
- `ADR-002` — stack técnica original, preservada como histórica/superseded em partes.
- `ADR-003` — Supabase Free temporário, preservado como superseded.
- `ADR-004` — mudanças de banco somente por migrations.
- `ADR-005` — Neon como plataforma canônica de dados/identidade.
- `ADR-006` — Object Storage desacoplado e decisão adiada.
- `ADR-007` — deployment Vercel exclusivamente humano/manual.

### Alterado

- `docs/DECISIONS.md` passou a ser índice/histórico legado e deixou de competir com ADRs arquiteturais.
- `00_SYSTEM/SOURCE_OF_TRUTH.md` passou a dar precedência explícita a ADRs `Accepted` para arquitetura.
- `AGENTS.md` e `AI_WORK_PROTOCOL.md` passaram a ler índice/ADRs aplicáveis antes do registro legado.
- Novas decisões arquiteturais materiais passam a exigir ADR, com supersessão explícita em vez de reescrita histórica.
- Referências operacionais de deployment passam a apontar `ADR-007` como decisão arquitetural canônica.
- `US-PLAT-001` foi refinada no Execution Plan e marcada `PRONTA` no backlog.
- `docs/EXECUTION_PLAN.md` concluiu OPS-004 e promoveu `US-PLAT-001 — Inicializar a aplicação web`.
- `docs/CHECKPOINT.md` encerrou a fase de reconciliação operacional e abriu o início técnico do Incremento 0.

### Corrigido

- Eliminada a possibilidade de duas fontes concorrentes para decisões arquiteturais (`DECISIONS.md` × ADR).
- Preservadas explicitamente as escolhas históricas Supabase/stack original sem fazê-las governar trabalho novo.
- Separadas decisões de produto/processo das decisões arquiteturais.

### Segurança e operação

- Secrets continuam proibidos no Git.
- Banco continua regido por migrations e verificação isolada.
- Production e non-production Neon permanecem separados.
- Deployment continua exclusivamente humano/manual; IA e CI não publicam.
- Nenhum token Vercel deve ser mantido no CI para publicação automática.

### Observação operacional

- OPS-002, OPS-003 e OPS-004 foram mudanças documentais/arquiteturais; não criaram aplicação, projeto Neon, integração Vercel ou deployment.
- A próxima ação canônica é `US-PLAT-001 — Inicializar a aplicação web`.
