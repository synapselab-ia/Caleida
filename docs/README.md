# Documentação do Caleida

Esta pasta reúne os documentos oficiais de produto, arquitetura, execução, decisões, testes e operação do Caleida.

## Artefatos principais

- `PROJECT_DESIGN.md` — especificação principal do produto e resultado final esperado.
- `PRODUCT_BACKLOG.md` — roadmap macro de épicos e User Stories.
- `EXECUTION_PLAN.md` — ordem operacional e tarefas executáveis.
- `CHECKPOINT.md` — cursor atual de continuação e `NEXT_ACTION`.
- `ARCHITECTURE.md` — arquitetura técnica vigente, sujeita a decisões formalmente registradas.
- `DECISIONS.md` — registro histórico de decisões, até evolução para ADRs.
- `CHANGELOG.md` — mudanças relevantes do projeto.
- `STATUS.md` — snapshot histórico da preparação inicial; não é o cursor operacional atual.

## Protocolo canônico

As regras de precedência, trabalho, verificação e deployment estão em `00_SYSTEM/`:

- `SOURCE_OF_TRUTH.md`;
- `AI_WORK_PROTOCOL.md`;
- `VERIFICATION_PROTOCOL.md`;
- `DEPLOYMENT_POLICY.md`.

O desenvolvimento deve ser incremental e recuperável por GitHub. Uma nova sessão deve seguir o `CHECKPOINT` e executar somente a `NEXT_ACTION` definida no plano.