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

---

# US-PLAT-003 — Configurar o ambiente local da aplicação

**Estado:** CONCLUÍDO  
**Backlog:** `US-PLAT-003` / EPIC-00

## Resultado

- criado `docs/LOCAL_DEVELOPMENT.md` como guia canônico de desenvolvimento local;
- README reduzido a entrada rápida e link para o guia completo;
- pré-requisitos Node `24.20.0` e npm `11.19.0` documentados e validados;
- fluxo clone limpo → `npm ci` → `npm run dev` documentado;
- `.env.example` formalizado como contrato seguro;
- gates locais e troubleshooting documentados;
- nenhum serviço remoto foi conectado.

## Verificação

Em runner GitHub Actions descartável:

- Node `24.20.0`: `PASS`;
- npm `11.19.0`: `PASS`;
- `npm ci`: `PASS`;
- `npm run dev` + resposta HTTP local: `PASS`;
- lint/typecheck/test/build: `PASS`;
- secrets: `PASS — nenhum`;
- Neon/Vercel/deployment: `SKIPPED — fora do escopo`.

---

# US-PLAT-004 — Configurar a fundação Neon de desenvolvimento

**Estado:** CONCLUÍDO  
**Backlog:** `US-PLAT-004` / EPIC-00  
**Issue:** `#14`

## Resultado

- criado o projeto Neon `caleida-nonprod`;
- PostgreSQL 18 em `aws-us-east-1`;
- branch default Neon `main` adotada como baseline canônica non-production/staging;
- `docs/NEON_NONPROD.md` registra o recurso remoto;
- Production, Neon Auth, Data API, Object Storage e schema de produto permaneceram não provisionados.

## Estado remoto

```text
Projeto: caleida-nonprod
Project ID: patient-glade-95136440
Região: aws-us-east-1
PostgreSQL: 18
Baseline branch: main
Branch ID: br-restless-cherry-awpcwy6r
Database default: neondb
```

---

# US-PLAT-005 — Definir migrations, testes de banco e RLS

**Estado:** CONCLUÍDO  
**Backlog:** `US-PLAT-005` / EPIC-00  
**Issue:** `#16`  
**PR:** `#19` (`#17` preservada como Draft histórica, fechada sem merge por falha do conector na transição Ready for review)

## Resultado

- criado `database/migrations/` com convenção sequencial e migration técnica inicial;
- criado `database/tests/` com testes executáveis de baseline e versão PostgreSQL;
- criado runner Node + `psql`, sem ORM/dependência npm adicional;
- ledger interno `caleida_internal.schema_migrations` registra filename/checksum/data de aplicação;
- SHA-256 detecta migration histórica alterada;
- `db:migrations:check`, `db:migrate` e `db:test` integram o contrato do repositório;
- guardrails distinguem `ephemeral`, `neon-isolated` e promoção explícita `baseline`;
- baseline Neon não pode ser usada como alvo de teste;
- contrato futuro de testes RLS cobre owner, non-owner, anonymous e ownership forjado;
- nenhuma entidade funcional do produto foi antecipada.

## ADR-008

Durante a Story, o endpoint de branching do conector Neon permaneceu incompatível. A estratégia foi formalizada no `ADR-008`:

- SQL/RLS PostgreSQL portável usa PostgreSQL descartável da mesma versão major do Neon como gate primário;
- comportamento específico do Neon exige gate adicional em branch Neon isolada quando aplicável;
- Neon permanece plataforma canônica conforme `ADR-005`;
- indisponibilidade de branching Neon não autoriza usar a baseline `main` como laboratório.

A documentação oficial do Neon verificada nesta Story confirma que Neon é PostgreSQL, com diferenças próprias de serviço gerenciado que justificam o gate adicional somente quando materialmente relevantes.

## Verificação

Em GitHub Actions descartável com `postgres:18`:

- PostgreSQL server 18.x: `PASS`;
- `npm ci`: `PASS`;
- `npm run db:migrations:check`: `PASS`;
- primeira aplicação de migrations: `PASS`;
- testes SQL: `PASS`;
- segunda aplicação sem duplicar ledger: `PASS`;
- drop/recreate + migrations + testes desde zero: `PASS`;
- lint: `PASS`;
- typecheck: `PASS`;
- testes Node: `PASS`;
- build: `PASS`;
- secrets reais: `PASS — nenhum`;
- Neon-specific gate: `SKIPPED — migration técnica usa somente primitives PostgreSQL portáveis`;
- baseline Neon: `SKIPPED — nenhuma promoção necessária nesta Story`;
- Production/Vercel/deployment: `SKIPPED — fora do escopo`.

A primeira execução encontrou um defeito real no runner: uma URL completa era enviada via `PGDATABASE`. O runner foi corrigido para `psql --dbname` e passou a redigir a URL em erro. A execução seguinte passou integralmente.

---

# US-PLAT-006 — Configurar validações automatizadas

**Estado:** NEXT_ACTION  
**Backlog:** `US-PLAT-006` / EPIC-00  
**Tipo:** consolidação de gates locais/reproduzíveis

## Objetivo

Consolidar as verificações técnicas já existentes em uma entrada canônica, determinística e simples para desenvolvimento e futura CI, sem criar ainda workflow permanente de GitHub Actions.

Ao final, uma sessão deve conseguir executar o conjunto padrão de validações do repositório sem precisar reconstruir manualmente a ordem dos comandos.

## Dependências

- `US-PLAT-001`, `US-PLAT-003`, `US-PLAT-004` e `US-PLAT-005` concluídas;
- scripts reais de lint/typecheck/test/build existentes;
- `db:migrations:check` existente;
- `ADR-008` vigente para gates de banco.

## Inspecionar antes de editar

1. `package.json` e scripts atuais;
2. `00_SYSTEM/VERIFICATION_PROTOCOL.md`;
3. `database/README.md`;
4. `docs/LOCAL_DEVELOPMENT.md`;
5. diferenças entre gates sempre executáveis e gates que exigem PostgreSQL descartável;
6. documentação oficial das ferramentas somente se alguma configuração atual depender de comportamento recente.

## Escopo esperado

- criar uma entrada canônica como `npm run verify` para gates que não exigem infraestrutura externa;
- incluir, no mínimo, validação de migrations, lint, typecheck, testes e build em ordem determinística;
- manter o gate integrado de banco PostgreSQL 18 como comando separado e explícito se executá-lo exigir service/container que ainda pertence à futura CI;
- documentar claramente o que `verify` cobre e o que permanece gate adicional;
- não duplicar lógica de comandos existentes sem necessidade;
- não introduzir framework/tooling novo apenas para orquestração simples.

## Critérios de aceite

1. existe um comando canônico de verificação padrão;
2. o comando reutiliza scripts existentes e falha no primeiro gate inválido;
3. `db:migrations:check` faz parte da verificação padrão;
4. gates que exigem PostgreSQL são distinguidos sem serem silenciosamente ignorados;
5. clean install + comando canônico passam;
6. documentação local/protocolo/checkpoint refletem o contrato real;
7. nenhum workflow CI permanente é criado nesta Story;
8. nenhum secret, Neon Auth/Data API, Vercel ou deployment é introduzido.

## Verificação obrigatória

- `npm ci`;
- executar o novo comando canônico do início ao fim;
- executar qualquer teste unitário novo do orquestrador, se houver;
- revisar diff e secrets;
- confirmar ausência de workflow permanente/deployment.

## Non-goals

- GitHub Actions permanente (`US-PLAT-007`);
- integração Neon-specific nova;
- Auth/Data API;
- schema de produto;
- Vercel/project/deployment;
- Production.

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
