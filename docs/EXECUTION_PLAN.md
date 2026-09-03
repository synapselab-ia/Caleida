# Execution Plan — Caleida

**Status:** roadmap operacional canônico  
**Regra:** uma `NEXT_ACTION` limitada por vez  
**Roadmap de produto:** `docs/PRODUCT_BACKLOG.md`

Este documento transforma o backlog macro em tarefas executáveis. Evidências detalhadas de incrementos concluídos ficam nos documentos de validação correspondentes e nos Issues/PRs indicados.

---

# Operações canônicas concluídas

## OPS-001 — Modernizar o protocolo canônico

**Estado:** CONCLUÍDO

Resultado: Source of Truth, AI Work Protocol, Verification Protocol, Deployment Policy, Execution Plan e Checkpoint tornaram o repositório recuperável sem memória de chat.

## OPS-002 — Formalizar o pivot Supabase → Neon

**Estado:** CONCLUÍDO

Resultado: plataforma Neon formalizada, ambientes isolados definidos, migrations/testes planejados em `database/`, Storage adiado e Project Design reconciliado por amendment.

## OPS-003 — Reconciliar a política de deployment

**Estado:** CONCLUÍDO

Resultado: deployment Vercel passou a ser exclusivamente humano/manual; CI ficou separada de CD; Project Design/backlog foram reconciliados.

## OPS-004 — Evoluir o registro de decisões para ADRs

**Estado:** CONCLUÍDO

Resultado: `docs/adr/` tornou-se autoridade arquitetural, decisões existentes foram migradas com supersessões preservadas.

## OPS-005 — Refinar o Incremento 1

**Estado:** CONCLUÍDO  
**Issue:** `#31`

Resultado: `docs/INCREMENT_1_PLAN.md` decompôs EPIC-01 em quatro Stories ordenadas, sem banco, Auth, Storage ou deployment.

## OPS-006 — Refinar EPIC-02 — Contas e autenticação

**Estado:** CONCLUÍDO  
**Issue:** `#41`  
**PR:** `#42`  
**Plano produzido:** `docs/INCREMENT_2_PLAN.md`

Resultado: EPIC-02 foi decomposto em oito Stories de acesso controlado, com gates PostgreSQL/Neon-specific e non-goals explícitos.

---

# Incremento 0 — Fundação executável

**Estado:** CONCLUÍDO  
**Evidência:** `docs/INCREMENT_0_VALIDATION.md`

Stories concluídas:

- `US-PLAT-001` — aplicação Next.js executável;
- `US-PLAT-002` — estrutura documental;
- `US-PLAT-003` — ambiente local reproduzível;
- `US-PLAT-004` — fundação Neon non-production;
- `US-PLAT-005` — migrations/testes/RLS e ADR-008;
- `US-PLAT-006` — `verify`/`verify:db`;
- `US-PLAT-007` — CI permanente sem CD;
- `US-PLAT-008` — hosting Vercel preparado para release manual;
- `US-PLAT-009` — ambientes/variáveis separados;
- `US-PLAT-010` — ciclo Issue → branch → CI → PR → review → merge validado.

Estado técnico consolidado:

```text
Next.js 16.3.3 / React 19.2.8
TypeScript strict / Tailwind CSS 4
Node 24.20.0 / npm 11.19.0
CI: .github/workflows/ci.yml
Banco canônico: Neon
Non-production: caleida-nonprod / PostgreSQL 18 / branch main
Production Neon: não provisionada
Deployment: exclusivamente humano/manual
```

---

# Incremento 1 — Fundação visual / EPIC-01

**Estado:** CONCLUÍDO  
**Plano:** `docs/INCREMENT_1_PLAN.md`  
**Evidência:** `docs/INCREMENT_1_VALIDATION.md`

```text
US-DS-001 tokens/temas — CONCLUÍDA (#33 / #34)
  ↓
US-DS-002 tipografia/marca — CONCLUÍDA (#35 / #36)
  ↓
US-DS-003 primitivos acessíveis — CONCLUÍDA (#37 / #38)
  ↓
US-DS-004 fundação responsiva aplicada — CONCLUÍDA (#39 / #40)
```

---

# Incremento 2 — Acesso controlado / EPIC-02

**Estado:** EM ANDAMENTO; US-AUTH-001 concluída após integração da PR #44  
**Plano:** `docs/INCREMENT_2_PLAN.md`

