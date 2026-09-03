# US-AUTH-004 — Verificação

**Story:** `US-AUTH-004 — Selecionar e integrar e-mail transacional non-production`  
**Issue:** `#49`  
**PR:** `#50`  
**Status:** `MANUAL_ACTION_REQUIRED`  
**Data:** 2026-09-03

## 1. Escopo verificado

A Story seleciona o provedor de e-mail e materializa a boundary server-only necessária para envios transacionais da aplicação, sem antecipar signup, login ou política de confirmação obrigatória.

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
- REST API e SMTP relay;
- API key com `sending_access` e possibilidade de restrição por domínio;
- `POST /emails` suporta `Idempotency-Key` de até 256 caracteres;
- idempotência retida por 24 horas;
- domínios usam SPF/DKIM e subdomínio é recomendado para isolamento de reputação;
- regiões de envio incluem São Paulo;
- seleção de região não altera residência dos dados de conta: metadados/logs/API permanecem nos EUA;
- DPA corrente foi revisado como parte da decisão.

### Alternativas

- Brevo: 300 envios/dia no plano gratuito;
- Mailgun: 100/dia no plano gratuito, REST + SMTP;
- Amazon SES: custo unitário muito baixo, mas maior superfície operacional AWS para esta fase.

A decisão final está registrada em `ADR-009`.

### Neon Auth

Confirmado na API corrente:

- email provider é configurável por branch;
- Better Auth aceita atualização SMTP com `host`, `port`, `username`, `password`, `sender_email`, `sender_name`;
- o provider é responsável por e-mails de verificação/recuperação;
- a baseline Caleida continua usando `email_provider.type=shared` enquanto o gate externo não for executado;
- `require_email_verification` continua `false` e não deve ser alterado antes de US-AUTH-005.

## 3. Estado Neon antes da Story

Verificado diretamente:

```text
Projeto: caleida-nonprod
Baseline: main / br-restless-cherry-awpcwy6r / ready
Branches descartáveis: nenhuma
Auth provider: Better Auth
Email provider Auth: shared Neon
Require email verification: false
```

Migrations:

```text
000001_migration_ledger.sql
4d9a403d6bd074faeca04bf3e714fd8066e5e9f3ae7358bbc0f27a1faf2f14c2

000002_product_authorization.sql
0ba6981b583ac8ed693a2a6b6eabc0c84d12678bdf9953e845a239d6b48493c8

000003_entry_control.sql
503700640a81cf41dfe56a0abe70fc581b9c64d8e9ad6585cbcb55d4751b7c5f
```

Contadores: zero usuários Auth, papéis, role_changes, convites, usos, solicitações e entry_events.

US-AUTH-004 não cria migration nem modifica dados Neon.

## 4. Implementação técnica

`src/lib/email/server.ts`:

- `server-only`;
- usa `fetch` nativo e não adiciona SDK Resend ao `package.json`;
- lê `RESEND_API_KEY`, `CALEIDA_EMAIL_FROM`, `CALEIDA_EMAIL_FROM_NAME` somente na invocação real;
- valida remetente/destinatários/subject/conteúdo;
- exige idempotency key de 1–256 caracteres;
- envia para `POST https://api.resend.com/emails`;
- usa header `Authorization` apenas server-side;
- retorna somente provider + message ID;
- rede, HTTP 429 e 5xx são classificados como recuperáveis;
- outros 4xx são rejeições não recuperáveis por retry cego;
- payload bruto de erro do provedor não é propagado;
- módulo não importa banco, `caleida_access`, `consume_invitation` ou `transition_invitation`.

## 5. CI técnico

Primeiro CI da PR:

```text
Run: 33786184072
Head: 9de864fd17a515207e123cfb3cb88344a83f08fe
Resultado: PASS
```

Gates observados:

- `npm ci`: `PASS`, zero vulnerabilidades reportadas;
- `npm run verify`: `PASS`;
- lint: `PASS`;
- typecheck: `PASS`;
- testes Node: `60/60 PASS`;
- build Next.js: `PASS`;
- PostgreSQL 18: `PASS`;
- `npm run verify:db`: `PASS`;
- migrations `000001`–`000003`: `PASS`;
- testes de autorização/entrada/concorrência existentes: `PASS`.

Os avisos transitivos já conhecidos de Better Auth/Auth UI permanecem sem vulnerabilidades reportadas por `npm ci` e não foram introduzidos pela integração de e-mail.

## 6. Gates classificados

| Gate | Estado | Evidência |
|---|---|---|
| fontes oficiais / provider comparison | PASS | ADR-009 + links oficiais |
| decisão arquitetural | PASS | ADR-009 Accepted |
| boundary server-only | PASS | código + 5 testes de contrato |
| secrets fora do browser/Git | PASS | `.env.example` comentado + testes |
| idempotência | PASS | header obrigatório + contrato 1–256 chars |
| falhas recuperáveis/sanitizadas | PASS | boundary + testes |
| invariantes de convite | PASS por arquitetura/contrato | módulo sem acesso ao banco |
| CI aplicação | PASS | run 33786184072 |
| PostgreSQL 18 / verify:db | PASS | run 33786184072; sem migration nova |
| Neon-specific SMTP customizado | MANUAL_ACTION_REQUIRED | credencial/domínio externos ausentes |
| envio Resend live | MANUAL_ACTION_REQUIRED | conta/secret/remetente externos ausentes |
| browser real | SKIPPED | Story não cria superfície funcional |
| Production Neon | SKIPPED/NON-GOAL | não provisionada |
| deployment Vercel | SKIPPED/PROIBIDO | ADR-007 |

## 7. Ação manual necessária

A Story não deve ser marcada como concluída nem a PR #50 mergeada apenas com simulação.

Fora do Git/chat, o usuário deve:

1. criar/usar conta Resend non-production;
2. verificar domínio/subdomínio apropriado com SPF/DKIM;
3. criar chave `sending_access`, preferencialmente restrita ao domínio;
4. guardar a chave em secret store/local seguro;
5. configurar SMTP customizado Resend no Neon Auth non-production diretamente no Console/superfície segura;
6. manter `require_email_verification=false`;
7. comunicar apenas que a configuração está pronta, sem colar chave ou senha.

Depois, revalidar a configuração pelo conector com secrets redigidos e executar o teste live permitido. Se PASS, atualizar esta evidência, concluir #49/#50 e promover US-AUTH-005.

## 8. Não realizado deliberadamente

- nenhum secret real gerado/versionado;
- nenhuma conta Resend criada pela IA;
- nenhum domínio/DNS alterado;
- nenhum e-mail real enviado;
- nenhum SMTP Neon alterado sem credencial segura;
- nenhuma branch Neon descartável aberta sem necessidade;
- nenhum signup/login/OAuth;
- nenhuma confirmação obrigatória habilitada;
- nenhum deployment Vercel.
