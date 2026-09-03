# Execution Plan — Caleida

**Status:** roadmap operacional canônico  
**Regra:** uma `NEXT_ACTION` limitada por vez  
**Roadmap de produto:** `docs/PRODUCT_BACKLOG.md`

Este documento transforma o backlog em tarefas executáveis. Evidências detalhadas ficam nos documentos de verificação e Issues/PRs indicados.

---

# Operações canônicas concluídas

- `OPS-001` — protocolo canônico v2: **CONCLUÍDO**.
- `OPS-002` — pivot Supabase → Neon: **CONCLUÍDO**.
- `OPS-003` — deployment Vercel exclusivamente humano/manual: **CONCLUÍDO**.
- `OPS-004` — ADRs como autoridade arquitetural: **CONCLUÍDO**.
- `OPS-005` — refino do Incremento 1: **CONCLUÍDO** (#31).
- `OPS-006` — refino do EPIC-02: **CONCLUÍDO** (#41/#42).

# Incremento 0

**Estado:** CONCLUÍDO — `docs/INCREMENT_0_VALIDATION.md`.

# Incremento 1

**Estado:** CONCLUÍDO — `docs/INCREMENT_1_VALIDATION.md`.

```text
US-DS-001 — CONCLUÍDA (#33/#34)
US-DS-002 — CONCLUÍDA (#35/#36)
US-DS-003 — CONCLUÍDA (#37/#38)
US-DS-004 — CONCLUÍDA (#39/#40)
```

---

# Incremento 2 — Acesso controlado / EPIC-02

**Estado:** EM ANDAMENTO; US-AUTH-004 concluída e US-AUTH-005 pronta  
**Plano:** `docs/INCREMENT_2_PLAN.md`

## US-AUTH-001 — Fundação Neon Auth e sessão

**Estado:** CONCLUÍDA — #43/#44  
**Evidência:** `docs/US_AUTH_001_VERIFICATION.md`

Managed Better Auth + boundary server-only/fail-closed. CI pós-merge `33753190237`: PASS.

## US-AUTH-002 — Papéis, autorização e bootstrap

**Estado:** CONCLUÍDA — #45/#46  
**Evidência:** `docs/US_AUTH_002_VERIFICATION.md`

Cinco papéis Caleida, autorização server/banco, auditoria e bootstrap owner controlado. CI pós-merge `33770088254`: PASS.

## US-AUTH-003 — Entrada controlada

**Estado:** CONCLUÍDA — #47/#48  
**Evidência:** `docs/US_AUTH_003_VERIFICATION.md`

Migration `000003`, convites digest-only, solicitações, auditoria e concorrência serializada.

```text
Merge: 3cecfaf6eef357ece3096873d6847e334510db94
CI final PR: 33773066584 — PASS
CI pós-merge main: 33773379852 — PASS
```

## US-AUTH-004 — E-mail Auth non-production

**Estado:** CONCLUÍDA — #49/#50  
**Decisão:** `ADR-009`  
**Contrato:** `docs/EMAIL_TRANSPORT.md`  
**Evidência:** `docs/US_AUTH_004_VERIFICATION.md`

Resultado:

- baseline `caleida-nonprod/main` permanece em Better Auth saudável;
- `email_provider.type=shared` atende desenvolvimento/non-production sem domínio próprio;
- email/password está habilitado;
- `require_email_verification=false` permanece até US-AUTH-005;
- adapter/configuração Resend preparados inicialmente foram removidos antes do merge;
- nenhum secret externo, migration ou deployment foi introduzido;
- SMTP/provedor externo foi adiado até requisito real de beta público/Production.

A branch Neon `verify-us-auth-004` criada durante a investigação não contém SMTP externo. Sua eventual exclusão é housekeeping não bloqueante e exige autorização destrutiva explícita.

## US-AUTH-005 — Cadastro controlado por convite ou aprovação

**Estado:** PRONTA  
**Dependências:** US-AUTH-002/003/004  
**Capacidades:** CAP-01, CAP-02

Objetivo da próxima unidade:

- impor signup fail-closed por convite válido ou solicitação aprovada fora da UI;
- preservar destinatário/validade/capacidade e concorrência;
- vincular/consumir entrada com segurança;
- integrar confirmação de e-mail pelo Neon Auth sem transformar verificação em substituto do gate de entrada;
- só ativar `require_email_verification` quando o controle de signup estiver comprovado.

### Non-goals imediatos

Não antecipar US-AUTH-006/007, OAuth, Production Neon ou deployment Vercel.

---

# Próxima ação única

> `US-AUTH-005 — implementar cadastro controlado por convite ou aprovação`.

# Contrato de execução

1. recuperar estado canônico + remoto;
2. executar somente a `NEXT_ACTION`;
3. manter Issue/branch/PR limitadas;
4. verificar antes de concluir;
5. registrar decisões materiais em ADR;
6. nunca versionar/expor secret;
7. nunca executar deployment Vercel;
8. deixar exatamente uma próxima ação.
