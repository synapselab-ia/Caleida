# AGENTS.md — Caleida

Este arquivo define as regras obrigatórias para qualquer agente de IA que trabalhe neste repositório.

## 1. Recuperação canônica antes de editar

Antes de qualquer alteração:

1. inspecione o estado real do repositório, branch padrão e commits recentes relevantes;
2. leia `docs/PROJECT_DESIGN.md`;
3. leia os amendments ativos do Project Design: `docs/PROJECT_DESIGN_PLATFORM_AMENDMENT.md` e `docs/PROJECT_DESIGN_DEPLOYMENT_AMENDMENT.md`;
4. leia `00_SYSTEM/SOURCE_OF_TRUTH.md`;
5. leia `00_SYSTEM/AI_WORK_PROTOCOL.md`;
6. leia `docs/CHECKPOINT.md`;
7. leia `docs/EXECUTION_PLAN.md` e a tarefa indicada por `NEXT_ACTION`;
8. leia `00_SYSTEM/VERIFICATION_PROTOCOL.md`;
9. leia `00_SYSTEM/DEPLOYMENT_POLICY.md`;
10. leia `docs/adr/README.md` e os ADRs aplicáveis;
11. consulte `docs/ARCHITECTURE.md`, `docs/NEON_PLATFORM.md`, `docs/PRODUCT_BACKLOG.md` e documentos de domínio relacionados quando aplicáveis;
12. use `docs/DECISIONS.md` apenas para histórico e decisões não arquiteturais;
13. verifique Issue, branch e PR ativos quando existirem;
14. inspecione implementação, migrations, testes e dependências relevantes antes de propor mudanças.

O histórico de um chat não substitui o repositório.

## 2. Fonte de verdade

A precedência entre artefatos é definida em `00_SYSTEM/SOURCE_OF_TRUTH.md`.

Regras essenciais:

- `docs/PROJECT_DESIGN.md` v1.0 continua a base de produto;
- amendments aprovados integram o Project Design e prevalecem somente no escopo declarado;
- ADRs `Accepted` em `docs/adr/` são a fonte canônica das decisões arquiteturais;
- ADRs `Superseded` permanecem históricos e não governam trabalho novo na parte substituída;
- `docs/DECISIONS.md` é índice/histórico legado e não compete com ADRs;
- `docs/CHECKPOINT.md` define o estado operacional e a `NEXT_ACTION`;
- `docs/EXECUTION_PLAN.md` define ordem e critérios operacionais;
- `docs/STATUS.md` é snapshot histórico;
- decisões de arquitetura não podem ser alteradas silenciosamente;
- quando documentação e GitHub divergirem, confronte o estado real e reconcilie os artefatos antes de continuar trabalho dependente.

## 3. Regra de escopo

- Execute somente a `NEXT_ACTION`, salvo mudança explícita do usuário ou bloqueio real.
- Não antecipe funcionalidades de incrementos futuros.
- Não refatore áreas não relacionadas sem necessidade demonstrável.
- Não crie requisitos de negócio por conveniência técnica.
- Não use dados fictícios para sustentar funcionalidade declarada concluída fora de testes/seeds apropriados.
- Se uma tarefa crescer além de uma unidade revisável, divida-a no plano antes de implementar.

## 4. Arquitetura canônica

ADRs vigentes principais:

- `ADR-001` — catálogo global separado da biblioteca pessoal;
- `ADR-004` — mudanças de banco somente por migrations;
- `ADR-005` — Neon Postgres/Auth/Data API/RLS;
- `ADR-006` — Object Storage provider-independent e ainda não escolhido;
- `ADR-007` — deployment Vercel exclusivamente humano/manual.

Histórico relevante:

- `ADR-002` — stack técnica original, superseded em partes;
- `ADR-003` — Supabase Free temporário, superseded por `ADR-005`.

Referências históricas a Supabase e Preview automático não governam a implementação quando abrangidas pelos ADRs/amendments posteriores.

Mudanças materiais de plataforma, autenticação, banco, Storage, hosting, autorização ou integração externa exigem novo ADR ou supersessão explícita antes ou na mesma unidade coerente de mudança.

## 5. Banco de dados

Quando a implementação de banco começar:

- migrations canônicas ficam em `database/migrations/`;
- testes de banco ficam em `database/tests/`;
- toda mudança estrutural deve ser migration versionada;
- não faça mudança canônica somente por Neon Console/dashboard;
- não reescreva migration já aplicada para alterar história;
- cada migration deve considerar constraints, índices, autorização, testes e recuperação;
- RLS deve existir desde a primeira tabela privada/user-scoped exposta relevante;
- nunca use Production para testes destrutivos;
- use branch Neon isolada e descartável do projeto non-production para verificação de schema/RLS quando aplicável;
- credencial owner/BYPASSRLS não serve para provar autorização normal de usuário;
- autenticação pelo papel `authenticated` não substitui predicados de ownership/visibilidade;
- helper, roles, grants e APIs da Neon Data API devem ser revalidados contra documentação oficial atual na tarefa que os implementar.

