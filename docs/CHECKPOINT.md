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
**NEXT_ACTION:** `US-AUTH-004 — configurar e provar Resend/SMTP na branch Neon isolada verify-us-auth-004 sem expor secrets`  
**BLOCKERS:** `o gate live exige conta Resend, domínio/remetente verificado e credencial sending_access externa`  
**ON_HOLD:** none  
**MANUAL_ACTION_REQUIRED:** `configurar Resend SMTP somente em verify-us-auth-004 e executar um teste live seguro; nunca enviar API key/senha pelo chat ou Git`

## Comando de continuação

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

Recupere GitHub e Neon antes de agir. Não refaça Stories concluídas, não invente secrets e não execute deployment Vercel.

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

A evidência pós-merge foi registrada na PR #48. A migration `000003_entry_control.sql` permanece integrada na baseline sem fixtures.

## Neon non-production — estado atual

```text
Projeto: caleida-nonprod
Project ID: patient-glade-95136440
PostgreSQL: 18
Baseline: main / br-restless-cherry-awpcwy6r / ready
Gate SMTP: verify-us-auth-004 / br-plain-pond-aw5f59ia / ready
Managed Better Auth: habilitado em ambas
Email provider Auth em ambas: shared Neon
Require email verification em ambas: false
Data API: não provisionada
```

`verify-us-auth-004` foi criada em 03/09/2026 a partir da baseline exclusivamente para o gate Neon-specific de SMTP de US-AUTH-004. A criação não alterou `main`. A branch será descartável e sua exclusão futura exigirá autorização explícita porque a ferramenta classifica `delete_branch` como destrutiva.

Ledger da baseline confirmado antes da criação da branch:

```text
000001_migration_ledger.sql
4d9a403d6bd074faeca04bf3e714fd8066e5e9f3ae7358bbc0f27a1faf2f14c2

000002_product_authorization.sql
0ba6981b583ac8ed693a2a6b6eabc0c84d12678bdf9953e845a239d6b48493c8

000003_entry_control.sql
503700640a81cf41dfe56a0abe70fc581b9c64d8e9ad6585cbcb55d4751b7c5f
```

Contadores confirmados em zero: Auth users, papéis, role_changes, convites, usos, solicitações e entry_events.

## US-AUTH-004 — trabalho materializado na PR #50

### Decisão

- `ADR-009` seleciona **Resend** para e-mail transacional non-production;
- comparação corrente considerou Resend, Brevo, Mailgun e Amazon SES;
- Resend Free observado em 03/09/2026: 3.000 e-mails/mês e 100/dia, REST + SMTP;
- chave deve ser `sending_access`, preferencialmente limitada ao domínio;
- idempotência de envio é obrigatória por contrato;
- região São Paulo pode ser usada para roteamento, mas metadados/logs/API permanecem armazenados nos EUA segundo a documentação corrente.

### Implementação

- `src/lib/email/server.ts` — boundary server-only usando `fetch` nativo;
- `tests/email-transport-contract.test.mjs` — secrets, idempotência, falhas sanitizadas e ausência de mutação de convite;
- `.env.example` — somente nomes comentados `RESEND_API_KEY`, `CALEIDA_EMAIL_FROM`, `CALEIDA_EMAIL_FROM_NAME`;
- `docs/EMAIL_TRANSPORT.md`;
- `docs/adr/ADR-009-resend-transactional-email.md`;
- `docs/US_AUTH_004_VERIFICATION.md`.

### Invariantes

- falha de transporte não chama `consume_invitation`;
- convite futuro só poderá transicionar para `enviado` após confirmação do provedor;
- rede/429/5xx são recuperáveis; erros retornados são sanitizados;
- nenhuma chave/API secret é registrada;
- `require_email_verification` continua `false` até US-AUTH-005;
- não existe endpoint/signup/login/Production/deployment nesta Story.

### CI técnico

```text
Run: 33786184072
Head técnico: 9de864fd17a515207e123cfb3cb88344a83f08fe
npm ci: PASS / 0 vulnerabilidades reportadas
npm run verify: PASS
Node tests: 60/60 PASS
build: PASS
PostgreSQL 18 + npm run verify:db: PASS
```

Novos commits documentais e a criação da branch Neon dispararão/requererão um CI final do head antes de qualquer merge.

## Gate externo pendente — sequência correta

A Story não pode ser declarada concluída sem prova live. Fora do chat/Git:

1. criar/usar conta Resend non-production;
2. verificar domínio/subdomínio apropriado com SPF/DKIM;
3. criar chave `sending_access`, preferencialmente restrita ao domínio;
4. guardar a chave em secret store/local seguro;
5. abrir **Neon → branch `verify-us-auth-004` → Auth → configuração de e-mail**;
6. configurar SMTP Resend somente nessa branch, usando `smtp.resend.com`, usuário `resend`, a credencial secreta e o remetente verificado;
7. manter `require_email_verification=false`;
8. executar o teste de envio seguro disponível no Resend/Neon para um endereço controlado;
9. avisar no chat apenas que **o SMTP da branch `verify-us-auth-004` foi configurado e o teste passou**, sem colar API key, senha, connection string ou Auth URL.

Depois disso, a IA deve:

1. revalidar `verify-us-auth-004` com secrets redigidos;
2. confirmar que a baseline ainda usa o provider compartilhado;
3. registrar o gate isolado como PASS;
4. orientar/configurar a promoção para a baseline por superfície segura sem expor secret;
5. revalidar baseline;
6. pedir autorização explícita antes de excluir `verify-us-auth-004`;
7. executar CI final, review e merge #50 somente quando todos os gates aplicáveis estiverem satisfeitos.

## Gates US-AUTH-004

- fontes oficiais/provider comparison: `PASS`;
- decisão arquitetural: `PASS — ADR-009`;
- código/testes/CI técnico: `PASS — 33786184072`;
- PostgreSQL 18: `PASS`;
- branch Neon isolada para SMTP: `PASS — criada e Auth herdado`;
- configuração SMTP Resend isolada: `MANUAL_ACTION_REQUIRED`;
- envio Resend live: `MANUAL_ACTION_REQUIRED`;
- promoção SMTP para baseline: `PENDING após gate isolado`;
- browser real: `SKIPPED — nenhuma superfície funcional criada`;
- Production Neon: `SKIPPED/NON-GOAL`;
- deployment Vercel: `SKIPPED/PROIBIDO`.
