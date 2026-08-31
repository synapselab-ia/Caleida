# AI Work Protocol — Caleida

**Status:** protocolo operacional canônico  
**Aplica-se a:** qualquer sessão de ChatGPT/IA que trabalhe neste repositório

## 1. Comando canônico de continuação

Uma nova sessão pode ser iniciada com:

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

A sessão deve recuperar o estado pelo repositório. O usuário não deve ser obrigado a reconstruir decisões, colar prompts antigos ou descrever novamente tarefas já registradas.

## 2. Sequência obrigatória de início

Antes de alterar qualquer arquivo:

1. inspecione a estrutura do repositório, a branch padrão e os commits recentes relevantes;
2. leia `docs/PROJECT_DESIGN.md`;
3. leia `00_SYSTEM/SOURCE_OF_TRUTH.md`;
4. leia este protocolo;
5. leia `docs/CHECKPOINT.md`;
6. leia `docs/EXECUTION_PLAN.md` e a entrada indicada por `NEXT_ACTION`;
7. leia `00_SYSTEM/VERIFICATION_PROTOCOL.md`;
8. leia `00_SYSTEM/DEPLOYMENT_POLICY.md`;
9. leia `docs/ARCHITECTURE.md`, `docs/PRODUCT_BACKLOG.md` e decisões relacionadas quando aplicáveis;
10. verifique Issue, branch e PR da frente ativa, se existirem;
11. inspecione código, migrations, testes, dependências e documentação diretamente relacionados à tarefa;
12. quando a tarefa tocar tecnologia externa de evolução rápida, confirme a documentação oficial atual antes de implementar.

Não pergunte ao usuário por algo que possa ser recuperado com segurança desses artefatos ou das ferramentas disponíveis.

## 3. Uma tarefa limitada por vez

Execute somente a tarefa definida por `NEXT_ACTION`, salvo:

- mudança explícita de prioridade pelo usuário;
- bloqueio real que exija uma correção prévia mínima;
- inconsistência documental que impeça saber com segurança o que executar.

Não expanda escopo silenciosamente. Não antecipe features futuras, refactors amplos, frameworks, infraestrutura ou dependências sem necessidade demonstrável.

Uma tarefa deve produzir uma unidade coerente e revisável. Se ficar grande demais, divida-a no `EXECUTION_PLAN` antes de continuar.

## 4. Inspecionar antes de editar

Nunca presuma que o repositório ainda corresponde a uma conversa antiga ou a um documento de status desatualizado.

Antes de editar, verifique o que já existe para evitar:

- recriar funcionalidade pronta;
- sobrescrever decisões mais recentes;
- duplicar migrations;
- introduzir segunda implementação concorrente para a mesma responsabilidade;
- reabrir trabalho concluído sem evidência.

## 5. Estados operacionais

Use estes estados de forma consistente:

- `READY` — existe próxima ação executável e nenhum bloqueio conhecido;
- `IN_PROGRESS` — há uma frente ativa em execução;
- `BLOCKED` — a tarefa não pode continuar sem resolver impedimento técnico ou decisão obrigatória;
- `ON_HOLD` — a frente depende de condição externa objetiva e não é a frente ativa;
- `MANUAL_ACTION_REQUIRED` — a próxima etapa exige ação humana externa que a sessão não pode ou não deve executar;
- `DONE` — não há trabalho restante no escopo indicado.

Issue aberta não significa automaticamente tarefa ativa.

## 6. Segurança e secrets

Nunca grave em código, documentação, Issues, commits, logs ou respostas persistentes:

- senhas;
- tokens;
- connection strings privadas;
- chaves administrativas;
- secrets de APIs;
- credenciais de banco;
- dados pessoais reais usados apenas como teste.

Não enfraqueça autorização, RLS, validação ou isolamento para fazer um teste passar.

## 7. Banco de dados

Quando houver banco implementado:

