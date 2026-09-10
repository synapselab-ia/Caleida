# Incremento 2 — Acesso controlado / EPIC-02

**Status:** EM ANDAMENTO; US-AUTH-006 concluída, US-AUTH-007 promovida  
**Origem:** `EPIC-02 — Contas e autenticação`  
**Capacidades:** CAP-01, CAP-02, CAP-04 e CAP-35  
**Prioridade:** P0/P1  
**Stories concluídas:** `US-AUTH-001` a `US-AUTH-006`  
**Próxima Story:** `US-AUTH-007 — Recuperação de senha e gestão/revogação de sessões`

## 1. Objetivo

Criar a fundação segura de identidade e entrada controlada do beta fechado, mantendo autenticação gerenciada, autorização, convites, e-mail, cadastro, gestão de sessão e auditoria em Stories separadas e verificáveis.

O incremento termina apenas quando:

- Neon Auth estiver integrado e reproduzível em non-production;
- cadastro só puder ocorrer por convite válido ou solicitação aprovada;
- login/logout e superfícies privadas estiverem protegidos;
- papéis administrativos forem verificados no servidor e no banco;
- recuperação de senha e gestão/revogação de sessões estiverem implementadas;
- eventos críticos de acesso estiverem auditados sem secrets;
- migrations/RLS aplicáveis forem versionadas e verificadas;
- comportamento Neon-specific for provado em branch isolada quando realmente existir dependência do serviço;
- a matriz adversarial/browser live integrada for executada no fechamento do incremento;
- nenhum deployment Vercel automático ou executado por IA ocorrer.

## 2. Arquitetura e gates

Decisões vigentes:

- `ADR-004`: mudanças persistentes de banco somente por migrations;
- `ADR-005`: Neon como plataforma canônica de dados/identidade;
- `ADR-007`: deployment Vercel exclusivamente humano/manual;
- `ADR-008`: PostgreSQL 18 descartável como gate primário para SQL portável; branch Neon isolada somente quando houver dependência real do serviço;
- `ADR-009`: provider compartilhado do Neon Auth é suficiente para desenvolvimento/non-production enquanto adequado.

### Regra de browser e deployment

Browser real é um meio de evidência e não cria obrigação de Preview por Story.

Para Stories intermediárias:

- `npm run verify` continua obrigatório;
- PostgreSQL 18 é executado quando aplicável pelo CI/gate de banco;
- Neon-specific é obrigatório quando a mudança depende de comportamento gerenciado do Neon;
- revisão server-side, testes de contrato/integração e casos adversariais devem cobrir a camada que realmente impõe a regra;
- se não houver runtime já disponível, browser live pode ser `SKIPPED/deferred` quando os critérios puderem ser provados de forma equivalente;
- ausência de Preview manual não é `BLOCKED` por padrão.

A validação live acumulada do Incremento 2 é responsabilidade de `US-AUTH-008`. Se ela exigir runtime público, deve ser preparada uma única release candidate manual para validar o conjunto, em vez de um Preview a cada Story.

Uma Story intermediária só exige runtime público antecipado se seu critério de aceitação depender inerentemente de infraestrutura externa impossível de validar de outra forma, conforme `00_SYSTEM/DEPLOYMENT_POLICY.md` e `00_SYSTEM/VERIFICATION_PROTOCOL.md`.

## 3. Estado integrado atual

```text
Projeto Neon: caleida-nonprod
PostgreSQL: 18
Baseline: main / br-restless-cherry-awpcwy6r / ready
Managed Better Auth: habilitado
Auth email provider: shared Neon
Email/password: enabled
Require email verification: true
Data API: não provisionada
Production Neon: não provisionada
Deployment Vercel: exclusivamente humano/manual
```

Branches Neon de verificação existentes são housekeeping e não podem ser excluídas automaticamente sem autorização específica.

## 4. Rastreamento de capacidades

