# Incremento 2 — Acesso controlado / EPIC-02

**Status:** EM ANDAMENTO; US-AUTH-002 concluída após integração  
**Origem:** `EPIC-02 — Contas e autenticação`  
**Capacidades:** CAP-01, CAP-02, CAP-04 e CAP-35  
**Prioridade:** P0/P1  
**Stories concluídas:** `US-AUTH-001`, `US-AUTH-002`  
**Próxima Story promovida:** `US-AUTH-003 — Modelar convites, solicitações de acesso e auditoria de entrada`

## 1. Objetivo

Criar a fundação segura de identidade e entrada controlada do beta fechado sem misturar, numa única entrega, autenticação gerenciada, autorização de produto, convites, e-mail e gestão completa de sessão.

O incremento deve terminar com:

- Neon Auth integrado de forma reproduzível em non-production;
- cadastro possível somente por convite válido ou solicitação aprovada;
- login/logout e sessão protegida/revogável;
- papéis administrativos verificados no servidor e no banco, nunca apenas na UI;
- recuperação de senha e gestão de sessões;
- auditoria mínima dos eventos críticos de acesso;
- nenhuma dependência estrutural de MFA, mas sem impedir sua adoção posterior;
- migrations/RLS versionadas para todo schema de produto;
- comportamento Neon-specific provado em branch isolada;
- nenhum deployment Vercel automático ou executado por IA.

## 2. Estado de partida histórico

O detalhamento de partida de OPS-006 permanece histórico: `caleida-nonprod` em PostgreSQL 18, sem Production, e `database/migrations/` inicialmente contendo somente o ledger técnico.

Após US-AUTH-001 e US-AUTH-002, o estado integrado non-production evoluiu para:

```text
Projeto: caleida-nonprod
Project ID: patient-glade-95136440
PostgreSQL: 18
Baseline: main / br-restless-cherry-awpcwy6r
Managed Better Auth: habilitado
Migrations baseline: 000001 + 000002
Usuários Auth baseline: 0
Papéis de produto baseline: 0
Eventos role_changes baseline: 0
Data API: não provisionada
Production Neon: não provisionada
```

## 3. Revalidação técnica corrente

### Neon Auth

A documentação oficial corrente confirma:

- Neon Auth é um serviço gerenciado baseado em Better Auth;
- usuários, sessões e configuração ficam no schema gerenciado `neon_auth`;
- Auth é branch-scoped e cada branch recebe endpoint isolado;
- o SDK oficial para integração Auth-only é `@neondatabase/auth`;
- no SDK Next.js atual, a configuração server-side é centralizada por `createNeonAuth()`;
- o contrato atual usa `NEON_AUTH_BASE_URL` e `NEON_AUTH_COOKIE_SECRET`;
- o SDK atual mantém cache de sessão assinado por cookie;
- Neon Auth não deve ser tratado como Better Auth self-hosted com plugins arbitrários presumidos.

Em US-AUTH-002, a documentação oficial do plugin Admin também confirmou que o `role` do Better Auth governa capacidades administrativas do provedor de autenticação. Por isso os cinco papéis de produto do Caleida permanecem separados no schema `caleida_auth`.

Consequência para o beta fechado: o gate de convite/aprovação não pode depender de esconder signup na UI nem de um plugin Better Auth imaginado. A futura Story de cadastro deve provar que criação direta sem autorização de entrada também é negada.

### Neon Data API e RLS

A Data API continua não provisionada. Quando houver tabela privada/user-scoped exposta, RLS e grants devem ser tratados separadamente e identidade autenticada não implicará ownership por si só.

US-AUTH-002 não habilitou Data API por conveniência: as tabelas de autorização/auditoria ficam fechadas, com grants públicos revogados, até existir uma superfície runtime real e least privilege correspondente.

### Next.js 16

O projeto usa Next.js `16.3.3`. Proxy/redirect pode melhorar UX futura, mas autorização real permanece na camada server-side que executa a operação e no banco quando aplicável.

## 4. Avaliação de arquitetura

US-AUTH-001 e US-AUTH-002 **não exigiram novo ADR**:

- Neon Auth e a plataforma de dados continuam regidos por `ADR-005`;
- migrations no Git continuam regidas por `ADR-004`;
- PostgreSQL 18 efêmero + gate Neon-specific continuam regidos por `ADR-008`;
- deployment manual continua regido por `ADR-007`.

Decisões futuras que podem exigir ADR:

1. provedor de e-mail transacional;
2. mudança material do provedor/arquitetura de identidade caso o beta fechado não possa ser imposto com a superfície suportada;
3. mudança material do padrão de acesso a dados/Data API.

## 5. Rastreamento de capacidades

