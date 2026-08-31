# Checkpoint — Caleida

**PROJECT_STATUS:** BLOCKED  
**CURRENT_PHASE:** Incremento 0 — Fundação executável / início técnico  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `OPS-004 — Evoluir o registro de decisões para ADRs`  
**LAST_COMPLETED_ISSUE:** `#6`  
**ACTIVE_TASK:** `US-PLAT-001 — Inicializar a aplicação web`  
**ACTIVE_ISSUE:** `#8`  
**ACTIVE_BRANCH:** `feat/us-plat-001-app-bootstrap`  
**ACTIVE_PR:** `#9 — DRAFT`  
**IMPLEMENTATION_HEAD:** `5db549d104c8af15e48a056419ec085081a244d3`  
**NEXT_ACTION:** `US-PLAT-001 — concluir lockfile e gates executáveis do bootstrap`  
**BLOCKERS:** ambiente local sem resolução de `registry.npmjs.org`; GitHub Actions falha antes de iniciar runner/steps  
**ON_HOLD:** none  
**MANUAL_ACTION_REQUIRED:** none

## Comando de continuação

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

A próxima sessão deve recuperar a Issue #8, a branch `feat/us-plat-001-app-bootstrap` e a PR #9 antes de editar. Não recrie o bootstrap nem abra segunda implementação concorrente.

## Estado da US-PLAT-001

A implementação base existe na branch ativa, mas **não está concluída nem mergeada** porque os gates executáveis obrigatórios ainda não puderam ser provados.

Implementado:

- Next.js `16.3.3`;
- React/React DOM `19.2.8`;
- App Router em `src/app`;
- TypeScript `strict`;
- Tailwind CSS 4 via PostCSS;
- ESLint CLI com `eslint-config-next`;
- Node `24.20.0` fixado em `.nvmrc`;
- npm `11.19.0` declarado como package manager;
- scripts `dev`, `lint`, `typecheck`, `test`, `build`;
- smoke test mínimo com `node:test`;
- página inicial somente de fundação técnica;
- `.env.example` sem secrets;
- assets preexistentes de `public/` preservados.

Ainda pendente:

- gerar e validar `package-lock.json` com npm;
- executar `npm ci` em clone/árvore limpa;
- executar `npm run lint`;
- executar `npm run typecheck` com dependências reais;
- executar `npm test` no ambiente alvo;
- executar `npm run build`;
- somente depois atualizar README/Changelog/Backlog, retirar PR de Draft e concluir/mergear a Story.

## Versões verificadas em 31/08/2026

A execução consultou documentação oficial e o scaffold oficial `create-next-app@16.3.3` antes de escolher versões.

Linha escolhida:

```text
Node 24.20.0 LTS
npm 11.19.0
Next.js 16.3.3
React 19.2.8
React DOM 19.2.8
TypeScript 5.x
Tailwind CSS 4.x
ESLint 9.x
```

`@types/node` segue `^20`, como o template oficial corrente do `create-next-app@16.3.3`; isso não altera o runtime fixado em Node 24.

## Verificação realmente executada

- documentação oficial Next.js/React/Node/Tailwind: `PASS`;
- alinhamento do manifesto/configuração com `create-next-app@16.3.3`: `PASS documental`;
- smoke test `node:test`: `PASS — 2/2`;
- diff da feature contra `main`: `PASS — 12 arquivos de fundação, sem integração externa`;
- secrets: `PASS — nenhum`;
- Neon/Auth/Storage: `SKIPPED — fora do escopo`;
- Vercel/project/deployment: `SKIPPED — fora do escopo e deployment proibido para IA`;
- `package-lock.json`: `BLOCKED — registry indisponível no ambiente local`;
- clean install: `BLOCKED — registry indisponível`;
- lint/typecheck/build com dependências reais: `BLOCKED — dependências não instaláveis no ambiente local`;
- GitHub Actions como fallback: `BLOCKED — dois workflows descartáveis falharam antes de qualquer step/runner útil`.

### Evidência do fallback GitHub Actions

Foi usada a branch descartável `verify/us-plat-001-bootstrap`.

- tentativa completa: falhou antes de qualquer step;
- diagnóstico mínimo (`uname`, `node`, `npm`, `git`): falhou antes de qualquer step;
- nenhum resultado foi contado como gate de aplicação;
- a branch de verificação foi resetada para o mesmo head da feature após o diagnóstico, removendo o workflow temporário da ponta da branch;
- nenhum workflow temporário faz parte da PR #9 ou da `main`.

## Arquitetura e segurança permanecem inalteradas

- `docs/adr/` continua autoridade arquitetural;
- Neon continua definido por `ADR-005`, mas não foi provisionado;
- Storage continua adiado por `ADR-006`;
- deployment continua human-only por `ADR-007`;
- não existe `vercel.json` nesta Story;
- não houve deployment.

## Próxima ação executável

Retomar **a mesma** `US-PLAT-001` na branch e PR existentes.

Ordem:

1. obter um ambiente capaz de executar npm/Node 24 e acessar o registry;
2. gerar o lockfile a partir do `package.json` da branch;
3. executar `npm ci`;
4. executar `npm run lint`;
5. executar `npm run typecheck`;
6. executar `npm test`;
7. executar `npm run build`;
8. corrigir apenas falhas reais encontradas;
9. atualizar documentação de conclusão;
10. revisar o diff, retirar a PR #9 de Draft e mergear somente com gates aplicáveis aprovados.

Não promover `US-PLAT-003` enquanto a `US-PLAT-001` permanecer bloqueada.
