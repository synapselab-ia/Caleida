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
Node 24.x em runtime Vercel; .nvmrc/CI em 24.20.0
npm 11.19.0
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

**Estado:** EM ANDAMENTO; US-AUTH-005 concluída e US-AUTH-006 promovida como NEXT_ACTION  
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
- CI pós-merge `33753190237`: PASS;
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
- migrations `000001/000002` promovidas à baseline;
- CI pós-merge `33770088254`: PASS;
- branch Neon de verificação removida após autorização explícita.

---

## US-AUTH-003 — Modelar convites, solicitações de acesso e auditoria de entrada

**Estado:** CONCLUÍDA  
**Issue:** `#47`  
**PR:** `#48`  
**Prioridade:** P0  
**Capacidades:** CAP-02, CAP-35  
**Evidência:** `docs/US_AUTH_003_VERIFICATION.md`

Resultado consolidado:

- migration `000003_entry_control.sql`;
- convite único/reutilizável, validade, destinatário opcional, capacidade e estados canônicos;
- somente digest do token persistido;
- solicitações de acesso e auditoria compacta;
- funções privadas `SECURITY DEFINER`;
- consumo serializado com row lock;
- concorrência PostgreSQL comprovada;
- migration promovida à baseline sem fixtures;
- CI técnico `33771989432`: PASS.

---

## US-AUTH-004 — Validar e-mail Auth non-production

**Estado:** CONCLUÍDA  
**Issue:** `#49`  
**PR:** `#50`  
**Prioridade:** P0  
**Capacidade:** CAP-01  
**Evidência:** `docs/US_AUTH_004_VERIFICATION.md`  
**Decisão:** `docs/adr/ADR-009-neon-shared-email-nonproduction.md`

Resultado consolidado:

- provider compartilhado do Neon Auth confirmado na baseline;
- SMTP/provedor externo adiado por ausência de requisito material;
- nenhum adapter/secret externo ficou no resultado final;
- branch `verify-us-auth-004` permanece housekeeping não bloqueante e só pode ser removida com autorização destrutiva específica.

---

## US-AUTH-005 — Cadastro controlado por convite ou aprovação

**Estado:** CONCLUÍDA  
**Issue:** `#51`  
**PR:** `#52`  
**Merge:** `9abc3235623c3f7d37531eb94a60997960f526e1`  
**Prioridade:** P0  
**Capacidades:** CAP-01, CAP-02  
**Evidência:** `docs/US_AUTH_005_VERIFICATION.md`

Resultado consolidado:

- signup fail-closed por convite válido ou solicitação aprovada;
- chamada direta sem autorização bloqueada pelo `user.before_create`;
- `user.created` finaliza vínculo/consumo;
- verificação Ed25519/JWKS/timestamp/idempotência;
- rate limiting HMAC no claim público;
- confirmação obrigatória de e-mail por OTP comprovada ponta a ponta;
- migrations `000004`–`000007` promovidas à baseline;
- baseline versus `verify-us-auth-005`: schema diff vazio;
- baseline permaneceu sem fixtures;
- CI final da branch `#201 / 34398683426`: PASS;
- Issue #51 fechada pelo merge da PR #52;
- nenhum Production Neon ou deployment Vercel pela IA.

---

## US-AUTH-006 — Implementar login, logout e proteção de sessão

**Estado:** NEXT_ACTION / PRONTA  
**Prioridade:** P0  
**Capacidade:** CAP-01  
**Dependência:** US-AUTH-005 concluída

### Objetivo

Materializar login/logout e proteção de superfícies privadas sobre o Managed Better Auth já integrado, sem duplicar credenciais ou confiar em estado apenas do cliente.

### Regras centrais

- credenciais inválidas devem falhar sem enumeração indevida;
- sessão ausente, inválida ou expirada deve negar acesso;
- acesso direto por URL deve passar pela mesma autorização server-side;
- conteúdo privado não pode piscar antes de redirecionamento/erro;
- estados de formulário/loading/erro devem ser acessíveis;
- papéis de produto continuam separados da identidade Better Auth;
- não antecipar recuperação de senha/gestão avançada de sessões de US-AUTH-007;
- não criar Production Neon nem executar deployment Vercel pela IA.

### Gates esperados

- `npm run verify`;
- PostgreSQL 18 somente se houver mudança de schema/contrato DB;
- gate Neon-specific obrigatório para comportamento dependente do Managed Better Auth;
- browser real obrigatório quando a superfície de login/proteção existir;
- revisão de acesso direto e ausência de flash de conteúdo privado.

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

## NEXT_ACTION vigente

> Criar Issue e branch limitadas a `US-AUTH-006 — Implementar login, logout e proteção de sessão`, recuperar os contratos Auth/sessão integrados e executar somente essa Story.

Não antecipar US-AUTH-007, Production ou deployment Vercel.