# Incremento 2 — Acesso controlado / EPIC-02

**Status:** EM ANDAMENTO; US-AUTH-004 em `MANUAL_ACTION_REQUIRED`  
**Origem:** `EPIC-02 — Contas e autenticação`  
**Capacidades:** CAP-01, CAP-02, CAP-04 e CAP-35  
**Prioridade:** P0/P1  
**Stories concluídas:** `US-AUTH-001`, `US-AUTH-002`, `US-AUTH-003`  
**Story ativa:** `US-AUTH-004 — Selecionar e integrar e-mail transacional non-production`

## 1. Objetivo

Criar a fundação segura de identidade e entrada controlada do beta fechado, mantendo autenticação, autorização, convites, e-mail, cadastro e sessão em Stories separadas e verificáveis.

O incremento termina apenas quando:

- Neon Auth estiver integrado em non-production;
- cadastro só ocorrer por convite válido ou solicitação aprovada;
- confirmação/recuperação por e-mail estiverem operacionais;
- login/logout e sessão estiverem protegidos/revogáveis;
- papéis administrativos forem impostos no servidor/banco;
- auditoria crítica existir sem secrets;
- migrations/RLS aplicáveis forem reproduzíveis;
- gates Neon-specific forem executados quando houver dependência real;
- nenhuma publicação Vercel for automatizada/executada pela IA.

## 2. Estado integrado antes do gate live de US-AUTH-004

```text
Projeto Neon: caleida-nonprod
Project ID: patient-glade-95136440
PostgreSQL: 18
Baseline: main / br-restless-cherry-awpcwy6r / ready
Branches Neon descartáveis: nenhuma
Managed Better Auth: habilitado
Auth email provider: shared Neon
Require email verification: false
Migrations baseline: 000001 + 000002 + 000003
Usuários Auth: 0
Papéis: 0
Convites: 0
Solicitações: 0
Data API: não provisionada
Production Neon: não provisionada
Deployment Vercel: não executado
```

## 3. Decisões e gates

Decisões vigentes:

- `ADR-004` — banco somente por migrations;
- `ADR-005` — Neon como plataforma de dados/identidade;
- `ADR-007` — deployment Vercel exclusivamente humano/manual;
- `ADR-008` — PostgreSQL 18 efêmero como gate primário para SQL portável;
- `ADR-009` — Resend como transporte transacional non-production.

### Neon Auth

- Better Auth gerenciado permanece a identidade;
- papéis Caleida continuam separados do Admin Better Auth;
- ocultar signup na UI não é barreira válida;
- `require_email_verification` continua `false` até US-AUTH-005 conectar o gate de entrada ao cadastro.

### E-mail

- app usa boundary server-only por REST Resend;
- Neon Auth deve usar SMTP Resend no gate live;
- API key nunca entra no browser/Git/chat;
- falha de transporte não consome convite;
- região de envio não deve ser confundida com data residency.

## 4. Rastreamento de capacidades

| Capacidade | Cobertura principal |
|---|---|
| CAP-01 — Contas, autenticação e sessões | US-AUTH-001, 004, 005, 006, 007 |
| CAP-02 — Convites e entrada | US-AUTH-003, 004, 005 |
| CAP-04 — Papéis e permissões | US-AUTH-002, 008 |
| CAP-35 — Auditoria | US-AUTH-002, 003, 007, 008 |

Requisitos transversais: NFR-01, NFR-02, NFR-03, NFR-04, NFR-07, NFR-09, NFR-10, NFR-11.

## 5. Ordem das Stories

```text
US-AUTH-001 fundação Auth + sessão — CONCLUÍDA (#43/#44)
  ↓
US-AUTH-002 papéis/autorização + bootstrap — CONCLUÍDA (#45/#46)
  ↓
US-AUTH-003 convites/solicitações + auditoria — CONCLUÍDA (#47/#48)
  ↓
US-AUTH-004 e-mail transacional non-production — EM ANDAMENTO / MANUAL_ACTION_REQUIRED (#49/#50)
  ↓
US-AUTH-005 cadastro controlado + confirmação
  ↓
US-AUTH-006 login/logout + proteção de sessão
  ↓
US-AUTH-007 recuperação + gestão/revogação de sessões
  ↓
US-AUTH-008 auditoria integrada + validação
```

---

# US-AUTH-001 — Fundação Neon Auth

**Estado:** CONCLUÍDA — #43/#44  
**Evidência:** `docs/US_AUTH_001_VERIFICATION.md`

Resultado: SDK pinado, boundary server-only/fail-closed, Managed Better Auth promovido à baseline e CI pós-merge em PASS.

# US-AUTH-002 — Papéis e autorização

**Estado:** CONCLUÍDA — #45/#46  
**Evidência:** `docs/US_AUTH_002_VERIFICATION.md`

Resultado: cinco papéis de produto, autorização server/banco, auditoria e bootstrap owner controlado.

# US-AUTH-003 — Entrada controlada persistente