| Capacidade | Cobertura principal |
|---|---|
| CAP-01 — Contas, autenticação e sessões | US-AUTH-001, 005, 006 e 007 |
| CAP-02 — Convites e controle de entrada | US-AUTH-003 e 005 |
| CAP-04 — Papéis e permissões | US-AUTH-002 e 008 |
| CAP-35 — Auditoria | US-AUTH-002, 003, 007 e 008 |

Requisitos transversais obrigatórios: NFR-01, NFR-02, NFR-03, NFR-04, NFR-07, NFR-09, NFR-10 e NFR-11.

## 6. Ordem das Stories

```text
US-AUTH-001 — fundação Neon Auth + sessão — CONCLUÍDA (#43 / #44)
  ↓
US-AUTH-002 — papéis/autorização + bootstrap administrativo — CONCLUÍDA (#45 / #46)
  ↓
US-AUTH-003 — convites/solicitações + auditoria de entrada — PRÓXIMA
  ↓
US-AUTH-004 — decisão e integração de e-mail transacional non-production
  ↓
US-AUTH-005 — cadastro controlado + confirmação de e-mail
  ↓
US-AUTH-006 — login/logout + proteção de sessão
  ↓
US-AUTH-007 — recuperação/alteração de senha + gestão/revogação de sessões
  ↓
US-AUTH-008 — consolidar auditoria e validar Incremento 2
```

A ordem evita criar uma tela de cadastro antes de existir uma barreira de entrada comprovável e evita usar privilégios administrativos antes de existir um modelo de autorização.

---

# US-AUTH-001 — Materializar fundação Neon Auth isolada e contrato de sessão

**Prioridade:** P0  
**Estado:** CONCLUÍDA APÓS INTEGRAÇÃO  
**Issue:** `#43`  
**PR:** `#44`  
**Capacidade:** CAP-01  
**Evidência:** `docs/US_AUTH_001_VERIFICATION.md`

## Resultado

- `@neondatabase/auth@0.5.0-beta` fixado;
- fronteira Auth server-only/lazy/fail-closed;
- handler GET/POST catch-all;
- cache de sessão explicitamente configurado;
- gate Neon-specific em branch isolada;
- Managed Better Auth promovido deliberadamente para a baseline;
- nenhum usuário, Data API, SMTP/e-mail, OAuth, Production ou deployment criado.

## Gates

- `npm run verify`: `PASS`;
- PostgreSQL 18 + `npm run verify:db`: `PASS`;
- Neon-specific: `PASS`;
- CI pós-merge: `PASS`;
- browser real: `SKIPPED` por ausência de fluxo/UI;
- deployment: `SKIPPED/PROIBIDO`.

A branch `verify-us-auth-001` foi removida mediante autorização explícita antes de US-AUTH-002.

---

# US-AUTH-002 — Materializar papéis, autorização e bootstrap administrativo

**Prioridade:** P0  
**Estado:** CONCLUÍDA APÓS INTEGRAÇÃO  
**Issue:** `#45`  
**PR:** `#46`  
**Dependência:** US-AUTH-001 concluída  
**Capacidades:** CAP-04, CAP-35  
**Evidência:** `docs/US_AUTH_002_VERIFICATION.md`

## Resultado

- papéis de produto: `proprietário`, `administrador`, `moderador`, `curador`, `usuário`;
- autorização armazenada por UUID Neon Auth sem duplicar credenciais;
- `caleida_auth.user_roles` como estado atual de papel;
- `caleida_audit.role_changes` como trilha mínima auditável;
- política de mutação imposta no banco e espelhada em fronteira server-only;
- autopromoção negada;
- usuário comum não executa ação administrativa;
- administrador não cria pares/owners nem altera proprietário/administrador;
- bootstrap inicial de proprietário exige identidade Auth existente, confirmação separada e motivo auditável;
- nenhuma conta real foi criada apenas para satisfazer a Story;
- nenhuma UI/endpoint/Data API foi inventada antes de existir fluxo funcional.

## Gates

- PostgreSQL 18 + `npm run verify:db`: `PASS` no CI `33766333312`;
- 49/49 testes Node + build: `PASS`;
- Neon-specific em `verify-us-auth-002`: `PASS`;
- promoção `000001` + `000002` para baseline: `PASS`, com checksums do runner;
- baseline pós-promoção: zero usuários/papéis/auditoria de papel;
- browser real: `SKIPPED` por ausência deliberada de superfície;
- deployment: `SKIPPED/PROIBIDO`.

## Pendência operacional

`verify-us-auth-002` (`br-weathered-shape-awp7ckqa`) contém somente dados sintéticos do gate e permanece pendente de exclusão explícita. Não criar outro branch descartável enquanto essa limpeza não ocorrer.

