# Incremento 2 — Acesso controlado / EPIC-02

**Status:** REFINADO EM OPS-006  
**Origem:** `EPIC-02 — Contas e autenticação`  
**Capacidades:** CAP-01, CAP-02, CAP-04 e CAP-35  
**Prioridade:** P0/P1  
**Primeira Story promovida:** `US-AUTH-001 — Materializar fundação Neon Auth isolada e contrato de sessão`

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

## 2. Estado de partida verificado em 02/09/2026

### GitHub

- `main`: `a42b8bdcd78293e797cdb6e2aff3e3cf02c495a2`;
- CI integrada da `main`: run `33664145901` — `PASS`;
- Issues abertas antes de OPS-006: nenhuma;
- PRs abertas antes de OPS-006: nenhuma;
- Incrementos 0 e 1: concluídos.

### Neon non-production

```text
Projeto: caleida-nonprod
Project ID: patient-glade-95136440
Região: aws-us-east-1
PostgreSQL: 18
Branch baseline: main
Branch ID: br-restless-cherry-awpcwy6r
Branches atuais: 1
```

Leitura do plano de controle confirmou a baseline `main` em estado `ready`.

Ainda não existem:

- Neon Auth provisionado;
- Neon Data API provisionada;
- schema funcional de produto;
- RLS funcional de produto;
- usuários remotos do Caleida;
- projeto Neon Production;
- projeto/deployment Vercel do Caleida.

No Git, `database/migrations/` contém somente `000001_migration_ledger.sql`.

## 3. Revalidação técnica corrente

### Neon Auth

A documentação oficial corrente confirma:

- Neon Auth é um serviço gerenciado baseado em Better Auth;
- usuários, sessões e configuração ficam no schema gerenciado `neon_auth`;
- Auth é branch-scoped e cada branch recebe endpoint isolado;
- o SDK oficial para integração Auth-only é `@neondatabase/auth`;
- no SDK Next.js atual, a configuração server-side é centralizada por `createNeonAuth()`;
- o contrato atual usa `NEON_AUTH_BASE_URL` e `NEON_AUTH_COOKIE_SECRET`;
- o SDK atual mantém cache de sessão assinado por cookie, com TTL padrão documentado de cinco minutos e configuração explícita;
- Neon Auth não deve ser tratado como Better Auth self-hosted: plugins próprios e handlers server-side customizados não podem ser presumidos como disponíveis.

Consequência para o beta fechado: **o gate de convite/aprovação não pode depender de um plugin Better Auth imaginado ou de esconder a tela de cadastro**. A Story de cadastro deve provar que uma chamada direta ao mecanismo de signup sem autorização de entrada também é negada.

Fontes oficiais revalidadas:

- https://neon.com/docs/auth/migrate/from-auth-v0.1
- https://neon.com/blog/neon-auth-branchable-identity-in-your-database
- https://neon.com/blog/teaching-ai-how-to-do-auth

### Neon Data API e RLS

A documentação oficial corrente mantém a Data API como caminho recomendado para consulta client-side com JWT + PostgreSQL RLS. Para tabelas expostas à Data API:

- RLS é obrigatória;
- `auth.user_id()` representa a identidade autenticada documentada pelo Neon;
- autenticação no papel `authenticated` não substitui ownership/visibilidade;
- grants e RLS são controles distintos;
- políticas ligadas à identidade Neon exigem gate Neon-specific além do PostgreSQL efêmero.

Fonte oficial revalidada:

- https://neon.com/docs/guides/row-level-security

A Data API **não será ativada em US-AUTH-001**. Sua necessidade deve nascer da primeira Story de dados user-scoped que realmente precise desse caminho.

### Next.js 16

O projeto usa Next.js `16.3.3`. A documentação corrente usa `proxy.ts` para proteção/roteamento antecipado, mas autorização real deve permanecer na camada que executa a operação e validar a sessão no servidor. Proxy/redirect não substitui autorização server-side ou RLS.

Fonte oficial revalidada:

- https://nextjs.org/learn/dashboard-app/adding-authentication

## 4. Avaliação de arquitetura

OPS-006 **não exige novo ADR**:

- Neon Auth, Neon Data API e PostgreSQL RLS já são decisões aceitas em `ADR-005`;
- migrations no Git continuam regidas por `ADR-004`;
- PostgreSQL 18 efêmero + gate Neon-specific continuam regidos por `ADR-008`;
- deployment manual continua regido por `ADR-007`.

Decisões futuras que podem exigir ADR antes ou na mesma Story:

1. **provedor de e-mail transacional:** ainda está deliberadamente em aberto em `docs/ARCHITECTURE.md`; a escolha deve considerar privacidade, custo, limites e operação;
2. **mudança do provedor/arquitetura de identidade:** se o gate seguro de beta fechado não puder ser implementado com a superfície suportada pelo Neon Auth, não contornar o problema; registrar decisão arquitetural antes de trocar ou adicionar camada de identidade;
3. **Data API fora do caminho preferencial atual:** qualquer mudança material de padrão de acesso deve ser justificada e registrada.

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
US-AUTH-001 — fundação Neon Auth + sessão
  ↓
US-AUTH-002 — papéis/autorização + bootstrap administrativo seguro
  ↓
US-AUTH-003 — convites/solicitações + auditoria de entrada
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
**Estado:** PRONTA / próxima ação  
**Dependências:** Incrementos 0 e 1 concluídos; `ADR-005`; branch Neon isolada disponível  
**Capacidade:** CAP-01