| Capacidade | Cobertura principal |
|---|---|
| CAP-01 — Contas, autenticação e sessões | US-AUTH-001, 004, 005, 006 e 007 |
| CAP-02 — Convites e controle de entrada | US-AUTH-003 e 005 |
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
US-AUTH-004 — e-mail Auth non-production — CONCLUÍDA (#49 / #50)
  ↓
US-AUTH-005 — cadastro controlado + confirmação de e-mail — CONCLUÍDA (#51 / #52)
  ↓
US-AUTH-006 — login/logout + proteção de sessão — CONCLUÍDA (#53 / #54)
  ↓
US-AUTH-007 — recuperação + gestão/revogação de sessões — PRÓXIMA
  ↓
US-AUTH-008 — auditoria integrada + validação live do incremento
```

---

# US-AUTH-001 — Fundação Neon Auth e contrato de sessão

**Estado:** CONCLUÍDA  
**Issue/PR:** `#43 / #44`  
**Evidência:** `docs/US_AUTH_001_VERIFICATION.md`

Resultado: `@neondatabase/auth` pinado; boundary server-only/lazy/fail-closed; handler Auth; Managed Better Auth promovido à baseline após gates; nenhum usuário real, Data API, Production ou deployment criado pela IA.

# US-AUTH-002 — Papéis, autorização e bootstrap administrativo

**Estado:** CONCLUÍDA  
**Issue/PR:** `#45 / #46`  
**Evidência:** `docs/US_AUTH_002_VERIFICATION.md`

Resultado: cinco papéis Caleida separados do Admin Better Auth; autorização server-side + banco; auditoria mínima; bootstrap owner controlado; migrations promovidas à baseline.

# US-AUTH-003 — Convites, solicitações de acesso e auditoria de entrada

**Estado:** CONCLUÍDA  
**Issue/PR:** `#47 / #48`  
**Evidência:** `docs/US_AUTH_003_VERIFICATION.md`  
**Contrato:** `docs/ENTRY_CONTROL.md`

Resultado: convites, solicitações, auditoria compacta e consumo concorrente serializado; migrations privadas por padrão; PostgreSQL 18 e concorrência comprovados.

# US-AUTH-004 — Validar e-mail Auth non-production

**Estado:** CONCLUÍDA  
**Issue/PR:** `#49 / #50`  
**Evidência:** `docs/US_AUTH_004_VERIFICATION.md`  
**Decisão:** `docs/adr/ADR-009-neon-shared-email-nonproduction.md`

Resultado: provider compartilhado Neon confirmado; SMTP/provedor externo adiado; nenhum secret/adapter externo incorporado.

# US-AUTH-005 — Cadastro controlado por convite ou aprovação

**Estado:** CONCLUÍDA  
**Issue/PR:** `#51 / #52`  
**Merge:** `9abc3235623c3f7d37531eb94a60997960f526e1`  
**Evidência:** `docs/US_AUTH_005_VERIFICATION.md`

Resultado: signup fail-closed por convite/aprovação; webhooks verificados; confirmação obrigatória de e-mail por OTP; migrations `000004`–`000007` promovidas; matriz live específica dessa Story comprovada porque a entrega/OTP real era material ao seu critério de aceitação.

# US-AUTH-006 — Login, logout e proteção de sessão

**Prioridade:** P0  
**Estado:** CONCLUÍDA  
**Issue/PR:** `#53 / #54`  
**Merge:** `b585234a159a73dfec89e1d4cb866201dcfdef34`  
**Capacidade:** CAP-01  
**Evidência:** `docs/US_AUTH_006_VERIFICATION.md`

## Resultado

- server actions de login/logout via boundary Auth;
- credenciais inválidas com mensagem genérica;
- `/login` server-aware;
- `/app` protegido por layout server-side;
- acesso direto anônimo negado pela mesma camada;
- conteúdo privado não renderizado antes da validação da sessão;
- estados pending/error acessíveis;
- logout fail-closed quando o provider falha;
- testes de contrato sem storage/cookie client-side como autoridade.

## Gates

- CI final da PR `#214 / 34500281605`: PASS;
- `npm run verify`: PASS;
- PostgreSQL 18 + `verify:db`: PASS;
- mudança de schema/migration: não aplicável;
- Neon-specific: configuração/isolamento da branch `verify-us-auth-006` confirmados, schema diff vazio e zero usuários/sessões/accounts;
- browser/live: `SKIPPED/deferred` para US-AUTH-008 conforme política revisada;
- Preview Vercel adicional: não requerido.

# US-AUTH-007 — Recuperação de senha e gestão/revogação de sessões

**Prioridade:** P0  
**Estado:** PRONTA / NEXT_ACTION  
**Dependências:** US-AUTH-004 e 006  
**Capacidades:** CAP-01, CAP-35

Cobrir recuperação/alteração de senha, consulta/encerramento de sessões, revogação e semântica de cache. Eventos sensíveis não podem registrar senha/token/secret.

Regras adicionais:

- falha de recuperação não deve enumerar conta indevidamente;
- tokens/códigos de recuperação não devem aparecer em logs/docs;
- comportamento de revogação e cache deve ser comprovado explicitamente;
- browser/live intermediário segue a política consolidada e não exige Preview por padrão;
- não antecipar US-AUTH-008.

# US-AUTH-008 — Consolidar auditoria e validar Incremento 2

**Prioridade:** P1  
**Estado:** A FAZER  
**Dependências:** US-AUTH-001 a 007  
**Capacidades:** CAP-04, CAP-35

Fechar lacunas de auditoria e executar a matriz adversarial integrada do incremento, incluindo browser/live dos fluxos acumulados. Esta é a Story padrão para uma eventual release candidate manual de validação externa.

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

Nenhum valor real é versionado. O provider compartilhado de e-mail do Neon Auth não exige secret adicional do Caleida nesta fase.

Production Neon continua inexistente e não é substituída pela baseline non-production.

## 8. Gates por classe de mudança

| Mudança | `npm run verify` | PostgreSQL 18 | Neon-specific | Browser real |
|---|---:|---:|---:|---:|
| Auth/sessão | obrigatório | gate permanente / schema se aplicável | quando depender do serviço | consolidado no incremento, salvo dependência pública material |
| autorização/RLS | obrigatório | obrigatório | quando depender de identidade gerenciada | quando houver fluxo live consolidado |
| e-mail/OTP | obrigatório | se houver contrato DB | obrigatório se usar Auth gerenciado | obrigatório quando entrega real for critério material |
| UI sem dependência externa | obrigatório | conforme escopo | conforme escopo | pode ser deferred para validação integrada |
| integração externa pública | obrigatório | conforme escopo | conforme escopo | obrigatório se não houver prova equivalente |

## 9. Non-goals do incremento

- OAuth customizado sem necessidade;
- Data API prematura;
- Production Neon durante Stories intermediárias;
- deployment Vercel pela IA;
- um Preview manual por Story;
- antecipar módulos de catálogo, listas ou social.

## 10. Próxima ação

> Criar Issue e branch limitadas a `US-AUTH-007 — Recuperação de senha e gestão/revogação de sessões`, recuperar os contratos atuais do Managed Better Auth/cache de sessão e executar somente essa Story sem exigir Preview Vercel intermediário.
