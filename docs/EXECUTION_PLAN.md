# Execution Plan — Caleida

**Status:** roadmap operacional canônico  
**Regra:** uma `NEXT_ACTION` limitada por vez  
**Roadmap de produto:** `docs/PRODUCT_BACKLOG.md`

Este documento transforma o backlog macro em tarefas executáveis. Evidências detalhadas ficam nos documentos de validação/verificação e nos Issues/PRs indicados.

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

Resultado: deployment Vercel passou a ser exclusivamente humano/manual; CI ficou separada de CD.

## OPS-004 — Evoluir o registro de decisões para ADRs

**Estado:** CONCLUÍDO

Resultado: `docs/adr/` tornou-se autoridade arquitetural.

## OPS-005 — Refinar o Incremento 1

**Estado:** CONCLUÍDO  
**Issue:** `#31`

Resultado: EPIC-01 decomposto em quatro Stories ordenadas.

## OPS-006 — Refinar EPIC-02 — Contas e autenticação

**Estado:** CONCLUÍDO  
**Issue:** `#41`  
**PR:** `#42`  
**Plano produzido:** `docs/INCREMENT_2_PLAN.md`

Resultado: EPIC-02 decomposto em oito Stories de acesso controlado, com gates PostgreSQL/Neon-specific e non-goals explícitos.

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

**Estado:** EM ANDAMENTO; US-AUTH-003 concluída após integração da PR #48  
**Plano:** `docs/INCREMENT_2_PLAN.md`

## US-AUTH-001 — Fundação Neon Auth e contrato de sessão

**Estado:** CONCLUÍDA  
**Issue:** `#43`  
**PR:** `#44`  
**Capacidade:** CAP-01  
**Evidência:** `docs/US_AUTH_001_VERIFICATION.md`

Resultado consolidado:

- SDK Neon Auth pinado;
- boundary server-only/lazy/fail-closed;
- Managed Better Auth promovido à baseline depois dos gates;
- CI pós-merge `33753190237`: `PASS`;
- nenhum usuário real/Data API/Production/deployment criado.

---

## US-AUTH-002 — Papéis, autorização e bootstrap administrativo

**Estado:** CONCLUÍDA  
**Issue:** `#45`  
**PR:** `#46`  
**Capacidades:** CAP-04, CAP-35  
**Evidência:** `docs/US_AUTH_002_VERIFICATION.md`

Resultado consolidado:

- cinco papéis Caleida separados do Admin Better Auth;
- migration `000002_product_authorization.sql`;
- autorização crítica server-only + banco;
- autopromoção/elevação indevida negadas;
- bootstrap owner controlado;
- migrations `000001`/`000002` promovidas à baseline;
- CI pós-merge `33770088254`: `PASS`;
- branch Neon de verificação removida após autorização explícita.

---

## US-AUTH-003 — Modelar convites, solicitações de acesso e auditoria de entrada

**Estado:** CONCLUÍDA APÓS INTEGRAÇÃO  
**Issue:** `#47`  
**PR:** `#48`  
**Prioridade:** P0  
**Capacidades:** CAP-02, CAP-35  
**Dependência:** US-AUTH-002 concluída  
**Evidência:** `docs/US_AUTH_003_VERIFICATION.md`

### Resultado

- migration `000003_entry_control.sql` cria o modelo persistente de entrada fechada;
- convite `unico`/`reutilizavel`, validade, destinatário opcional, capacidade e estados canônicos;
- somente digest hexadecimal do token é persistido;
- usos de convite são numerados e limitados atomicamente;
- solicitações possuem espera/aprovação/recusa/arquivamento, ator e motivo;
- auditoria compacta em `caleida_audit.entry_events`;
- funções privadas `SECURITY DEFINER` com `search_path` fixo;
- consumo serializado com row lock PostgreSQL;
- teste concorrente com duas sessões `psql` independentes;
- nenhuma UI, e-mail, signup, Data API ou Production criada;
- nenhuma nova decisão arquitetural material exigiu ADR.

### Verificação

- CI inicial `33771618637`: `FAIL` legítimo somente por variável ambígua no teste SQL, após migration aplicar corretamente;
- teste corrigido sem relaxar regras;
- CI técnico `33771989432`: `PASS` para `npm ci`, `npm run verify`, 55/55 testes, build, PostgreSQL 18 e `npm run verify:db`;
- concorrência: `PASS — exatamente uma de duas sessões consumiu convite de capacidade 1`;
- checksum `000003`: `503700640a81cf41dfe56a0abe70fc581b9c64d8e9ad6585cbcb55d4751b7c5f`;
- migration `000003` promovida à baseline `caleida-nonprod/main` sem fixtures;
- baseline pós-promoção: zero usuários/papéis/convites/solicitações/eventos;
- Neon-specific: `SKIPPED` porque a Story depende somente de PostgreSQL portável;
- browser real: `SKIPPED` por ausência deliberada de fluxo/UI;
- deployment Vercel: `SKIPPED/PROIBIDO`.

---

## US-AUTH-004 — Selecionar e integrar e-mail transacional non-production

**Estado:** NEXT_ACTION  
**Prioridade:** P0  
**Capacidades:** CAP-01, CAP-02  
**Dependências:** fundação Auth e contratos de entrada concluídos

### Objetivo

Escolher e integrar o transporte non-production necessário para confirmação de e-mail, convite e recuperação de senha sem acoplar o produto silenciosamente a um provedor.

### Escopo limitado

- revalidar provedores, pricing, limites, regiões e privacidade na execução;
- escolher somente depois da comparação corrente;
- registrar ADR se a escolha criar compromisso arquitetural/operacional material;
- introduzir secrets somente server-side e separados por ambiente;
- integrar transporte/testabilidade em non-production;
- definir comportamento recuperável quando o provedor estiver indisponível;
- preservar o mecanismo de entrada sem consumir convite indevidamente por falha de transporte.

### Non-goals

- signup completo;
- login/logout;
- OAuth;
- Production Neon;
- deployment Vercel;
- reutilizar non-production como Production.

---

# Contrato de execução

Para cada tarefa:

1. recuperar estado pelo protocolo;
2. confirmar `NEXT_ACTION`;
3. inspecionar repositório/documentação/estado externo aplicável;
4. resolver `MANUAL_ACTION_REQUIRED` que seja pré-condição;
5. criar/usar Issue e branch limitadas;
6. implementar somente o necessário;
7. executar Verification Protocol;
8. revisar diff;
9. atualizar docs/ADRs quando aplicável;
10. atualizar Checkpoint/Backlog/Changelog;
11. abrir/revisar/mergear PR;
12. deixar uma única próxima ação.
