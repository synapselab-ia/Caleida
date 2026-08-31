# AGENTS.md — Caleida

Este arquivo define as regras obrigatórias para qualquer agente de IA que trabalhe neste repositório.

## 1. Recuperação canônica antes de editar

Antes de qualquer alteração:

1. inspecione o estado real do repositório, branch padrão e commits recentes relevantes;
2. leia `docs/PROJECT_DESIGN.md`;
3. leia `00_SYSTEM/SOURCE_OF_TRUTH.md`;
4. leia `00_SYSTEM/AI_WORK_PROTOCOL.md`;
5. leia `docs/CHECKPOINT.md`;
6. leia `docs/EXECUTION_PLAN.md` e a tarefa indicada por `NEXT_ACTION`;
7. leia `00_SYSTEM/VERIFICATION_PROTOCOL.md`;
8. leia `00_SYSTEM/DEPLOYMENT_POLICY.md`;
9. consulte `docs/ARCHITECTURE.md`, `docs/PRODUCT_BACKLOG.md`, `docs/DECISIONS.md` e documentos de domínio relacionados quando aplicáveis;
10. verifique Issue, branch e PR ativos quando existirem;
11. inspecione implementação, migrations, testes e dependências relevantes antes de propor mudanças.

O histórico de um chat não substitui o repositório.

## 2. Fonte de verdade

A precedência entre artefatos é definida em `00_SYSTEM/SOURCE_OF_TRUTH.md`.

Regras essenciais:

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

## 4. Arquitetura

A arquitetura vigente deve ser lida dos documentos canônicos e das decisões aceitas atuais.

Não assuma stack ou provedor apenas por memória. O Project Design inicial contém decisões históricas que podem ser formalmente superseded em tarefas posteriores.

Mudanças materiais de plataforma, autenticação, banco, storage, hosting, autorização ou integração externa exigem registro explícito da decisão antes ou na mesma unidade coerente de mudança.

## 5. Banco de dados

Quando houver banco implementado:

- toda mudança estrutural deve ser migration versionada;
- não faça mudança canônica somente por dashboard/console;
- não reescreva migration já aplicada para alterar a história;
- cada migration deve considerar constraints, índices, autorização, testes e recuperação;
- RLS/autorização persistente deve existir desde a primeira tabela exposta relevante;
- nunca use produção para testes destrutivos;
- use ambiente isolado e descartável para verificação de schema quando possível;
- credencial owner/BYPASSRLS não serve para provar autorização normal de usuário.

## 6. Segurança e secrets

Nunca grave no repositório, Issues, PRs, logs persistentes ou documentação:

- senhas;
- tokens;
- connection strings privadas;
- chaves administrativas;
- credenciais de APIs;
- secrets de autenticação;
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

Para Next.js, React, provedor de banco/auth, Vercel, APIs de catálogo, e-mail, storage ou qualquer serviço de evolução rápida:

- consulte documentação oficial atual quando a tarefa depender de comportamento, API, SDK, limites ou configuração corrente;
- não confie exclusivamente em memória do modelo;
- registre mudanças materiais de arquitetura/custos/privacidade.

## 9. Deployment

Siga `00_SYSTEM/DEPLOYMENT_POLICY.md`.

Deployment não é verificação. Nenhum push, branch ou PR concede autorização automática para publicar Preview ou Production.

Não configure ou execute deployment automático sem autorização canônica explícita.

## 10. Fluxo Git

Fluxo preferencial:

```text
NEXT_ACTION / Issue
  ↓
branch
  ↓
implementação
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

## 11. Estados de trabalho

Use os estados definidos no protocolo:

- `READY`;
- `IN_PROGRESS`;
- `BLOCKED`;
- `ON_HOLD`;
- `MANUAL_ACTION_REQUIRED`;
- `DONE`.

Uma frente `ON_HOLD` não é a frente ativa. Não fabrique dados, deploys ou atividade artificial apenas para desbloqueá-la.

## 12. Encerramento obrigatório

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

## 13. Experiência de continuidade

O projeto deve poder ser retomado em um chat novo com:

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

Se a informação já estiver no repositório ou puder ser obtida pelas ferramentas disponíveis, não peça ao usuário para repeti-la.