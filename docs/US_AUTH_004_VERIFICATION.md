# US-AUTH-004 — Verificação

**Story:** `US-AUTH-004 — Selecionar e integrar e-mail transacional non-production`  
**Issue:** `#49`  
**PR:** `#50`  
**Status:** `MANUAL_ACTION_REQUIRED`  
**Data:** 2026-09-03

## 1. Escopo verificado

A Story seleciona o provedor e materializa a boundary server-only para e-mail transacional sem antecipar signup, login ou confirmação obrigatória.

Arquivos principais:

- `docs/adr/ADR-009-resend-transactional-email.md`;
- `docs/EMAIL_TRANSPORT.md`;
- `src/lib/email/server.ts`;
- `tests/email-transport-contract.test.mjs`;
- `.env.example`;
- `docs/ENVIRONMENTS.md`.

## 2. Revalidação externa

Fontes oficiais correntes foram verificadas em 03/09/2026.

### Resend

Confirmado:

- Free: 3.000 e-mails/mês e 100/dia;
- REST API + SMTP relay;
- API key `sending_access`, com possibilidade de restrição por domínio;
- `POST /emails` com `Idempotency-Key` de até 256 caracteres;
- idempotência por 24 horas;
- SPF/DKIM e recomendação de subdomínio;
- região de envio São Paulo disponível;
- seleção de região não muda residência dos dados: metadados/logs/API permanecem nos EUA;
- DPA corrente revisado.

Alternativas comparadas: Brevo, Mailgun e Amazon SES. Decisão final: `ADR-009`.

### Neon Auth

Confirmado:

- email provider configurável por branch;
- SMTP usa `host`, `port`, `username`, `password`, `sender_email`, `sender_name`;
- provider atende verificação/recuperação do Auth;
- `require_email_verification` é configuração separada e permanece `false` até US-AUTH-005.

## 3. Estado Neon e isolamento

Antes de US-AUTH-004:

```text
Baseline: main / br-restless-cherry-awpcwy6r / ready
Branches descartáveis: nenhuma
Auth: Better Auth
Email provider: shared Neon
Require email verification: false
```

Para o gate SMTP Neon-specific foi criada, sem ação destrutiva:

```text
verify-us-auth-004
br-plain-pond-aw5f59ia
parent: br-restless-cherry-awpcwy6r
state: ready
Auth provider: Better Auth
Email provider herdado: shared Neon
Require email verification: false
```

A baseline `main` não foi alterada pela criação. Auth URL/JWKS e outros valores operacionais não são persistidos em documentação.

A branch é descartável. Sua exclusão futura exige autorização explícita do usuário porque `delete_branch` é classificada como destrutiva.

Migrations herdadas da baseline:

```text
000001_migration_ledger.sql
4d9a403d6bd074faeca04bf3e714fd8066e5e9f3ae7358bbc0f27a1faf2f14c2

000002_product_authorization.sql
0ba6981b583ac8ed693a2a6b6eabc0c84d12678bdf9953e845a239d6b48493c8

000003_entry_control.sql
503700640a81cf41dfe56a0abe70fc581b9c64d8e9ad6585cbcb55d4751b7c5f
```

Contadores baseline confirmados antes da branch: zero usuários Auth, papéis, role_changes, convites, usos, solicitações e entry_events.

US-AUTH-004 não cria migration nem dados funcionais.

## 4. Implementação técnica

`src/lib/email/server.ts`:

- `server-only`;
- `fetch` nativo, sem SDK Resend direto;
- lê `RESEND_API_KEY`, `CALEIDA_EMAIL_FROM`, `CALEIDA_EMAIL_FROM_NAME` somente na operação real;
- valida remetente/destinatários/subject/conteúdo;
- idempotency key obrigatória, 1–256 caracteres;
- `POST https://api.resend.com/emails`;
- Authorization somente server-side;
- retorna somente provider + message ID;
- rede/429/5xx recuperáveis;
- outros 4xx não recebem retry cego;
- payload bruto de erro não é propagado;
- nenhum acesso a `caleida_access`, banco ou funções de convite.

