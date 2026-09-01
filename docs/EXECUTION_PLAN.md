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
- `.env.example` formalizado como contrato seguro, sem variáveis fictícias nem secrets;
- regras para futuras variáveis server-side e `NEXT_PUBLIC_*` documentadas;
- gates locais e troubleshooting objetivo documentados;
- nenhum serviço remoto foi conectado.

## Verificação

Em runner GitHub Actions descartável:

- Node `24.20.0`: `PASS`;
- npm `11.19.0`: `PASS`;
- `npm ci`: `PASS`;
- `npm run dev` + resposta HTTP local: `PASS`;
- `npm run lint`: `PASS`;
- `npm run typecheck`: `PASS`;
- `npm test`: `PASS`;
- `npm run build`: `PASS`;
- secrets: `PASS — nenhum`;
- Neon/Vercel/deployment: `SKIPPED — fora do escopo`.

O workflow temporário usado para verificação não integra a Story nem deve permanecer na `main`.

---

# US-PLAT-004 — Configurar a fundação Neon de desenvolvimento

**Estado:** NEXT_ACTION  
**Backlog:** `US-PLAT-004` / EPIC-00  
**Tipo:** infraestrutura non-production

## Objetivo

Criar a fundação Neon non-production do Caleida de forma segura e reproduzível, sem introduzir schema de negócio prematuro.

## Dependências

- `US-PLAT-001` e `US-PLAT-003` concluídas;
- `ADR-004` — mudanças de banco somente por migrations;
- `ADR-005` — Neon como plataforma canônica de dados/identidade;
- `ADR-006` — Object Storage permanece desacoplado/adiado;
- nenhum deployment Vercel necessário.

## Inspecionar antes de executar

1. documentação oficial Neon corrente;
2. `docs/NEON_PLATFORM.md`;
3. `docs/adr/ADR-004-database-changes-by-migrations.md`;
4. `docs/adr/ADR-005-neon-data-identity-platform.md`;
5. estado real dos projetos Neon conectados;
6. contratos atuais de branches, roles e connection strings do Neon.

## Escopo esperado

- criar ou selecionar um projeto Neon exclusivamente non-production para o Caleida;
- definir branch canônica de desenvolvimento/staging conforme arquitetura vigente;
- definir convenção para branches descartáveis de verificação;
- documentar quais credenciais/connections pertencem a cada ambiente, sem versionar valores;
- manter Production isolada e não provisioná-la apenas por conveniência;
- registrar o estado remoto real no repositório;
- não criar schema/tabelas de produto antes da Story de migrations.

## Segurança

- nenhum secret ou connection string real no Git, Issue, PR ou documentação;
- não usar Production como ambiente de teste;
- não conceder privilégios extras sem necessidade;
- não tratar credencial owner/admin como prova de autorização de usuário;
- não habilitar Auth/Data API apenas por existir o projeto, salvo necessidade explícita e compatível com o escopo.

## Critérios de aceite

1. existe fundação Neon non-production identificável do Caleida;
2. topologia de projeto/branch está coerente com ADR-005;
3. convenção de branch descartável está documentada;
4. nenhum schema de negócio prematuro é criado;
5. nenhum secret é versionado;
6. Production permanece isolada/não usada como laboratório;
7. documentação e Checkpoint refletem os recursos remotos realmente existentes.

## Verificação

- confirmar projeto/branch via Neon conectado;
- confirmar ausência de alterações de schema de produto;
- revisar diff e ausência de credenciais;
- consultar documentação oficial atual para qualquer comportamento de branching/roles/conexões assumido.

## Non-goals

- schema/migrations/RLS de produto (`US-PLAT-005`);
- implementação Neon Auth/Data API na aplicação;
- Object Storage;
- CI permanente;
- projeto/conexão Vercel;
- deployment;
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
