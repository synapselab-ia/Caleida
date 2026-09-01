# Documentação do Caleida

Esta pasta reúne os documentos oficiais de produto, arquitetura, execução, decisões, testes e operação.

## Artefatos principais

- `PROJECT_DESIGN.md` — especificação base do produto.
- `PROJECT_DESIGN_PLATFORM_AMENDMENT.md` — amendment de plataforma/dados/identidade/Storage.
- `PROJECT_DESIGN_DEPLOYMENT_AMENDMENT.md` — amendment de hosting, CI, deployment e release.
- `adr/README.md` — índice e autoridade canônica das decisões arquiteturais.
- `adr/TEMPLATE.md` — formato mínimo para novos ADRs.
- `ARCHITECTURE.md` — arquitetura técnica vigente.
- `NEON_PLATFORM.md` — topologia/guardrails Neon.
- `LOCAL_DEVELOPMENT.md` — setup local, variáveis, execução, gates e troubleshooting.
- `PRODUCT_BACKLOG.md` — roadmap macro de épicos/User Stories.
- `EXECUTION_PLAN.md` — ordem operacional e tarefas executáveis.
- `CHECKPOINT.md` — cursor atual e `NEXT_ACTION`.
- `DECISIONS.md` — índice/histórico legado; não é fonte concorrente dos ADRs.
- `CHANGELOG.md` — mudanças relevantes.
- `STATUS.md` — snapshot histórico da preparação inicial.

## Decisões arquiteturais

Após `OPS-004`, novas decisões arquiteturais são registradas em `docs/adr/`.

ADRs aceitos vigentes de maior impacto:

- `ADR-001` — catálogo global separado da biblioteca pessoal;
- `ADR-004` — mudanças de banco somente por migrations;
- `ADR-005` — Neon como plataforma de dados/identidade;
- `ADR-006` — Object Storage desacoplado/adiado;
- `ADR-007` — deployment Vercel exclusivamente humano/manual.

`ADR-002` e `ADR-003` preservam a arquitetura inicial e o Supabase histórico com supersessões explícitas.

## Plataforma vigente

```text
Next.js / React / TypeScript
→ Neon Auth
→ Neon Data API
→ Neon Postgres
→ PostgreSQL RLS
```

Object Storage permanece provider-independent.

## Desenvolvimento local

O ambiente local canônico está documentado em `LOCAL_DEVELOPMENT.md` e usa Node `24.20.0`, npm `11.19.0` e instalação por `npm ci` a partir do lockfile.

Nenhum serviço remoto é necessário para iniciar a aplicação no estado atual.

## Hosting e release

```text
GitHub / CI
→ lint + typecheck + test + build
→ PR + review + merge
→ sem deploy automático
→ release manual somente pelo usuário quando necessária
```

Vercel permanece destino de hosting, conforme `ADR-007` e `00_SYSTEM/DEPLOYMENT_POLICY.md`.

## Protocolo canônico

As regras operacionais estão em `00_SYSTEM/`:

- `SOURCE_OF_TRUTH.md`;
- `AI_WORK_PROTOCOL.md`;
- `VERIFICATION_PROTOCOL.md`;
- `DEPLOYMENT_POLICY.md`.

Uma nova sessão deve seguir o Checkpoint, ler os ADRs aplicáveis e executar somente a `NEXT_ACTION` definida no Execution Plan.
