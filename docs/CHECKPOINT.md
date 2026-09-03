# Checkpoint — Caleida

**PROJECT_STATUS:** MANUAL_ACTION_REQUIRED  
**CURRENT_PHASE:** Incremento 2 — Acesso controlado / EPIC-02 em andamento  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `US-AUTH-003 — Modelar convites, solicitações de acesso e auditoria de entrada`  
**LAST_COMPLETED_ISSUE:** `#47`  
**LAST_COMPLETED_PR:** `#48`  
**ACTIVE_TASK:** `US-AUTH-004 — Selecionar e integrar e-mail transacional non-production`  
**ACTIVE_ISSUE:** `#49`  
**ACTIVE_BRANCH:** `feat/us-auth-004-transactional-email`  
**ACTIVE_PR:** `#50`  
**NEXT_ACTION:** `US-AUTH-004 — concluir gate live Resend/Neon Auth non-production sem expor secrets`  
**BLOCKERS:** `envio live e SMTP customizado não podem ser provados sem conta Resend, domínio/remetente apropriado e credencial sending_access externa`  
**ON_HOLD:** none  
**MANUAL_ACTION_REQUIRED:** `configurar externamente o Resend non-production e o SMTP customizado do Neon Auth; nunca enviar a API key pelo chat/Git`

## Comando de continuação

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

Recupere o estado real no GitHub e Neon antes de agir. Não refaça Stories concluídas, não invente secrets e não execute deployment Vercel.

## Incrementos concluídos

- Incremento 0 — fundação executável: **CONCLUÍDO** (`docs/INCREMENT_0_VALIDATION.md`).
- Incremento 1 — fundação visual / EPIC-01: **CONCLUÍDO** (`docs/INCREMENT_1_VALIDATION.md`).

## Incremento 2 — cursor atual

```text
US-AUTH-001 fundação Neon Auth + sessão — CONCLUÍDA (#43 / #44)
  ↓
US-AUTH-002 papéis/autorização + bootstrap — CONCLUÍDA (#45 / #46)
  ↓
US-AUTH-003 convites/solicitações + auditoria — CONCLUÍDA (#47 / #48)
  ↓
US-AUTH-004 e-mail transacional non-production — EM ANDAMENTO / MANUAL_ACTION_REQUIRED (#49 / #50)
  ↓
US-AUTH-005 cadastro controlado + confirmação de e-mail
  ↓
US-AUTH-006 login/logout + proteção de sessão
  ↓
US-AUTH-007 recuperação de senha + gestão/revogação de sessões
  ↓
US-AUTH-008 auditoria integrada + validação do incremento
```

Plano detalhado: `docs/INCREMENT_2_PLAN.md`.

## US-AUTH-003 — fechamento confirmado

```text
Issue: #47 — closed/completed
PR: #48 — merged
Merge: 3cecfaf6eef357ece3096873d6847e334510db94
CI final PR: 33773066584 — PASS
CI pós-merge main: 33773379852 — PASS
```

A evidência pós-merge foi registrada na discussão da PR #48. A migration `000003_entry_control.sql` permanece integrada na baseline Neon sem fixtures.

## Neon non-production — estado confirmado antes de US-AUTH-004

```text
Projeto: caleida-nonprod
Project ID: patient-glade-95136440
PostgreSQL: 18
Baseline: main / br-restless-cherry-awpcwy6r / ready
Branches descartáveis: nenhuma
Managed Better Auth: habilitado
Email provider Auth: shared Neon
Require email verification: false
Data API: não provisionada
```

Ledger confirmado:

```text
000001_migration_ledger.sql
4d9a403d6bd074faeca04bf3e714fd8066e5e9f3ae7358bbc0f27a1faf2f14c2

000002_product_authorization.sql
0ba6981b583ac8ed693a2a6b6eabc0c84d12678bdf9953e845a239d6b48493c8

000003_entry_control.sql
503700640a81cf41dfe56a0abe70fc581b9c64d8e9ad6585cbcb55d4751b7c5f
```

Contadores confirmados em zero: Auth users, papéis, role_changes, convites, usos, solicitações e entry_events.

## US-AUTH-004 — trabalho já materializado na PR #50

### Decisão

- `ADR-009` seleciona **Resend** para e-mail transacional non-production;
- comparação corrente considerou Resend, Brevo, Mailgun e Amazon SES;
- Resend Free observado em 03/09/2026: 3.000 e-mails/mês e 100/dia, REST + SMTP;
- chave operacional deve ser `sending_access`, preferencialmente limitada ao domínio;
- idempotência do `POST /emails` é usada por contrato;
- região São Paulo pode ser usada para roteamento, mas metadados/logs/API do Resend permanecem armazenados nos EUA.

### Implementação

- `src/lib/email/server.ts` — boundary server-only usando `fetch` nativo, sem SDK do provedor;
- `tests/email-transport-contract.test.mjs` — contrato de secrets, idempotência, falhas e ausência de mutação de convite;
- `.env.example` — adiciona somente nomes comentados `RESEND_API_KEY`, `CALEIDA_EMAIL_FROM`, `CALEIDA_EMAIL_FROM_NAME`;
- `docs/EMAIL_TRANSPORT.md` — contrato operacional, Resend REST e SMTP Neon Auth;
- `docs/adr/ADR-009-resend-transactional-email.md` — decisão arquitetural.

### Invariantes

- falha de transporte não chama `consume_invitation`;
- convite só poderá transicionar para `enviado` após confirmação de envio no fluxo futuro;
- rede/429/5xx são recuperáveis; erros retornados são sanitizados;
- nenhuma chave/API secret é registrada;
- `require_email_verification` continua `false` até US-AUTH-005;
- não existe endpoint/signup/login/Production/deployment nesta Story.

## Gate externo pendente

A Story não pode ser declarada concluída sem prova live non-production. A ação humana necessária é, fora do chat/Git:

1. criar/usar conta Resend non-production e aceitar os termos aplicáveis;
2. verificar domínio/subdomínio de envio apropriado com SPF/DKIM;
3. criar chave `sending_access`, preferencialmente restrita ao domínio;
4. guardar a chave em local seguro fora do Git/chat;
5. configurar no Neon Auth da baseline non-production um provider SMTP customizado Resend, com secret inserido diretamente no Console/secret surface;
6. não habilitar ainda confirmação obrigatória de e-mail;
7. avisar somente que a configuração terminou, sem colar a chave.

Depois disso, uma sessão pode revalidar a configuração Neon com secrets redigidos, executar o teste live aplicável, fechar #49/#50 se todos os gates passarem e só então promover US-AUTH-005.

## Gates US-AUTH-004

- fontes oficiais/provider comparison: `PASS`;
- decisão arquitetural: `PASS — ADR-009`;
- código/testes/CI da PR: `PENDING` enquanto o run atual não concluir;
- PostgreSQL 18: executado pelo CI permanente, sem migration nova;
- Neon-specific SMTP: `MANUAL_ACTION_REQUIRED`;
- envio Resend live: `MANUAL_ACTION_REQUIRED`;
- browser real: `SKIPPED — nenhuma superfície funcional criada`;
- Production Neon: `SKIPPED/NON-GOAL`;
- deployment Vercel: `SKIPPED/PROIBIDO`.
