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

**Estado:** EM ANDAMENTO; US-AUTH-002 concluída após integração da PR #46  
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
- configuração fail-closed e cache de dados de sessão fixado em 300 segundos;
- Neon Auth Better Auth provado em branch isolada e promovido deliberadamente para `caleida-nonprod/main`;
- nenhum usuário, Data API, schema de produto, e-mail, OAuth, Production ou deployment criado.

### Verificação

- CI técnico corrigido `33679442415`: `PASS`;
- gate Neon-specific: `PASS`;
- promoção Auth à baseline non-production: `PASS`;
- CI pós-merge da `main` `33753190237`: `PASS`;
- browser real: `SKIPPED` porque a Story não cria fluxo/UI funcional;
- deployment Vercel: `SKIPPED/PROIBIDO` conforme `ADR-007`.

A branch descartável `verify-us-auth-001` foi posteriormente removida mediante autorização explícita antes do início da Story seguinte.

---

## US-AUTH-002 — Materializar papéis, autorização e bootstrap administrativo

**Estado:** CONCLUÍDA APÓS INTEGRAÇÃO  
**Issue:** `#45`  
**PR:** `#46`  
**Prioridade:** P0  
**Capacidades:** CAP-04, CAP-35  
**Dependência:** US-AUTH-001 concluída  
**Evidência:** `docs/US_AUTH_002_VERIFICATION.md`

### Resultado

- cinco papéis de produto materializados separadamente do papel Admin do Better Auth;
- migration `000002_product_authorization.sql` cria `caleida_auth.user_roles`, `caleida_audit.role_changes` e operações privilegiadas controladas;
- UUID de `neon_auth.user.id` é o vínculo de identidade, sem duplicar credenciais;
- fronteira server-only em `src/lib/auth/authorization.ts` replica a política crítica do banco;
- usuário não pode alterar o próprio papel;
- `administrador` não concede `administrador`/`proprietário` nem altera pares/owner;
- bootstrap inicial de proprietário é server-only, explícito, auditável, idempotente e só aceita identidade Auth já existente;
- nenhuma superfície HTTP/UI/Data API foi fabricada antes de existir um fluxo real;
- nenhuma nova decisão arquitetural material foi necessária além de ADR-004/005/008.

### Verificação

- gate Neon-specific em `verify-us-auth-002`: `PASS`;
- CI inicial `33765866322`: `FAIL` legítimo apenas no teste de ACL que tratava `PUBLIC` como role concreta;
- teste corrigido sem relaxar ACL;
- head técnico/documental `2b5c20d47137e880c7c535b04a025d532d6e685b`: CI `33766333312` `PASS` para aplicação, 49 testes, build, PostgreSQL 18 e `verify:db`;
- migrations `000001`/`000002` promovidas deliberadamente à baseline `caleida-nonprod/main` com checksums idênticos ao runner;
- baseline pós-promoção: zero usuários Auth, zero papéis, zero eventos de mudança de papel e Data API ausente;
- browser real: `SKIPPED` por ausência deliberada de fluxo/UI;
- Production Neon: `SKIPPED/NON-GOAL`;
- deployment Vercel: `SKIPPED/PROIBIDO`.

### Pendência operacional

A branch Neon `verify-us-auth-002` (`br-weathered-shape-awp7ckqa`) permanece descartável. Sua exclusão é destrutiva e exige nova autorização explícita do usuário.

Não criar outro ambiente Neon descartável para US-AUTH-003 enquanto essa limpeza estiver pendente.

---

## US-AUTH-003 — Modelar convites, solicitações de acesso e auditoria de entrada

**Estado:** NEXT_ACTION  
**Prioridade:** P0  
**Capacidades:** CAP-02, CAP-35  
**Dependência:** US-AUTH-002 concluída

### Objetivo

Criar o modelo persistente de entrada controlada antes do signup, sem enviar e-mail e sem criar conta.

### Escopo limitado

- modelar convite único/reutilizável;
- validade, limite de uso e destinatário opcional;
- estados criado, enviado, utilizado, expirado, revogado e cancelado;
- solicitação/lista de espera com aprovação, recusa, espera e arquivamento;
- rastrear responsável pelo convite e vínculo futuro com a conta;
- auditoria mínima sem secrets;
- provar concorrência/uso simultâneo de convite;
- definir rate limiting/abuso como requisito quando existir endpoint externo;
- migrations/RLS somente quando justificadas pelo modelo;
- PostgreSQL 18 obrigatório e Neon-specific somente se a regra depender de identidade/roles gerenciados.

### Non-goals

- envio de e-mail;
- criação de conta/signup;
- login/logout;
- OAuth;
- Production Neon;
- deployment Vercel.

### Pré-condição operacional

Antes de criar uma nova branch Neon descartável, obter autorização explícita e remover `verify-us-auth-002`. Se US-AUTH-003 puder iniciar com trabalho puramente PostgreSQL portável sem novo ambiente Neon, a modelagem pode avançar, mas nenhum segundo branch descartável deve ser criado por conveniência.

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
