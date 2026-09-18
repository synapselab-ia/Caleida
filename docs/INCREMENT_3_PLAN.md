# Incremento 3 - Perfis e privacidade / EPIC-03

**Status:** REFINADO EM OPS-007  
**Origem:** `EPIC-03 - Perfis e privacidade`  
**Capacidades:** CAP-03, CAP-05 e CAP-33  
**Prioridade:** P0/P1  
**Primeira Story promovida:** `US-PRIV-001 - Materializar perfil básico user-scoped com Data API e RLS`

## 1. Objetivo

Entregar a primeira identidade de produto do usuário e uma fundação de privacidade que permaneça correta quando catálogo, biblioteca e comunidade forem adicionados depois.

O incremento deve terminar com:

- perfil básico persistente, editável pelo próprio usuário e separado da identidade gerenciada do Neon Auth;
- nome de usuário único para rota pública, nome de exibição e personalização compatível com a identidade visual;
- visibilidade de perfil aplicada no servidor e no banco, com negação por padrão;
- bloqueio com efeito real sobre leitura de perfil e contrato reutilizável por consultas sociais futuras;
- desativação reversível sem apagar dados;
- solicitação de exclusão com período de cancelamento, exportação prévia e finalização deliberada;
- exclusão definitiva somente após reautenticação forte e inventário explícito de dados a remover, anonimizar ou preservar;
- migrations e RLS versionadas;
- primeiro uso deliberado da Neon Data API somente quando a Story user-scoped realmente precisar dela;
- nenhum upload ou provedor de Storage antecipado;
- nenhum fluxo social falso para seguidores, conexões, silenciamento ou restrição antes de existir uma superfície que dê significado a esses controles;
- nenhum deployment Vercel executado por IA.

## 2. Estado de partida verificado em 14/09/2026

### GitHub

```text
main: 9ea9f9253a0123eb491d8980fd252401b6ea8f10
último merge funcional: 84f7fecb018d6f4b6bc36817accef15f1976f05f
CI main: #247 / 34851172467 / SUCCESS
Issues abertas antes de OPS-007: nenhuma
PRs abertas antes de OPS-007: nenhuma
Issue de planejamento: #59
Branch de planejamento: ops/007-refine-epic-03
```

### Aplicação

```text
Node: 24.x
npm: 11.19.0
Next.js: 16.3.3
React: 19.2.8
@neondatabase/auth: 0.5.0-beta
```

O runtime já possui:

- cadastro controlado e OTP;
- login/logout;
- boundary privada server-side;
- papéis/autorização de produto;
- recovery e alteração de senha;
- gestão/revogação de sessões;
- auditoria Auth sanitizada;
- área privada `/account/security`.

Ainda não existem schema, rota ou UI funcional de perfil/privacidade.

### Neon non-production

```text
Project: caleida-nonprod / patient-glade-95136440
PostgreSQL: 18
Baseline: main / br-restless-cherry-awpcwy6r / ready
Managed Better Auth: enabled
Data API: não provisionada
Production Neon: não provisionada
Storage: não adotado pelo Caleida
Migrations integradas: 000001-000008
```

Branches de verificação históricas de US-AUTH-004 a US-AUTH-008 continuam existentes. Elas não são fonte de verdade, não bloqueiam este incremento e não serão apagadas sem autorização explícita porque a operação é destrutiva.

## 3. Revalidação técnica corrente

### 3.1 Neon Data API e RLS

A documentação oficial corrente confirma que:

- a Data API é configurada por branch e por banco;
- a Data API não possui um sistema de autorização paralelo ao PostgreSQL;
- `GRANT` define quais objetos um papel pode tocar;
- RLS define quais linhas esse papel pode acessar;
- JWT válido usa normalmente o papel PostgreSQL `authenticated`;
- acesso sem login usa o papel `anonymous` somente quando explicitamente habilitado;
- `auth.user_id()` extrai o claim `sub` como texto;
- `auth.uid()` converte o `sub` para UUID e retorna `NULL` quando o valor não é um UUID válido;
- RLS habilitada sem policy bloqueia acesso por padrão;
- expor uma tabela com RLS desabilitada permitiria leitura ampla conforme os grants existentes.

Consequências para o Caleida:

1. `authenticated` nunca será tratado como autorização suficiente.
2. Tabelas user-scoped expostas à Data API devem usar ownership por identidade JWT e RLS explícita para cada operação permitida.
3. `auth_user_id` continua UUID no domínio do Caleida; a Story deve revalidar `auth.uid()` e seu comportamento no ambiente Neon real antes de promover policies.
4. O Caleida não deve conceder acesso amplo ao schema `public` por conveniência. O schema de perfil deve receber somente grants mínimos para as tabelas/operações expostas.
5. A Data API somente será provisionada quando US-PRIV-001 realmente materializar o primeiro CRUD user-scoped que a utilize.
6. O SDK e a forma de integração devem ser revalidados na Story. A documentação corrente aponta `@neondatabase/neon-js` para Managed Better Auth, mas OPS-007 não adiciona dependências.

Fontes oficiais revalidadas em OPS-007:

- `docs/data-api/access-control.md`;
- `docs/data-api/get-started.md`;
- `docs/auth/guides/user-management.md`.

### 3.2 Identidade Auth versus perfil de produto

O diretório gerenciado `neon_auth` continua sendo fonte de identidade e sessão, não o modelo completo de perfil do Caleida.

O campo gerenciado de nome do Auth não substitui CAP-03. Username público, nome de exibição, biografia, cor de destaque, links permitidos, categorias favoritas e regras de visibilidade pertencem ao domínio de perfil do produto.

Não duplicar senha, token, e-mail de verificação ou sessão em tabela própria.

### 3.3 Exclusão da identidade gerenciada

A documentação corrente do Managed Better Auth declara suporte a exclusão de conta, mas a Story de finalização deve revalidar a API server-side e a exigência de reautenticação disponíveis naquele momento.

Não apagar diretamente linhas do schema gerenciado `neon_auth` como atalho. Se a superfície oficial não permitir finalização segura e verificável, US-PRIV-007 deve marcar `BLOCKED` e registrar a decisão necessária.

## 4. Decisões de escopo do incremento

### 4.1 Perfil básico

O perfil do Caleida começa pequeno:

- username público estável e único;
- nome de exibição;
- biografia opcional;
- cor de destaque restrita aos tokens aprovados do design system;
- links externos permitidos com validação de esquema e limites;
- categorias culturais favoritas, pois a taxonomia já é canônica e não depende do catálogo.

Ficam fora deste incremento:

- avatar e banner próprios, porque exigem EPIC-16/CAP-30 e decisão de Storage;
- obras favoritas, porque dependem de EPIC-04/CAP-06 e do catálogo global;
- organização modular rica do perfil, porque os módulos ainda não existem.

A UI não deve fabricar placeholders de upload, catálogo ou módulos futuros como se fossem funcionais.

### 4.2 Visibilidade

Os quatro níveis canônicos permanecem:

```text
public
followers
connections
only_me
```

Neste incremento:

- `only_me` é o default fail-closed;
- `public` pode ser selecionado quando a rota pública existir;
- `followers` e `connections` podem ser representados como estados canônicos de domínio, mas não são oferecidos como opção funcional antes de EPIC-13 criar essas relações;
- qualquer estado ainda sem relação social implementada deve resolver como privado para terceiros;
- owner continua autorizado a consultar e editar o próprio perfil;
- perfil privado não pode vazar por URL, ID, query alternativa, loading ou erro.

Privacidade por biblioteca, avaliações, resenhas, atividade, coleções, rankings, metas, estatísticas e favoritos será implementada junto de cada domínio correspondente. OPS-007 não cria tabelas de configuração para conteúdo inexistente.

### 4.3 Bloqueio, silenciamento e restrição

Bloqueio entra neste incremento porque já possui efeito verificável sobre perfil:

- relação direcional blocker -> blocked;
- auto-bloqueio proibido;
- duplicidade proibida;
- se qualquer lado bloqueou o outro, leitura do perfil entre as duas identidades é negada mesmo quando o perfil é público;
- owner pode listar e remover os próprios bloqueios;
- o predicado de bloqueio deve ser reutilizável por consultas sociais futuras.

Silenciamento e restrição de interação dependem de feed, comentários, recomendações ou outra superfície social real. Criar botões ou estados sem efeito seria fluxo falso. Eles ficam explicitamente adiados para EPIC-13, onde CAP-05 e CAP-26 se encontram.