---

# US-AUTH-003 — Modelar convites, solicitações de acesso e auditoria de entrada

**Prioridade:** P0  
**Estado:** PRONTA / próxima ação  
**Dependência:** US-AUTH-002 concluída  
**Capacidades:** CAP-02, CAP-35

## Objetivo

Criar o modelo persistente de entrada controlada antes do signup.

Deve cobrir:

- convite único/reutilizável;
- validade e limite de uso;
- destinatário opcional;
- estados criado, enviado, utilizado, expirado, revogado e cancelado;
- solicitação/lista de espera com aprovação, recusa, espera e arquivamento;
- rastreio do responsável e da futura conta criada;
- auditoria mínima;
- concorrência/uso simultâneo de convite;
- rate limiting/abuso como requisito de implementação quando houver endpoint externo.

Não envia e-mail e não cria conta nesta Story.

Gates: migrations/RLS em PostgreSQL 18; Neon-specific somente se a política usar identidade/roles gerenciados.

### Pré-condição operacional

Antes de abrir outra branch Neon descartável, remover `verify-us-auth-002` somente após nova autorização explícita do usuário. Trabalho puramente PostgreSQL portável não deve ser artificialmente bloqueado pela limpeza, mas não se cria um segundo ambiente descartável por conveniência.

---

# US-AUTH-004 — Selecionar e integrar e-mail transacional non-production

**Prioridade:** P0  
**Estado:** A FAZER  
**Dependências:** US-AUTH-001 e contratos de entrada definidos  
**Capacidades:** CAP-01, CAP-02

## Objetivo

Escolher e integrar o transporte necessário para confirmação de e-mail, convite e recuperação de senha sem acoplar o produto silenciosamente a um provedor.

## Regras

- revalidar provedores/preços/limites/privacidade na execução;
- registrar ADR se a escolha for material à arquitetura/operação;
- secrets server-only e separados por ambiente;
- nenhum secret real no Git;
- somente non-production nesta fase;
- indisponibilidade do e-mail deve produzir estado recuperável, sem consumir convite indevidamente;
- não provisionar Vercel/Production por conveniência.

---

# US-AUTH-005 — Implementar cadastro controlado por convite ou aprovação

**Prioridade:** P0  
**Estado:** A FAZER  
**Dependências:** US-AUTH-002, 003 e 004  
**Capacidades:** CAP-01, CAP-02

## Objetivo

Permitir criação de conta somente quando existir autorização de entrada válida e concluir confirmação de e-mail conforme contrato escolhido.

## Regra crítica de segurança

Ocultar botão/tela não é gate de beta.

A implementação deve provar que:

- signup direto sem convite válido/solicitação aprovada é negado;
- convite expirado/revogado/esgotado é negado;
- destinatário restrito não pode ser trocado por payload;
- consumo do convite e vínculo com a conta são atômicos ou possuem compensação segura;
- concorrência não excede limite de usos;
- a superfície oficial suportada pelo Neon Auth permite impor o gate antes/de forma segura ao criar a conta.

Se a superfície gerenciada não permitir impor o beta fechado de forma segura, parar e registrar decisão arquitetural; não liberar signup público como workaround.

---

# US-AUTH-006 — Implementar login, logout e proteção de sessão

**Prioridade:** P0  
**Estado:** A FAZER  
**Dependência:** US-AUTH-005  
**Capacidade:** CAP-01

## Objetivo

Materializar login/logout e proteger superfícies privadas com validação de sessão server-side, estados acessíveis e comportamento fail-closed.

Deve cobrir:

- credenciais inválidas sem enumeração indevida de conta;
- sessão ausente/inválida;
- acesso direto por URL;
- redirect/proxy como UX, não como única autorização;
- loading/erro/acesso negado sem flash de conteúdo privado;
- teclado, foco, labels e feedback acessível.

---

# US-AUTH-007 — Implementar recuperação de senha e gestão/revogação de sessões

**Prioridade:** P0  
**Estado:** A FAZER  
**Dependências:** US-AUTH-004 e 006  
**Capacidades:** CAP-01, CAP-35

## Objetivo

Cobrir recuperação/alteração de senha, consulta/encerramento de sessões e revogação segura.

A Story deve testar explicitamente o impacto do cache de sessão do SDK corrente. Revogar uma sessão deve produzir o comportamento de segurança exigido pelo produto dentro de uma janela documentada e aprovada; não assumir invalidação imediata se o SDK estiver cacheando sessão.

Eventos sensíveis devem ser auditados sem senha, token ou payload secreto.

---

# US-AUTH-008 — Consolidar auditoria e validar Incremento 2

