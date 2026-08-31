# Execution Plan — Caleida

**Status:** roadmap operacional canônico  
**Regra:** uma `NEXT_ACTION` limitada por vez  
**Roadmap de produto:** `docs/PRODUCT_BACKLOG.md`

Este documento transforma o backlog macro em tarefas executáveis.

---

# OPS-001 — Modernizar o protocolo canônico

**Estado:** CONCLUÍDO

Resultado: Source of Truth, AI Work Protocol, Verification Protocol, Deployment Policy, Execution Plan e Checkpoint tornaram o repositório recuperável sem memória de chat.

---

# OPS-002 — Formalizar o pivot Supabase → Neon

**Estado:** CONCLUÍDO

Resultado: plataforma Neon formalizada, ambientes isolados definidos, migrations/testes planejados em `database/`, Storage adiado e Project Design reconciliado por amendment.

---

# OPS-003 — Reconciliar a política de deployment

**Estado:** CONCLUÍDO

Resultado: deployment Vercel passou a ser exclusivamente humano/manual; CI ficou separada de CD; Project Design/backlog foram reconciliados.

---

# OPS-004 — Evoluir o registro de decisões para ADRs

**Estado:** CONCLUÍDO

Resultado: `docs/adr/` tornou-se autoridade arquitetural, decisões legadas foram migradas com supersessões explícitas e a primeira Story técnica foi refinada.

---

# US-PLAT-001 — Inicializar a aplicação web

**Estado:** BLOCKED — implementação em Draft PR #9  
**Issue:** `#8`  
**Branch:** `feat/us-plat-001-app-bootstrap`  
**PR:** `#9`  
**Tipo:** primeira tarefa técnica do Incremento 0

## Objetivo

Inicializar a aplicação Next.js/React/TypeScript mínima, reproduzível e verificável, sem implementar domínio de produto ou infraestrutura externa.

## Estado de implementação

A fundação técnica foi implementada na branch da Story e inclui:

- Next.js `16.3.3` + React/React DOM `19.2.8`;
- App Router em `src/app`;
- TypeScript strict;
- Tailwind CSS 4 via PostCSS;
- Node `24.20.0` pinado;
- npm `11.19.0` como package manager;
- ESLint CLI;
- scripts `dev`, `lint`, `typecheck`, `test`, `build`;
- smoke test com `node:test`;
- página mínima de fundação;
- `.gitignore` e `.env.example` seguros;
- nenhum Neon, Auth, Storage, Vercel ou feature de negócio.

A PR permanece Draft porque a definição de pronto exige verificação executável que o ambiente disponível não conseguiu realizar.

## Versões e runtime

A escolha foi baseada na documentação oficial corrente em 31/08/2026 e no template `create-next-app@16.3.3`:

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

A escolha de versões permanece decisão de implementação de baixo impacto e não exigiu novo ADR.

## Critérios de aceite

1. clone limpo pode instalar dependências a partir do lockfile;
2. aplicação inicia localmente;
3. TypeScript strict está ativo;
4. lint passa;
5. typecheck passa;
6. teste básico passa;
7. build de produção passa;
8. nenhuma feature de negócio prematura;
9. assets existentes preservados;
10. nenhum secret ou integração externa criada;
11. nenhum deployment;
12. documentação/Checkpoint refletem estado real.

## Verificação realizada até o momento

- documentação oficial corrente: `PASS`;
- configuração alinhada ao scaffold oficial Next 16.3.3: `PASS documental`;
- smoke test do bootstrap: `PASS — 2/2`;
- revisão de escopo/diff: `PASS`;
- secrets/integrações externas/deployment: `PASS — nenhum`;
- `package-lock.json`: `BLOCKED`;
- clean install: `BLOCKED`;
- lint com dependências reais: `BLOCKED`;
- typecheck com dependências reais: `BLOCKED`;
- build: `BLOCKED`.

### Motivo do bloqueio

O ambiente local disponível não resolve `registry.npmjs.org`.

Como fallback, foi usada uma branch GitHub descartável. O workflow completo e depois um diagnóstico mínimo de um único step falharam antes de executar qualquer step, sem fornecer ambiente de runner útil. Isso não é evidência de falha do código, mas também não permite declarar os gates como aprovados.

Nenhum workflow temporário está presente na PR #9 ou na `main`.

## NEXT_ACTION dentro da Story

> `US-PLAT-001 — concluir lockfile e gates executáveis do bootstrap`

Executar na branch/PR já existentes:

1. usar ambiente com Node 24/npm e acesso ao registry;
2. gerar `package-lock.json` a partir do manifesto atual;
3. `npm ci`;
4. `npm run lint`;
5. `npm run typecheck`;
6. `npm test`;
7. `npm run build`;
8. corrigir somente falhas reais;
9. atualizar README/Changelog/Backlog/Checkpoint;
10. tirar PR #9 de Draft e mergear somente após os gates aplicáveis.

## Non-goals preservados

- projeto/schema/migrations Neon;
- Neon Auth/Data API;
- RLS;
- Object Storage;
- projeto/conexão/deployment Vercel;
- `vercel.json`;
- CI permanente GitHub Actions;
- catálogo, biblioteca, perfil ou feature funcional;
- design system completo;
- E2E amplo.

## Definition of Done

A Story somente passa a `CONCLUÍDA` quando os gates obrigatórios forem executados e a PR #9 puder ser mergeada sem alegações fictícias de verificação.

---

# Próximas Stories do Incremento 0

`US-PLAT-003` e seguintes permanecem no `PRODUCT_BACKLOG.md` e **não** devem ser promovidas enquanto a US-PLAT-001 estiver bloqueada.

---

# Contrato de execução

Para cada tarefa:

1. recuperar estado pelo protocolo;
2. confirmar `NEXT_ACTION`;
3. inspecionar repositório/documentação;
4. reutilizar Issue/branch/PR ativos quando já existirem;
5. implementar somente o necessário;
6. executar Verification Protocol;
7. revisar diff;
8. atualizar docs/ADRs quando aplicável;
9. atualizar Checkpoint;
10. abrir/revisar/mergear PR conforme gates;
11. deixar uma única próxima ação.

Deployment segue `ADR-007` e nunca é consequência automática do fluxo.