### 4.4 Ciclo de conta

CAP-33 será dividido para impedir exclusão instantânea:

1. desativação reversível;
2. solicitação de exclusão com janela de cancelamento;
3. exportação de encerramento antes da exclusão;
4. finalização explícita somente após a janela;
5. revogação de sessões;
6. remoção, anonimização ou preservação conforme matriz de dados.

A janela inicial planejada é de 30 dias. Ela deve aparecer claramente na interface e nos testes e pode ser alterada futuramente por decisão de produto registrada.

Não haverá scheduler oculto neste incremento. Após o prazo, a exclusão definitiva será uma ação deliberada do próprio usuário, com reautenticação forte e confirmação destrutiva. Isso mantém a operação observável e evita automatizar destruição antes de existir a camada operacional do beta.

O export oferecido por CAP-33 será um pacote JSON versionado com os dados pessoais implementados até então. Ele não será apresentado como substituto da portabilidade completa de CAP-32/EPIC-17.

### 4.5 Arquivos e retenção

Como o Caleida ainda não armazena avatar/banner ou outros arquivos próprios, a primeira implementação de CAP-33 deve comprovar que não existem objetos a remover.

Quando EPIC-16 introduzir Storage, sua Definition of Done deve integrar os objetos ao contrato de exclusão antes de permitir uso real.

Registros de auditoria necessários para segurança podem ser preservados de forma minimizada/anônima. A Story de exclusão final deve documentar tabela por tabela o que é removido, anonimizado ou preservado e por quê.

## 5. Avaliação de arquitetura

OPS-007 não exige novo ADR.

As decisões existentes continuam suficientes:

- ADR-004: toda mudança persistente de schema por migration;
- ADR-005: Neon Postgres, Managed Better Auth, Data API quando apropriada e RLS;
- ADR-006: Storage provider-independent e decisão adiada;
- ADR-007: deployment Vercel somente humano/manual;
- ADR-008: PostgreSQL 18 para SQL portável e Neon isolado para comportamento específico do serviço;
- ADR-009: e-mail compartilhado atual em non-production.

Uma futura Story deve criar ADR antes de continuar se precisar:

- substituir a Data API por outro padrão de acesso como decisão geral;
- alterar o provedor de identidade;
- escolher um provedor de Storage;
- automatizar exclusão definitiva de contas com infraestrutura/scheduler materialmente novo.

## 6. Rastreabilidade de capacidades

| Capacidade | Cobertura no Incremento 3 | Dependência futura explícita |
|---|---|---|
| CAP-03 - Perfis e personalização | US-PRIV-001, 002, 003 | avatar/banner em EPIC-16; obras favoritas após EPIC-04; módulos ricos conforme surgirem domínios |
| CAP-05 - Privacidade, bloqueios e restrições | US-PRIV-001, 003, 004, 008 | followers/connections, mute e restrição com efeito real em EPIC-13; privacidade de cada conteúdo com seu domínio |
| CAP-33 - Desativação e exclusão | US-PRIV-005, 006, 007, 008 | exportação completa e recuperação ampla em EPIC-17; arquivos próprios quando EPIC-16 existir |

Requisitos transversais principais: NFR-01, NFR-02, NFR-03, NFR-04, NFR-05, NFR-07, NFR-08, NFR-09, NFR-10 e NFR-11.

## 7. Ordem das Stories

```text
US-PRIV-001 - perfil básico user-scoped + Data API/RLS
  ↓
US-PRIV-002 - personalização segura do perfil
  ↓
US-PRIV-003 - rota pública + visibilidade
  ↓
US-PRIV-004 - bloqueio e contrato de exclusão social
  ↓
US-PRIV-005 - desativação e reativação da conta
  ↓
US-PRIV-006 - solicitação/cancelamento + export de encerramento
  ↓
US-PRIV-007 - finalização segura da exclusão
  ↓
US-PRIV-008 - validação integrada + fechamento do incremento
```

A ordem cria primeiro um domínio privado com ownership real, só então abre leitura pública e depois adiciona bloqueio. O ciclo destrutivo de conta entra somente após o modelo de dados pessoal estar conhecido.

---

# US-PRIV-001 - Materializar perfil básico user-scoped com Data API e RLS

