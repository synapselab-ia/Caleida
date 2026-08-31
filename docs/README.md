# Documentação do Caleida

Esta pasta reúne os documentos oficiais de produto, arquitetura, execução, decisões, testes e operação do Caleida.

## Artefatos principais

- `PROJECT_DESIGN.md` — especificação base do produto e resultado final esperado; preserva a edição v1.0 e seu contexto histórico.
- `PROJECT_DESIGN_PLATFORM_AMENDMENT.md` — amendment ativo que substitui as premissas específicas de plataforma/Supabase do Project Design v1.0 sem alterar a visão funcional do produto.
- `PRODUCT_BACKLOG.md` — roadmap macro de épicos e User Stories.
- `EXECUTION_PLAN.md` — ordem operacional e tarefas executáveis.
- `CHECKPOINT.md` — cursor atual de continuação e `NEXT_ACTION`.
- `ARCHITECTURE.md` — arquitetura técnica vigente.
- `NEON_PLATFORM.md` — topologia e guardrails específicos de Neon Postgres/Auth/Data API/RLS.
- `DECISIONS.md` — registro histórico de decisões, incluindo supersessões, até evolução para ADRs.
- `CHANGELOG.md` — mudanças relevantes do projeto.
- `STATUS.md` — snapshot histórico da preparação inicial; não é o cursor operacional atual.

## Plataforma vigente

Após OPS-002, a plataforma canônica de dados/identidade é:

```text
Neon Postgres
+ Neon Auth
+ Neon Data API
+ PostgreSQL RLS
```

Object Storage permanece provider-independent e ainda não foi escolhido.

Referências a Supabase no Project Design v1.0 são históricas quando abrangidas pelo amendment de plataforma e pelas decisões `DEC-007`/`DEC-008`.

## Protocolo canônico

As regras de precedência, trabalho, verificação e deployment estão em `00_SYSTEM/`:

- `SOURCE_OF_TRUTH.md`;
- `AI_WORK_PROTOCOL.md`;
- `VERIFICATION_PROTOCOL.md`;
- `DEPLOYMENT_POLICY.md`.

O desenvolvimento deve ser incremental e recuperável por GitHub. Uma nova sessão deve seguir o `CHECKPOINT` e executar somente a `NEXT_ACTION` definida no plano.
