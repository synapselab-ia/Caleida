# Checkpoint — Caleida

**PROJECT_STATUS:** READY  
**CURRENT_PHASE:** Incremento 2 — Acesso controlado / EPIC-02 refinado  
**PROTOCOL_VERSION:** 2  
**LAST_COMPLETED_TASK:** `OPS-006 — Refinar o próximo incremento funcional (EPIC-02 — Contas e autenticação)`  
**LAST_COMPLETED_ISSUE:** `#41`  
**LAST_COMPLETED_PR:** `#42`  
**ACTIVE_TASK:** none  
**ACTIVE_ISSUE:** none  
**ACTIVE_BRANCH:** none  
**ACTIVE_PR:** none  
**NEXT_ACTION:** `US-AUTH-001 — Materializar fundação Neon Auth isolada e contrato de sessão`  
**BLOCKERS:** none  
**ON_HOLD:** none  
**MANUAL_ACTION_REQUIRED:** none

## Comando de continuação

> Continue o projeto `synapselab-ia/Caleida` pelo protocolo canônico e execute a `NEXT_ACTION`.

Recupere o estado real no GitHub e siga os documentos canônicos. Não refaça Stories concluídas.

## Incrementos concluídos

### Incremento 0 — Fundação executável

**CONCLUÍDO.** Evidência: `docs/INCREMENT_0_VALIDATION.md`.

### Incremento 1 — Fundação visual / EPIC-01

**CONCLUÍDO.** Evidência: `docs/INCREMENT_1_VALIDATION.md`.

```text
US-DS-001 tokens/temas — CONCLUÍDA (#33 / #34)
  ↓
US-DS-002 tipografia/marca — CONCLUÍDA (#35 / #36)
  ↓
US-DS-003 primitivos acessíveis — CONCLUÍDA (#37 / #38)
  ↓
US-DS-004 fundação responsiva aplicada — CONCLUÍDA (#39 / #40)
```

## OPS-006 — resultado

```text
Issue: #41
Branch: ops/006-refine-epic-02
PR: #42
Plano: docs/INCREMENT_2_PLAN.md
```

OPS-006 refinou `EPIC-02 — Contas e autenticação` sem implementar Auth e promoveu exatamente uma próxima Story técnica.

### Estado real reconciliado

- `main` de partida: `a42b8bdcd78293e797cdb6e2aff3e3cf02c495a2`;
- CI integrada de partida: run `33664145901` — `PASS`;
- antes de OPS-006 não havia Issue ou PR aberta;
- Neon non-production: `caleida-nonprod`, PostgreSQL 18, região `aws-us-east-1`;
- baseline Neon: `main` / `br-restless-cherry-awpcwy6r`, estado `ready`;
- branches Neon existentes no refino: somente a baseline `main`;
- Neon Auth/Data API: não provisionados;
- Production Neon: não provisionada;
- schema funcional de produto: inexistente;
- migrations: somente `database/migrations/000001_migration_ledger.sql`;
- Vercel: nenhum projeto/deployment do Caleida criado.

### Revalidação técnica de OPS-006

Documentação oficial corrente foi revalidada para o desenho da próxima Story:

- Neon Auth atual é Better Auth gerenciado, branch-scoped, com schema `neon_auth` e SDK oficial `@neondatabase/auth`;
- integração server-side Next.js corrente usa `createNeonAuth()`;
- variáveis correntes previstas para a fundação são `NEON_AUTH_BASE_URL` e `NEON_AUTH_COOKIE_SECRET`, sempre sem valores no Git;
- cache de sessão assinado do SDK atual possui TTL e deve ser considerado explicitamente na futura revogação de sessão;
- Neon Auth não deve ser tratado como Better Auth self-hosted com plugins/handlers server-side customizados presumidos;
- o futuro gate de beta fechado deve negar signup direto sem convite/aprovação, e não apenas ocultar interface;
- Neon Data API/RLS continua exigindo RLS em tabelas expostas e usa a identidade documentada por `auth.user_id()`;
- Next.js 16 pode usar `proxy.ts` para proteção antecipada, mas autorização real permanece server-side e/ou no banco.

Referências e consequências estão registradas em `docs/INCREMENT_2_PLAN.md`.

### Arquitetura

- nenhum novo ADR foi necessário em OPS-006;
- `ADR-004`, `ADR-005`, `ADR-007` e `ADR-008` permanecem suficientes;
- provedor de e-mail transacional continua deliberadamente não escolhido e deve ser decidido/documentado na Story própria;
- se o Neon Auth não permitir impor com segurança o controle de entrada do beta, a futura Story deve parar e registrar decisão arquitetural em vez de liberar signup público como workaround.

### Incremento 2 refinado

```text
US-AUTH-001 fundação Neon Auth + sessão — PRONTA / NEXT_ACTION
  ↓
US-AUTH-002 papéis/autorização + bootstrap administrativo
  ↓
US-AUTH-003 convites/solicitações + auditoria de entrada
  ↓
US-AUTH-004 e-mail transacional non-production
  ↓
US-AUTH-005 cadastro controlado + confirmação de e-mail
  ↓
US-AUTH-006 login/logout + proteção de sessão
  ↓
US-AUTH-007 recuperação de senha + gestão/revogação de sessões
  ↓
US-AUTH-008 auditoria integrada + validação do incremento
```

Plano detalhado: `docs/INCREMENT_2_PLAN.md`.

## Verificação de OPS-006

OPS-006 é uma mudança documental de planejamento.

- coerência Project Design / amendments / ADRs: `PASS` por inspeção;
- CAP-01/CAP-02/CAP-04/CAP-35 rastreadas: `PASS`;
- estado GitHub/CI de partida confrontado com Checkpoint: `PASS`;
- estado Neon non-production lido sem mutação: `PASS`;
- documentação oficial Neon Auth/Data API/RLS + Next.js 16 revalidada: `PASS`;
- migrations/schema funcional: `PASS — nenhuma alteração`;
- dependencies/package-lock: `PASS — nenhuma alteração`;
- Neon Auth/Data API/usuários/SMTP/OAuth: `PASS — nenhum recurso criado`;
- gate Neon-specific: `SKIPPED — OPS-006 não muta comportamento gerenciado do Neon`;
- browser real: `SKIPPED — tarefa somente documental`;
- deployment Vercel: `SKIPPED/PROIBIDO` conforme `ADR-007`;
- CI do head documental final da PR #42: **deve estar `PASS` antes do merge**;
- CI pós-merge da `main`: **deve estar `PASS` antes do fechamento operacional; evidência final deve ser registrada em #41/#42**.

## Próxima ação — US-AUTH-001

Executar somente:

> `US-AUTH-001 — Materializar fundação Neon Auth isolada e contrato de sessão`

Limites obrigatórios:

1. começar pela leitura do estado real e da documentação oficial corrente;
2. usar branch Neon descartável para qualquer gate Neon Auth específico;
3. se branching/provisionamento isolado estiver indisponível, marcar `BLOCKED`; não usar a baseline Neon `main` como laboratório;
4. integrar somente a fundação Neon Auth/session do Next.js 16;
5. documentar nomes de variáveis sem valores e manter secrets server-only;
6. não implementar cadastro/login, convite, papéis, Data API, SMTP/e-mail, OAuth ou schema funcional de produto;
7. não provisionar Production Neon;
8. não criar/importar projeto Caleida na Vercel nem executar deployment.
