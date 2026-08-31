# Deployment Policy — Caleida

**Status:** protocolo operacional canônico  
**Princípio:** deployment é uma ação de publicação controlada, não um mecanismo normal de teste

## 1. Regra central

Nenhuma sessão de IA, automação, workflow ou integração possui autorização implícita para disparar deployment do Caleida apenas porque existe uma branch, commit ou pull request.

Qualquer deployment real deve decorrer de uma tarefa explicitamente autorizada e respeitar as decisões de produto/arquitetura vigentes.

## 2. Proibido sem autorização explícita da tarefa

Não executar nem configurar comportamento que dispare automaticamente:

- deployment de Preview por branch ou pull request;
- deployment de Production por push/merge;
- comandos `vercel`, `vercel deploy`, `vercel --prod`, promote ou rollback;
- deploy hooks;
- GitHub Actions que publiquem a aplicação;
- loops de redeploy como estratégia de debugging.

A existência de referência à Vercel em documentos históricos ou no Project Design não equivale a autorização operacional para publicar.

## 3. Trabalho permitido sem deployment

Quando necessário ao escopo, a sessão pode:

- consultar documentação oficial atual da Vercel;
- preparar código compatível com o ambiente de hosting;
- preparar `vercel.json` ou configuração equivalente quando justificada;
- documentar variáveis de ambiente sem registrar secrets;
- executar build local/CI;
- preparar runbook de publicação;
- inspecionar deployment já existente quando solicitado e permitido pelas ferramentas;
- diagnosticar logs de um deployment previamente criado.

Preparar configuração não concede autorização para publicar.

## 4. Estado de transição do Caleida

O Project Design inicial ainda descreve Preview Deployments automáticos como parte do fluxo original. Essa suposição permanece pendente de reconciliação arquitetural em tarefa própria.

Até essa reconciliação:

- não habilitar deploy automático;
- não interpretar o backlog antigo como autorização operacional;
- usar lint, typecheck, testes, build e verificação de banco como gates técnicos;
- marcar `MANUAL_ACTION_REQUIRED` se uma entrega realmente depender de publicação externa.

## 5. Gate antes de qualquer publicação

Antes de um deployment real:

1. os gates técnicos aplicáveis devem estar `PASS`;
2. o diff/release candidato deve estar identificado;
3. secrets e variáveis necessárias devem estar documentados sem valores sensíveis;
4. `docs/CHECKPOINT.md` deve registrar a necessidade de deployment;
5. a tarefa deve indicar ambiente e objetivo da publicação;
6. deve existir autorização explícita do usuário para aquele deployment ou política canônica posterior que o permita de forma inequívoca.

## 6. Falha de deployment

Se um deployment falhar, não faça uma sequência especulativa de novos deploys.

Primeiro diagnostique com:

- reprodução local;
- lint/typecheck/test/build;
- logs do deployment existente;
- documentação oficial atual;
- diff da mudança correspondente.

Depois prepare uma correção limitada e só publique novamente quando houver autorização aplicável.

## 7. Prioridade

Esta política controla o comportamento operacional das sessões enquanto a arquitetura de deployment do Caleida não for deliberadamente revisada.

Uma alteração futura dessa política deve ser registrada de forma explícita e coerente com Project Design, decisões, Execution Plan e Checkpoint.