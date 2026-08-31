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

### Alterado

- `AGENTS.md` passou a recuperar estado pelo protocolo canônico, Checkpoint e Execution Plan antes de editar.
- `docs/README.md` passou a documentar as funções dos artefatos canônicos.
- `docs/STATUS.md` foi classificado como snapshot histórico, deixando de ser cursor operacional.
- O fluxo operacional passou a distinguir `READY`, `IN_PROGRESS`, `BLOCKED`, `ON_HOLD`, `MANUAL_ACTION_REQUIRED` e `DONE`.

### Corrigido

- Eliminada a ambiguidade entre status histórico, backlog e próxima ação operacional.
- Eliminada a dependência de memória de chat como mecanismo necessário de continuação do projeto.

### Segurança

- Mantida a proibição de versionar secrets.
- Mantida a obrigatoriedade futura de autorização persistente e migrations versionadas.
- Deployment passou a exigir autorização operacional explícita e deixou de ser tratado como mecanismo implícito de verificação.

### Observação operacional

- Nenhum código de produto, banco, integração externa ou deployment foi criado nesta modernização.
- A próxima ação canônica é `OPS-002 — Formalizar o pivot Supabase → Neon`.