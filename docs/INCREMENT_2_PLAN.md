# Incremento 2 — Acesso controlado / EPIC-02

**Status:** EM ANDAMENTO; US-AUTH-003 concluída após integração  
**Origem:** `EPIC-02 — Contas e autenticação`  
**Capacidades:** CAP-01, CAP-02, CAP-04 e CAP-35  
**Prioridade:** P0/P1  
**Stories concluídas:** `US-AUTH-001`, `US-AUTH-002`, `US-AUTH-003`  
**Próxima Story promovida:** `US-AUTH-004 — Selecionar e integrar e-mail transacional non-production`

## 1. Objetivo

Criar a fundação segura de identidade e entrada controlada do beta fechado, mantendo autenticação gerenciada, autorização, convites, e-mail, cadastro e gestão de sessão em Stories separadas e verificáveis.

O incremento termina apenas quando:

- Neon Auth estiver integrado e reproduzível em non-production;
- cadastro só puder ocorrer por convite válido ou solicitação aprovada;
- login/logout e sessão estiverem protegidos/revogáveis;
- papéis administrativos forem verificados no servidor e no banco;
- recuperação de senha e gestão de sessões estiverem implementadas;
- eventos críticos de acesso estiverem auditados sem secrets;
- migrations/RLS aplicáveis forem versionadas e verificadas;
- comportamento Neon-specific for provado em branch isolada quando realmente existir dependência do serviço;
- nenhum deployment Vercel automático ou executado por IA ocorrer.

## 2. Estado integrado atual

```text
Projeto Neon: caleida-nonprod
Project ID: patient-glade-95136440
PostgreSQL: 18
Baseline: main / br-restless-cherry-awpcwy6r / ready
Managed Better Auth: habilitado
Migrations baseline: 000001 + 000002 + 000003
Usuários Auth: 0
Papéis de produto: 0
Convites: 0
Solicitações de acesso: 0
Data API: não provisionada
Branches Neon descartáveis: nenhuma
Production Neon: não provisionada
Deployment Vercel: não executado
```

## 3. Arquitetura e gates

Decisões vigentes:

- `ADR-004`: mudanças persistentes de banco somente por migrations;
- `ADR-005`: Neon como plataforma canônica de dados/identidade;
- `ADR-007`: deployment Vercel exclusivamente humano/manual;
- `ADR-008`: PostgreSQL 18 descartável como gate primário para SQL portável; branch Neon isolada somente quando houver dependência real do serviço.

US-AUTH-001, 002 e 003 não exigiram novo ADR.

### Neon Auth

- Managed Better Auth permanece a solução de identidade;
- papéis de produto do Caleida permanecem separados do Admin Better Auth;
- esconder signup na UI nunca será aceito como barreira de entrada;
- US-AUTH-005 deve provar que criação direta sem autorização também é negada.

### Data API e RLS

A Data API continua não provisionada. Tabelas privadas permanecem fechadas a `PUBLIC` até existir uma superfície runtime real. Quando Data API/user context for introduzido, grants e RLS serão tratados separadamente e o gate Neon-specific será obrigatório se a política depender de identidade gerenciada.

## 4. Rastreamento de capacidades

| Capacidade | Cobertura principal |
|---|---|
| CAP-01 — Contas, autenticação e sessões | US-AUTH-001, 004, 005, 006 e 007 |
| CAP-02 — Convites e controle de entrada | US-AUTH-003, 004 e 005 |
| CAP-04 — Papéis e permissões | US-AUTH-002 e 008 |
| CAP-35 — Auditoria | US-AUTH-002, 003, 007 e 008 |

Requisitos transversais: NFR-01, NFR-02, NFR-03, NFR-04, NFR-07, NFR-09, NFR-10 e NFR-11.

## 5. Ordem das Stories

```text
US-AUTH-001 — fundação Neon Auth + sessão — CONCLUÍDA (#43 / #44)
  ↓
US-AUTH-002 — papéis/autorização + bootstrap — CONCLUÍDA (#45 / #46)
  ↓
US-AUTH-003 — convites/solicitações + auditoria — CONCLUÍDA (#47 / #48)
  ↓
US-AUTH-004 — e-mail transacional non-production — PRÓXIMA
  ↓
US-AUTH-005 — cadastro controlado + confirmação de e-mail
  ↓
US-AUTH-006 — login/logout + proteção de sessão
  ↓
US-AUTH-007 — recuperação + gestão/revogação de sessões
  ↓
US-AUTH-008 — auditoria integrada + validação do incremento
```

---

# US-AUTH-001 — Fundação Neon Auth e contrato de sessão

