# Execution Plan — Caleida

**Status:** roadmap operacional canônico  
**Regra:** uma `NEXT_ACTION` limitada por vez  
**Roadmap de produto:** `docs/PRODUCT_BACKLOG.md`

Este documento transforma o backlog macro em tarefas executáveis. Evidências detalhadas ficam nos documentos de validação/verificação e nos Issues/PRs indicados.

---

# Operações canônicas concluídas

- `OPS-001` — modernizar o protocolo canônico — **CONCLUÍDO**.
- `OPS-002` — formalizar o pivot Supabase → Neon — **CONCLUÍDO**.
- `OPS-003` — reconciliar a política de deployment — **CONCLUÍDO**; Vercel é exclusivamente humano/manual e CI permanece separada de CD.
- `OPS-004` — evoluir o registro de decisões para ADRs — **CONCLUÍDO**.
- `OPS-005` — refinar o Incremento 1 — **CONCLUÍDO** (`#31`).
- `OPS-006` — refinar EPIC-02 — **CONCLUÍDO** (`#41 / #42`), com plano em `docs/INCREMENT_2_PLAN.md`.

---

# Incremento 0 — Fundação executável

**Estado:** CONCLUÍDO  
**Evidência:** `docs/INCREMENT_0_VALIDATION.md`

Fundação consolidada: Next.js 16 / React 19, TypeScript strict, Tailwind CSS 4, Node 24.x, CI permanente sem CD, Neon/PostgreSQL 18 non-production e Vercel preparado para release manual.

# Incremento 1 — Fundação visual / EPIC-01

**Estado:** CONCLUÍDO  
**Plano:** `docs/INCREMENT_1_PLAN.md`  
**Evidência:** `docs/INCREMENT_1_VALIDATION.md`

```text
US-DS-001 tokens/temas — CONCLUÍDA (#33 / #34)
US-DS-002 tipografia/marca — CONCLUÍDA (#35 / #36)
US-DS-003 primitivos acessíveis — CONCLUÍDA (#37 / #38)
US-DS-004 fundação responsiva aplicada — CONCLUÍDA (#39 / #40)
```

---

# Incremento 2 — Acesso controlado / EPIC-02

**Estado:** EM ANDAMENTO  
**Plano:** `docs/INCREMENT_2_PLAN.md`

## Cursor

```text
US-AUTH-001 fundação Neon Auth + sessão — CONCLUÍDA (#43 / #44)
  ↓
US-AUTH-002 papéis/autorização + bootstrap — CONCLUÍDA (#45 / #46)
  ↓
US-AUTH-003 convites/solicitações + auditoria — CONCLUÍDA (#47 / #48)
  ↓
US-AUTH-004 e-mail Auth non-production — CONCLUÍDA (#49 / #50)
  ↓
US-AUTH-005 cadastro controlado + confirmação de e-mail — CONCLUÍDA (#51 / #52)
  ↓
US-AUTH-006 login/logout + proteção de sessão — CONCLUÍDA (#53 / #54)
  ↓
US-AUTH-007 recuperação de senha + gestão/revogação de sessões — EM REVISÃO (#55 / #56)
  ↓
US-AUTH-008 auditoria integrada + validação live do incremento
```

## US-AUTH-001 — Fundação Neon Auth e contrato de sessão

**Estado:** CONCLUÍDA  
**Issue/PR:** `#43 / #44`  
**Evidência:** `docs/US_AUTH_001_VERIFICATION.md`

Resultado: SDK Neon Auth pinado; boundary server-only/lazy/fail-closed; Managed Better Auth integrado em non-production.

## US-AUTH-002 — Papéis, autorização e bootstrap administrativo

**Estado:** CONCLUÍDA  
**Issue/PR:** `#45 / #46`  
**Evidência:** `docs/US_AUTH_002_VERIFICATION.md`

Resultado: papéis de produto separados da identidade Better Auth; autorização crítica server-only + banco; bootstrap owner controlado.

## US-AUTH-003 — Convites, solicitações de acesso e auditoria de entrada

**Estado:** CONCLUÍDA  
**Issue/PR:** `#47 / #48`  
**Evidência:** `docs/US_AUTH_003_VERIFICATION.md`

Resultado: convites, solicitações, auditoria e consumo concorrente/serializado versionados e verificados em PostgreSQL 18.

## US-AUTH-004 — E-mail Auth non-production

**Estado:** CONCLUÍDA  
**Issue/PR:** `#49 / #50`  
**Evidência:** `docs/US_AUTH_004_VERIFICATION.md`  
**ADR:** `docs/adr/ADR-009-neon-shared-email-nonproduction.md`

Resultado: provider compartilhado Neon confirmado; SMTP/provedor externo adiado até necessidade material.

## US-AUTH-005 — Cadastro controlado por convite ou aprovação

