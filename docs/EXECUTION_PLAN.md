# Execution Plan — Caleida

**Status:** roadmap operacional canônico  
**Regra:** uma `NEXT_ACTION` limitada por vez  
**Roadmap de produto:** `docs/PRODUCT_BACKLOG.md`

Este documento transforma o backlog macro em tarefas executáveis. O backlog continua descrevendo capacidades e prioridades; este plano define ordem, dependências, critérios de aceite e limites operacionais.

---

# OPS-001 — Modernizar o protocolo canônico

**Estado:** CONCLUÍDO

## Objetivo

Tornar o repositório suficiente para retomada confiável por novas sessões, sem depender da memória de chats.

## Resultado

- `00_SYSTEM/SOURCE_OF_TRUTH.md`;
- `00_SYSTEM/AI_WORK_PROTOCOL.md`;
- `00_SYSTEM/VERIFICATION_PROTOCOL.md`;
- `00_SYSTEM/DEPLOYMENT_POLICY.md`;
- `docs/CHECKPOINT.md`;
- este `docs/EXECUTION_PLAN.md`;
- `AGENTS.md` reconciliado com o protocolo;
- documentação operacional atualizada.

---

# OPS-002 — Formalizar o pivot Supabase → Neon

**Estado:** CONCLUÍDO

## Objetivo

Substituir formalmente a escolha inicial de Supabase pela arquitetura Neon adequada ao Caleida antes do início da implementação técnica.

## Evidência de contexto

Na execução de OPS-002 foi confirmado que:

- o repositório ainda não possui aplicação, migrations ou schema de produto;
- nenhuma integração Supabase precisou ser migrada;
- não existia projeto Neon do Caleida no ambiente conectado;
- Supabase Free continua limitado a dois projetos ativos;
- Neon Free oferece atualmente 100 projetos, branching e Neon Auth no Free;
- Neon Auth usa Better Auth e mantém identidade/sessões no schema `neon_auth`;
- Neon Data API integra JWT com PostgreSQL RLS;
- Neon Object Storage permanece beta em 31/08/2026.

## Decisões

- `DEC-003` e `DEC-004` foram preservadas como históricas e marcadas `SUPERSEDED`;
- `DEC-007` tornou Neon a plataforma canônica de Postgres/Auth/Data API/RLS;
- Production e non-production usarão projetos Neon separados;
- branches descartáveis de verificação existirão somente em non-production;
- migrations ficarão em `database/migrations/` e testes de banco em `database/tests/`;
- Storage permaneceu provider-independent e adiado por `DEC-008`;
- o Project Design v1.0 permaneceu preservado e recebeu `PROJECT_DESIGN_PLATFORM_AMENDMENT.md` como amendment canônico da plataforma.

## Verificação

- documentação oficial atual Neon/Supabase: `PASS`;
- decisão histórica preservada: `PASS`;
- referências ativas de arquitetura/backlog reconciliadas: `PASS`;
- Project Design reconciliado por amendment canônico: `PASS`;
- estratégia de migrations/RLS/branches: `PASS`;
- Storage boundary explícito: `PASS`;
- secrets adicionados: `PASS — nenhum`;
- projeto Neon criado: `SKIPPED — não necessário para decisão documental`;
- aplicação/lint/typecheck/test/build: `SKIPPED — aplicação ainda não inicializada`;
- banco/RLS executável: `SKIPPED — schema ainda não existe`;
- deployment: `SKIPPED — proibido/fora do escopo`.

## Artefatos principais

- `docs/PROJECT_DESIGN_PLATFORM_AMENDMENT.md`;
- `docs/NEON_PLATFORM.md`;
- `docs/ARCHITECTURE.md`;
- `docs/DECISIONS.md`;
- `docs/PRODUCT_BACKLOG.md`;
- `docs/CHECKPOINT.md`;
- `AGENTS.md`;
- documentação canônica associada.

---

# OPS-003 — Reconciliar a política de deployment

**Estado:** NEXT_ACTION

## Objetivo

Reconciliar Project Design, backlog e arquitetura com a política operacional de deployment controlado, removendo a ambiguidade remanescente entre Preview automático e autorização manual.

## Por que agora

OPS-002 removeu a contradição da plataforma de dados, mas o Project Design v1.0 ainda descreve Preview Deployments automáticos e "publicar uma base vazia" como parte do ciclo original. O protocolo operacional já proíbe deploy implícito.

Antes de iniciar a aplicação, a regra de hosting deve ficar inequívoca para impedir churn de deployments durante desenvolvimento assistido.

## Dependências

- OPS-001 concluída;
- OPS-002 concluída;
- `00_SYSTEM/DEPLOYMENT_POLICY.md` vigente;
- documentação oficial atual da Vercel verificada durante OPS-003.

## Inspecionar antes de editar

- `docs/PROJECT_DESIGN.md` e amendment ativo;
- `00_SYSTEM/DEPLOYMENT_POLICY.md`;
- `docs/ARCHITECTURE.md`;
- `docs/PRODUCT_BACKLOG.md`;
- `docs/DECISIONS.md`;
- referências a Preview, Production, branch/PR deployment, Git integration e release gate.

## Resultado esperado

- Project Design formalmente reconciliado quanto a deployment;
- Vercel permanece destino de hosting sem deploy automático como efeito colateral de push/PR;
- CI/build claramente separados de publicação;
- Stories `US-PLAT-008` e `US-PLAT-010` desbloqueadas/redefinidas de forma coerente;
- regra de ação manual/release documentada;
- nenhuma integração Vercel ativada apenas para concluir a tarefa documental;
- `CHECKPOINT` aponta para a próxima tarefa executável.

## Critérios de aceite

- nenhuma referência ativa trata Preview automático como gate obrigatório;
- deployment só ocorre sob política/autorização explícita;
- build/CI continuam verificáveis sem deploy;
- nenhum deployment é disparado na própria OPS-003;
- histórico original permanece rastreável.

## Non-goals

- não inicializar Next.js;
- não conectar GitHub à Vercel;
- não publicar Preview/Production;
- não criar domínio;
- não criar banco.

---

# OPS-004 — Evoluir o registro de decisões para ADRs

**Estado:** PLANEJADO

## Objetivo

Criar estrutura `docs/adr/` e migrar gradualmente decisões arquiteturais sem perder histórico, links ou contexto das `DEC-*` existentes.

## Dependência

Após OPS-003 e antes de acumular decisões arquiteturais adicionais relevantes.

## Resultado esperado

Cada decisão material passa a ter status, contexto, decisão, consequências e relação de supersessão rastreáveis.

---

# Fundação técnica após reconciliação operacional

As User Stories do Incremento 0 permanecem no `PRODUCT_BACKLOG.md`, mas sua execução deve obedecer ao estado canônico atualizado depois das tarefas OPS.

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
4. criar/usar Issue e branch limitadas ao escopo quando aplicável;
5. implementar somente o necessário;
6. executar `00_SYSTEM/VERIFICATION_PROTOCOL.md`;
7. revisar diff;
8. atualizar documentação/decisões afetadas;
9. atualizar `docs/CHECKPOINT.md`;
10. abrir PR/revisar/mergear conforme o fluxo vigente;
11. deixar uma única próxima ação clara para a sessão seguinte.

Não crie trabalho artificial para manter atividade. Se uma frente depender de condição externa, use `ON_HOLD` e avance apenas para trabalho independente realmente previsto.
