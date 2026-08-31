# Execution Plan — Caleida

**Status:** roadmap operacional canônico  
**Regra:** uma `NEXT_ACTION` limitada por vez  
**Roadmap de produto:** `docs/PRODUCT_BACKLOG.md`

Este documento transforma o backlog macro em tarefas executáveis. O backlog continua descrevendo capacidades e prioridades; este plano define ordem, dependências, critérios de aceite e limites operacionais.

---

# OPS-001 — Modernizar o protocolo canônico

**Estado:** CONCLUÍDO NESTA ENTREGA

## Objetivo

Tornar o repositório suficiente para retomada confiável por novas sessões, sem depender da memória de chats.

## Entregáveis

- `00_SYSTEM/SOURCE_OF_TRUTH.md`;
- `00_SYSTEM/AI_WORK_PROTOCOL.md`;
- `00_SYSTEM/VERIFICATION_PROTOCOL.md`;
- `00_SYSTEM/DEPLOYMENT_POLICY.md`;
- `docs/CHECKPOINT.md`;
- este `docs/EXECUTION_PLAN.md`;
- `AGENTS.md` reconciliado com o protocolo;
- documentação operacional atualizada.

## Critérios de aceite

- existe uma hierarquia explícita de fontes de verdade;
- existe comando canônico de continuação;
- `CHECKPOINT` contém uma única `NEXT_ACTION` executável;
- estados `READY`, `IN_PROGRESS`, `BLOCKED`, `ON_HOLD`, `MANUAL_ACTION_REQUIRED` e `DONE` estão definidos;
- verificação diferencia `PASS`, `FAIL`, `SKIPPED` e `BLOCKED`;
- deployment não pode ser disparado implicitamente como estratégia de teste;
- nenhum código de produto, banco ou infraestrutura externa é alterado nesta tarefa.

## Verificação

Revisão documental, coerência de caminhos, diff de escopo e ausência de secrets.

## Non-goals

- não trocar Supabase por Neon;
- não alterar Project Design de produto;
- não inicializar Next.js;
- não criar banco;
- não configurar Vercel;
- não criar feature de negócio.

---

# OPS-002 — Formalizar o pivot Supabase → Neon

**Estado:** NEXT_ACTION

## Objetivo

Substituir formalmente a escolha inicial de Supabase pela arquitetura Neon adequada ao Caleida antes do início da implementação técnica.

## Por que agora

O repositório ainda não possui aplicação, migrations ou integração de Auth/Storage. Este é o ponto de menor custo e risco para corrigir a decisão de plataforma sem carregar compatibilidade desnecessária.

## Dependências

- OPS-001 concluída;
- estado real do repositório confirmado;
- documentação oficial atual de Neon e Supabase verificada na execução da tarefa.

## Inspecionar antes de editar

- `docs/PROJECT_DESIGN.md`;
- `docs/ARCHITECTURE.md`;
- `docs/PRODUCT_BACKLOG.md`;
- `docs/DECISIONS.md`;
- `AGENTS.md`;
- referências a Supabase, Auth, Storage, RLS, local development, staging, production e branching;
- fluxo Neon já comprovado em outros projetos apenas como referência, nunca como substituto da documentação oficial atual.

## Resultado esperado

- decisão arquitetural formal de pivot;
- Project Design e arquitetura reconciliados com a nova plataforma;
- estratégia de Postgres/Auth/Data API/RLS definida com precisão suficiente para fundação técnica;
- estratégia de Storage explicitamente decidida ou adiada com boundary claro;
- backlog e tarefas de fundação reconciliados;
- referências Supabase mantidas apenas quando históricas ou explicitamente superseded;
- `CHECKPOINT` apontando para a próxima tarefa executável.

## Critérios de aceite

- nenhuma referência ativa contraditória de plataforma permanece nos artefatos canônicos;
- a decisão antiga não é apagada silenciosamente: é marcada como superseded ou preservada historicamente;
- migrations, RLS e ambiente de verificação têm estratégia definida;
- secrets continuam fora do Git;
- nenhum banco hospedado precisa ser criado para concluir apenas a decisão documental, salvo se a tarefa deliberadamente exigir prova técnica isolada;
- nenhum deploy Vercel ocorre.

## Non-goals

- não construir schema de produto;
- não implementar autenticação de aplicação;
- não iniciar catálogo/biblioteca;
- não publicar a aplicação.

---

# OPS-003 — Reconciliar a política de deployment

**Estado:** PLANEJADO

## Objetivo

Reconciliar Project Design, backlog e arquitetura com a política operacional de deployment controlado, removendo qualquer ambiguidade entre Preview automático e autorização manual.

## Dependência

OPS-002.

## Resultado esperado

Fluxo explícito de CI/verificação separado de deployment, com Vercel usada somente segundo política canônica aprovada.

---

# OPS-004 — Evoluir o registro de decisões para ADRs

**Estado:** PLANEJADO

## Objetivo

Criar estrutura `docs/adr/` e migrar gradualmente decisões arquiteturais sem perder histórico, links ou contexto das `DEC-*` existentes.

## Dependência

Após o pivot de plataforma e antes de acumular decisões arquiteturais adicionais relevantes.

## Resultado esperado

Cada decisão material passa a ter status, contexto, decisão, consequências e relação de supersessão rastreáveis.

---

# Fundação técnica após reconciliação operacional

As User Stories do Incremento 0 permanecem no `PRODUCT_BACKLOG.md`, mas sua execução deve obedecer ao estado canônico atualizado depois de OPS-002/OPS-003.

A primeira tarefa de aplicação continua conceitualmente equivalente a:

## US-PLAT-001 — Repository/application bootstrap

Criar a aplicação Next.js/React/TypeScript mínima e reproduzível, com versões e package manager definidos a partir da documentação oficial corrente.

Antes de executar, a sessão deve expandir a tarefa contra o estado atual incluindo:

- objetivo;
- dependências;
- arquivos afetados;
- versões/runtime;
- segurança;
- testes;
- critérios de aceite;
- non-goals;
- Definition of Done.

Não iniciar `US-PLAT-001` enquanto o `CHECKPOINT` apontar para uma tarefa OPS anterior.

---

# Contrato de execução

Para cada tarefa:

1. recuperar estado pelo protocolo canônico;
2. confirmar que é a `NEXT_ACTION`;
3. inspecionar repositório e documentação relevante;
4. criar/usar branch limitada ao escopo;
5. implementar somente o necessário;
6. executar `00_SYSTEM/VERIFICATION_PROTOCOL.md`;
7. revisar diff;
8. atualizar documentação/decisões afetadas;
9. atualizar `docs/CHECKPOINT.md`;
10. abrir PR/revisar/mergear conforme o fluxo vigente;
11. deixar uma única próxima ação clara para a sessão seguinte.

Não crie trabalho artificial para manter atividade. Se uma frente depender de condição externa, use `ON_HOLD` e avance apenas para trabalho independente realmente previsto.