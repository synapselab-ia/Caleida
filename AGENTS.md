# AGENTS.md — Caleida

Este arquivo define as regras obrigatórias para qualquer agente de IA que trabalhe neste repositório.

## 1. Recuperação canônica antes de editar

Antes de qualquer alteração:

1. inspecione o estado real do repositório, branch padrão e commits recentes relevantes;
2. leia `docs/PROJECT_DESIGN.md`;
3. leia os amendments ativos do Project Design, atualmente `docs/PROJECT_DESIGN_PLATFORM_AMENDMENT.md`;
4. leia `00_SYSTEM/SOURCE_OF_TRUTH.md`;
5. leia `00_SYSTEM/AI_WORK_PROTOCOL.md`;
6. leia `docs/CHECKPOINT.md`;
7. leia `docs/EXECUTION_PLAN.md` e a tarefa indicada por `NEXT_ACTION`;
8. leia `00_SYSTEM/VERIFICATION_PROTOCOL.md`;
9. leia `00_SYSTEM/DEPLOYMENT_POLICY.md`;
10. consulte `docs/ARCHITECTURE.md`, `docs/NEON_PLATFORM.md`, `docs/PRODUCT_BACKLOG.md`, `docs/DECISIONS.md` e documentos de domínio relacionados quando aplicáveis;
11. verifique Issue, branch e PR ativos quando existirem;
12. inspecione implementação, migrations, testes e dependências relevantes antes de propor mudanças.

O histórico de um chat não substitui o repositório.

## 2. Fonte de verdade

A precedência entre artefatos é definida em `00_SYSTEM/SOURCE_OF_TRUTH.md`.

Regras essenciais:

- `docs/PROJECT_DESIGN.md` v1.0 continua a base de produto;
- amendments aprovados integram o Project Design e prevalecem somente no escopo declarado;
- o amendment ativo de plataforma é `docs/PROJECT_DESIGN_PLATFORM_AMENDMENT.md`;
- não use `docs/STATUS.md` como cursor atual; ele é snapshot histórico;
- `docs/CHECKPOINT.md` define o estado operacional e a `NEXT_ACTION`;
- `docs/EXECUTION_PLAN.md` define ordem e critérios operacionais;
- decisões de arquitetura não podem ser alteradas silenciosamente;
- quando documentação e GitHub divergirem, confronte o estado real e reconcilie os artefatos antes de continuar trabalho dependente.

## 3. Regra de escopo

- Execute somente a `NEXT_ACTION`, salvo mudança explícita do usuário ou bloqueio real.
- Não antecipe funcionalidades de incrementos futuros.
- Não refatore áreas não relacionadas sem necessidade demonstrável.
- Não crie requisitos de negócio por conveniência técnica.
- Não use dados fictícios para sustentar uma funcionalidade declarada concluída fora de testes/seeds apropriados.
- Se uma tarefa crescer além de uma unidade revisável, divida-a no plano antes de implementar.

## 4. Arquitetura canônica

A arquitetura vigente deve ser lida dos documentos canônicos e das decisões aceitas atuais.

Após OPS-002:

- Neon Postgres é o banco canônico;
- Neon Auth é a solução inicial de identidade;
- Neon Data API é o caminho preferencial para CRUD normal sob contexto de usuário quando apropriado;
- PostgreSQL RLS é a camada persistente de autorização;
- Production e non-production usam projetos Neon separados;
- branches Neon descartáveis de verificação pertencem ao projeto non-production;
- Object Storage permanece provider-independent e ainda não foi escolhido;
- Vercel permanece destino de hosting, mas deployment segue `00_SYSTEM/DEPLOYMENT_POLICY.md`.

Referências a Supabase no Project Design v1.0, DEC-003 ou DEC-004 são históricas e explicitamente superseded por `DEC-007` e pelo amendment de plataforma. Não as trate como stack ativa.

Mudanças materiais de plataforma, autenticação, banco, Storage, hosting, autorização ou integração externa exigem registro explícito da decisão antes ou na mesma unidade coerente de mudança.