**Prioridade:** P0  
**Estado:** CONCLUÍDA  
**Issue:** `#43`  
**PR:** `#44`  
**Capacidade:** CAP-01  
**Evidência:** `docs/US_AUTH_001_VERIFICATION.md`

Resultado:

- `@neondatabase/auth@0.5.0-beta` fixado;
- boundary server-only/lazy/fail-closed;
- handler Auth GET/POST catch-all;
- cache de sessão explicitamente configurado;
- Managed Better Auth provado em branch isolada e promovido à baseline;
- CI pós-merge `33753190237`: `PASS`;
- nenhum usuário real, Data API, e-mail, OAuth, Production ou deployment criado.

---

# US-AUTH-002 — Papéis, autorização e bootstrap administrativo

**Prioridade:** P0  
**Estado:** CONCLUÍDA  
**Issue:** `#45`  
**PR:** `#46`  
**Capacidades:** CAP-04, CAP-35  
**Evidência:** `docs/US_AUTH_002_VERIFICATION.md`

Resultado:

- papéis `proprietário`, `administrador`, `moderador`, `curador`, `usuário`;
- autorização por UUID Auth sem duplicar credenciais;
- `caleida_auth.user_roles` e `caleida_audit.role_changes`;
- política crítica no servidor e no banco;
- autopromoção/elevação indevida negadas;
- bootstrap owner explícito, auditável e idempotente;
- migrations `000001`/`000002` promovidas à baseline;
- CI pós-merge `33770088254`: `PASS`;
- `verify-us-auth-002` removida após autorização explícita antes de US-AUTH-003.

---

# US-AUTH-003 — Convites, solicitações de acesso e auditoria de entrada

**Prioridade:** P0  
**Estado:** CONCLUÍDA APÓS INTEGRAÇÃO  
**Issue:** `#47`  
**PR:** `#48`  
**Dependência:** US-AUTH-002  
**Capacidades:** CAP-02, CAP-35  
**Evidência:** `docs/US_AUTH_003_VERIFICATION.md`  
**Contrato:** `docs/ENTRY_CONTROL.md`

## Resultado

- migration `000003_entry_control.sql`;
- `caleida_access.invitations` para convites únicos/reutilizáveis, validade, destinatário opcional e capacidade;
- token persistido somente como digest hexadecimal de 64 caracteres;
- `caleida_access.invitation_uses` para usos numerados e vínculo futuro à conta;
- `caleida_access.access_requests` para espera, aprovação, recusa e arquivamento;
- `caleida_audit.entry_events` para auditoria compacta;
- consumo de convite serializado com row lock PostgreSQL;
- tabelas/funções privadas por padrão, sem Data API/browser;
- rate limiting explicitamente adiado até existir endpoint externo.

## Verificação

- CI inicial `33771618637`: falha legítima apenas no teste SQL por variável ambígua; migration já aplicava corretamente;
- teste corrigido sem relaxar regra;
- CI técnico `33771989432`: `PASS`;
- testes Node: `55/55 PASS`;
- PostgreSQL 18 + `npm run verify:db`: `PASS`;
- concorrência: duas sessões independentes disputando convite de uso único produziram exatamente um consumo;
- checksum `000003`: `503700640a81cf41dfe56a0abe70fc581b9c64d8e9ad6585cbcb55d4751b7c5f`;
- migration promovida à baseline sem fixtures;
- estado baseline pós-promoção: zero usuários, papéis, convites, solicitações e eventos;
- Neon-specific: `SKIPPED` corretamente porque a Story usa somente PostgreSQL portável;
- browser real: `SKIPPED` por ausência deliberada de fluxo/UI;
- e-mail/signup/Data API/Production: `SKIPPED/NON-GOAL`;
- deployment: `SKIPPED/PROIBIDO`.

---

# US-AUTH-004 — Selecionar e integrar e-mail transacional non-production

**Prioridade:** P0  
**Estado:** PRONTA / próxima ação  
**Dependências:** US-AUTH-001 e US-AUTH-003  
**Capacidades:** CAP-01, CAP-02

## Objetivo

Escolher e integrar o transporte necessário para confirmação de e-mail, convite e recuperação de senha em non-production sem acoplar o produto silenciosamente a um provedor.

## Requisitos

- revalidar provedores, preços, limites, regiões e privacidade na execução;
- registrar ADR se a escolha for material à arquitetura/operação;
- secrets server-only e separados por ambiente;
- nenhum secret real no Git;
- configurar somente non-production nesta fase;
- indisponibilidade do transporte deve gerar estado recuperável;
- falha de envio não pode consumir convite indevidamente;
- integração deve ser testável sem depender de Production;
- não provisionar Vercel/Production por conveniência.

## Non-goals

- signup completo;
- login/logout;
- OAuth;
- Production Neon;
- deployment Vercel.