**Estado:** CONCLUÍDA — #47/#48  
**Evidência:** `docs/US_AUTH_003_VERIFICATION.md`  
**Contrato:** `docs/ENTRY_CONTROL.md`

Resultado: migration `000003`, convites digest-only, validade/capacidade/destinatário, solicitações, auditoria e concorrência serializada. CI pós-merge `33773379852` em PASS.

---

# US-AUTH-004 — E-mail transacional non-production

**Prioridade:** P0  
**Estado:** EM ANDAMENTO / MANUAL_ACTION_REQUIRED  
**Issue:** `#49`  
**PR:** `#50`  
**Branch:** `feat/us-auth-004-transactional-email`  
**Dependências:** US-AUTH-001 e 003  
**Capacidades:** CAP-01, CAP-02  
**Decisão:** `ADR-009`  
**Contrato:** `docs/EMAIL_TRANSPORT.md`  
**Evidência:** `docs/US_AUTH_004_VERIFICATION.md`

## Objetivo

Integrar transporte non-production para convites, confirmação e recuperação sem expor secret e sem antecipar cadastro.

## Trabalho materializado

- comparação oficial Resend/Brevo/Mailgun/SES;
- Resend escolhido;
- `src/lib/email/server.ts` com `fetch` nativo;
- `RESEND_API_KEY`, `CALEIDA_EMAIL_FROM`, `CALEIDA_EMAIL_FROM_NAME` como contrato server-only;
- idempotência obrigatória;
- erros sanitizados;
- rede/429/5xx recuperáveis;
- transporte sem acesso ao banco;
- CI `33786184072`: `60/60 PASS`, build e PostgreSQL 18/verify:db em PASS.

## Gate externo obrigatório

Não concluir a Story até existir prova live non-production.

Ação humana, fora do Git/chat:

1. criar/usar conta Resend;
2. verificar domínio/subdomínio com SPF/DKIM;
3. criar chave `sending_access` restrita ao domínio quando possível;
4. armazenar secret em superfície segura;
5. configurar SMTP customizado Resend no Neon Auth non-production;
6. manter `require_email_verification=false`;
7. informar apenas que a configuração está pronta.

Depois, revalidar config com secrets redigidos, executar teste live, CI final, review, merge e CI pós-merge.

## Non-goals

- signup;
- login/logout;
- OAuth;
- templates finais;
- fila/outbox persistente sem necessidade;
- Production;
- deployment Vercel.

---

# US-AUTH-005 — Cadastro controlado

**Prioridade:** P0  
**Estado:** BLOQUEADA por US-AUTH-004  
**Dependências:** US-AUTH-002/003/004  
**Capacidades:** CAP-01, CAP-02

Deve provar:

- signup sem convite/aprovação é negado fora da UI;
- convite expirado/revogado/esgotado é negado;
- destinatário restrito não pode ser trocado;
- consumo/vínculo com conta é atômico ou compensável;
- concorrência não excede capacidade;
- confirmação de e-mail integra o transporte aprovado.

Se Neon Auth não permitir impor o beta fechado com segurança, parar e registrar decisão; nunca liberar signup público como workaround.

# US-AUTH-006 — Login/logout e sessão

**Prioridade:** P0  
**Estado:** A FAZER  
**Dependência:** US-AUTH-005

Validar sessão server-side, acesso direto por URL, ausência de enumeração indevida e UX acessível sem flash privado.

# US-AUTH-007 — Recuperação e revogação de sessões

**Prioridade:** P0  
**Estado:** A FAZER  
**Dependências:** US-AUTH-004 e 006

Cobrir recuperação/alteração de senha, sessões consultáveis/revogáveis e impacto do cache de sessão. Nunca auditar senha/token.

# US-AUTH-008 — Fechamento do incremento

**Prioridade:** P1  
**Estado:** A FAZER  
**Dependências:** US-AUTH-001 a 007

Executar matriz adversarial integrada e produzir evidência final.

## 6. Matriz transversal

Quando aplicável testar:

1. anônimo;
2. autenticado autorizado;
3. autenticado não autorizado com ID válido;
4. manipulação de ID/ownership/papel;
5. acesso direto sem UI;
6. sessão inválida/revogada;
7. secret ausente/inválido;
8. usuário comum em ação admin;
9. concorrência crítica;
10. ausência de vazamento em erro/loading.

## 7. Gates

| Mudança | verify | PG18 | Neon-specific | Browser |
|---|---:|---:|---:|---:|
| Auth/sessão | obrigatório | CI permanente | quando depender do serviço | quando houver UI |
| migration/RLS | obrigatório | obrigatório | se ligada ao Neon | conforme UI |
| e-mail | obrigatório | CI permanente, sem schema novo | obrigatório para SMTP Auth live | quando fluxo existir |
| cadastro/login | obrigatório | conforme schema | obrigatório | obrigatório |
| docs-only | CI normal | sem gate extra | SKIPPED | SKIPPED |

## 8. Próxima ação única

> `US-AUTH-004 — concluir gate live Resend/Neon Auth non-production sem expor secrets`.

US-AUTH-005 não é promovida enquanto #49/#50 permanecerem abertas.