**Prioridade:** P1  
**Estado:** A FAZER  
**Dependências:** US-AUTH-001 a 007  
**Capacidades:** CAP-04, CAP-35

## Objetivo

Fechar lacunas de auditoria, executar matriz adversarial integrada e produzir evidência de encerramento do Incremento 2.

Auditar, quando aplicável:

- login sensível/falhas relevantes sem registrar segredo;
- convite e mudança de estado;
- criação de conta autorizada;
- mudança de papel;
- recuperação de conta;
- revogação/encerramento de sessão;
- ações administrativas críticas.

Retenção deve ser proporcional e não deve capturar senhas, tokens, secrets ou payloads desnecessários.

## 7. Matriz transversal de segurança

Toda Story que exponha operação protegida deve testar, conforme aplicável:

1. visitante/anônimo;
2. usuário autenticado autorizado;
3. usuário autenticado não autorizado conhecendo ID válido;
4. manipulação de ID/ownership/papel no payload;
5. acesso direto ao endpoint sem passar pela UI;
6. sessão inválida/revogada;
7. secret ausente/inválido;
8. papel comum tentando ação administrativa;
9. concorrência em convite/alteração crítica;
10. ausência de vazamento de conteúdo privado durante loading/erro.

A camada que impõe a regra deve ser testada; botão escondido não é prova de autorização.

## 8. Contrato de ambientes e secrets

### Auth e autorização

Nomes correntes materializados/documentados, sem valores no Git:

```text
NEON_AUTH_BASE_URL
NEON_AUTH_COOKIE_SECRET
CALEIDA_BOOTSTRAP_OWNER_USER_ID
CALEIDA_BOOTSTRAP_REASON
CALEIDA_ALLOW_OWNER_BOOTSTRAP
```

Regras:

- secrets nunca usam `NEXT_PUBLIC_*`;
- endpoint/secret de branch descartável não é reutilizado em Production;
- bootstrap não aceita e-mail/senha nem cria conta;
- `.env.example` contém somente nomes/comentários/placeholders seguros;
- qualquer variável adicional deve ser revalidada antes da materialização;
- nenhum valor real entra em Issue, PR, commit ou log persistente.

### E-mail

Os nomes específicos do provedor não são inventados antes de US-AUTH-004.

### Production

Production Neon continua inexistente. Nenhuma Story deste incremento pode reutilizar non-production como Production por conveniência.

## 9. Gates por classe de mudança

| Mudança | `npm run verify` | PostgreSQL 18 / `verify:db` | Neon-specific isolado | Browser real |
|---|---:|---:|---:|---:|
| Auth gerenciado / sessão | obrigatório | gate permanente | obrigatório | quando houver superfície real |
| migration/RLS portável | obrigatório | obrigatório | se ligada a Neon Auth/Data API | conforme UI |
| papéis/autorização | obrigatório | obrigatório | obrigatório quando usar identidade Neon | obrigatório para fluxo real |
| e-mail | obrigatório | se schema mudar | obrigatório se configuração Auth mudar | fluxo real |
| cadastro/login/sessão | obrigatório | obrigatório quando houver schema/RLS | obrigatório | obrigatório |
| docs-only | CI normal se disparado | semântica não adicional | `SKIPPED` se não houver mutação | `SKIPPED` |

## 10. Porta de saída do Incremento 2

O Incremento 2 só pode ser encerrado quando:

- CAP-01: cadastro autorizado, login/logout, recuperação e gestão/revogação de sessões verificadas;
- CAP-02: convite e solicitação/aprovação de entrada possuem estados e autorização consistentes;
- CAP-04: papéis são verificados no servidor e no banco e papel comum não obtém ação administrativa;
- CAP-35: eventos críticos definidos estão auditados sem secrets;
- NFR-03/NFR-04: matriz adversarial passa, inclusive acesso direto por ID/endpoint;
- migrations aplicam do zero e RLS aplicável passa em PostgreSQL 18;
- gates Neon-specific aplicáveis passam em branch isolada;
- UI de acesso é responsiva e acessível;
- nenhum fluxo depende de Production como laboratório;
- CI permanece sem CD;
- Vercel continua sem deployment automático e IA não publica;
- documento de validação do incremento registra evidências reais.

## 11. Próxima ação promovida

Executar somente:

> `US-AUTH-003 — Modelar convites, solicitações de acesso e auditoria de entrada`

Antes de criar outra branch Neon descartável, resolver `MANUAL_ACTION_REQUIRED`: obter nova autorização explícita para excluir `verify-us-auth-002`. Não antecipar e-mail, cadastro, login, Production ou deployment dentro de US-AUTH-003.