**Prioridade:** P0  
**Estado:** CONCLUÍDA  
**Dependências:** Incremento 2 concluído; ADR-004, ADR-005 e ADR-008; branch Neon isolada disponível  
**Capacidades:** CAP-03, fundação de CAP-05

## Narrativa

Como usuário autenticado, quero criar e editar a identidade básica do meu perfil para ter um registro próprio do Caleida protegido por ownership real.

## Objetivo

Criar o primeiro domínio user-scoped do produto e provar o caminho normal de dados com Data API + JWT + RLS antes de qualquer perfil público.

## Escopo

- revalidar documentação e versões correntes da Data API, Managed Better Auth, `auth.uid()`/`auth.user_id()` e SDK aplicável;
- criar branch Neon descartável `verify-us-priv-001` ou equivalente a partir da baseline non-production;
- criar migration nova, sem reescrever `000001-000008`, para o schema/tabela de perfil;
- persistir no núcleo inicial somente `auth_user_id`, `username`, `display_name`, `visibility`, timestamps e campos mínimos de integridade;
- usar UUID de identidade do Auth como ownership imutável;
- username normalizado, case-insensitive na unicidade, adequado a rota e protegido contra valores inválidos/reservados;
- default de visibilidade `only_me`;
- RLS habilitada desde a criação;
- owner autenticado pode SELECT/INSERT/UPDATE o próprio perfil;
- outro usuário e anônimo não conseguem ler ou alterar o perfil nesta Story;
- DELETE normal pela Data API não é liberado; remoção pertence ao ciclo de conta;
- payload não pode forjar nem transferir ownership;
- conceder somente schema/table privileges mínimos necessários ao papel da Data API;
- provisionar Data API somente na branch isolada durante a prova;
- configurar Managed Better Auth como provider da Data API sem broad grants no schema `public`;
- criar boundary de dados da aplicação sem credencial owner/BYPASSRLS no CRUD normal;
- criar superfície privada real em `/account/profile` ou rota equivalente para setup/edição de username e nome de exibição;
- tratar loading, erro, sucesso e perfil ainda não criado;
- após gates, promover somente migration/configuração deliberadamente aprovada para a baseline non-production e documentar o estado real;
- manter Production Neon e Vercel fora da Story.

## Critérios de aceite

1. usuário A cria e lê somente o próprio perfil;
2. usuário B conhecendo UUID ou username de A não lê nem altera o perfil por endpoint/query direta;
3. anônimo não lê o perfil antes da Story pública;
4. ownership não pode ser alterado por payload;
5. dois usernames equivalentes por case/normalização não podem coexistir;
6. perfil novo nasce `only_me`;
7. ausência/invalidade de JWT falha fechada;
8. credencial privilegiada não participa do fluxo normal de CRUD;
9. tabela exposta tem RLS e grants mínimos comprovados;
10. UI privada permite setup/edição real sem fabricar avatar, banner, favoritos ou visibilidade pública;
11. nenhum secret ou JWT é persistido em Git/logs/documentação;
12. migrations históricas permanecem intactas.

## Non-goals

- biografia, links e categorias favoritas;
- avatar/banner/upload/Storage;
- rota pública de perfil;
- acesso anônimo;
- seguidores/conexões;
- bloqueio/mute/restrict;
- desativação/exclusão;
- catálogo ou obras favoritas;
- Production Neon;
- deployment Vercel.

## Impactos

- **Banco:** nova migration e nova tabela user-scoped;
- **RLS:** obrigatório para SELECT/INSERT/UPDATE e ownership;
- **Data API:** primeira ativação deliberada em branch isolada, com promoção non-production somente após prova;
- **Storage:** nenhum;
- **Egress:** mínimo, apenas campos do próprio perfil;
- **Realtime:** nenhum;
- **E-mail:** nenhum;
- **Backup:** migration reproduzível; sem novo procedimento de backup nesta Story.

## Gates

- `npm run verify`: obrigatório;
- `npm run verify:db` em PostgreSQL 18 descartável: obrigatório;
- Neon-specific: obrigatório por Data API, Managed Better Auth e helper de identidade real;
- casos adversariais com pelo menos dois usuários sintéticos e anônimo: obrigatórios;
- browser real: obrigatório quando a superfície privada puder ser executada sem deployment; caso contrário, somente o gate visual intermediário pode ser `SKIPPED/deferred`, nunca RLS/Data API;
- deployment: proibido para IA.