---

# US-AUTH-005 — Implementar cadastro controlado por convite ou aprovação

**Prioridade:** P0  
**Estado:** A FAZER  
**Dependências:** US-AUTH-002, 003 e 004  
**Capacidades:** CAP-01, CAP-02

## Objetivo

Permitir criação de conta somente quando existir autorização de entrada válida e concluir confirmação de e-mail conforme o contrato escolhido.

## Regra crítica

A implementação deve provar que:

- signup direto sem convite válido/solicitação aprovada é negado;
- convite expirado/revogado/esgotado é negado;
- destinatário restrito não pode ser trocado por payload;
- consumo do convite e vínculo com a conta são atômicos ou possuem compensação segura;
- concorrência não excede limite de usos;
- a superfície oficial suportada pelo Neon Auth permite impor o gate de forma segura antes/ao criar a conta.

Se a superfície gerenciada não permitir impor o beta fechado com segurança, registrar decisão arquitetural; não liberar signup público como workaround.

---

# US-AUTH-006 — Implementar login, logout e proteção de sessão

**Prioridade:** P0  
**Estado:** A FAZER  
**Dependência:** US-AUTH-005  
**Capacidade:** CAP-01

Deve cobrir credenciais inválidas sem enumeração indevida, sessão ausente/inválida, acesso direto por URL, autorização server-side e UX acessível sem flash de conteúdo privado.

---

# US-AUTH-007 — Recuperação de senha e gestão/revogação de sessões

**Prioridade:** P0  
**Estado:** A FAZER  
**Dependências:** US-AUTH-004 e 006  
**Capacidades:** CAP-01, CAP-35

Deve cobrir recuperação/alteração de senha, consulta/encerramento de sessões, revogação e teste explícito da semântica do cache de sessão. Eventos sensíveis não podem registrar senha/token/secret.

---

# US-AUTH-008 — Consolidar auditoria e validar Incremento 2

**Prioridade:** P1  
**Estado:** A FAZER  
**Dependências:** US-AUTH-001 a 007  
**Capacidades:** CAP-04, CAP-35

Deve fechar lacunas de auditoria, executar matriz adversarial integrada e produzir evidência de encerramento do incremento.

## 6. Matriz transversal de segurança

Toda Story com operação protegida deve testar conforme aplicável:

1. visitante/anônimo;
2. usuário autenticado autorizado;
3. usuário autenticado não autorizado conhecendo ID válido;
4. manipulação de ID/ownership/papel no payload;
5. acesso direto sem passar pela UI;
6. sessão inválida/revogada;
7. secret ausente/inválido;
8. papel comum tentando ação administrativa;
9. concorrência em alteração crítica;
10. ausência de vazamento durante loading/erro.

Botão escondido não é prova de autorização.

## 7. Contrato de ambientes

Auth/autorização existentes:

```text
NEON_AUTH_BASE_URL
NEON_AUTH_COOKIE_SECRET
CALEIDA_BOOTSTRAP_OWNER_USER_ID
CALEIDA_BOOTSTRAP_REASON
CALEIDA_ALLOW_OWNER_BOOTSTRAP
```

Nenhum valor real é versionado. Variáveis de e-mail só serão introduzidas depois da escolha documentada do provedor em US-AUTH-004.

Production Neon continua inexistente e não é substituída pela baseline non-production.

## 8. Gates por classe de mudança

| Mudança | `npm run verify` | PostgreSQL 18 | Neon-specific | Browser real |
|---|---:|---:|---:|---:|
| Auth/sessão | obrigatório | gate permanente | quando depender do serviço | quando houver superfície |
| migration/RLS portável | obrigatório | obrigatório | se ligada a Neon Auth/Data API | conforme UI |
| papéis/autorização | obrigatório | obrigatório | quando usar identidade gerenciada | quando houver fluxo |
| e-mail | obrigatório | se schema mudar | se configuração Auth mudar | fluxo real quando existir |
| cadastro/login/sessão | obrigatório | conforme schema | obrigatório quando ligado ao Auth | obrigatório |
| docs-only | CI normal | sem gate adicional | `SKIPPED` | `SKIPPED` |

## 9. Porta de saída do Incremento 2

O Incremento 2 só encerra quando CAP-01, CAP-02, CAP-04 e CAP-35 estiverem comprovadas com matriz adversarial, migrations reproduzíveis, gates Neon-specific aplicáveis, UI acessível onde existir, CI sem CD e nenhuma dependência de Production como laboratório.

## 10. Próxima ação promovida

Executar somente:

> `US-AUTH-004 — Selecionar e integrar e-mail transacional non-production`

Não antecipar signup, login, Production ou deployment Vercel dentro de US-AUTH-004.
