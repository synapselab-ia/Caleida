# Checkpoint — Caleida

**PROJECT_STATUS:** READY  
**CURRENT_PHASE:** Incremento 0 — Fundação executável / reconciliação operacional  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `OPS-002 — Formalizar o pivot Supabase → Neon`  
**LAST_COMPLETED_ISSUE:** `#2`  
**BASELINE_BEFORE_OPS_002:** `ee7db33f9b222f1f88f51da31aada942d66693a6`  
**ACTIVE_TASK:** none  
**ACTIVE_ISSUE:** none  
**ACTIVE_BRANCH:** none  
**NEXT_ACTION:** `OPS-003 — Reconciliar a política de deployment`  
**BLOCKERS:** none  
**ON_HOLD:** none  
**MANUAL_ACTION_REQUIRED:** none

## Comando de continuação

Uma nova sessão deve poder iniciar com:

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

Recupere o estado pelo GitHub e pelos documentos canônicos. Não peça ao usuário para repetir contexto já disponível.

## Estado técnico atual

O Caleida continua antes do bootstrap da aplicação:

- aplicação Next.js ainda não inicializada;
- nenhum `package.json` de aplicação;
- nenhum schema/migration de produto;
- nenhum banco hospedado do Caleida criado;
- nenhuma integração de autenticação implementada;
- nenhum Object Storage selecionado/configurado;
- nenhum deployment Vercel executado como parte deste fluxo.

A plataforma canônica de dados/identidade agora é:

```text
Next.js
→ Neon Auth
→ Neon Data API
→ Neon Postgres
→ PostgreSQL RLS
```

Conexão direta ao Postgres permanece reservada a contexts server-side confiáveis, migrations e manutenção com least privilege.

## Decisões de OPS-002

- `DEC-003` — stack técnica original com Supabase: `SUPERSEDED`;
- `DEC-004` — Supabase Free temporário: `SUPERSEDED`;
- `DEC-007` — Neon como plataforma canônica de Postgres/Auth/Data API/RLS: `APROVADA`;
- `DEC-008` — Object Storage desacoplado e decisão adiada: `APROVADA`.

O Project Design v1.0 foi preservado como documento histórico-base. As premissas específicas de plataforma foram formalmente substituídas por:

- `docs/PROJECT_DESIGN_PLATFORM_AMENDMENT.md`;
- `docs/NEON_PLATFORM.md`;
- `docs/ARCHITECTURE.md`;
- `docs/DECISIONS.md`.

## Topologia de ambientes aprovada

### Non-production

Projeto Neon dedicado a desenvolvimento integrado/staging/verificação, com:

- branch canônica de staging;
- branches curtas e descartáveis para migration, RLS e testes;
- dados fictícios ou anonimizados;
- Auth/Data API provisionados somente quando a Story correspondente exigir.

### Production

Projeto Neon separado do non-production, com secrets e dados reais isolados.

Production não recebe resets/testes destrutivos e não é usada como laboratório.

## Banco e migrations

Layout canônico planejado:

```text
database/migrations/
database/tests/
```

Migrations no Git serão a história de schema. Alterações permanentes somente no Neon Console não são aceitas como implementação canônica.

O runner/tooling exato será definido na Story de fundação de banco; nenhum ORM foi escolhido apenas para migrations.

## Auth, Data API e RLS

- Neon Auth é a solução inicial de identidade;
- Neon Data API é o caminho preferencial para CRUD normal sob contexto de usuário quando apropriado;
- PostgreSQL RLS continua obrigatória para dados privados/user-scoped expostos;
- autenticação (`authenticated`) não substitui ownership/visibilidade;
- o helper/API de identidade deve ser revalidado na documentação oficial durante implementação; em OPS-002 a documentação corrente usa `auth.user_id()`;
- owner/BYPASSRLS não serve como evidência de autorização normal de usuário.

## Storage

Nenhum provedor foi selecionado.

Neon Object Storage permanecia beta na verificação de 31/08/2026; a decisão foi adiada até existir Story de arquivos/upload. O domínio deve permanecer provider-independent.

## Verificação de OPS-002

- estado real da `main` inspecionado antes da edição: `PASS`;
- documentação oficial corrente Neon/Supabase verificada: `PASS`;
- limitação atual de projetos do Supabase Free confirmada: `PASS`;
- capacidades atuais de Neon Projects/Branches/Auth/Data API/RLS verificadas: `PASS`;
- decisão histórica preservada e supersessão explícita: `PASS`;
- Project Design reconciliado por amendment de escopo: `PASS`;
- arquitetura/backlog/Execution Plan reconciliados: `PASS`;
- estratégia de migrations/branches/RLS definida: `PASS`;
- boundary de Storage explícito: `PASS`;
- secrets/credenciais adicionados: `PASS — nenhum`;
- projeto Neon do Caleida criado: `SKIPPED — desnecessário para decisão documental`;
- aplicação/lint/typecheck/test/build: `SKIPPED — aplicação ainda não inicializada`;
- migrations/testes RLS executados: `SKIPPED — schema ainda não existe`;
- deployment Vercel: `SKIPPED — fora do escopo e não autorizado`.

## Próxima ação — OPS-003

Executar somente:

> `OPS-003 — Reconciliar a política de deployment`

Requisitos essenciais:

1. verificar documentação oficial corrente da Vercel;
2. localizar referências ativas a Preview/Production automáticos, Git integration e deploy como gate;
3. formalizar a política manual/controlada no Project Design sem apagar o histórico original;
4. separar CI/build/verificação de publicação;
5. reconciliar `US-PLAT-008` e `US-PLAT-010`;
6. não conectar o repositório à Vercel apenas para concluir a decisão documental;
7. não executar Preview nem Production deployment;
8. atualizar este checkpoint com uma única próxima ação executável.

`US-PLAT-001` não deve começar enquanto uma tarefa OPS anterior permanecer como `NEXT_ACTION`.