## Bloqueio objetivo

Se a Data API não puder ser provisionada/testada em branch Neon isolada, se JWT do Managed Better Auth não puder ser validado no caminho planejado, ou se ownership não puder ser provado sem credencial privilegiada, marcar `BLOCKED`. Não usar a baseline Neon `main` como laboratório e não enfraquecer RLS para prosseguir.

---

# US-PRIV-002 - Adicionar personalização segura do perfil

**Prioridade:** P1  
**Estado:** CONCLUÍDA  
**Dependência:** US-PRIV-001  
**Capacidade:** CAP-03

Adicionar biografia, cor de destaque baseada em tokens aprovados, links HTTPS permitidos com limites e categorias culturais favoritas da taxonomia canônica.

Deve validar tamanho/formato no servidor e no banco quando aplicável, neutralizar URLs perigosas, manter acessibilidade/contraste e preservar ownership. Não cria avatar/banner, Storage, obras favoritas ou módulos inexistentes.

---

# US-PRIV-003 - Publicar perfil com visibilidade fail-closed

**Prioridade:** P0  
**Estado:** CONCLUÍDA  
**Dependência:** US-PRIV-002  
**Capacidades:** CAP-03, CAP-05

Criar rota pública por username e aplicar visibilidade no servidor e no banco.

Regras mínimas:

- owner sempre consegue consultar o próprio perfil autenticado;
- `public` pode ser lido conforme política;
- `only_me` não vaza para terceiros;
- `followers` e `connections`, enquanto sem relações implementadas, resolvem como privados e não aparecem como escolha funcional;
- perfil inexistente e perfil não autorizado não devem revelar dados privados por diferença indevida de payload;
- acesso direto por UUID/username deve obedecer a mesma política da UI;
- acesso anônimo somente recebe colunas deliberadamente públicas;
- nenhuma policy concede UPDATE/DELETE a anônimo.

Gate Neon-specific é obrigatório se a leitura pública usar papel `anonymous`/Data API.

---

# US-PRIV-004 - Implementar bloqueio com efeito real

**Prioridade:** P0  
**Estado:** CONCLUÍDA  
**Dependência:** US-PRIV-003  
**Capacidade:** CAP-05

Criar relação persistente de bloqueio e integrar o predicado à leitura do perfil.

Critérios centrais:

- blocker e blocked distintos;
- par duplicado impossível;
- usuário só cria/lista/remove seus próprios bloqueios;
- se A bloqueia B, A e B não acessam o perfil um do outro como relação autenticada, ainda que público;
- IDOR por endpoint/ID continua negado;
- consultas futuras devem ter um helper/contrato claro para incorporar bloqueio;
- nenhum botão de mute/restrict é criado sem efeito real.

---

# US-PRIV-005 - Implementar desativação e reativação reversíveis

**Prioridade:** P0  
**Estado:** PRONTA / próxima ação  
**Dependência:** US-PRIV-004  
**Capacidade:** CAP-33

Introduzir estado de conta de produto separado do Auth gerenciado.

Desativação deve:

- exigir autenticação e confirmação explícita;
- esconder perfil de terceiros imediatamente;
- impedir uso normal das áreas privadas até reativação;
- revogar sessões conforme contrato seguro da aplicação;
- preservar dados pessoais;
- permitir novo login somente para uma superfície restrita de reativação/encerramento;
- registrar evento de auditoria sem payload sensível.

Reativação deve restaurar acesso sem recriar dados ou identidade.

---

# US-PRIV-006 - Solicitar/cancelar exclusão e oferecer export de encerramento

**Prioridade:** P0  
**Estado:** A FAZER  
**Dependência:** US-PRIV-005  
**Capacidade:** CAP-33

Criar solicitação de exclusão com janela inicial de 30 dias.

Durante a janela:

- dados não são destruídos;
- conta fica restrita;
- usuário vê data mínima de finalização e consequências;
- solicitação pode ser cancelada;
- sessões e superfícies normais seguem política restritiva;
- é oferecido download JSON versionado dos dados pessoais atualmente implementados;
- o export não inclui senha, token, cookie, segredo ou auditoria interna desnecessária;
- o produto deixa claro que a exportação completa de CAP-32 será ampliada em EPIC-17.

