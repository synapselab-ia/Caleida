# Changelog

Todas as mudanças relevantes do Caleida serão registradas neste arquivo.

O formato segue uma organização simples por versão e categoria.

## [Não lançado]

### Adicionado

- Repositório inicial do Caleida.
- README de apresentação.
- Project Design v1.0 em PDF.
- Identidade visual inicial.
- Regras persistentes para agentes em `AGENTS.md`.
- Project Design operacional em Markdown.
- Arquitetura técnica inicial.
- Backlog inicial do Incremento 0.
- Registro de decisões.
- Documento de status inicial.
- Protocolo canônico v2 em `00_SYSTEM/` com Source of Truth, AI Work Protocol, Verification Protocol e Deployment Policy.
- `docs/EXECUTION_PLAN.md` para separar roadmap macro de execução operacional.
- `docs/CHECKPOINT.md` como cursor de continuidade e fonte da `NEXT_ACTION`.
- `docs/PROJECT_DESIGN_PLATFORM_AMENDMENT.md` para preservar o Project Design v1.0 e substituir formalmente apenas suas premissas específicas de plataforma.
- `docs/NEON_PLATFORM.md` como especificação canônica de Neon Postgres, Neon Auth, Neon Data API, RLS, ambientes e branching.
- `DEC-007` — Neon como plataforma canônica de dados e identidade.
- `DEC-008` — Object Storage desacoplado e decisão adiada.

### Alterado

- `AGENTS.md` passou a recuperar estado pelo protocolo canônico, amendments, Checkpoint e Execution Plan antes de editar.
- `docs/README.md` passou a documentar as funções dos artefatos canônicos e a plataforma Neon vigente.
- `docs/STATUS.md` foi classificado como snapshot histórico, deixando de ser cursor operacional.
- O fluxo operacional passou a distinguir `READY`, `IN_PROGRESS`, `BLOCKED`, `ON_HOLD`, `MANUAL_ACTION_REQUIRED` e `DONE`.
- `docs/ARCHITECTURE.md` passou de Supabase para Neon Postgres/Auth/Data API/RLS.
- `docs/PRODUCT_BACKLOG.md` substituiu Supabase local pela fundação Neon non-production e branches descartáveis de verificação.
- `docs/EXECUTION_PLAN.md` concluiu OPS-002 e promoveu `OPS-003 — Reconciliar a política de deployment` como próxima ação.
- `DEC-003` e `DEC-004` foram preservadas como histórico e marcadas `SUPERSEDED` por `DEC-007`.
- A estratégia de banco passou a utilizar `database/migrations/` e `database/tests/` como caminhos canônicos planejados.

### Corrigido

- Eliminada a ambiguidade entre status histórico, backlog e próxima ação operacional.
- Eliminada a dependência de memória de chat como mecanismo necessário de continuação do projeto.
- Eliminada a contradição ativa que tratava Supabase como plataforma canônica apesar do pivot deliberado para Neon.
- Corrigida a suposição de que a limitação de dois projetos Supabase deveria determinar a topologia do Caleida.
- Storage deixou de ser escolhido prematuramente apenas por estar acoplado ao provedor de banco original.

### Segurança

- Mantida a proibição de versionar secrets.
- Mantida a obrigatoriedade de autorização persistente e migrations versionadas.
- Deployment continua exigindo autorização operacional explícita e não é mecanismo implícito de verificação.
- Production e non-production foram separados em projetos Neon distintos no desenho aprovado.
- Verificação futura de migrations/RLS passa a usar branches Neon descartáveis em non-production.
- Owner/BYPASSRLS não pode ser usado como prova de autorização normal de usuário.
- Neon Data API deve operar com JWT e RLS para dados user-scoped quando utilizada no fluxo normal de CRUD.

### Observação operacional

- OPS-002 foi uma mudança arquitetural/documental: nenhum projeto Neon do Caleida foi criado, nenhum schema foi aplicado, nenhum secret foi gerado e nenhum deployment foi executado.
- Neon Object Storage permanecia beta em 31/08/2026 e não foi adotado como dependência canônica.
- A próxima ação canônica é `OPS-003 — Reconciliar a política de deployment`.