**Estado:** CONCLUÍDA  
**Issue/PR:** `#51 / #52`  
**Merge:** `9abc3235623c3f7d37531eb94a60997960f526e1`  
**Evidência:** `docs/US_AUTH_005_VERIFICATION.md`

Resultado: signup fail-closed por convite/aprovação; confirmação obrigatória por OTP; migrations `000004`–`000007` promovidas; gates integrados aprovados.

## US-AUTH-006 — Login, logout e proteção de sessão

**Estado:** CONCLUÍDA  
**Issue/PR:** `#53 / #54`  
**Merge:** `b585234a159a73dfec89e1d4cb866201dcfdef34`  
**Evidência:** `docs/US_AUTH_006_VERIFICATION.md`

Resultado: login/logout server-side, `/app` privado, acesso direto fail-closed, mensagem anti-enumeração e estados acessíveis. CI/PG18/Neon-specific passaram; browser live foi corretamente deferred para US-AUTH-008.

## US-AUTH-007 — Recuperação de senha e gestão/revogação de sessões

**Estado:** EM REVISÃO  
**Issue:** `#55`  
**PR:** `#56`  
**Branch:** `feat/us-auth-007-password-session-management`  
**Prioridade:** P0  
**Dependências:** US-AUTH-004 e 006  
**Capacidades:** CAP-01, CAP-35  
**Contrato:** `docs/SESSION_SECURITY.md`  
**Evidência:** `docs/US_AUTH_007_VERIFICATION.md`

### Resultado implementado

- recuperação em `/forgot-password` com resposta pública genérica;
- reset em `/reset-password` usando token do provider sem persistência em Git/logs;
- callback derivado de origem same-origin validada;
- alteração autenticada exige senha atual e usa `revokeOtherSessions: true`;
- `/account/security` lista somente metadados seguros das próprias sessões;
- revogação individual recebe `session.id`, valida ownership e só resolve `session.token` no servidor;
- sessão corrente pode ser encerrada por `signOut()`;
- cache de dados de sessão reduzido de 300 s para 1 s para limitar janela stale;
- nenhum schema/migration adicional criado.

### Semântica explícita

- operações sensíveis Better Auth usam validação autoritativa server-side na implementação upstream corrente;
- rotas comuns podem reutilizar dados assinados por até aproximadamente 1 segundo antes de revalidar upstream;
- reset por e-mail **não é declarado** como revogação automática de sessões existentes, porque `revokeSessionsOnPasswordReset` não está exposto na configuração Managed Neon observada;
- alteração autenticada e controles explícitos de sessão fornecem revogação das sessões próprias;
- comportamento live do reset, trusted origin e multi-device entra em US-AUTH-008.

### Gates atuais

```text
Head funcional: df745df9a05232372e8a1e1b269bc5502499503b
CI #221 / 34519793813 / job 103014162360: SUCCESS
npm run verify: PASS
PostgreSQL 18 + verify:db: PASS
Neon verify-us-auth-007: ready
Auth users/sessions/accounts/verifications: 0
Schema diff vs baseline: vazio
Browser/live: SKIPPED/deferred para US-AUTH-008
Preview Vercel: não requerido
```

A integração depende apenas do CI do head documental final, revisão da diff/threads e merge da PR #56.

## US-AUTH-008 — Consolidar auditoria e validar Incremento 2

**Estado:** A FAZER  
**Dependências:** US-AUTH-001 a 007

Fechar lacunas de auditoria e executar a matriz integrada do incremento. Este é o ponto padrão para browser/live consolidado de cadastro, login, logout, recuperação, alteração de senha, sessão, autorização, acesso direto e ausência de flash privado. Se runtime público for material, usar uma única release candidate manual conforme a política de deployment.

---

# Contrato de execução

Para cada tarefa:

1. recuperar estado pelo protocolo;
2. confirmar `NEXT_ACTION`;
3. inspecionar repositório/documentação/estado externo aplicável;
4. criar/usar Issue e branch limitadas;
5. implementar somente o necessário;
6. executar Verification Protocol proporcional ao escopo;
7. não transformar ausência de Preview manual em blocker automático;
8. revisar diff/secrets;
9. atualizar docs/ADRs quando aplicável;
10. atualizar Checkpoint/Backlog/Changelog;
11. revisar/mergear PR quando gates materiais estiverem satisfeitos;
12. deixar uma única próxima ação.

## NEXT_ACTION vigente

> Finalizar `US-AUTH-007` na PR #56: revalidar CI após a documentação de fechamento, revisar diff/threads e integrar a Story sem exigir Preview Vercel intermediário. Depois do merge saudável, promover somente `US-AUTH-008 — consolidar auditoria e validar Incremento 2`.

Não iniciar US-AUTH-008 antes da integração de US-AUTH-007 e não executar deployment Vercel pela IA.
