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

Resultado: `docs/adr/` tornou-se autoridade arquitetural, decisões existentes foram migradas com supersessões preservadas e a primeira Story técnica foi refinada.

---

# US-PLAT-001 — Inicializar a aplicação web

**Estado:** CONCLUÍDO  
**Backlog:** `US-PLAT-001` / EPIC-00

## Resultado

- Next.js 16.3.3 / React 19.2.8;
- App Router em `src/app`;
- TypeScript strict;
- Tailwind CSS 4;
- Node 24.20.0 em `.nvmrc`;
- npm 11.19.0 e `package-lock.json` canônico;
- scripts reais `dev`, `lint`, `typecheck`, `test`, `build`;
- smoke test mínimo;
- README com comandos locais;
- nenhum domínio de produto ou infraestrutura externa.

## Verificação

Em runner GitHub Actions descartável, usando Node 24.20.0/npm 11.19.0:

- geração do lockfile: `PASS`;
- `npm ci`: `PASS`;
- `npm run lint`: `PASS`;
- `npm run typecheck`: `PASS`;
- `npm test`: `PASS`;
- `npm run build`: `PASS`.

O workflow usado para desbloquear a verificação não integra a Story nem deve permanecer na `main`.

---

# US-PLAT-003 — Configurar o ambiente local da aplicação

**Estado:** NEXT_ACTION  
**Backlog:** `US-PLAT-003` / EPIC-00

## Objetivo

Transformar o bootstrap já validado em um ambiente local reproduzível para desenvolvimento, sem conectar serviços remotos.

## Escopo esperado

- revisar e completar instruções locais de setup;
- definir contrato de variáveis em `.env.example` sem valores sensíveis;
- documentar fluxo de instalação e execução a partir de clone limpo;
- validar versões/pin de runtime e package manager já adotados;
- definir comandos mínimos de desenvolvimento e troubleshooting objetivo;
- não criar projeto Neon, Auth, Storage ou Vercel.

## Critérios de aceite

1. um desenvolvedor consegue identificar pré-requisitos e comandos sem depender do chat;
2. `.env.example` contém apenas placeholders/documentação segura;
3. instalação continua reproduzível por lockfile;
4. `dev`, lint, typecheck, test e build permanecem funcionais;
5. nenhum secret ou integração remota é criado;
6. Checkpoint/documentação refletem o estado real.

## Verificação

Executar novamente os gates aplicáveis quando houver alteração técnica que possa afetá-los. Mudanças exclusivamente documentais exigem revisão de consistência e diff hygiene.

## Non-goals

- Neon project/branch;
- migrations/RLS;
- CI permanente;
- Vercel/project/deployment;
- features de produto.

---

# Contrato de execução

Para cada tarefa:

1. recuperar estado pelo protocolo;
2. confirmar `NEXT_ACTION`;
3. inspecionar repositório/documentação;
4. criar/usar Issue e branch limitadas;
5. implementar somente o necessário;
6. executar Verification Protocol;
7. revisar diff;
8. atualizar docs/ADRs quando aplicável;
9. atualizar Checkpoint;
10. abrir/revisar/mergear PR;
11. deixar uma única próxima ação.

Deployment segue `ADR-007` e nunca é consequência automática do fluxo.