## Objetivo

Integrar o Neon Auth atual ao Next.js 16 em ambiente Neon descartável e estabelecer um contrato server-side de sessão antes de criar qualquer fluxo de cadastro/login.

## Escopo

- criar branch Neon `verify/us-auth-001` ou equivalente a partir da baseline non-production;
- provisionar Neon Auth **somente na branch isolada** durante desenvolvimento/verificação;
- adicionar a versão corrente suportada de `@neondatabase/auth`;
- centralizar a integração server-side conforme API oficial corrente;
- materializar o endpoint/handler oficial necessário e uma fronteira server-side reutilizável para obter/validar sessão;
- usar `proxy.ts` apenas como camada de roteamento/proteção antecipada quando necessário, nunca como única autorização;
- documentar `NEON_AUTH_BASE_URL` e `NEON_AUTH_COOKIE_SECRET` sem valores;
- definir comportamento fail-closed quando configuração/sessão for ausente ou inválida;
- adicionar testes/contratos proporcionais à fundação;
- decidir, com evidência, como o cache de sessão afeta futuras exigências de revogação antes de declarar gestão de sessão concluída;
- após gates, promover somente configuração deliberadamente aprovada à baseline non-production, sem Production.

## Non-goals

- formulário de cadastro;
- formulário de login;
- criar usuário real ou conta de beta persistente;
- convite/lista de espera;
- papéis de produto;
- Data API;
- migration/schema funcional de produto;
- SMTP/e-mail;
- OAuth;
- Production Neon;
- deployment Vercel.

## Gates

- `npm run verify`: obrigatório;
- `npm run verify:db` em PostgreSQL 18: obrigatório como gate permanente do repositório, ainda que nenhuma migration funcional seja criada;
- Neon-specific: **obrigatório**, pois a Story depende de Neon Auth/schema/endpoint gerenciados;
- branch Neon baseline `main`: proibida como laboratório destrutivo;
- browser real: verificar a fronteira mínima de sessão quando houver superfície navegável; não criar UI fictícia apenas para satisfazer o gate;
- deployment: proibido para IA.

## Casos adversariais mínimos

- anônimo retorna ausência de sessão sem vazar detalhe sensível;
- cookie/ticket inválido não autentica;
- configuração/secret ausente falha de forma explícita e fechada;
- uma simples presença de cookie não é aceita como prova de autorização server-side;
- nenhum secret aparece no bundle do browser, logs persistentes ou Git;
- branch isolada não compartilha endpoint Auth por engano com a baseline.

## Bloqueio objetivo

Se o plano de controle não permitir criar branch Neon isolada/provisionar Auth de forma verificável, marcar `BLOCKED`. Não usar a baseline `main` para contornar o gate Neon-specific.

---

# US-AUTH-002 — Materializar papéis, autorização e bootstrap administrativo

**Prioridade:** P0  
**Estado:** A FAZER  
**Dependência:** US-AUTH-001  
**Capacidades:** CAP-04, CAP-35

## Objetivo

Definir papéis `proprietário`, `administrador`, `moderador`, `curador` e `usuário` como autorização de produto vinculada à identidade Neon, com bootstrap administrativo controlado e auditável.

## Requisitos

- não duplicar credenciais/identidade somente para contornar Neon Auth;
- não inferir privilégio por parâmetro, UI ou campo editável pelo usuário;
- mudanças de schema em migration versionada;
- autorização crítica comprovada no servidor e no banco;
- usuário comum não consegue promover a si mesmo nem executar ação administrativa direta;
- bootstrap inicial de proprietário em non-production deve ser explícito, server-only, reversível/auditável e não criar atalho reaproveitável no browser;
- registrar mudança de papel sem secret/payload desnecessário.

Gates: PostgreSQL 18 + Neon-specific, porque a regra se relaciona à identidade Neon real.

---

# US-AUTH-003 — Modelar convites, solicitações de acesso e auditoria de entrada

**Prioridade:** P0  
**Estado:** A FAZER  
**Dependência:** US-AUTH-002  
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

Gates: migrations/RLS em PostgreSQL 18; Neon-specific se a política usar identidade/roles gerenciados.

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

Como Neon Auth gerenciado não permite presumir plugins/handlers customizados de Better Auth, a Story deve revalidar a API corrente. Se não houver mecanismo seguro compatível com o beta fechado, parar e registrar decisão arquitetural; não liberar signup público como workaround.

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

### US-AUTH-001

Nomes correntes a documentar/usar, sem valores no Git:

```text
NEON_AUTH_BASE_URL        ← endpoint Auth branch-scoped
NEON_AUTH_COOKIE_SECRET   ← secret server-only para assinatura do cache de sessão
```

Regras:

- `NEON_AUTH_COOKIE_SECRET` nunca usa `NEXT_PUBLIC_*`;
- endpoint/secret de branch descartável não é reutilizado em Production;
- `.env.example` contém somente nomes/comentários/placeholders seguros;
- a Story deve revalidar a API corrente antes de materializar qualquer variável adicional;
- nenhum valor real entra em Issue, PR, commit ou log persistente.

### E-mail

Os nomes específicos do provedor **não são inventados em OPS-006**. US-AUTH-004 define o contrato somente depois da escolha documentada do provedor.

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

> `US-AUTH-001 — Materializar fundação Neon Auth isolada e contrato de sessão`

Não antecipar convite, cadastro, papéis, e-mail, Data API ou Production dentro dessa Story.