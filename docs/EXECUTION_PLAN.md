# Execution Plan — Caleida

**Status:** roadmap operacional canônico  
**Regra:** uma `NEXT_ACTION` limitada por vez  
**Roadmap de produto:** `docs/PRODUCT_BACKLOG.md`

Este documento transforma o backlog macro em tarefas executáveis. Evidências detalhadas ficam nos documentos de validação/verificação e nos Issues/PRs indicados.

---

# Operações canônicas concluídas

- `OPS-001` — modernizar o protocolo canônico — **CONCLUÍDO**.
- `OPS-002` — formalizar o pivot Supabase → Neon — **CONCLUÍDO**.
- `OPS-003` — reconciliar a política de deployment — **CONCLUÍDO**; deployment Vercel é exclusivamente humano/manual e CI permanece separada de CD.
- `OPS-004` — evoluir o registro de decisões para ADRs — **CONCLUÍDO**.
- `OPS-005` — refinar o Incremento 1 — **CONCLUÍDO** (`#31`).
- `OPS-006` — refinar EPIC-02 — **CONCLUÍDO** (`#41 / #42`), com plano em `docs/INCREMENT_2_PLAN.md`.

---

# Incremento 0 — Fundação executável

**Estado:** CONCLUÍDO  
**Evidência:** `docs/INCREMENT_0_VALIDATION.md`

Fundação consolidada: Next.js 16 / React 19, TypeScript strict, Tailwind CSS 4, Node 24.x, CI permanente sem CD, Neon/PostgreSQL 18 non-production e Vercel preparado para release manual.

---

# Incremento 1 — Fundação visual / EPIC-01

**Estado:** CONCLUÍDO  
**Plano:** `docs/INCREMENT_1_PLAN.md`  
**Evidência:** `docs/INCREMENT_1_VALIDATION.md`

```text
US-DS-001 tokens/temas — CONCLUÍDA (#33 / #34)
US-DS-002 tipografia/marca — CONCLUÍDA (#35 / #36)
US-DS-003 primitivos acessíveis — CONCLUÍDA (#37 / #38)
US-DS-004 fundação responsiva aplicada — CONCLUÍDA (#39 / #40)
```

---

# Incremento 2 — Acesso controlado / EPIC-02

**Estado:** EM ANDAMENTO  
**Plano:** `docs/INCREMENT_2_PLAN.md`

## Cursor

```text
US-AUTH-001 fundação Neon Auth + sessão — CONCLUÍDA (#43 / #44)
  ↓
US-AUTH-002 papéis/autorização + bootstrap — CONCLUÍDA (#45 / #46)
  ↓
US-AUTH-003 convites/solicitações + auditoria — CONCLUÍDA (#47 / #48)
  ↓
US-AUTH-004 e-mail Auth non-production — CONCLUÍDA (#49 / #50)
  ↓
US-AUTH-005 cadastro controlado + confirmação de e-mail — CONCLUÍDA (#51 / #52)
  ↓
US-AUTH-006 login/logout + proteção de sessão — CONCLUÍDA (#53 / #54)
  ↓
US-AUTH-007 recuperação de senha + gestão/revogação de sessões — NEXT_ACTION
  ↓
US-AUTH-008 auditoria integrada + validação live do incremento
```

## US-AUTH-001 — Fundação Neon Auth e contrato de sessão

**Estado:** CONCLUÍDA  
**Issue/PR:** `#43 / #44`  
**Evidência:** `docs/US_AUTH_001_VERIFICATION.md`

Resultado: SDK Neon Auth pinado; boundary server-only/lazy/fail-closed; Managed Better Auth integrado em non-production; CI pós-merge PASS; sem usuário real, Data API, Production ou deployment criado pela IA.

## US-AUTH-002 — Papéis, autorização e bootstrap administrativo

**Estado:** CONCLUÍDA  
**Issue/PR:** `#45 / #46`  
**Evidência:** `docs/US_AUTH_002_VERIFICATION.md`

Resultado: papéis de produto separados da identidade Better Auth; autorização crítica server-only + banco; bootstrap owner controlado; migrations promovidas; gates PASS.

## US-AUTH-003 — Convites, solicitações de acesso e auditoria de entrada

**Estado:** CONCLUÍDA  
**Issue/PR:** `#47 / #48`  
**Evidência:** `docs/US_AUTH_003_VERIFICATION.md`

Resultado: convites, solicitações, auditoria e consumo concorrente/serializado versionados e verificados em PostgreSQL 18; sem Data API/browser/Production.