## 5. Banco de dados

Quando a implementação de banco começar:

- migrations canônicas ficam em `database/migrations/`;
- testes de banco ficam em `database/tests/`;
- toda mudança estrutural deve ser migration versionada;
- não faça mudança canônica somente por Neon Console/dashboard;
- não reescreva migration já aplicada para alterar a história;
- cada migration deve considerar constraints, índices, autorização, testes e recuperação;
- RLS deve existir desde a primeira tabela privada/user-scoped exposta relevante;
- nunca use Production para testes destrutivos;
- use branch Neon isolada e descartável do projeto non-production para verificação de schema/RLS quando aplicável;
- credencial owner/BYPASSRLS não serve para provar autorização normal de usuário;
- autenticação pelo papel `authenticated` não substitui predicados de ownership/visibilidade;
- helper, roles, grants e APIs da Neon Data API devem ser revalidados contra documentação oficial atual na tarefa que os implementar.

O tooling exato de migrations deve ser o mais simples e reproduzível adequado ao projeto. Não introduza ORM apenas para administrar migrations sem necessidade de domínio demonstrada.

## 6. Segurança e secrets

Nunca grave no repositório, Issues, PRs, logs persistentes ou documentação:

- senhas;
- tokens;
- connection strings privadas;
- Neon API keys;
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
- registre mudanças materiais de arquitetura/custos/privacidade;
- revalide limites de Free tier antes de decisões operacionais ou financeiras.

## 9. Storage

`DEC-008` mantém Object Storage desacoplado e não escolhido.

Até existir Story própria:

- não crie buckets antecipadamente;
- não assuma Neon Object Storage como dependência canônica;
- preserve capas externas por URL quando permitido;
- modele metadados futuros de arquivo sem acoplamento desnecessário ao provedor.

Na Story de arquivos, reavalie o estado corrente do Neon Object Storage e alternativas S3-compatible quanto a maturidade, privacidade, autorização, regiões, lifecycle, backup e custo.

## 10. Deployment

Siga `00_SYSTEM/DEPLOYMENT_POLICY.md`.

Deployment não é verificação. Nenhum push, branch ou PR concede autorização automática para publicar Preview ou Production.

Não configure ou execute deployment automático sem autorização canônica explícita.

A contradição histórica de Preview automático do Project Design v1.0 será formalmente reconciliada em `OPS-003`. Até lá, a política operacional de deployment controlado prevalece para execução.

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
```

- uma frente principal por vez, salvo aprovação explícita;
- commits devem ser semanticamente claros;
- não faça push silencioso de mudança relevante na `main`;
- PR deve explicar escopo, motivação, validação, riscos e migrations quando aplicável;
- `main` deve permanecer recuperável e compreensível.

## 12. Estados de trabalho

Use os estados definidos no protocolo:

- `READY`;
- `IN_PROGRESS`;
- `BLOCKED`;
- `ON_HOLD`;
- `MANUAL_ACTION_REQUIRED`;
- `DONE`.

Uma frente `ON_HOLD` não é a frente ativa. Não fabrique dados, deploys ou atividade artificial apenas para desbloqueá-la.

## 13. Encerramento obrigatório

Ao concluir uma tarefa:

1. revise o diff completo;
2. execute os gates aplicáveis;
3. informe migrations criadas/modificadas, se houver;
4. registre limitações e riscos reais;
5. atualize `docs/CHECKPOINT.md`;
6. atualize `docs/CHANGELOG.md` quando aplicável;
7. atualize decisões/documentação de arquitetura quando houver mudança material;
8. deixe uma única `NEXT_ACTION` clara e executável;
9. não declare conclusão sem evidência verificável.

## 14. Experiência de continuidade

O projeto deve poder ser retomado em um chat novo com:

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

Se a informação já estiver no repositório ou puder ser obtida pelas ferramentas disponíveis, não peça ao usuário para repeti-la.