Não executa exclusão definitiva.

---

# US-PRIV-007 - Finalizar exclusão de conta com matriz de dados

**Prioridade:** P0  
**Estado:** A FAZER  
**Dependência:** US-PRIV-006  
**Capacidade:** CAP-33

Após a janela, permitir finalização somente por ação explícita do usuário e reautenticação forte suportada pelo provider corrente.

Antes de remover qualquer identidade:

- inventariar tabelas user-scoped existentes;
- documentar matriz `delete | anonymize | preserve` e justificativa;
- revogar todas as sessões;
- apagar dados pessoais que devem ser removidos;
- anonimizar referências de auditoria quando retenção for necessária;
- confirmar inexistência de arquivos próprios no estado atual;
- usar API oficial do Managed Better Auth para excluir a identidade;
- tornar a operação idempotente/recuperável até o limite tecnicamente possível;
- impedir finalização antes do prazo ou por outro usuário.

Se a API oficial de Auth não oferecer finalização segura no momento da Story, marcar `BLOCKED`; não escrever diretamente no schema `neon_auth` como workaround.

---

# US-PRIV-008 - Validar integralmente privacidade e fechar o Incremento 3

**Prioridade:** P0  
**Estado:** A FAZER  
**Dependências:** US-PRIV-001 a US-PRIV-007  
**Capacidades:** CAP-03, CAP-05, CAP-33

Consolidar migrations/RLS/auditoria e executar matriz integrada com identidades sintéticas.

Cobertura mínima:

- owner versus outro usuário versus anônimo;
- leitura por username e ID conhecido;
- visibilidade pública/privada;
- estados sociais reservados fail-closed;
- bloqueio nos dois sentidos;
- tentativa de forjar ownership;
- deativação e reativação;
- solicitação/cancelamento de exclusão;
- export pré-exclusão;
- tentativa de finalizar antes do prazo;
- finalização de usuário sintético elegível;
- sessão revogada após estados críticos;
- ausência de flash de conteúdo privado;
- mobile, desktop, teclado/foco e erros críticos de console;
- nenhuma regressão no Incremento 2.

O gate live acumulado pode usar release candidate manual somente se necessário e somente pelo usuário conforme ADR-007. A IA não publica.

## 8. Porta de saída do incremento

O Incremento 3 pode ser encerrado quando:

- US-PRIV-001 a US-PRIV-008 estiverem concluídas;
- perfil próprio e perfil público funcionarem com persistência real;
- RLS/GRANTs impedirem IDOR/BOLA;
- bloqueio prevalecer sobre visibilidade pública entre usuários autenticados;
- desativação for reversível;
- exclusão não for instantânea e possuir cancelamento/export/finalização segura;
- matriz de exclusão estiver documentada;
- todos os gates técnicos e live aplicáveis estiverem PASS ou SKIPPED com justificativa válida;
- nenhum fluxo falso de Storage, catálogo ou comunidade tiver sido introduzido;
- documentação canônica estiver reconciliada.

CAP-03 e CAP-05 permanecerão com extensões futuras deliberadas onde suas dependências ainda não existem. Isso não autoriza marcar avatar/banner, obras favoritas, followers/connections, mute/restrict ou privacidade de domínios futuros como implementados.

## 9. Estado operacional após US-PRIV-004

US-PRIV-001 a US-PRIV-004 estão concluídas.

```text
Issue #67: closed/completed
PR #68: merged
Feature head final: 874cb989aec13848c48901ac351980d870f0f935
Merge: 4eaa0b44dbe76354ea86f590b22a3acab157353d
CI final PR #303 / 35361184117 / job 105652550427: SUCCESS
CI pós-merge main #304 / 35361379171 / job 105653192533: SUCCESS
PostgreSQL 18 + verify:db: PASS
Neon isolated: verify-us-priv-004 / br-curly-fog-aw1c1hpo: PASS
Baseline ledger: 000001-000013
Schema diff isolated vs baseline: vazio
```

Promover somente:

> `US-PRIV-005 - Implementar desativação e reativação reversíveis`

Não iniciar US-PRIV-006 nem antecipar Storage, Production Neon ou deployment Vercel.