O tooling exato de migrations deve ser o mais simples e reproduzível adequado ao projeto. Não introduza ORM apenas para administrar migrations sem necessidade demonstrada.

## 6. Segurança e secrets

Nunca grave no repositório, Issues, PRs, logs persistentes ou documentação:

- senhas;
- tokens;
- connection strings privadas;
- Neon API keys;
- Vercel tokens;
- chaves administrativas;
- credenciais de APIs;
- secrets de autenticação/cookie;
- OAuth client secrets;
- dados pessoais reais usados como teste.

Nenhuma chave secreta deve ser exposta ao browser por conveniência.

Não desabilite autorização, RLS ou validação para fazer uma tarefa passar.

## 7. Qualidade mínima

Uma tarefa não está concluída enquanto os gates aplicáveis de `00_SYSTEM/VERIFICATION_PROTOCOL.md` não forem executados ou registrados como `SKIPPED`/`BLOCKED` com motivo.

Quando aplicável, verificar:

- validação de entrada;
- autorização no servidor e no banco;
- estados de loading/vazio/erro;
- responsividade;
- acessibilidade básica;
- testes unitários/integrados/E2E adequados ao estágio;
- testes adversariais de autorização;
- lint;
- typecheck;
- testes;
- build;
- diff completo;
- documentação atualizada.

Nunca declare verificação que não ocorreu.

## 8. Plataformas externas

Para Next.js, React, Neon Postgres/Auth/Data API, Vercel, APIs de catálogo, e-mail, Storage ou qualquer serviço de evolução rápida:

- consulte documentação oficial atual quando a tarefa depender de comportamento, API, SDK, limites ou configuração corrente;
- não confie exclusivamente em memória do modelo;
- registre mudanças materiais de arquitetura/custos/privacidade em ADR/amendment quando aplicável;
- revalide limites e configuração antes de decisões operacionais ou financeiras.

## 9. Storage

`ADR-006` mantém Object Storage desacoplado e não escolhido.

Até existir Story própria:

- não crie buckets antecipadamente;
- não assuma Neon Object Storage como dependência canônica;
- preserve capas externas por URL quando permitido;
- modele metadados futuros de arquivo sem acoplamento desnecessário ao provedor.

## 10. Deployment

Siga `00_SYSTEM/DEPLOYMENT_POLICY.md`, `ADR-007` e `docs/PROJECT_DESIGN_DEPLOYMENT_AMENDMENT.md`.

Regras obrigatórias:

- deployment não é verificação;
- push, branch, PR ou merge não podem gerar deployment automático;
- quando `vercel.json` existir, manter `git.deploymentEnabled: false` enquanto a política atual estiver vigente, sujeito à documentação oficial corrente;
- IA não executa Preview, Production, promote, rollback, redeploy ou deploy hooks;
- IA não cria workflow de CI que publique na Vercel;
- somente o usuário executa deployments manualmente;
- IA pode preparar runbook, validar pré-condições e diagnosticar deployment já executado.

Uma solicitação de continuação do projeto não autoriza deployment.

## 11. Fluxo Git

Fluxo preferencial:

```text
NEXT_ACTION / Issue
  ↓
branch
  ↓
implementação/documentação
  ↓
verificação
  ↓
PR
  ↓
review
  ↓
merge
  ↓
sem deploy automático
```

- uma frente principal por vez, salvo aprovação explícita;
- commits devem ser semanticamente claros;
- não faça push silencioso de mudança relevante na `main`;
- PR deve explicar escopo, motivação, validação, riscos e migrations quando aplicável;
- `main` deve permanecer recuperável e compreensível.

## 12. Estados de trabalho

Use:

- `READY`;
- `IN_PROGRESS`;
- `BLOCKED`;
- `ON_HOLD`;
- `MANUAL_ACTION_REQUIRED`;
- `DONE`.

Uma frente `ON_HOLD` não é a frente ativa. Não fabrique dados, deploys ou atividade artificial para desbloqueá-la.

Quando uma release externa for necessária e depender do usuário, registre `MANUAL_ACTION_REQUIRED` sem executar a ação humana.

## 13. Encerramento obrigatório

Ao concluir uma tarefa:

1. revise o diff completo;
2. execute os gates aplicáveis;
3. informe migrations criadas/modificadas, se houver;
4. registre limitações e riscos reais;
5. atualize `docs/CHECKPOINT.md`;
6. atualize `docs/CHANGELOG.md` quando aplicável;
7. atualize/crie ADRs e documentação de arquitetura quando houver mudança material;
8. deixe uma única `NEXT_ACTION` clara e executável;
9. não declare conclusão sem evidência verificável.

## 14. Experiência de continuidade

O projeto deve poder ser retomado em um chat novo com:

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

Se a informação já estiver no repositório ou puder ser obtida pelas ferramentas disponíveis, não peça ao usuário para repeti-la.