## US-AUTH-004 — Validar e-mail Auth non-production

**Estado:** CONCLUÍDA  
**Issue/PR:** `#49 / #50`  
**Evidência:** `docs/US_AUTH_004_VERIFICATION.md`  
**ADR:** `docs/adr/ADR-009-neon-shared-email-nonproduction.md`

Resultado: provider compartilhado Neon confirmado; SMTP/provedor externo adiado; nenhum secret/adaptador externo incorporado.

## US-AUTH-005 — Cadastro controlado por convite ou aprovação

**Estado:** CONCLUÍDA  
**Issue/PR:** `#51 / #52`  
**Merge:** `9abc3235623c3f7d37531eb94a60997960f526e1`  
**Evidência:** `docs/US_AUTH_005_VERIFICATION.md`

Resultado: signup fail-closed por convite/aprovação; confirmação obrigatória por OTP; migrations `000004`–`000007` promovidas; CI e gate live específicos da Story aprovados; sem Production ou deployment pela IA.

## US-AUTH-006 — Login, logout e proteção de sessão

**Estado:** CONCLUÍDA  
**Issue/PR:** `#53 / #54`  
**Merge:** `b585234a159a73dfec89e1d4cb866201dcfdef34`  
**Capacidade:** CAP-01  
**Evidência:** `docs/US_AUTH_006_VERIFICATION.md`

Resultado:

- login/logout por server actions via boundary Neon Auth;
- `/login` server-aware;
- `/app` protegido por layout server-side;
- credenciais inválidas com mensagem genérica;
- acesso direto anônimo negado antes de conteúdo privado;
- estados pending/error acessíveis;
- CI final da PR `#214 / 34500281605`: PASS;
- PostgreSQL 18 + `verify:db`: PASS;
- Neon-specific estrutural/configuração: PASS em `verify-us-auth-006`;
- browser/live: `SKIPPED/deferred` para US-AUTH-008 conforme política revisada;
- nenhum Preview adicional exigido.

## US-AUTH-007 — Recuperação de senha e gestão/revogação de sessões

**Estado:** NEXT_ACTION / PRONTA  
**Prioridade:** P0  
**Dependências:** US-AUTH-004 e 006

Implementar recuperação/alteração de senha, consulta/encerramento de sessões, revogação e semântica explícita do cache de sessão.

### Regras centrais

- recuperação não pode enumerar contas indevidamente;
- tokens/códigos de recuperação não podem ser persistidos em logs/docs;
- alteração de senha deve respeitar confirmação/autorização do provider;
- usuário autenticado deve conseguir consultar/encerrar as próprias sessões quando a API suportar;
- revogação e comportamento do cache de sessão devem ser testados explicitamente;
- eventos sensíveis não podem registrar senha/token/secret;
- browser/live intermediário segue a política consolidada: sem Preview por Story, salvo dependência pública material impossível de validar de forma equivalente;
- não antecipar US-AUTH-008.

## US-AUTH-008 — Consolidar auditoria e validar Incremento 2

**Estado:** A FAZER  
**Dependências:** US-AUTH-001 a 007

Fechar lacunas de auditoria e executar a matriz integrada do incremento. Este é o ponto padrão para validação live/browser consolidada de cadastro, login, logout, sessão, recuperação, autorização, acesso direto e ausência de flash privado. Se um Preview manual for realmente necessário para essa validação integrada, solicitar uma única release candidate, não um deployment por Story.

---

# Contrato de execução

Para cada tarefa:

1. recuperar estado pelo protocolo;
2. confirmar `NEXT_ACTION`;
3. inspecionar repositório/documentação/estado externo aplicável;
4. criar/usar Issue e branch limitadas;
5. implementar somente o necessário;
6. executar Verification Protocol proporcional ao escopo;
7. não transformar ausência de Preview manual em blocker automático;
8. revisar diff;
9. atualizar docs/ADRs quando aplicável;
10. atualizar Checkpoint/Backlog;
11. abrir/revisar/mergear PR quando os gates materiais estiverem satisfeitos;
12. deixar uma única próxima ação.

## NEXT_ACTION vigente

> Criar Issue e branch limitadas a `US-AUTH-007 — recuperação de senha e gestão/revogação de sessões`, recuperar os contratos atuais do Managed Better Auth/cache de sessão e executar somente essa Story sem exigir Preview Vercel intermediário.

Não antecipar US-AUTH-008, Production ou deployment Vercel.
