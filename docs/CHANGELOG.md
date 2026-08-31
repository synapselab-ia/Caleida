# Changelog

Todas as mudanças relevantes do Caleida serão registradas neste arquivo.

## [Não lançado]

### Adicionado

- Repositório inicial do Caleida e documentação base.
- Project Design v1.0 e identidade visual inicial.
- Protocolo canônico v2 em `00_SYSTEM/` com Source of Truth, AI Work Protocol, Verification Protocol e Deployment Policy.
- `docs/EXECUTION_PLAN.md` e `docs/CHECKPOINT.md` para execução/continuidade.
- `docs/PROJECT_DESIGN_PLATFORM_AMENDMENT.md` e `docs/NEON_PLATFORM.md` para o pivot Neon.
- `DEC-007` — Neon como plataforma canônica de dados e identidade.
- `DEC-008` — Object Storage desacoplado e decisão adiada.
- `docs/PROJECT_DESIGN_DEPLOYMENT_AMENDMENT.md` para reconciliar o Project Design com release manual.
- `DEC-009` — Deployment Vercel exclusivamente humano e manual.

### Alterado

- `AGENTS.md` passou a recuperar estado pelos amendments, Checkpoint e Execution Plan antes de editar.
- `docs/ARCHITECTURE.md` passou a usar Neon Postgres/Auth/Data API/RLS e CI sem CD.
- `docs/PRODUCT_BACKLOG.md` substituiu Supabase local pela fundação Neon non-production.
- `US-PLAT-008` passou a preparar hosting Vercel sem exigir conexão/publicação.
- `US-PLAT-010` passou a validar PR → CI → review → merge sem deployment.
- `00_SYSTEM/DEPLOYMENT_POLICY.md` passou de autorização explícita para política **human-only**: somente o usuário publica.
- Git deployments automáticos passam a ser proibidos; quando `vercel.json` existir, o guardrail esperado é `git.deploymentEnabled: false`, sujeito à documentação corrente.
- Deployment real deixou de ser critério obrigatório de encerramento do Incremento 0.
- `docs/EXECUTION_PLAN.md` concluiu OPS-003 e promoveu `OPS-004 — Evoluir o registro de decisões para ADRs`.

### Corrigido

- Eliminada a ambiguidade entre status histórico, backlog e próxima ação operacional.
- Eliminada a dependência de memória de chat como mecanismo necessário de continuação.
- Eliminada a contradição ativa que tratava Supabase como plataforma canônica.
- Eliminada a contradição entre Preview automático do Project Design v1.0 e a política real de deployment controlado.
- Separados formalmente CI/build/verificação de release Vercel.

### Segurança e operação

- Secrets continuam proibidos no Git.
- Production e non-production Neon permanecem separados.
- Verificação de migrations/RLS usa branches Neon descartáveis.
- Owner/BYPASSRLS não serve como prova de autorização normal.
- Nenhum token Vercel deve ser mantido no CI apenas para publicação automática.
- IA não executa Preview, Production, promote, rollback ou redeploy.

### Observação operacional

- OPS-002 foi documental/arquitetural: nenhum projeto Neon foi criado.
- OPS-003 também foi documental/arquitetural: nenhum projeto/conexão Vercel foi criado e nenhum deployment foi executado.
- A próxima ação canônica é `OPS-004 — Evoluir o registro de decisões para ADRs`.