## US-AUTH-001 — Materializar fundação Neon Auth isolada e contrato de sessão

**Estado:** CONCLUÍDA APÓS INTEGRAÇÃO  
**Issue:** `#43`  
**PR:** `#44`  
**Prioridade:** P0  
**Capacidade:** CAP-01  
**Evidência:** `docs/US_AUTH_001_VERIFICATION.md`

### Resultado

- `@neondatabase/auth` fixado em `0.5.0-beta` com lockfile reproduzível;
- fronteira Auth server-only/lazy em `src/lib/auth/server.ts`;
- handler catch-all GET/POST em `src/app/api/auth/[...path]/route.ts`;
- `NEON_AUTH_BASE_URL` e `NEON_AUTH_COOKIE_SECRET` documentados sem valores;
- configuração fail-closed e cache de dados de sessão fixado em 300 segundos;
- branch Neon `verify-us-auth-001` criada para gate Neon-specific;
- Neon Auth Better Auth e schema gerenciado `neon_auth` comprovados na branch isolada;
- baseline Neon preservada durante experimentação;
- depois dos gates, Neon Auth Better Auth promovido deliberadamente para `caleida-nonprod/main`;
- nenhum usuário, Data API, schema/RLS de produto, e-mail, OAuth, Production ou deployment criado.

### Verificação

- CI inicial `33679115854`: `FAIL` legítimo no typecheck porque o handler corrente exige request + contexto catch-all;
- causa corrigida sem relaxar gate;
- head técnico corrigido `d289e9bdde563b8161e2603a9fccc4df50a081c7`;
- CI técnico `33679442415`: `PASS` para `npm ci`, `npm run verify`, PostgreSQL 18 e `npm run verify:db`;
- gate Neon-specific: `PASS` em branch isolada;
- promoção Auth à baseline non-production: `PASS`;
- browser real: `SKIPPED` porque a Story não cria fluxo/UI funcional;
- deployment Vercel: `SKIPPED/PROIBIDO` conforme `ADR-007`;
- branch Neon descartável permanece pendente de remoção explícita porque exclusão é ação destrutiva no conector.

---

## US-AUTH-002 — Materializar papéis, autorização e bootstrap administrativo

**Estado:** NEXT_ACTION  
**Prioridade:** P0  
**Capacidades:** CAP-04, CAP-35  
**Dependência:** US-AUTH-001 concluída

### Objetivo

Definir papéis `proprietário`, `administrador`, `moderador`, `curador` e `usuário` como autorização de produto vinculada à identidade Neon, com bootstrap administrativo controlado e auditável.

### Escopo limitado

- reler `docs/INCREMENT_2_PLAN.md`, CAP-04/CAP-35 e ADRs aplicáveis;
- modelar autorização de produto sem duplicar credenciais do Neon Auth;
- criar qualquer schema persistente somente por migration versionada;
- verificar autorização crítica no servidor e no banco;
- desenhar bootstrap inicial de proprietário de forma explícita, server-only e auditável;
- testar usuário comum tentando promover a si mesmo ou executar ação administrativa direta;
- registrar eventos de mudança de papel sem secrets/payload desnecessário;
- usar PostgreSQL 18 e gate Neon-specific quando a regra depender da identidade Neon real.

### Non-goals

- convites/lista de espera;
- cadastro/login/logout;
- SMTP/e-mail;
- OAuth;
- Data API por conveniência;
- Production Neon;
- deployment Vercel.

### Pré-condição operacional

Antes de criar nova branch Neon para US-AUTH-002, remover a branch descartável `verify-us-auth-001` quando houver autorização explícita para a ação destrutiva. A pendência deve permanecer visível em `CHECKPOINT.md` até ser resolvida.

---

# Contrato de execução

Para cada tarefa:

1. recuperar estado pelo protocolo;
2. confirmar `NEXT_ACTION`;
3. inspecionar repositório/documentação/estado externo aplicável;
4. resolver `MANUAL_ACTION_REQUIRED` que seja pré-condição da tarefa;
5. criar/usar Issue e branch limitadas;
6. implementar somente o necessário;
7. executar Verification Protocol;
8. revisar diff;
9. atualizar docs/ADRs quando aplicável;
10. atualizar Checkpoint/Backlog/Changelog;
11. abrir/revisar/mergear PR;
12. deixar uma única próxima ação.