- toda mudança persistente de schema deve ser migration versionada;
- não altere migration já aplicada para reescrever história;
- correções usam nova migration;
- testes de autorização devem usar identidades normais da aplicação, não owner/BYPASSRLS como prova de acesso de usuário;
- operações destrutivas de verificação devem ocorrer em ambiente descartável, nunca na base canônica de produção;
- schema, constraints, índices, autorização, testes e recuperação devem ser tratados como uma única responsabilidade coerente quando aplicável.

A plataforma de banco vigente deve ser determinada pelas decisões canônicas atuais; não assuma provedor por memória.

## 8. Provedores externos

APIs externas são integrações, não fontes silenciosas de autoridade sobre dados pessoais do usuário.

Ao integrar catálogo, imagens, autenticação, e-mail ou outros serviços:

- use documentação oficial atual;
- minimize campos e permissões;
- preserve limites entre dados canônicos e dados derivados/externos;
- mantenha secrets fora do cliente;
- registre decisões materiais de persistência, cache, privacidade ou custo.

## 9. Verificação faz parte da tarefa

Uma tarefa não está concluída até que os gates aplicáveis de `00_SYSTEM/VERIFICATION_PROTOCOL.md` tenham sido realmente executados ou marcados `SKIPPED` com justificativa.

Nunca declare que um comando, teste ou inspeção foi executado quando não foi.

## 10. Git workflow

Fluxo preferencial:

```text
NEXT_ACTION / Issue
  ↓
branch de trabalho
  ↓
implementação/documentação
  ↓
verificação
  ↓
pull request
  ↓
review
  ↓
merge
```

Regras:

- uma frente principal por vez, salvo paralelismo explicitamente aprovado;
- commits pequenos e semanticamente claros;
- alterações relevantes não devem entrar silenciosamente na `main`;
- PRs devem explicar escopo, motivação, verificação, riscos, migrations e limitações quando aplicável;
- a `main` deve representar estado integrado e recuperável.

## 11. Deployment

Deploy não é sinônimo de verificação.

Siga `00_SYSTEM/DEPLOYMENT_POLICY.md`. Nenhuma sessão possui permissão implícita para disparar ou configurar deploy automático apenas porque a aplicação usa Vercel ou porque uma PR existe.

## 12. Encerramento obrigatório

Ao concluir trabalho relevante:

1. revise o diff completo;
2. confirme que não há mudança fora do escopo;
3. execute os gates aplicáveis;
4. atualize documentação canônica afetada;
5. atualize `docs/CHECKPOINT.md` com estado real, verificação, blockers e `NEXT_ACTION`;
6. atualize `docs/CHANGELOG.md` quando houver mudança relevante;
7. atualize decisões quando arquitetura ou produto mudarem;
8. deixe a próxima ação executável por uma sessão nova.

## 13. Política de interação com o usuário

O objetivo é desenvolvimento de baixa operação manual.

Não peça ao usuário para executar comandos, copiar arquivos, escrever migrations ou repetir contexto quando as ferramentas disponíveis puderem realizar o trabalho com segurança.

Peça intervenção somente para ações genuinamente externas, como:

- fornecer ou configurar secret que não pode ser inferido;
- concluir consentimento OAuth;
- aprovar custo/billing;
- executar deployment manual quando a política exigir;
- tomar decisão de produto realmente aberta e não defaultável com segurança.

## 14. Decisão bloqueante

Quando surgir uma decisão que altere materialmente produto ou arquitetura e não possa ser inferida dos artefatos:

- marque `BLOCKED` ou `DECISÃO NECESSÁRIA`;
- apresente a recomendação principal e os trade-offs relevantes;
- não implemente silenciosamente a alternativa escolhida pela IA;
- registre o bloqueio no `CHECKPOINT`.

Preferências de implementação de baixo impacto devem usar a solução segura e simples, com registro adequado, sem escalar tudo ao usuário.

## 15. Resposta de conclusão

Ao final, informe apenas o que importa operacionalmente:

- o que foi concluído;
- decisões ou mudanças relevantes;
- verificação realmente executada;
- estado de branch/PR/merge;
- `NEXT_ACTION` atual;
- qualquer ação manual necessária.

O repositório deve ser suficiente para a próxima sessão continuar.