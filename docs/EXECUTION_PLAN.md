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

---

# US-PLAT-006 — Configurar validações automatizadas

**Estado:** CONCLUÍDO  
**Backlog:** `US-PLAT-006` / EPIC-00  
**Issue:** `#20`  
**PR:** `#21`

## Resultado

- criado `npm run verify` como entrada canônica de verificação padrão;
- ordem do gate: `db:migrations:check → lint → typecheck → test → build`;
- composição usa `&&`, portanto interrompe no primeiro gate inválido;
- criado `npm run verify:db` como gate integrado separado: `db:migrate → db:test`;
- o gate padrão não exige banco nem credencial externa;
- o gate de banco exige ambiente PostgreSQL já provisionado e guardrails existentes;
- teste `tests/verification-contract.test.mjs` fixa o contrato e a ordem dos comandos;
- README, guia local e Verification Protocol foram reconciliados;
- nenhuma dependência ou alteração de lockfile foi necessária;
- nenhum workflow permanente foi criado.

## Verificação

Em GitHub Actions descartável com Node `24.20.0`, npm `11.19.0` e service container `postgres:18`:

- `npm ci`: `PASS`;
- `npm run verify`: `PASS`;
- teste do contrato de verificação: `PASS` como parte de `npm test`;
- servidor PostgreSQL 18.x: `PASS`;
- `npm run verify:db`: `PASS`;
- secrets: `PASS — nenhum`;
- workflow descartável na branch/PR final: `PASS — não integra`;
- Neon non-production: `SKIPPED — nenhuma mudança remota necessária`;
- Vercel/deployment: `SKIPPED — fora do escopo`.

---

# US-PLAT-007 — Configurar integração contínua

**Estado:** NEXT_ACTION  
**Backlog:** `US-PLAT-007` / EPIC-00  
**Tipo:** CI permanente sem CD

## Objetivo

Materializar GitHub Actions permanente para validar mudanças do Caleida usando os comandos canônicos já provados, sem qualquer job, token ou chamada de deployment.

Ao final, pull requests devem receber checks reproduzíveis para a aplicação e para o gate PostgreSQL portável.

## Dependências

- `US-PLAT-006` concluída;
- `npm run verify` e `npm run verify:db` em PASS;
- `ADR-007` — deployment exclusivamente manual;
- `ADR-008` — PostgreSQL efêmero como gate primário para SQL portável;
- `00_SYSTEM/DEPLOYMENT_POLICY.md` vigente.

## Inspecionar antes de editar

1. documentação oficial atual do GitHub Actions para workflow syntax, permissions, Node e service containers;
2. `.nvmrc`, `package.json` e `package-lock.json`;
3. `00_SYSTEM/VERIFICATION_PROTOCOL.md` e `00_SYSTEM/DEPLOYMENT_POLICY.md`;
4. `database/README.md` e `ADR-008`;
5. estado real de workflows/checks no repositório;
6. necessidade de cache — não adicionar se não houver benefício demonstrado.

## Escopo esperado

- criar workflow permanente de CI em `.github/workflows/`;
- usar Node `24.20.0` e npm `11.19.0` conforme o repositório;
- executar `npm ci`;
- executar `npm run verify`;
- fornecer PostgreSQL 18 descartável e executar `npm run verify:db`;
- usar permissões mínimas, preferencialmente `contents: read` salvo necessidade demonstrada;
- executar em pull requests e na integração da `main` quando coerente com a configuração final;
- reutilizar comandos do `package.json`, sem duplicar a lógica interna dos gates no YAML;
- não usar Neon credential para SQL portável;
- não conter qualquer passo de Vercel/deployment.

## Critérios de aceite

1. workflow permanente existe e é legível/reproduzível;
2. clean install usa `npm ci`;
3. `npm run verify` é executado;
4. PostgreSQL 18 descartável é usado para `npm run verify:db`;
5. o workflow produz check de sucesso em uma PR real da Story;
6. permissões são mínimas e nenhum secret externo é necessário para os gates atuais;
7. não existe job/comando/token/deploy hook Vercel;
8. documentação/checkpoint refletem o CI real;
9. nenhum deployment ocorre em consequência de push/PR/merge.

## Verificação obrigatória

- validar sintaxe do workflow pela própria execução no GitHub Actions;
- confirmar Node/npm esperados no runner;
- confirmar `npm ci`, `npm run verify` e `npm run verify:db` em `PASS`;
- confirmar PostgreSQL server 18.x;
- revisar permissions e ausência de secrets/deployment;
- revisar diff completo;
- após merge, confirmar workflow presente em `main` e sem execução de deployment.

## Non-goals

- CD/deployment;
- Vercel project/integration (`US-PLAT-008`);
- branch protection/ruleset além do necessário para materializar o CI, salvo decisão separada;
- Neon-specific gate sem mudança que o exija;
- Auth/Data API;
- schema funcional do produto;
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
