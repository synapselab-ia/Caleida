# Documentação do Caleida

Esta pasta reúne os documentos oficiais de produto, arquitetura, execução, decisões, testes e operação do Caleida.

## Artefatos principais

- `PROJECT_DESIGN.md` — especificação base do produto e resultado final esperado; preserva a edição v1.0 e seu contexto histórico.
- `PROJECT_DESIGN_PLATFORM_AMENDMENT.md` — amendment ativo de plataforma/dados/identidade/Storage.
- `PROJECT_DESIGN_DEPLOYMENT_AMENDMENT.md` — amendment ativo de hosting, CI, deployment e release.
- `PRODUCT_BACKLOG.md` — roadmap macro de épicos e User Stories.
- `EXECUTION_PLAN.md` — ordem operacional e tarefas executáveis.
- `CHECKPOINT.md` — cursor atual de continuação e `NEXT_ACTION`.
- `ARCHITECTURE.md` — arquitetura técnica vigente.
- `NEON_PLATFORM.md` — topologia e guardrails específicos de Neon Postgres/Auth/Data API/RLS.
- `DECISIONS.md` — registro histórico de decisões e supersessões até a migração para ADRs.
- `CHANGELOG.md` — mudanças relevantes do projeto.
- `STATUS.md` — snapshot histórico da preparação inicial; não é o cursor operacional atual.

## Plataforma vigente

Dados/identidade:

```text
Neon Postgres
+ Neon Auth
+ Neon Data API
+ PostgreSQL RLS
```

Object Storage permanece provider-independent e ainda não foi escolhido.

## Hosting e release

Vercel permanece destino de hosting.

A política vigente é:

```text
GitHub / CI
→ lint + typecheck + test + build
→ PR + review + merge
→ sem deploy automático
→ release manual somente pelo usuário quando necessária
```

Enquanto `DEC-009` estiver vigente:

- IA não executa deployments;
- GitHub Actions não executa deployments;
- Preview/Production são manuais;
- quando `vercel.json` existir, Git deployments automáticos devem ficar desabilitados conforme a documentação oficial corrente.

## Protocolo canônico

As regras de precedência, trabalho, verificação e deployment estão em `00_SYSTEM/`:

- `SOURCE_OF_TRUTH.md`;
- `AI_WORK_PROTOCOL.md`;
- `VERIFICATION_PROTOCOL.md`;
- `DEPLOYMENT_POLICY.md`.

O desenvolvimento deve ser incremental e recuperável por GitHub. Uma nova sessão deve seguir o `CHECKPOINT` e executar somente a `NEXT_ACTION` definida no plano.