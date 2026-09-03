# Incremento 2 — Acesso controlado / EPIC-02

**Status:** EM ANDAMENTO; US-AUTH-004 concluída, US-AUTH-005 é a próxima Story  
**Origem:** `EPIC-02 — Contas e autenticação`  
**Capacidades:** CAP-01, CAP-02, CAP-04 e CAP-35  
**Prioridade:** P0/P1  
**Stories concluídas:** `US-AUTH-001`, `US-AUTH-002`, `US-AUTH-003`, `US-AUTH-004`  
**Próxima Story:** `US-AUTH-005 — Cadastro controlado por convite ou aprovação`

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

## 2. Estado integrado após US-AUTH-004

```text
Projeto Neon: caleida-nonprod
Project ID: patient-glade-95136440
PostgreSQL: 18
Baseline: main / br-restless-cherry-awpcwy6r / ready
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

Existe `verify-us-auth-004 / br-plain-pond-aw5f59ia`, criada durante a investigação inicial de SMTP externo. Ela não contém configuração externa e sua remoção é housekeeping não bloqueante sujeita a autorização destrutiva explícita.

## 3. Decisões e gates

Decisões vigentes:

- `ADR-004` — banco somente por migrations;
- `ADR-005` — Neon como plataforma de dados/identidade;
- `ADR-007` — deployment Vercel exclusivamente humano/manual;
- `ADR-008` — PostgreSQL 18 efêmero como gate primário para SQL portável;
- `ADR-009` — provider compartilhado do Neon Auth em desenvolvimento/non-production; SMTP externo adiado até necessidade real.

### Neon Auth

- Better Auth gerenciado permanece a identidade;
- papéis Caleida continuam separados do Admin Better Auth;
- ocultar signup na UI não é barreira válida;
- `require_email_verification` continua `false` até US-AUTH-005 conectar o gate de entrada ao cadastro.

### E-mail

- confirmação/recuperação de Auth usam o provider compartilhado do Neon enquanto adequado ao beta fechado;
- não existe adapter Resend/SMTP próprio no estado atual;
- provedor externo só será escolhido quando houver requisito real;
- falha de transporte nunca pode ser usada como justificativa para consumir convite ou liberar entrada.

## 4. Rastreamento de capacidades

| Capacidade | Cobertura principal |
|---|---|
| CAP-01 — Contas, autenticação e sessões | US-AUTH-001, 004, 005, 006, 007 |
| CAP-02 — Convites e entrada | US-AUTH-003, 005 |
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
US-AUTH-004 e-mail Auth non-production — CONCLUÍDA (#49/#50)
  ↓
US-AUTH-005 cadastro controlado + confirmação — PRÓXIMA
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

# US-AUTH-004 — E-mail Auth non-production

**Prioridade:** P0  
**Estado:** CONCLUÍDA — #49/#50  
**Capacidades:** CAP-01  
**Decisão:** `ADR-009`  
**Contrato:** `docs/EMAIL_TRANSPORT.md`  
**Evidência:** `docs/US_AUTH_004_VERIFICATION.md`

## Resultado

- readback confirmou Better Auth saudável na baseline;
- email/password está habilitado;
- `email_provider.type=shared` já fornece transporte non-production;
- `require_email_verification=false` permanece até US-AUTH-005;
- Resend/SMTP/domínio próprio foram retirados do escopo por não haver requisito material;
- nenhum secret, migration ou adapter de e-mail externo foi introduzido;
- provedor externo ficou explicitamente adiado para quando houver necessidade real.

A branch `verify-us-auth-004` criada durante a investigação tornou-se desnecessária; sua eventual exclusão depende de autorização explícita e não bloqueia US-AUTH-005.

## Non-goals preservados

- signup;
- login/logout;
- OAuth customizado;
- Production;
- deployment Vercel.

---

# US-AUTH-005 — Cadastro controlado

**Prioridade:** P0  
**Estado:** PRONTA  
**Dependências:** US-AUTH-002/003/004  
**Capacidades:** CAP-01, CAP-02

Deve provar:

- signup sem convite/aprovação é negado fora da UI;
- convite expirado/revogado/esgotado é negado;
- destinatário restrito não pode ser trocado;
- consumo/vínculo com conta é atômico ou compensável;
- concorrência não excede capacidade;
- confirmação de e-mail usa Neon Auth e não substitui o gate de entrada;
- qualquer ativação de `require_email_verification` ocorre somente depois do controle de signup estar fail-closed.

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
| e-mail Auth shared | obrigatório | CI permanente | readback/config quando política mudar | quando fluxo existir |
| cadastro/login | obrigatório | conforme schema | obrigatório | obrigatório |
| docs-only | CI normal | sem gate extra | SKIPPED | SKIPPED |

## 8. Próxima ação única

> `US-AUTH-005 — implementar cadastro controlado por convite ou aprovação`.
