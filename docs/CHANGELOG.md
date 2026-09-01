# Changelog — Caleida

Registro resumido das mudanças relevantes do projeto.

## 2026-09-01

### US-PLAT-001 — Inicializar a aplicação web

- inicializada a fundação Next.js 16.3.3 com App Router;
- React/React DOM 19.2.8;
- TypeScript strict;
- Tailwind CSS 4 via PostCSS;
- Node 24.20.0 e npm 11.19.0 fixados como linha de runtime/package manager;
- adicionado `package-lock.json` gerado e validado no npm 11.19.0;
- adicionados scripts `dev`, `lint`, `typecheck`, `test` e `build`;
- adicionado smoke test mínimo com `node:test`;
- README atualizado com execução local;
- verificação executável concluída em runner GitHub Actions descartável: `npm ci`, lint, typecheck, test e build em PASS;
- nenhum Neon/Auth/Storage/Vercel/deployment incluído;
- workflow temporário de verificação não integra a Story nem a `main`.

## 2026-08-31

### OPS-004 — Evoluir o registro de decisões para ADRs

- criada autoridade arquitetural em `docs/adr/`;
- migradas decisões arquiteturais relevantes para ADRs;
- relações de supersessão preservadas;
- `DECISIONS.md` convertido em índice/histórico legado;
- protocolos e documentação operacional reconciliados;
- `US-PLAT-001` refinada como primeira Story técnica.

### OPS-003 — Reconciliar a política de deployment

- deployment Vercel formalizado como humano/manual;
- removida exigência de Preview automática por branch/PR;
- CI separada de CD;
- backlog e Project Design reconciliados.

### OPS-002 — Formalizar o pivot Supabase → Neon

- Neon formalizado como plataforma de dados/identidade;
- ambientes e branches isoladas definidos;
- estrutura futura de migrations/testes movida para `database/`;
- Object Storage desacoplado/adiado.

### OPS-001 — Modernizar o protocolo canônico

- adicionados Source of Truth, AI Work Protocol, Verification Protocol, Deployment Policy, Execution Plan e Checkpoint;
- continuação entre chats passou a depender do repositório, não da memória conversacional.

## Histórico anterior

Mudanças anteriores permanecem preservadas no histórico Git e nos documentos legados do projeto.