## 5. CI técnico

Primeiro CI da PR:

```text
Run: 33786184072
Head: 9de864fd17a515207e123cfb3cb88344a83f08fe
Resultado: PASS
```

- `npm ci`: PASS, zero vulnerabilidades reportadas;
- `npm run verify`: PASS;
- lint/typecheck: PASS;
- testes Node: `60/60 PASS`;
- build: PASS;
- PostgreSQL 18: PASS;
- `npm run verify:db`: PASS;
- migrations/testes de autorização/entrada/concorrência: PASS.

Avisos transitivos conhecidos de Better Auth/Auth UI permanecem sem vulnerabilidades reportadas e não foram introduzidos pelo e-mail.

Como documentos e estado Neon avançaram depois desse head técnico, um CI final do head corrente ainda é obrigatório antes de merge.

## 6. Gates classificados

| Gate | Estado | Evidência |
|---|---|---|
| fontes/provider comparison | PASS | ADR-009 + fontes oficiais |
| decisão arquitetural | PASS | ADR-009 Accepted |
| boundary server-only | PASS | código + 5 testes |
| secrets fora do browser/Git | PASS | `.env.example` + testes |
| idempotência | PASS | header + contrato 1–256 |
| falhas recuperáveis/sanitizadas | PASS | boundary + testes |
| invariante de convite | PASS por arquitetura | módulo sem banco |
| CI técnico | PASS | 33786184072 |
| PostgreSQL 18 / verify:db | PASS | 33786184072 |
| branch Neon isolada criada | PASS | `verify-us-auth-004` ready, Auth herdado |
| SMTP Resend isolado | MANUAL_ACTION_REQUIRED | credencial/domínio externos ausentes |
| envio live | MANUAL_ACTION_REQUIRED | conta/secret/remetente externos ausentes |
| promoção SMTP baseline | PENDING | somente após PASS isolado |
| CI final do head | PENDING | depois da reconciliação/gate aplicável |
| browser real | SKIPPED | sem superfície funcional |
| Production Neon | SKIPPED/NON-GOAL | inexistente |
| deployment Vercel | SKIPPED/PROIBIDO | ADR-007 |

## 7. Ação manual necessária

Não marcar a Story como concluída nem mergear #50 por simulação.

Fora do Git/chat:

1. criar/usar conta Resend non-production;
2. verificar domínio/subdomínio com SPF/DKIM;
3. criar chave `sending_access`, preferencialmente limitada ao domínio;
4. guardar a chave em local seguro;
5. no Neon Console, selecionar **`verify-us-auth-004`**;
6. configurar SMTP Resend somente nessa branch (`smtp.resend.com`, usuário `resend`, secret e remetente verificado);
7. manter `require_email_verification=false`;
8. executar teste de envio controlado;
9. comunicar apenas que a configuração/teste passaram, sem colar chave, senha, connection string ou Auth URL.

Depois:

- revalidar branch via conector com secrets redigidos;
- confirmar baseline ainda em provider compartilhado;
- registrar PASS isolado;
- promover deliberadamente SMTP para baseline por superfície segura;
- revalidar baseline;
- obter autorização explícita antes de apagar `verify-us-auth-004`;
- executar CI final/review/merge #50 e CI pós-merge;
- somente então promover US-AUTH-005.

## 8. Não realizado deliberadamente

- nenhum secret real gerado/versionado;
- nenhuma conta Resend criada pela IA;
- nenhum DNS alterado;
- nenhum e-mail real enviado;
- nenhum SMTP Neon modificado sem secret seguro;
- baseline Auth não foi usada como laboratório;
- nenhum signup/login/OAuth;
- nenhuma confirmação obrigatória habilitada;
- nenhum deployment Vercel.
