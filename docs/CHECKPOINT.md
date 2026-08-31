# Checkpoint — Caleida

**PROJECT_STATUS:** READY  
**CURRENT_PHASE:** Incremento 0 — Fundação executável / modernização operacional  
**PROTOCOL_VERSION:** 2  
**PROTOCOL_BOOTSTRAP_TASK:** `OPS-001 — Modernizar o protocolo canônico`  
**BASELINE_BEFORE_PROTOCOL_V2:** `5e5848b448090ab11301cf7344ac83f381bb654e`  
**ACTIVE_TASK:** none  
**ACTIVE_ISSUE:** none  
**ACTIVE_BRANCH:** none  
**NEXT_ACTION:** `OPS-002 — Formalizar o pivot Supabase → Neon`  
**BLOCKERS:** none  
**ON_HOLD:** none  
**MANUAL_ACTION_REQUIRED:** none

## Comando de continuação

Uma nova sessão deve poder iniciar com:

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

Recupere o estado pelo GitHub e pelos documentos canônicos. Não peça ao usuário para repetir contexto já disponível.

## Estado técnico atual

Até a conclusão de OPS-001, o estado conhecido da `main` era documental:

- aplicação Next.js ainda não inicializada;
- nenhum `package.json` de aplicação;
- nenhum schema/migration de produto;
- nenhum banco hospedado do Caleida criado;
- nenhuma integração de autenticação implementada;
- nenhum deploy Vercel do Caleida configurado como parte do fluxo executado;
- backlog do Incremento 0 existente;
- Project Design v1.0 existente;
- arquitetura inicial ainda baseada em Supabase e pendente de reconciliação por OPS-002.

O GitHub real deve ser conferido no início de cada sessão antes de assumir que este snapshot continua válido.

## Estado documental

Com o protocolo v2, os artefatos operacionais passam a ter funções separadas:

- `docs/PROJECT_DESIGN.md` — produto;
- `docs/PRODUCT_BACKLOG.md` — roadmap macro;
- `docs/EXECUTION_PLAN.md` — tarefas executáveis e ordem operacional;
- `docs/CHECKPOINT.md` — cursor de continuação;
- `00_SYSTEM/SOURCE_OF_TRUTH.md` — precedência;
- `00_SYSTEM/AI_WORK_PROTOCOL.md` — procedimento de trabalho;
- `00_SYSTEM/VERIFICATION_PROTOCOL.md` — prova de conclusão;
- `00_SYSTEM/DEPLOYMENT_POLICY.md` — guardrails de publicação;
- `docs/STATUS.md` — snapshot histórico inicial, não cursor atual.

## Verificação de OPS-001

- coerência documental: `PASS`;
- caminhos canônicos definidos: `PASS`;
- `NEXT_ACTION` única e explícita: `PASS`;
- aplicação/lint/typecheck/test/build: `SKIPPED — aplicação ainda não inicializada`;
- banco/RLS: `SKIPPED — banco ainda não implementado`;
- deployment: `SKIPPED — nenhum deployment necessário ou autorizado`;
- secrets/credenciais adicionados: `PASS — nenhum valor sensível incluído`.

## Próxima ação — OPS-002

Executar somente:

> `OPS-002 — Formalizar o pivot Supabase → Neon`

Requisitos essenciais:

1. verificar documentação oficial corrente do Neon e do Supabase;
2. localizar todas as referências ativas à plataforma anterior;
3. formalizar a decisão de pivot sem apagar o histórico;
4. reconciliar Project Design, arquitetura, backlog e regras operacionais afetadas;
5. definir boundaries de Postgres, Auth/Data API, RLS e Storage;
6. não iniciar schema de produto ou feature de negócio;
7. não realizar deployment Vercel;
8. atualizar este checkpoint ao final com a próxima ação executável.

`US-PLAT-001` não deve começar enquanto OPS-002 permanecer como `NEXT_ACTION`.